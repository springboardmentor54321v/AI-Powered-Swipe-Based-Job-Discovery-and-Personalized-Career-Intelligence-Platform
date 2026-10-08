import json
import os
import requests
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.resume import Resume

resume_bp = Blueprint("resume", __name__)

UPLOAD_FOLDER = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
)

ALLOWED_EXTENSIONS = {"pdf", "docx"}

def _ai_headers():
    key = os.getenv("INTERNAL_API_KEY", "")
    return {"X-Internal-Key": key} if key else {}


AI_SERVICE_URL = os.getenv(
    "AI_SERVICE_URL",
    os.getenv("ATS_SERVICE_URL", "http://127.0.0.1:8000")
)

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@resume_bp.post("/upload")
@jwt_required()
def upload_resume():
    user_id = int(get_jwt_identity())

    if "file" not in request.files:
        return {
            "success": False,
            "message": "Resume file is required"
        }, 400
    file = request.files["file"]

    file.stream.seek(0, os.SEEK_END)
    size = file.stream.tell()
    file.stream.seek(0)
    if size == 0:
        return {
            "success": False,
            "message": "Resume file cannot be empty"
        }, 400

    if not file.filename:
        return {
            "success": False,
            "message": "Filename is required"
        }, 400

    if not allowed_file(file.filename):
        return {
            "success": False,
            "message": "Only PDF and DOCX files are allowed"
        }, 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(file.filename)

    resume = Resume(
        user_id=user_id,
        filename=filename
    )

    db.session.add(resume)
    db.session.flush()

    stored_filename = f"{user_id}_{resume.id}_{filename}"
    file_path = os.path.join(UPLOAD_FOLDER, stored_filename)

    file.save(file_path)

    resume.file_path = file_path

    # Send the same resume file to Intern 4's Resume Service
    try:
        with open(file_path, "rb") as resume_file:
            response = requests.post(
                f"{AI_SERVICE_URL.rstrip('/')}/api/v1/resume/upload",
                files={
                    "file": (
                        filename,
                        resume_file,
                        "application/pdf"
                        if filename.lower().endswith(".pdf")
                        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    )
                },
                params={"user_id": str(user_id)},
                headers=_ai_headers(),
                timeout=30
            )

        if response.status_code not in (200, 201):
            db.session.rollback()

            if os.path.exists(file_path):
                os.remove(file_path)

            return {
                "success": False,
                "message": "External resume service upload failed",
                "status_code": response.status_code
            }, 502

        try:
            external_data = response.json()
        except ValueError:
            db.session.rollback()

            if os.path.exists(file_path):
                os.remove(file_path)

            return {
                "success": False,
                "message": "External resume service returned an invalid response"
            }, 502

        external_resume_id = external_data.get("resume_id")

        if not external_resume_id:
            db.session.rollback()

            if os.path.exists(file_path):
                os.remove(file_path)

            return {
                "success": False,
                "message": "External resume service did not return resume_id"
            }, 502

        resume.external_resume_id = external_resume_id
        resume.extracted_skills = json.dumps(external_data.get("parsed_skills") or [])
        resume.parsed_text = external_data.get("raw_text") or None

    except requests.RequestException as e:
        db.session.rollback()

        if os.path.exists(file_path):
            os.remove(file_path)

        return {
            "success": False,
            "message": "Could not connect to external resume service"
        }, 502

    db.session.commit()

    return {
        "success": True,
        "message": "Resume uploaded successfully",
        "resume": resume.to_dict()
    }, 201


@resume_bp.get("/")
@jwt_required()
def get_my_resumes():
    user_id = int(get_jwt_identity())

    resumes = Resume.query.filter_by(user_id=user_id).order_by(Resume.id.desc()).all()

    return {
        "success": True,
        "count": len(resumes),
        "resumes": [resume.to_dict() for resume in resumes]
    }, 200
@resume_bp.get("/<int:resume_id>")
@jwt_required()
def get_resume(resume_id):
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
        "resume": resume.to_dict()
    }, 200
@resume_bp.delete("/<int:resume_id>")
@jwt_required()
def delete_resume(resume_id):
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

    if resume.file_path and os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.session.delete(resume)
    db.session.commit()

    return {
        "success": True,
        "message": "Resume deleted successfully",
        "resume_id": resume_id
    }, 200
@resume_bp.post("/<int:resume_id>/parse")
@jwt_required()
def parse_resume(resume_id):
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

    if not resume.file_path or not os.path.exists(resume.file_path):
        return {
            "success": False,
            "message": "Resume file not found"
        }, 404

    try:
        with open(resume.file_path, "rb") as fh:
            response = requests.post(
                f"{AI_SERVICE_URL.rstrip('/')}/api/v1/resume/upload",
                files={"file": (resume.filename, fh, "application/pdf")},
                params={"user_id": str(user_id)},
                headers=_ai_headers(),
                timeout=30
            )
        data = response.json()
    except (requests.RequestException, ValueError):
        return {"success": False, "message": "Could not reach resume extraction service"}, 502

    if response.status_code not in (200, 201):
        return {
            "success": False,
            "message": "Resume extraction failed (the AI parser currently supports PDF only)",
            "status_code": response.status_code
        }, 502

    resume.external_resume_id = data.get("resume_id") or resume.external_resume_id
    resume.extracted_skills = json.dumps(data.get("parsed_skills") or [])
    resume.parsed_text = data.get("raw_text") or None
    db.session.commit()

    return {
        "success": True,
        "resume_id": resume.id,
        "skills": data.get("parsed_skills", []),
        "status": "parsed"
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
        "ats_score": resume.ats_score,
        "status": (
            "analysis_pending"
            if resume.ats_score is None
            else "analysis_complete"
        )
    }, 200
@resume_bp.post("/ats/score")
@jwt_required()
def score_resume():
    user_id = int(get_jwt_identity())

    data = request.get_json(silent=True)

    if not data:
        return {
            "success": False,
            "message": "Request body is required"
        }, 400

    resume_id = data.get("resume_id")
    job_id = data.get("job_id")

    if not isinstance(resume_id, int) or not isinstance(job_id, int):
        return {
            "success": False,
            "message": "resume_id and job_id must be integers"
        }, 400

    if resume_id <= 0 or job_id <= 0:
        return {
            "success": False,
            "message": "resume_id and job_id must be positive integers"
        }, 400

    resume = Resume.query.filter_by(
        id=resume_id,
        user_id=user_id
    ).first()

    if not resume:
        return {
            "success": False,
            "message": "Resume not found"
        }, 404

    # AI service resolves an external uuid first, then falls back to this DB id
    resume_ref = resume.external_resume_id or resume.id
    mode = str(data.get("mode") or "hybrid").lower()  # heuristic | ml | hybrid
    external_job_id = str(job_id)

    ats_url = (
        f"{AI_SERVICE_URL.rstrip('/')}/api/v1/resume/"
        f"{resume_ref}/ats-score"
    )

    try:
        response = requests.get(
            ats_url,
            params={"job_id": external_job_id, "mode": mode},
            headers=_ai_headers(),
            timeout=30
        )
    except requests.RequestException:
        return {
            "success": False,
            "message": "Could not connect to ATS scoring service"
        }, 502

    if response.status_code != 200:
        try:
            external_error = response.json()
        except ValueError:
            external_error = {}

        return {
            "success": False,
            "message": "ATS scoring service returned an error",
            "status_code": response.status_code,
            "external_response": external_error
        }, 502

    try:
        ats_data = response.json()
    except ValueError:
        return {
            "success": False,
            "message": "ATS scoring service returned invalid JSON"
        }, 502

    resume.ats_score = ats_data.get("match_score")
    db.session.commit()

    return {
        "success": True,
        "resume_id": resume.id,
        "job_id": job_id,
        "external_job_id": external_job_id,
        "ats": ats_data
    }, 200
@resume_bp.post("/ai-suggestions")
@jwt_required()
def ai_suggestions():
    user_id = int(get_jwt_identity())

    data = request.get_json(silent=True)

    if not data:
        return {
            "success": False,
            "message": "Request body is required"
        }, 400

    resume_id = data.get("resume_id")
    job_id = data.get("job_id")

    if not isinstance(resume_id, int) or not isinstance(job_id, int):
        return {
            "success": False,
            "message": "resume_id and job_id must be integers"
        }, 400

    if resume_id <= 0 or job_id <= 0:
        return {
            "success": False,
            "message": "resume_id and job_id must be positive integers"
        }, 400

    resume = Resume.query.filter_by(
        id=resume_id,
        user_id=user_id
    ).first()

    if not resume:
        return {
            "success": False,
            "message": "Resume not found"
        }, 404

    # Intern 4 AI suggestions integration point.
    return {
        "success": False,
        "message": "AI suggestions service is not connected yet",
        "resume_id": resume.id,
        "job_id": job_id,
        "status": "suggestions_pending"
    }, 503