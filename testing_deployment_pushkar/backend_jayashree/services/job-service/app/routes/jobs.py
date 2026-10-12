from flask import Blueprint, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt,
    get_jwt_identity,
    verify_jwt_in_request,
)

from app.extensions import db
from app.models.job import Job
from app.models.swipe import Swipe
from app.models.saved_job import SavedJob
from app.models.application import Application
from app.models.notification import Notification
from app.services import latest_resume_id, lookup_users, notify_new_application
from app import competition
from app.alerts import fan_out_new_job_async


def _viewer_id():
    """Logged-in user id for public endpoints that personalise when a token is present."""
    try:
        verify_jwt_in_request(optional=True)
        ident = get_jwt_identity()
        return int(ident) if ident else None
    except Exception:
        return None


def _with_competition(jobs, viewer_id=None):
    """Job models -> dicts with applicant count, competition level, posted-time and early-window fields."""
    payload = [j.to_dict() for j in jobs]
    return competition.enrich(payload, {j.id: j for j in jobs}, viewer_id)


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

        # Alerts (high match / low competition / startup / instant) run in the background
        fan_out_new_job_async(job.id)

        return {
            "success": True,
            "message": "Job created successfully",
            "job": _with_competition([job])[0],
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
        "jobs": _with_competition(jobs),
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

    payload = _with_competition(jobs, _viewer_id())

    # Competition filter: ?competition=Low|Medium|High  (or ?low_competition=true)
    wanted = (request.args.get("competition") or "").strip().title()
    if request.args.get("low_competition") == "true":
        wanted = "Low"
    if wanted in ("Low", "Medium", "High"):
        payload = [j for j in payload if j.get("competition_level") == wanted]

    return {
        "success": True,
        "count": len(payload),
        "jobs": payload,
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
        "job": _with_competition([job], _viewer_id())[0],
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
        Notification.query.filter_by(job_id=job_id).delete(synchronize_session=False)
        Application.query.filter_by(job_id=job_id).delete(synchronize_session=False)
        SavedJob.query.filter_by(job_id=job_id).delete(synchronize_session=False)
        Swipe.query.filter_by(job_id=job_id).delete(synchronize_session=False)

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
                    resume_id=latest_resume_id(user_id),
                    status="Applied",
                )

                db.session.add(
                    application
                )

                # Tell the recruiter (same transaction as the application)
                db.session.flush()
                notify_new_application(
                    job,
                    application,
                    (lookup_users([user_id]).get(user_id) or {}).get("name"),
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

    by_id = {s.job.id: s.job for s in saved_jobs if s.job}
    competition.enrich(result, by_id, user_id)

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
            resume_id=latest_resume_id(user_id),
            status="Applied",
        )

        db.session.add(
            application
        )

        db.session.flush()
        notify_new_application(
            job,
            application,
            (lookup_users([user_id]).get(user_id) or {}).get("name"),
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

            "updated_at": (
                application.updated_at.isoformat()
                if application.updated_at
                else None
            ),
        })

    return {
        "success": True,
        "count": len(result),
        "applications": result,
    }, 200

# from flask import Blueprint, request
# from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

# from app.extensions import db
# from app.models.job import Job
# from app.models.swipe import Swipe

# jobs_bp = Blueprint("jobs", __name__)


# @jobs_bp.post("/")
# @jwt_required()
# def create_job():
#     claims = get_jwt()

#     if claims.get("role") != "RECRUITER":
#         return {
#             "success": False,
#             "message": "Only recruiters can create jobs"
#         }, 403

#     data = request.get_json() or {}

#     required = [
#         "title",
#         "company",
#         "description",
#         "location",
#         "skills"
#     ]

#     if any(not data.get(field) for field in required):
#         return {
#             "success": False,
#             "message": "title, company, description, location and skills are required"
#         }, 400

#     job = Job(
#         recruiter_id=int(get_jwt_identity()),
#         title=data["title"],
#         company=data["company"],
#         description=data["description"],
#         location=data["location"],
#         skills=data["skills"],
#         salary=data.get("salary")
#     )

#     db.session.add(job)
#     db.session.commit()

#     return {
#         "success": True,
#         "message": "Job created successfully",
#         "job": job.to_dict()
#     }, 201


# @jobs_bp.get("/")
# def get_jobs():
#     page = request.args.get("page", 1, type=int)
#     per_page = request.args.get("per_page", 10, type=int)

#     if page < 1:
#         page = 1

#     if per_page < 1:
#         per_page = 10

#     if per_page > 100:
#         per_page = 100

#     query = Job.query.order_by(Job.id.desc())

#     search = request.args.get("search")
#     location = request.args.get("location")
#     skills = request.args.get("skills")

#     if search:
#         query = query.filter(
#             db.or_(
#                 Job.title.ilike(f"%{search}%"),
#                 Job.company.ilike(f"%{search}%"),
#                 Job.description.ilike(f"%{search}%")
#             )
#         )

#     if location:
#         query = query.filter(
#             Job.location.ilike(f"%{location}%")
#         )

#     if skills:
#         query = query.filter(
#             Job.skills.ilike(f"%{skills}%")
#         )

#     pagination = query.paginate(
#         page=page,
#         per_page=per_page,
#         error_out=False
#     )

#     return {
#         "success": True,
#         "page": page,
#         "per_page": per_page,
#         "total": pagination.total,
#         "jobs": [
#             job.to_dict()
#             for job in pagination.items
#         ]
#     }, 200

# @jobs_bp.get("/search")
# def search_jobs():
#     keyword = request.args.get("keyword")
#     location = request.args.get("location")
#     job_type = request.args.get("job_type")
#     experience_level = request.args.get("experience_level")
#     skills = request.args.get("skills")

#     salary_min = request.args.get("salary_min", type=float)
#     salary_max = request.args.get("salary_max", type=float)

#     page = request.args.get("page", 1, type=int)
#     per_page = request.args.get("per_page", 10, type=int)

#     if page < 1:
#         page = 1

#     if per_page < 1:
#         per_page = 10

#     if per_page > 100:
#         per_page = 100

#     if salary_min is not None and salary_min < 0:
#         return {
#             "success": False,
#             "message": "salary_min cannot be negative"
#         }, 400

#     if salary_max is not None and salary_max < 0:
#         return {
#             "success": False,
#             "message": "salary_max cannot be negative"
#         }, 400

#     if (
#         salary_min is not None
#         and salary_max is not None
#         and salary_min > salary_max
#     ):
#         return {
#             "success": False,
#             "message": "salary_min cannot be greater than salary_max"
#         }, 400

#     query = Job.query

#     if keyword:
#         query = query.filter(
#             db.or_(
#                 Job.title.ilike(f"%{keyword}%"),
#                 Job.company.ilike(f"%{keyword}%"),
#                 Job.description.ilike(f"%{keyword}%")
#             )
#         )

#     if location:
#         query = query.filter(
#             Job.location.ilike(f"%{location}%")
#         )

#     if job_type:
#         query = query.filter(
#             Job.job_type.ilike(job_type)
#         )

#     if experience_level:
#         query = query.filter(
#             Job.experience_level.ilike(experience_level)
#         )

#     if skills:
#         query = query.filter(
#             Job.skills.ilike(f"%{skills}%")
#         )

#     jobs = query.order_by(Job.id.desc()).all()

#     def salary_value(salary):
#         if not salary:
#             return None

#         try:
#             values = salary.upper().replace("LPA", "").strip()

#             if "-" in values:
#                 minimum, maximum = values.split("-", 1)
#                 return float(minimum.strip()), float(maximum.strip())

#             value = float(values.strip())
#             return value, value

#         except (ValueError, AttributeError):
#             return None

#     filtered_jobs = []

#     for job in jobs:
#         salary_range = salary_value(job.salary)

#         if salary_min is not None:
#             if salary_range is None:
#                 continue

#             if salary_range[1] < salary_min:
#                 continue

#         if salary_max is not None:
#             if salary_range is None:
#                 continue

#             if salary_range[0] > salary_max:
#                 continue

#         filtered_jobs.append(job)

#     total = len(filtered_jobs)

#     start = (page - 1) * per_page
#     end = start + per_page

#     paginated_jobs = filtered_jobs[start:end]

#     return {
#         "success": True,
#         "page": page,
#         "per_page": per_page,
#         "total": total,
#         "jobs": [job.to_dict() for job in paginated_jobs]
#     }, 200
    
# @jobs_bp.get("/<int:job_id>")
# def get_job(job_id):
#     job = Job.query.get(job_id)

#     if not job:
#         return {
#             "success": False,
#             "message": "Job not found"
#         }, 404

#     return {
#         "success": True,
#         "job": job.to_dict()
#     }, 200
# @jobs_bp.put("/<int:job_id>")
# @jwt_required()
# def update_job(job_id):
#     claims = get_jwt()
#     user_id = int(get_jwt_identity())

#     if claims.get("role") != "RECRUITER":
#         return {
#             "success": False,
#             "message": "Forbidden"
#         }, 403

#     job = Job.query.get(job_id)

#     if not job:
#         return {
#             "success": False,
#             "message": "Job not found"
#         }, 404

#     if job.recruiter_id != user_id:
#         return {
#             "success": False,
#             "message": "You cannot update this job"
#         }, 403

#     data = request.get_json() or {}

#     allowed_fields = [
#         "title",
#         "company",
#         "description",
#         "location",
#         "skills",
#         "salary"
#     ]

#     for field in allowed_fields:
#         if field in data:
#             setattr(job, field, data[field])

#     db.session.commit()

#     return {
#         "success": True,
#         "message": "Job updated successfully",
#         "job": job.to_dict()
#     }, 200

# @jobs_bp.delete("/<int:job_id>")
# @jwt_required()
# def delete_job(job_id):
#     claims = get_jwt()
#     user_id = int(get_jwt_identity())

#     job = Job.query.get(job_id)

#     if not job:
#         return {
#             "success": False,
#             "message": "Job not found"
#         }, 404

#     if claims.get("role") != "RECRUITER" or job.recruiter_id != user_id:
#         return {
#             "success": False,
#             "message": "You cannot delete this job"
#         }, 403

#     db.session.delete(job)
#     db.session.commit()

#     return {
#         "success": True,
#         "message": "Job deleted successfully"
#     }, 200


# @jobs_bp.get("/swipes")
# @jwt_required()
# def get_swipe_history():
#     user_id = int(get_jwt_identity())

#     swipes = Swipe.query.filter_by(
#         user_id=user_id
#     ).order_by(Swipe.id.desc()).all()

#     return {
#         "success": True,
#         "count": len(swipes),
#         "swipes": [
#             swipe.to_dict()
#             for swipe in swipes
#         ]
#     }, 200
    
# @jobs_bp.get("/saved")
# @jwt_required()
# def get_saved_jobs():
#     user_id = int(get_jwt_identity())

#     saved_swipes = Swipe.query.filter_by(
#         user_id=user_id,
#         action="SAVE"
#     ).order_by(Swipe.id.desc()).all()

#     jobs = []

#     for swipe in saved_swipes:
#         job = Job.query.get(swipe.job_id)

#         if job:
#             jobs.append(job.to_dict())

#     return {
#         "success": True,
#         "count": len(jobs),
#         "jobs": jobs
#     }, 200
    
# @jobs_bp.get("/applications")
# @jwt_required()
# def get_applications():
#     user_id = int(get_jwt_identity())

#     application_swipes = Swipe.query.filter_by(
#         user_id=user_id,
#         action="APPLY"
#     ).order_by(Swipe.id.desc()).all()

#     applications = []

#     for swipe in application_swipes:
#         job = Job.query.get(swipe.job_id)

#         if job:
#             applications.append({
#                 "job": job.to_dict(),
#                 "action": swipe.action,
#                 "swipe": swipe.to_dict()
#             })

#     return {
#         "success": True,
#         "count": len(applications),
#         "applications": applications
#     }, 200