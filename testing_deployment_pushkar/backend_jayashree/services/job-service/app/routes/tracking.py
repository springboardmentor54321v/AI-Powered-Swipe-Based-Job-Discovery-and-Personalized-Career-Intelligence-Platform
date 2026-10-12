"""Application tracking: the candidate's board (saved + every stage) and a status timeline per application."""
from flask import Blueprint
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from app import competition
from app.extensions import db
from app.models.application import Application
from app.models.application_event import ApplicationStatusEvent
from app.models.job import Job
from app.models.saved_job import SavedJob
from app.services import STATUSES

tracking_bp = Blueprint("tracking", __name__)


def _uid():
    try:
        return int(get_jwt_identity())
    except (TypeError, ValueError):
        return None


def _card(application, job, counts):
    return {
        "application_id": application.id, "job_id": job.id, "title": job.title, "company": job.company,
        "location": job.location, "salary": job.salary, "status": application.status,
        "applied_at": application.applied_at.isoformat() if application.applied_at else None,
        "updated_at": application.updated_at.isoformat() if application.updated_at else None,
        "applicant_count": counts.get(job.id, 0),
    }


@tracking_bp.get("/applications/board")
@jwt_required()
def board():
    """Saved jobs + the user's applications grouped by stage."""
    uid = _uid()
    rows = (db.session.query(Application, Job).join(Job, Job.id == Application.job_id)
            .filter(Application.user_id == uid).order_by(Application.updated_at.desc().nullslast(),
                                                         Application.id.desc()).all())
    saved = (db.session.query(SavedJob, Job).join(Job, Job.id == SavedJob.job_id)
             .filter(SavedJob.user_id == uid).order_by(SavedJob.created_at.desc()).all())
    counts = competition.applicant_counts([j.id for _, j in rows] + [j.id for _, j in saved])
    columns = {"Saved": [{"job_id": j.id, "title": j.title, "company": j.company, "location": j.location,
                          "salary": j.salary, "status": "Saved",
                          "applicant_count": counts.get(j.id, 0),
                          "saved_at": s.created_at.isoformat() if s.created_at else None}
                         for s, j in saved]}
    for stage in STATUSES:
        columns[stage] = []
    for a, j in rows:
        columns.setdefault(a.status, []).append(_card(a, j, counts))
    return {"success": True, "stages": ["Saved"] + STATUSES, "columns": columns,
            "totals": {k: len(v) for k, v in columns.items()}}, 200


@tracking_bp.get("/applications/<int:application_id>/history")
@jwt_required()
def history(application_id):
    """Status timeline. Visible to the candidate and to the recruiter who owns the job."""
    uid, role = _uid(), get_jwt().get("role")
    application = db.session.get(Application, application_id)
    if not application:
        return {"success": False, "message": "Application not found"}, 404
    job = db.session.get(Job, application.job_id)
    allowed = application.user_id == uid or (role == "RECRUITER" and job and job.recruiter_id == uid)
    if not allowed:
        return {"success": False, "message": "Application not found"}, 404
    events = (ApplicationStatusEvent.query.filter_by(application_id=application_id)
              .order_by(ApplicationStatusEvent.created_at, ApplicationStatusEvent.id).all())
    timeline = [e.to_dict() for e in events]
    if not timeline:  # applications created before status events existed
        timeline = [{"id": None, "application_id": application_id, "from_status": None, "to_status": "Applied",
                     "note": None, "actor_id": application.user_id,
                     "created_at": application.applied_at.isoformat() if application.applied_at else None}]
    applied_early = bool(job and job.created_at and application.applied_at and
                         (application.applied_at - job.created_at).total_seconds() / 3600
                         <= competition.EARLY_WINDOW_HOURS)
    return {"success": True, "application_id": application_id, "status": application.status,
            "applied_early": applied_early,
            "job": {"id": job.id, "title": job.title, "company": job.company} if job else None,
            "history": timeline}, 200
