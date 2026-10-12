from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.resume import Resume

resume_bp = Blueprint("resume", __name__)

@resume_bp.post("/")
@jwt_required()
def create_resume():
    data = request.get_json() or {}

    filename = data.get("filename")

    if not filename:
        return {
            "success": False,
            "message": "filename is required"
        }, 400

    resume = Resume(
        user_id=int(get_jwt_identity()),
        filename=filename,
        file_path=data.get("file_path"),
        ats_score=data.get("ats_score")
    )

    db.session.add(resume)
    db.session.commit()

    return {
        "success": True,
        "message": "Resume saved successfully",
        "resume": resume.to_dict()
    }, 201


@resume_bp.get("/")
@jwt_required()
def get_my_resumes():
    user_id = int(get_jwt_identity())

    resumes = Resume.query.filter_by(user_id=user_id).all()

    return {
        "success": True,
        "count": len(resumes),
        "resumes": [resume.to_dict() for resume in resumes]
    }, 200


@resume_bp.get("/<int:resume_id>/ats")
@jwt_required()
def get_ats_result(resume_id):
    user_id = int(get_jwt_identity())

    resume = Resume.query.filter_by(
        id=resume_id,
        user_id=user_id
    ).first()

    if not resume:
        return {
            "success": False,
            "message": "Resume not found"
        }, 404

    return {
        "success": True,
        "resume_id": resume.id,
        "ats_score": resume.ats_score or 0,
        "status": "analysis_pending" if resume.ats_score is None else "analysis_complete"
    }, 200
