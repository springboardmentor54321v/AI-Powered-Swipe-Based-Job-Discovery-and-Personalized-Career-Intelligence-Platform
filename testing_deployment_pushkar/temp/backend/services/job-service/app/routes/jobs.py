from flask import Blueprint, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt,
    get_jwt_identity,
)

from app.extensions import db
from app.models.job import Job
from app.models.swipe import Swipe
from app.models.saved_job import SavedJob
from app.models.application import Application


jobs_bp = Blueprint("jobs", __name__)


# ============================================================
# HELPERS
# ============================================================

def get_current_user_id():
    """
    Safely get the logged-in user's ID from JWT.
    """
    try:
        return int(get_jwt_identity())
    except (TypeError, ValueError):
        return None


def is_job_seeker():
    """
    Check whether current JWT belongs to a Job Seeker.
    """
    claims = get_jwt()
    return claims.get("role") == "JOB_SEEKER"


# ============================================================
# RECRUITER - CREATE JOB
# ============================================================

@jobs_bp.post("/")
@jwt_required()
def create_job():
    claims = get_jwt()

    # Only recruiters can post jobs
    if claims.get("role") != "RECRUITER":
        return {
            "success": False,
            "message": "Only recruiters can create jobs",
        }, 403

    data = request.get_json(silent=True) or {}

    required = [
        "title",
        "company",
        "description",
        "location",
        "skills",
    ]

    missing = [
        field
        for field in required
        if not data.get(field)
    ]

    if missing:
        return {
            "success": False,
            "message": (
                "Missing required fields: "
                + ", ".join(missing)
            ),
        }, 400

    recruiter_id = get_current_user_id()

    if recruiter_id is None:
        return {
            "success": False,
            "message": "Invalid recruiter identity",
        }, 401

    try:
        skills = data["skills"]

        if isinstance(skills, str):
            skills = skills.strip()
        elif isinstance(skills, list):
            skills = ", ".join(
                str(skill).strip()
                for skill in skills
                if str(skill).strip()
            )
        else:
            skills = str(skills)

        job = Job(
            recruiter_id=recruiter_id,

            title=data["title"].strip(),
            company=data["company"].strip(),
            description=data["description"].strip(),
            location=data["location"].strip(),

            skills=skills,

            salary=data.get("salary"),

            employment_type=data.get(
                "employment_type"
            ),

            experience_level=data.get(
                "experience_level"
            ),

            work_mode=data.get(
                "work_mode"
            ),

            deadline=data.get(
                "deadline"
            ),

            qualifications=data.get(
                "qualifications"
            ),

            status=data.get(
                "status",
                "Active"
            ),
        )

        db.session.add(job)
        db.session.commit()

        return {
            "success": True,
            "message": "Job created successfully",
            "job": job.to_dict(),
        }, 201

    except Exception as exc:
        db.session.rollback()

        print(
            "CREATE JOB ERROR:",
            exc,
        )

        return {
            "success": False,
            "message": "Unable to create job",
        }, 500


# ============================================================
# RECRUITER - MY JOBS
# ============================================================

@jobs_bp.get("/my-jobs")
@jwt_required()
def get_my_jobs():
    claims = get_jwt()

    if claims.get("role") != "RECRUITER":
        return {
            "success": False,
            "message": (
                "Only recruiters can access "
                "their jobs"
            ),
        }, 403

    recruiter_id = get_current_user_id()

    if recruiter_id is None:
        return {
            "success": False,
            "message": "Invalid recruiter identity",
        }, 401

    jobs = (
        Job.query
        .filter_by(
            recruiter_id=recruiter_id
        )
        .order_by(Job.id.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(jobs),
        "jobs": [
            job.to_dict()
            for job in jobs
        ],
    }, 200


# ============================================================
# JOB SEEKER - JOB DISCOVERY
# ============================================================

@jobs_bp.get("/")
def get_jobs():
    """
    Public job discovery endpoint.

    Supported query parameters:

        search
        location
        skills
        employment_type
        work_mode
        experience_level
        recently_posted
    """

    query = Job.query

    # ========================================================
    # SEARCH
    # ========================================================

    search = request.args.get(
        "search",
        type=str,
    )

    if search and search.strip():

        search_value = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            db.or_(
                Job.title.ilike(search_value),
                Job.company.ilike(search_value),
                Job.description.ilike(search_value),
                Job.skills.ilike(search_value),
            )
        )

    # ========================================================
    # LOCATION
    # ========================================================

    location = request.args.get(
        "location",
        type=str,
    )

    if (
        location
        and location.strip()
        and location != "All"
    ):

        query = query.filter(
            Job.location.ilike(
                f"%{location.strip()}%"
            )
        )

    # ========================================================
    # SKILLS
    # ========================================================

    skills = request.args.get(
        "skills",
        type=str,
    )

    if (
        skills
        and skills.strip()
        and skills != "All"
    ):

        query = query.filter(
            Job.skills.ilike(
                f"%{skills.strip()}%"
            )
        )

    # ========================================================
    # EMPLOYMENT TYPE
    # ========================================================

    employment_type = request.args.get(
        "employment_type",
        type=str,
    )

    if (
        employment_type
        and employment_type != "All"
    ):

        query = query.filter(
            Job.employment_type.ilike(
                employment_type.strip()
            )
        )

    # ========================================================
    # WORK MODE
    # ========================================================

    work_mode = request.args.get(
        "work_mode",
        type=str,
    )

    if (
        work_mode
        and work_mode != "All"
    ):

        query = query.filter(
            Job.work_mode.ilike(
                work_mode.strip()
            )
        )

    # ========================================================
    # EXPERIENCE LEVEL
    # ========================================================

    experience_level = request.args.get(
        "experience_level",
        type=str,
    )

    if (
        experience_level
        and experience_level != "All"
    ):

        query = query.filter(
            Job.experience_level.ilike(
                f"%{experience_level.strip()}%"
            )
        )

    # ========================================================
    # ACTIVE JOBS ONLY
    # ========================================================

    query = query.filter(
        db.or_(
            Job.status == "Active",
            Job.status.is_(None),
        )
    )

    # ========================================================
    # RECENTLY POSTED
    # ========================================================

    recently_posted = request.args.get(
        "recently_posted",
        type=str,
    )

    if recently_posted == "true":

        recent_date = (
            db.func.now()
            - db.text("INTERVAL '7 days'")
        )

        query = query.filter(
            Job.created_at >= recent_date
        )

    # ========================================================
    # RESULT
    # ========================================================

    jobs = (
        query
        .order_by(
            Job.created_at.desc(),
            Job.id.desc(),
        )
        .all()
    )

    return {
        "success": True,
        "count": len(jobs),
        "jobs": [
            job.to_dict()
            for job in jobs
        ],
    }, 200


# ============================================================
# GET SINGLE JOB
# ============================================================

@jobs_bp.get("/<int:job_id>")
def get_job(job_id):
    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found",
        }, 404

    return {
        "success": True,
        "job": job.to_dict(),
    }, 200


# ============================================================
# RECRUITER - DELETE JOB
# ============================================================

@jobs_bp.delete("/<int:job_id>")
@jwt_required()
def delete_job(job_id):
    claims = get_jwt()

    user_id = get_current_user_id()

    if user_id is None:
        return {
            "success": False,
            "message": "Invalid user identity",
        }, 401

    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found",
        }, 404

    # Only owning recruiter can delete
    if (
        claims.get("role") != "RECRUITER"
        or job.recruiter_id != user_id
    ):
        return {
            "success": False,
            "message": (
                "You cannot delete this job"
            ),
        }, 403

    try:
        db.session.delete(job)
        db.session.commit()

        return {
            "success": True,
            "message": (
                "Job deleted successfully"
            ),
        }, 200

    except Exception as exc:
        db.session.rollback()

        print(
            "DELETE JOB ERROR:",
            exc,
        )

        return {
            "success": False,
            "message": "Unable to delete job",
        }, 500


# ============================================================
# JOB SEEKER - SWIPE
# ============================================================
#
# FINAL PRODUCT SEMANTICS:
#
# LEFT:
#   swipes -> LEFT
#
# RIGHT:
#   swipes -> RIGHT
#   applications -> Applied
#
# SAVE:
#   handled separately by /save
#
# ============================================================

@jobs_bp.post("/<int:job_id>/swipe")
@jwt_required()
def swipe_job(job_id):
    user_id = get_current_user_id()

    if user_id is None:
        return {
            "success": False,
            "message": "Invalid user identity",
        }, 401

    # --------------------------------------------------------
    # ROLE CHECK
    # --------------------------------------------------------

    if not is_job_seeker():
        return {
            "success": False,
            "message": (
                "Only job seekers can swipe jobs"
            ),
        }, 403

    # --------------------------------------------------------
    # JOB CHECK
    # --------------------------------------------------------

    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found",
        }, 404

    # --------------------------------------------------------
    # REQUEST
    # --------------------------------------------------------

    data = request.get_json(
        silent=True
    ) or {}

    action = data.get("action")

    if action not in [
        "RIGHT",
        "LEFT",
    ]:
        return {
            "success": False,
            "message": (
                "action must be RIGHT or LEFT"
            ),
        }, 400

    try:
        # ====================================================
        # SAVE / UPDATE SWIPE
        # ====================================================

        existing_swipe = (
            Swipe.query
            .filter_by(
                user_id=user_id,
                job_id=job_id,
            )
            .first()
        )

        if existing_swipe:
            existing_swipe.action = action

        else:
            swipe = Swipe(
                user_id=user_id,
                job_id=job_id,
                action=action,
            )

            db.session.add(swipe)

        # ====================================================
        # RIGHT = APPLY
        # ====================================================

        application = None

        if action == "RIGHT":

            # ----------------------------------------------
            # Check existing application
            # ----------------------------------------------

            application = (
                Application.query
                .filter_by(
                    user_id=user_id,
                    job_id=job_id,
                )
                .first()
            )

            # ----------------------------------------------
            # Create application if missing
            # ----------------------------------------------

            if not application:

                application = Application(
                    user_id=user_id,
                    job_id=job_id,
                    status="Applied",
                )

                db.session.add(
                    application
                )

        # ====================================================
        # COMMIT EVERYTHING TOGETHER
        # ====================================================

        db.session.commit()

        response = {
            "success": True,
            "job_id": job_id,
            "action": action,
        }

        # ----------------------------------------------------
        # LEFT
        # ----------------------------------------------------

        if action == "LEFT":
            response["message"] = (
                "Job skipped successfully"
            )

            response["swipe"] = {
                "user_id": user_id,
                "job_id": job_id,
                "action": "LEFT",
            }

        # ----------------------------------------------------
        # RIGHT
        # ----------------------------------------------------

        else:
            response["message"] = (
                "Application submitted successfully"
            )

            response["swipe"] = {
                "user_id": user_id,
                "job_id": job_id,
                "action": "RIGHT",
            }

            response["application"] = {
                "id": application.id,
                "user_id": application.user_id,
                "job_id": application.job_id,
                "status": application.status,
                "applied_at": (
                    application.applied_at.isoformat()
                    if application.applied_at
                    else None
                ),
            }

        return response, 200

    except Exception as exc:
        db.session.rollback()

        print(
            "SWIPE ERROR:",
            exc,
        )

        return {
            "success": False,
            "message": (
                "Unable to process swipe"
            ),
        }, 500


# ============================================================
# GET SWIPE HISTORY
# ============================================================

@jobs_bp.get("/swipes")
@jwt_required()
def get_swipe_history():
    user_id = get_current_user_id()

    if user_id is None:
        return {
            "success": False,
            "message": "Invalid user identity",
        }, 401

    swipes = (
        Swipe.query
        .filter_by(
            user_id=user_id
        )
        .order_by(
            Swipe.id.desc()
        )
        .all()
    )

    return {
        "success": True,
        "count": len(swipes),
        "swipes": [
            swipe.to_dict()
            for swipe in swipes
        ],
    }, 200


# ============================================================
# SAVE JOB
# ============================================================
#
# IMPORTANT:
#
# Saving does NOT:
#   - create a swipe
#   - create an application
#   - remove the card from discovery
#
# ============================================================

@jobs_bp.post("/<int:job_id>/save")
@jwt_required()
def save_job(job_id):
    user_id = get_current_user_id()

    if user_id is None:
        return {
            "success": False,
            "message": "Invalid user identity",
        }, 401

    if not is_job_seeker():
        return {
            "success": False,
            "message": (
                "Only job seekers can save jobs"
            ),
        }, 403

    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found",
        }, 404

    try:
        existing = (
            SavedJob.query
            .filter_by(
                user_id=user_id,
                job_id=job_id,
            )
            .first()
        )

        if existing:
            return {
                "success": True,
                "message": "Job already saved",
                "saved": True,
                "job_id": job_id,
            }, 200

        saved_job = SavedJob(
            user_id=user_id,
            job_id=job_id,
        )

        db.session.add(
            saved_job
        )

        db.session.commit()

        return {
            "success": True,
            "message": (
                "Job saved successfully"
            ),
            "saved": True,
            "job_id": job_id,
        }, 201

    except Exception as exc:
        db.session.rollback()

        print(
            "SAVE JOB ERROR:",
            exc,
        )

        return {
            "success": False,
            "message": (
                "Unable to save job"
            ),
        }, 500


# ============================================================
# UNSAVE JOB
# ============================================================

@jobs_bp.delete("/<int:job_id>/save")
@jwt_required()
def unsave_job(job_id):
    user_id = get_current_user_id()

    if user_id is None:
        return {
            "success": False,
            "message": "Invalid user identity",
        }, 401

    if not is_job_seeker():
        return {
            "success": False,
            "message": (
                "Only job seekers can unsave jobs"
            ),
        }, 403

    saved_job = (
        SavedJob.query
        .filter_by(
            user_id=user_id,
            job_id=job_id,
        )
        .first()
    )

    if not saved_job:
        return {
            "success": True,
            "message": (
                "Job was not saved"
            ),
            "saved": False,
            "job_id": job_id,
        }, 200

    try:
        db.session.delete(
            saved_job
        )

        db.session.commit()

        return {
            "success": True,
            "message": (
                "Job removed from saved jobs"
            ),
            "saved": False,
            "job_id": job_id,
        }, 200

    except Exception as exc:
        db.session.rollback()

        print(
            "UNSAVE JOB ERROR:",
            exc,
        )

        return {
            "success": False,
            "message": (
                "Unable to remove saved job"
            ),
        }, 500


# ============================================================
# GET SAVED JOBS
# ============================================================

@jobs_bp.get("/saved")
@jwt_required()
def get_saved_jobs():
    user_id = get_current_user_id()

    if user_id is None:
        return {
            "success": False,
            "message": "Invalid user identity",
        }, 401

    if not is_job_seeker():
        return {
            "success": False,
            "message": (
                "Only job seekers can access "
                "saved jobs"
            ),
        }, 403

    saved_jobs = (
        SavedJob.query
        .filter_by(
            user_id=user_id
        )
        .order_by(
            SavedJob.created_at.desc()
        )
        .all()
    )

    result = []

    for saved_job in saved_jobs:

        job = saved_job.job

        if not job:
            continue

        result.append({
            "id": job.id,
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "description": job.description,
            "location": job.location,
            "skills": job.skills,
            "salary": job.salary,

            "employment_type": getattr(
                job,
                "employment_type",
                None,
            ),

            "experience_level": getattr(
                job,
                "experience_level",
                None,
            ),

            "work_mode": getattr(
                job,
                "work_mode",
                None,
            ),

            "deadline": getattr(
                job,
                "deadline",
                None,
            ),

            "qualifications": getattr(
                job,
                "qualifications",
                None,
            ),

            "saved_at": (
                saved_job.created_at.isoformat()
                if saved_job.created_at
                else None
            ),
        })

    return {
        "success": True,
        "count": len(result),
        "saved_jobs": result,
    }, 200


# ============================================================
# EXPLICIT APPLY
# ============================================================
#
# This endpoint is available for places in the UI where the
# user clicks an explicit Apply button.
#
# Right swipe already performs this same application action.
#
# ============================================================

@jobs_bp.post("/<int:job_id>/apply")
@jwt_required()
def apply_job(job_id):
    user_id = get_current_user_id()

    if user_id is None:
        return {
            "success": False,
            "message": "Invalid user identity",
        }, 401

    if not is_job_seeker():
        return {
            "success": False,
            "message": (
                "Only job seekers can apply "
                "for jobs"
            ),
        }, 403

    job = Job.query.get(job_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found",
        }, 404

    try:
        # ----------------------------------------------------
        # Application
        # ----------------------------------------------------

        application = (
            Application.query
            .filter_by(
                user_id=user_id,
                job_id=job_id,
            )
            .first()
        )

        if application:
            return {
                "success": True,
                "message": (
                    "You have already applied "
                    "for this job"
                ),
                "already_applied": True,
                "application": {
                    "id": application.id,
                    "job_id": application.job_id,
                    "status": application.status,
                    "applied_at": (
                        application.applied_at.isoformat()
                        if application.applied_at
                        else None
                    ),
                },
            }, 200

        # ----------------------------------------------------
        # Create application
        # ----------------------------------------------------

        application = Application(
            user_id=user_id,
            job_id=job_id,
            status="Applied",
        )

        db.session.add(
            application
        )

        # ----------------------------------------------------
        # Also record RIGHT swipe
        # ----------------------------------------------------

        existing_swipe = (
            Swipe.query
            .filter_by(
                user_id=user_id,
                job_id=job_id,
            )
            .first()
        )

        if existing_swipe:
            existing_swipe.action = "RIGHT"

        else:
            swipe = Swipe(
                user_id=user_id,
                job_id=job_id,
                action="RIGHT",
            )

            db.session.add(
                swipe
            )

        db.session.commit()

        return {
            "success": True,
            "message": (
                "Application submitted successfully"
            ),
            "already_applied": False,
            "application": {
                "id": application.id,
                "job_id": application.job_id,
                "status": application.status,
                "applied_at": (
                    application.applied_at.isoformat()
                    if application.applied_at
                    else None
                ),
            },
        }, 201

    except Exception as exc:
        db.session.rollback()

        print(
            "APPLY JOB ERROR:",
            exc,
        )

        return {
            "success": False,
            "message": (
                "Unable to submit application"
            ),
        }, 500


# ============================================================
# GET MY APPLICATIONS
# ============================================================

@jobs_bp.get("/applications")
@jwt_required()
def get_my_applications():
    user_id = get_current_user_id()

    if user_id is None:
        return {
            "success": False,
            "message": "Invalid user identity",
        }, 401

    if not is_job_seeker():
        return {
            "success": False,
            "message": (
                "Only job seekers can access "
                "their applications"
            ),
        }, 403

    applications = (
        Application.query
        .filter_by(
            user_id=user_id
        )
        .order_by(
            Application.id.desc()
        )
        .all()
    )

    result = []

    for application in applications:

        job = application.job

        if not job:
            continue

        result.append({
            "id": application.id,

            "user_id": application.user_id,

            "job_id": application.job_id,

            "title": job.title,

            "company": job.company,

            "location": job.location,

            "skills": job.skills,

            "salary": job.salary,

            "status": application.status,

            "applied_at": (
                application.applied_at.isoformat()
                if application.applied_at
                else None
            ),
        })

    return {
        "success": True,
        "count": len(result),
        "applications": result,
    }, 200