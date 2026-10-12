"""Recruiter side of the pipeline: see applicants, move them through stages, notify the candidate."""
from flask import Blueprint, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from app.extensions import db
from app.models.application import Application
from app.models.job import Job
from app.services import (
    STATUSES, ai_candidate_scores, latest_resumes, lookup_users,
    normalize_status, notify_status_change, record_status_event,
)

recruiter_bp = Blueprint("recruiter", __name__)

MAX_SCORED_JOBS = 12


def _recruiter_id():
    """-> (recruiter_id, error_response)"""
    if get_jwt().get("role") != "RECRUITER":
        return None, ({"success": False, "message": "Only recruiters can access applicants"}, 403)
    try:
        return int(get_jwt_identity()), None
    except (TypeError, ValueError):
        return None, ({"success": False, "message": "Invalid recruiter identity"}, 401)


def _skills_list(value):
    if isinstance(value, list):
        return value
    return [s.strip() for s in str(value or "").split(",") if s.strip()]


def _payload(application, job, users, resumes, scores):
    cand = users.get(application.user_id) or {}
    resume = resumes.get(application.user_id)
    score = scores.get((job.id, application.user_id)) or {}
    return {
        "id": application.id,
        "application_id": application.id,
        "status": application.status,
        "applied_at": application.applied_at.isoformat() if application.applied_at else None,
        "updated_at": application.updated_at.isoformat() if getattr(application, "updated_at", None) else None,
        "recruiter_notes": application.recruiter_notes or "",
        "job": {"id": job.id, "title": job.title, "company": job.company, "skills": _skills_list(job.skills)},
        "candidate": {
            "id": application.user_id,
            "name": cand.get("name") or f"Candidate #{application.user_id}",
            "email": cand.get("email"),
            "phone": cand.get("phone"),
            "location": cand.get("location"),
            "experience": cand.get("experience"),
            "desired_role": cand.get("desired_role"),
            "bio": cand.get("bio"),
            "skills": _skills_list(cand.get("skills")),
        },
        "resume": ({"id": resume["id"], "filename": resume["filename"]} if resume else None),
        "match_score": score.get("score"),
        "matching_skills": score.get("matching_skills", []),
        "missing_skills": score.get("missing_skills", []),
    }


def _build(rows, with_scores=True):
    """rows = [(Application, Job)] -> list of payload dicts (batched user/resume/AI lookups)."""
    user_ids = {a.user_id for a, _ in rows}
    users = lookup_users(user_ids)
    resumes = latest_resumes(user_ids)

    scores = {}
    if with_scores and rows:
        by_job = {}
        for a, j in rows:
            by_job.setdefault(j.id, set()).add(a.user_id)
        for job_id, uids in list(by_job.items())[:MAX_SCORED_JOBS]:
            result = ai_candidate_scores(job_id, uids)
            if not result:  # AI down -> do not wait for every job
                break
            for uid, value in result.items():
                scores[(job_id, uid)] = value

    return [_payload(a, j, users, resumes, scores) for a, j in rows]


def _query(recruiter_id):
    return (
        db.session.query(Application, Job)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.recruiter_id == recruiter_id)
    )


@recruiter_bp.get("/applicants")
@jwt_required()
def list_applicants():
    recruiter_id, err = _recruiter_id()
    if err:
        return err

    query = _query(recruiter_id)

    job_id = request.args.get("job_id", type=int)
    if job_id:
        query = query.filter(Job.id == job_id)

    status = request.args.get("status")
    if status and status != "All":
        normalized = normalize_status(status)
        if not normalized:
            return {"success": False, "message": f"Unknown status. Use one of: {', '.join(STATUSES)}"}, 400
        query = query.filter(Application.status == normalized)

    rows = query.order_by(Application.applied_at.desc(), Application.id.desc()).all()
    applicants = _build(rows)

    return {"success": True, "count": len(applicants), "statuses": STATUSES, "applicants": applicants}, 200


@recruiter_bp.get("/<int:job_id>/applicants")
@jwt_required()
def list_job_applicants(job_id):
    recruiter_id, err = _recruiter_id()
    if err:
        return err

    job = Job.query.get(job_id)
    if not job or job.recruiter_id != recruiter_id:
        return {"success": False, "message": "Job not found"}, 404

    rows = (
        _query(recruiter_id).filter(Job.id == job_id)
        .order_by(Application.applied_at.desc(), Application.id.desc()).all()
    )
    applicants = _build(rows)
    return {"success": True, "count": len(applicants), "job": job.to_dict(), "applicants": applicants}, 200


@recruiter_bp.get("/applications/<int:application_id>")
@jwt_required()
def get_applicant(application_id):
    recruiter_id, err = _recruiter_id()
    if err:
        return err

    row = _query(recruiter_id).filter(Application.id == application_id).first()
    if not row:
        return {"success": False, "message": "Application not found"}, 404

    return {"success": True, "applicant": _build([row])[0]}, 200


@recruiter_bp.patch("/applications/<int:application_id>")
@jwt_required()
def update_application(application_id):
    """Move an application to a new stage and/or save private notes.

    Body: {"status": "Shortlisted", "notes": "...", "message": "optional text shown to the candidate"}
    A status change creates a notification for the candidate.
    """
    recruiter_id, err = _recruiter_id()
    if err:
        return err

    row = _query(recruiter_id).filter(Application.id == application_id).first()
    if not row:
        return {"success": False, "message": "Application not found"}, 404
    application, job = row

    data = request.get_json(silent=True) or {}
    has_status, has_notes = "status" in data, "notes" in data

    if not has_status and not has_notes:
        return {"success": False, "message": "Provide status and/or notes"}, 400

    new_status = None
    if has_status:
        new_status = normalize_status(data.get("status"))
        if not new_status:
            return {"success": False, "message": f"Invalid status. Use one of: {', '.join(STATUSES)}"}, 400

    notified = False
    try:
        if has_notes:
            application.recruiter_notes = str(data.get("notes") or "")[:5000]

        if new_status and new_status != application.status:
            previous_status = application.status
            application.status = new_status
            record_status_event(application, previous_status, new_status, actor_id=recruiter_id,
                                note=data.get("message"))
            notify_status_change(application, job, new_status, data.get("message"))
            notified = True

        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        print("UPDATE APPLICATION ERROR:", exc)
        return {"success": False, "message": "Unable to update application"}, 500

    payload = _build([(application, job)], with_scores=False)[0]
    return {
        "success": True,
        "message": "Application updated" + (" and candidate notified" if notified else ""),
        "notified": notified,
        "applicant": payload,
    }, 200
