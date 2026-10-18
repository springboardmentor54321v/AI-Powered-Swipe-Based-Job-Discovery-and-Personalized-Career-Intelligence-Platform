from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.models.application_history import ApplicationHistory
from app.extensions import db
from app.models.application import Application


applications_bp = Blueprint("applications", __name__)


VALID_STATUSES = [
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEW",
    "REJECTED"
]


@applications_bp.post("/")
@jwt_required()
def create_application():
    claims = get_jwt()

    if claims.get("role") != "JOB_SEEKER":
        return {
            "success": False,
            "message": "Forbidden"
        }, 403

    data = request.get_json() or {}
    job_id = data.get("job_id")

    if not job_id:
        return {
            "success": False,
            "message": "job_id is required"
        }, 400

    user_id = int(get_jwt_identity())

    existing = Application.query.filter_by(
        user_id=user_id,
        job_id=int(job_id)
    ).first()

    if existing:
        return {
            "success": False,
            "message": "Application already exists",
            "application": existing.to_dict()
        }, 409

    application = Application(
        user_id=user_id,
        job_id=int(job_id),
        status="APPLIED"
    )

    db.session.add(application)
    db.session.commit()

    return {
        "success": True,
        "message": "Application created successfully",
        "application": application.to_dict()
    }, 201


@applications_bp.get("/")
@jwt_required()
def get_my_applications():
    user_id = int(get_jwt_identity())

    applications = Application.query.filter_by(
        user_id=user_id
    ).order_by(Application.applied_at.desc()).all()

    return {
        "success": True,
        "applications": [
            application.to_dict()
            for application in applications
        ]
    }, 200


@applications_bp.get("/<int:application_id>")
@jwt_required()
def get_application(application_id):
    user_id = int(get_jwt_identity())

    application = Application.query.get(application_id)

    if not application:
        return {
            "success": False,
            "message": "Application not found"
        }, 404

    if application.user_id != user_id:
        return {
            "success": False,
            "message": "Forbidden"
        }, 403

    return {
        "success": True,
        "application": application.to_dict()
    }, 200

@applications_bp.get("/<int:application_id>/history")
@jwt_required()
def get_application_history(application_id):
    user_id = int(get_jwt_identity())

    application = Application.query.get(application_id)

    if not application:
        return {
            "success": False,
            "message": "Application not found"
        }, 404

    if application.user_id != user_id:
        return {
            "success": False,
            "message": "Forbidden"
        }, 403

    history = ApplicationHistory.query.filter_by(
        application_id=application_id
    ).order_by(
        ApplicationHistory.changed_at.asc()
    ).all()

    return {
        "success": True,
        "history": [
            item.to_dict()
            for item in history
        ]
    }, 200
    
@applications_bp.put("/<int:application_id>/status")
@jwt_required()
def update_application_status(application_id):
    claims = get_jwt()

    if claims.get("role") != "RECRUITER":
        return {
            "success": False,
            "message": "Forbidden"
        }, 403

    data = request.get_json() or {}
    status = data.get("status")

    if status not in VALID_STATUSES:
        return {
            "success": False,
            "message": "Invalid application status"
        }, 400

    application = Application.query.get(application_id)

    if not application:
        return {
            "success": False,
            "message": "Application not found"
        }, 404

    old_status = application.status

    application.status = status

    history = ApplicationHistory(
        application_id=application.id,
        old_status=old_status,
        new_status=status
    )

    db.session.add(history)
    db.session.commit()

    return {
        "success": True,
        "message": "Application status updated successfully",
        "application": application.to_dict()
    }, 200