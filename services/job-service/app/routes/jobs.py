from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from app.extensions import db
from app.models.job import Job
from app.models.swipe import Swipe
from app.models.saved_job import SavedJob
from app.models.application import Application

jobs_bp = Blueprint("jobs", __name__)

@jobs_bp.post("/")
@jwt_required()
def create_job():
    claims = get_jwt()

    if claims.get("role") != "RECRUITER":
        return {
            "success": False,
            "message": "Only recruiters can create jobs"
        }, 403

    data = request.get_json() or {}

    required = ["title", "company", "description", "location", "skills"]

    if any(not data.get(field) for field in required):
        return {
            "success": False,
            "message": "title, company, description, location and skills are required"
        }, 400

    job = Job(
        recruiter_id=int(get_jwt_identity()),
        title=data["title"],
        company=data["company"],
        description=data["description"],
        location=data["location"],
        skills=data["skills"],
        salary=data.get("salary")
    )

    db.session.add(job)
    db.session.commit()

    return {
        "success": True,
        "message": "Job created successfully",
        "job": job.to_dict()
    }, 201


@jobs_bp.get("/")
def get_jobs():
    query = Job.query

    search = request.args.get("search")
    location = request.args.get("location")
    skills = request.args.get("skills")

    if search:
        query = query.filter(
            db.or_(
                Job.title.ilike(f"%{search}%"),
                Job.company.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%")
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if skills:
        query = query.filter(Job.skills.ilike(f"%{skills}%"))

    jobs = query.order_by(Job.id.desc()).all()

    return {
        "success": True,
        "count": len(jobs),
        "jobs": [job.to_dict() for job in jobs]
    }, 200


@jobs_bp.get("/<int:job_id>")
def get_job(job_id):
    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found"
        }, 404

    return {
        "success": True,
        "job": job.to_dict()
    }, 200


@jobs_bp.delete("/<int:job_id>")
@jwt_required()
def delete_job(job_id):
    claims = get_jwt()
    user_id = int(get_jwt_identity())

    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found"
        }, 404

    if claims.get("role") != "RECRUITER" or job.recruiter_id != user_id:
        return {
            "success": False,
            "message": "You cannot delete this job"
        }, 403

    db.session.delete(job)
    db.session.commit()

    return {
        "success": True,
        "message": "Job deleted successfully"
    }, 200

@jobs_bp.post("/<int:job_id>/swipe")
@jwt_required()
def swipe_job(job_id):
    user_id = int(get_jwt_identity())

    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found"
        }, 404

    data = request.get_json() or {}
    action = data.get("action")

    if action not in ["RIGHT", "LEFT"]:
        return {
            "success": False,
            "message": "action must be RIGHT or LEFT"
        }, 400

    existing_swipe = Swipe.query.filter_by(
        user_id=user_id,
        job_id=job_id
    ).first()

    if existing_swipe:
        existing_swipe.action = action
    else:
        swipe = Swipe(
            user_id=user_id,
            job_id=job_id,
            action=action
        )
        db.session.add(swipe)

    db.session.commit()

    return {
        "success": True,
        "message": f"Job swiped {action}",
        "swipe": {
            "user_id": user_id,
            "job_id": job_id,
            "action": action
        }
    }, 200

@jobs_bp.get("/swipes")
@jwt_required()
def get_swipe_history():
    user_id = int(get_jwt_identity())

    swipes = Swipe.query.filter_by(
        user_id=user_id
    ).order_by(Swipe.id.desc()).all()

    return {
        "success": True,
        "count": len(swipes),
        "swipes": [swipe.to_dict() for swipe in swipes]
    }, 200


@jobs_bp.post("/<int:job_id>/save")
@jwt_required()
def save_job(job_id):
    user_id = int(get_jwt_identity())

    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found"
        }, 404

    existing = SavedJob.query.filter_by(
        user_id=user_id,
        job_id=job_id
    ).first()

    if existing:
        return {
            "success": True,
            "message": "Job already saved",
            "saved": existing.to_dict()
        }, 200

    saved_job = SavedJob(
        user_id=user_id,
        job_id=job_id
    )

    db.session.add(saved_job)
    db.session.commit()

    return {
        "success": True,
        "message": "Job saved successfully",
        "saved": saved_job.to_dict()
    }, 201

@jobs_bp.delete("/<int:job_id>/save")
@jwt_required()
def unsave_job(job_id):
    user_id = int(get_jwt_identity())

    saved_job = SavedJob.query.filter_by(
        user_id=user_id,
        job_id=job_id
    ).first()

    if not saved_job:
        return {
            "success": False,
            "message": "Job is not saved"
        }, 404

    db.session.delete(saved_job)
    db.session.commit()

    return {
        "success": True,
        "message": "Job removed from saved jobs"
    }, 200

@jobs_bp.get("/saved")
@jwt_required()
def get_saved_jobs():
    user_id = int(get_jwt_identity())

    saved_jobs = (
        SavedJob.query
        .filter_by(user_id=user_id)
        .order_by(SavedJob.id.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(saved_jobs),
        "saved_jobs": [
            saved.to_dict()
            for saved in saved_jobs
        ]
    }, 200

@jobs_bp.post("/<int:job_id>/apply")
@jwt_required()
def apply_job(job_id):
    user_id = int(get_jwt_identity())

    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found"
        }, 404

    existing = Application.query.filter_by(
        user_id=user_id,
        job_id=job_id
    ).first()

    if existing:
        return {
            "success": False,
            "message": "You have already applied for this job",
            "application": existing.to_dict()
        }, 409

    data = request.get_json() or {}

    application = Application(
        user_id=user_id,
        job_id=job_id,
        resume_id=data.get("resume_id"),
        status="Applied"
    )

    db.session.add(application)
    db.session.commit()

    return {
        "success": True,
        "message": "Application submitted successfully",
        "application": application.to_dict()
    }, 201

@jobs_bp.get("/applications")
@jwt_required()
def get_applications():
    user_id = int(get_jwt_identity())

    applications = (
        Application.query
        .filter_by(user_id=user_id)
        .order_by(Application.id.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(applications),
        "applications": [
            application.to_dict()
            for application in applications
        ]
    }, 200