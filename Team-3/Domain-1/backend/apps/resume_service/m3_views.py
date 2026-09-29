"""
SwipeX Resume Service Views — Milestone 3 (Days 2–5)

Views for Resume Upload, Resume List, Resume Parse, ATS Score,
AI Suggestions, and Upgraded Recommendations endpoints.
Separate from the existing M2 gateway proxy views in views.py.

POST /api/v1/resumes/upload       — Upload a resume file (PDF/DOCX)
GET  /api/v1/resumes/             — List authenticated user's resumes
POST /api/v1/resumes/{id}/parse   — Parse resume & extract skills
POST /api/v1/ats/score            — Compute blended ATS score
POST /api/v1/suggestions/         — AI resume optimization suggestions
GET  /api/v1/recommendations/     — Upgraded AI-powered job recommendations

Authentication & RBAC:
  - All endpoints require JWT authentication and JOB_SEEKER role.
  - Resume data is ownership-restricted: a user can only access their own.
"""

import uuid
import logging
from django.utils import timezone
from django.db import transaction
from django.db.models import Max
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiTypes, OpenApiParameter

from apps.auth_service.authentication import JWTAuthentication
from apps.auth_service.permissions import IsJobSeeker
from .models import Resume, ResumeVersion, Skill, ResumeSkill
from .serializers import (
    ResumeUploadResponseSerializer,
    ResumeSummarySerializer,
    ResumeParseResponseSerializer,
    ATSScoreResponseSerializer,
    SuggestionsResponseSerializer,
    RecommendationsResponseSerializer,
)
from .storage import validate_resume_file, save_resume_file, get_file_path
from .extraction_service import extract_resume_content
from .ats_scoring_service import resolve_job_data, compute_ats_score
from .suggestions_service import compute_suggestions
from .recommendation_service import get_upgraded_recommendations

logger = logging.getLogger("resume_service.views")


class M3ResumeUploadView(APIView):
    """
    POST /api/v1/resumes/upload

    Upload a candidate's resume file (PDF or DOCX).
    Creates a new Resume record (if first upload) or adds a new
    ResumeVersion to the existing Resume. Previous versions are preserved.

    Protected: Requires valid JWT and JOB_SEEKER role.
    Ownership: Resume is automatically associated with the authenticated user.
    """
    parser_classes = [MultiPartParser, FormParser]
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "file": {
                        "type": "string",
                        "format": "binary",
                        "description": "Resume file (PDF or DOCX, max 5 MB)"
                    },
                    "label": {
                        "type": "string",
                        "description": "Optional human-readable label for this version"
                    }
                },
                "required": ["file"]
            }
        },
        operation_id="m3_upload_resume",
        summary="Upload Candidate Resume (M3)",
        description=(
            "Upload a resume file (PDF/DOCX). Creates a Resume record on first "
            "upload, or adds a new version to the existing Resume. Previous "
            "versions are preserved. Protected: JOB_SEEKER role only."
        ),
        responses={
            201: ResumeUploadResponseSerializer,
            400: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
        },
        tags=["Resume (M3)"],
    )
    def post(self, request):
        user = request.user
        uploaded_file = request.FILES.get("file")
        label = request.data.get("label", None)

        # ── Validate the uploaded file ──
        is_valid, error_msg = validate_resume_file(uploaded_file)
        if not is_valid:
            return Response(
                {
                    "error": "Validation Error",
                    "detail": error_msg,
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Save file to disk storage ──
        try:
            storage_key, file_size, sha256_hash, content_type = save_resume_file(
                user_id=user.id,
                filename=uploaded_file.name,
                file_obj=uploaded_file,
            )
        except IOError as e:
            logger.error(f"Resume file storage failed for user {user.id}: {e}")
            return Response(
                {
                    "error": "Storage Error",
                    "detail": "Failed to store the uploaded file. Please try again.",
                    "status_code": 500,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ── Create or get the Resume record, then create a ResumeVersion ──
        try:
            with transaction.atomic():
                # Get or create the user's Resume record
                resume, _created = Resume.objects.get_or_create(
                    owner=user,
                )

                # Check for duplicate file (same sha256 hash within this resume)
                if resume.versions.filter(sha256_hash=sha256_hash).exists():
                    return Response(
                        {
                            "error": "Validation Error",
                            "detail": "This exact file has already been uploaded as a previous version.",
                            "status_code": 400,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Determine version number
                max_version = resume.versions.aggregate(
                    max_v=Max("version_number")
                )["max_v"] or 0
                next_version = max_version + 1

                # Deactivate previous active versions
                resume.versions.filter(is_active=True).update(is_active=False)

                # Create the new version
                version = ResumeVersion.objects.create(
                    resume=resume,
                    version_number=next_version,
                    original_filename=uploaded_file.name,
                    content_type=content_type,
                    storage_key=storage_key,
                    file_size_bytes=file_size,
                    sha256_hash=sha256_hash,
                    label=label,
                    is_active=True,
                )

                # Update resume timestamp
                resume.save(update_fields=["updated_at"])

        except Exception as e:
            logger.error(f"Resume DB creation failed for user {user.id}: {e}")
            return Response(
                {
                    "error": "Database Error",
                    "detail": "Failed to create resume record. Please try again.",
                    "status_code": 500,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ── Build response per Day-1 contract ──
        response_data = {
            "resume_id": str(resume.id),
            "version_id": str(version.id),
            "version_number": version.version_number,
            "original_filename": version.original_filename,
            "content_type": version.content_type,
            "file_size_bytes": version.file_size_bytes,
            "sha256_hash": version.sha256_hash,
            "label": version.label,
            "is_active": version.is_active,
            "uploaded_at": version.uploaded_at.isoformat(),
            "extraction_status": "pending",  # Day-3 responsibility
        }

        logger.info(
            f"Resume uploaded: user={user.id}, resume={resume.id}, "
            f"version={version.version_number}, file={uploaded_file.name}"
        )
        return Response(response_data, status=status.HTTP_201_CREATED)


class M3ResumeListView(APIView):
    """
    GET /api/v1/resumes/

    List the authenticated Job Seeker's resume and all versions.
    Only the authenticated user's own resume data is returned.

    Protected: Requires valid JWT and JOB_SEEKER role.
    Ownership: Server-enforced — filters by request.user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        operation_id="m3_list_resumes",
        summary="List My Resumes (M3)",
        description=(
            "Retrieve all resumes owned by the authenticated Job Seeker. "
            "Returns resume metadata including version history. "
            "Ownership-enforced: only the user's own resumes are returned."
        ),
        responses={
            200: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
        },
        tags=["Resume (M3)"],
    )
    def get(self, request):
        user = request.user

        # Query only this user's resumes with prefetched versions
        resumes = Resume.objects.filter(
            owner=user
        ).prefetch_related("versions").order_by("-updated_at")

        serializer = ResumeSummarySerializer(resumes, many=True)

        response_data = {
            "count": resumes.count(),
            "results": serializer.data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


class M3ResumeParseView(APIView):
    """
    POST /api/v1/resumes/{id}/parse

    Triggers text extraction and NLP skill extraction on an existing stored resume.
    
    Workflow:
      1. Authenticates request and validates JOB_SEEKER role.
      2. Validates resume existence and verifies ownership (Job Seeker can only parse their own).
      3. Locates the stored resume file on disk via Domain-1 storage.
      4. Invokes Intern 4's (Domain-3) completed extraction modules:
         - extract_pdf_text for PDF extraction (or python-docx for DOCX)
         - extract_skills (spaCy PhraseMatcher) for skill extraction
      5. Persists parsed_text, parsed_status, and extracted skills to PostgreSQL
         using Intern 3's schema (resumes, skills, resume_skills).
      6. Idempotent: Can be called multiple times without duplicate skills.
      7. Returns structured response with parsed text and extracted skills.
    """
    serializer_class = ResumeParseResponseSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        operation_id="m3_parse_resume",
        summary="Parse Resume Document & Extract Skills (M3)",
        description=(
            "Extracts raw text and NLP-detected skills from a previously uploaded resume file. "
            "Requires valid JWT and JOB_SEEKER role. "
            "Enforces strict ownership: a candidate can only parse their own resume."
        ),
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
                description="UUID of the Resume or ResumeVersion to parse",
            ),
        ],
        responses={
            200: ResumeParseResponseSerializer,
            400: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
            503: OpenApiTypes.OBJECT,
        },
        tags=["Resume (M3)"],
    )
    def post(self, request, resume_id=None, **kwargs):
        # Support both url param names ("resume_id" and "id")
        target_id_str = str(resume_id or kwargs.get("id") or "").strip()
        user = request.user

        # 1. Validate UUID format
        try:
            target_uuid = uuid.UUID(target_id_str)
        except (ValueError, AttributeError):
            return Response(
                {"error": "Validation Error", "detail": "Invalid resume ID format. Expected UUID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Look up Resume or ResumeVersion
        resume = Resume.objects.filter(id=target_uuid).first()
        version = None

        if resume:
            # Found by Resume.id -> find active or latest version
            version = (
                resume.versions.filter(is_active=True).first()
                or resume.versions.order_by("-version_number").first()
            )
        else:
            # Check if UUID points directly to a ResumeVersion
            version = (
                ResumeVersion.objects.filter(id=target_uuid)
                .select_related("resume")
                .first()
            )
            if version:
                resume = version.resume

        if not resume or not version:
            return Response(
                {"error": "Not Found", "detail": "Resume or version not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 3. Enforce Strict Ownership
        if resume.owner_id != user.id:
            logger.warning(
                f"Unauthorized parse attempt: user={user.id} tried to parse resume={resume.id} owned by user={resume.owner_id}"
            )
            return Response(
                {"error": "Forbidden", "detail": "You do not have permission to parse this resume."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 4. Locate stored file on disk
        file_path = get_file_path(version.storage_key)
        if not file_path.is_file():
            logger.error(f"Stored resume file missing on disk: {file_path}")
            return Response(
                {
                    "error": "Not Found",
                    "detail": "Stored resume document could not be located on disk storage.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # 5. Invoke Intern 4 extraction pipeline
        try:
            parsed_text, extracted_skills = extract_resume_content(file_path)
        except ValueError as e:
            version.parsed_status = "FAILED"
            version.save(update_fields=["parsed_status"])
            return Response(
                {"error": "Extraction Error", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except RuntimeError as e:
            version.parsed_status = "FAILED"
            version.save(update_fields=["parsed_status"])
            return Response(
                {"error": "Downstream Unavailable", "detail": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.exception(f"Unexpected extraction failure for {file_path}: {e}")
            version.parsed_status = "FAILED"
            version.save(update_fields=["parsed_status"])
            return Response(
                {"error": "Internal Error", "detail": "Failed to parse resume content."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 6. Persist results using Intern 3's schema
        with transaction.atomic():
            version.parsed_text = parsed_text
            version.parsed_status = "PARSED"
            version.parsed_at = timezone.now()
            version.save(update_fields=["parsed_text", "parsed_status", "parsed_at"])

            # Idempotency: clear existing skills for this version before re-inserting
            ResumeSkill.objects.filter(resume_version=version).delete()

            created_skills_data = []
            for skill_name in extracted_skills:
                norm = skill_name.strip().lower()
                if not norm:
                    continue
                skill_obj, _ = Skill.objects.get_or_create(
                    normalized_name=norm,
                    defaults={"name": skill_name.strip()}
                )
                rs, _ = ResumeSkill.objects.get_or_create(
                    resume_version=version,
                    skill=skill_obj,
                    defaults={"source": "parsed", "confidence": 1.0}
                )
                created_skills_data.append({
                    "skill_name": skill_obj.name,
                    "normalized_name": skill_obj.normalized_name,
                    "source": rs.source,
                    "confidence": rs.confidence,
                })

        logger.info(
            f"Successfully parsed resume={resume.id} v={version.version_number}: "
            f"{len(extracted_skills)} skills extracted and persisted"
        )

        response_data = {
            "resume_id": str(resume.id),
            "version_id": str(version.id),
            "version_number": version.version_number,
            "filename": version.original_filename,
            "parsed_status": version.parsed_status,
            "parsed_text": parsed_text,
            "extracted_skills": extracted_skills,
            "parsed_skills": extracted_skills,
            "skills": created_skills_data,
            "parsed_at": version.parsed_at.isoformat(),
            "detail": "Resume parsed and skills extracted successfully.",
        }

        return Response(response_data, status=status.HTTP_200_OK)


class M3ATSScoreView(APIView):
    """
    POST /api/v1/ats/score

    Computes a blended ATS compatibility score for a parsed resume
    against a specific job posting.

    Workflow:
      1. Authenticates request and validates JOB_SEEKER role.
      2. Validates request body (resume_id, job_id).
      3. Retrieves the resume version, enforces strict ownership.
      4. Ensures the resume has been parsed (Day-3 prerequisite).
      5. Resolves job data (description, skills, keywords) from
         Intern 3's CSV dataset or the live Job Service.
      6. Delegates to Intern 4's (Domain-3) completed blended ATS
         scoring engine:
           final_ats_score = keyword_score × 0.40 + semantic_score × 0.60
      7. Returns structured scoring results with actionable feedback.

    Protected: Requires valid JWT and JOB_SEEKER role.
    Ownership: Strict — candidate can only score their own resume.
    """
    serializer_class = ATSScoreResponseSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        operation_id="m3_ats_score",
        summary="Compute ATS Score — Resume vs Job (M3)",
        description=(
            "Calculates a blended ATS compatibility score for a parsed resume "
            "against a job posting. Uses Intern 4's scoring engine: "
            "final_ats_score = (keyword_score × 0.40) + (semantic_score × 0.60). "
            "Requires the resume to be parsed first (POST /resumes/{id}/parse). "
            "Protected: JOB_SEEKER role only. Ownership-enforced."
        ),
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "resume_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the Resume or ResumeVersion",
                    },
                    "job_id": {
                        "type": "string",
                        "description": "Job ID to score against (matches jobId in dataset)",
                    },
                },
                "required": ["resume_id", "job_id"],
            }
        },
        responses={
            200: ATSScoreResponseSerializer,
            400: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
            503: OpenApiTypes.OBJECT,
        },
        tags=["ATS Scoring (M3)"],
    )
    def post(self, request):
        user = request.user
        resume_id_str = str(request.data.get("resume_id", "")).strip()
        job_id_str = str(request.data.get("job_id", "")).strip()

        # ── 1. Validate required fields ──
        if not resume_id_str or not job_id_str:
            return Response(
                {
                    "error": "Validation Error",
                    "detail": "Both 'resume_id' and 'job_id' are required.",
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 2. Validate UUID format ──
        try:
            target_uuid = uuid.UUID(resume_id_str)
        except (ValueError, AttributeError):
            return Response(
                {
                    "error": "Validation Error",
                    "detail": "Invalid resume_id format. Expected UUID.",
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 3. Look up Resume or ResumeVersion ──
        resume = Resume.objects.filter(id=target_uuid).first()
        version = None

        if resume:
            # Found by Resume.id -> find active or latest version
            version = (
                resume.versions.filter(is_active=True).first()
                or resume.versions.order_by("-version_number").first()
            )
        else:
            # Check if UUID points directly to a ResumeVersion
            version = (
                ResumeVersion.objects.filter(id=target_uuid)
                .select_related("resume")
                .first()
            )
            if version:
                resume = version.resume

        if not resume or not version:
            return Response(
                {
                    "error": "Not Found",
                    "detail": "Resume or version not found.",
                    "status_code": 404,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Enforce Strict Ownership ──
        if resume.owner_id != user.id:
            logger.warning(
                f"Unauthorized ATS score attempt: user={user.id} "
                f"tried to score resume={resume.id} owned by user={resume.owner_id}"
            )
            return Response(
                {
                    "error": "Forbidden",
                    "detail": "You do not have permission to score this resume.",
                    "status_code": 403,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── 5. Verify resume is parsed ──
        if version.parsed_status != "PARSED" or not version.parsed_text:
            return Response(
                {
                    "error": "Validation Error",
                    "detail": (
                        "Resume must be parsed before computing an ATS score. "
                        "Call POST /api/v1/resumes/{id}/parse first."
                    ),
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 6. Collect resume skills from DB ──
        resume_skills = list(
            ResumeSkill.objects.filter(resume_version=version)
            .select_related("skill")
            .values_list("skill__normalized_name", flat=True)
        )

        # ── 7. Resolve job data ──
        try:
            job_data = resolve_job_data(job_id_str)
        except ValueError as e:
            return Response(
                {
                    "error": "Not Found",
                    "detail": str(e),
                    "status_code": 404,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 8. Compute blended ATS score via Intern 4's engine ──
        try:
            scoring_result = compute_ats_score(
                resume_text=version.parsed_text,
                resume_skills=resume_skills,
                job_data=job_data,
            )
        except RuntimeError as e:
            return Response(
                {
                    "error": "Downstream Unavailable",
                    "detail": str(e),
                    "status_code": 503,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.exception(
                f"Unexpected ATS scoring failure for resume={resume.id}, "
                f"job={job_id_str}: {e}"
            )
            return Response(
                {
                    "error": "Internal Error",
                    "detail": "Failed to compute ATS score.",
                    "status_code": 500,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ── 9. Build response ──
        response_data = {
            "resume_id": str(resume.id),
            "version_id": str(version.id),
            "job_id": job_id_str,
            "job_title": job_data.get("title", ""),
            "keyword_score": scoring_result["keyword_score"],
            "semantic_similarity": scoring_result["semantic_similarity"],
            "semantic_score": scoring_result["semantic_score"],
            "final_ats_score": scoring_result["final_ats_score"],
            "matched_skills": scoring_result["matched_skills"],
            "missing_skills": scoring_result["missing_skills"],
            "matched_keywords": scoring_result["matched_keywords"],
            "missing_keywords": scoring_result["missing_keywords"],
            "below_threshold": scoring_result["below_threshold"],
            "threshold": scoring_result["threshold"],
            "detail": (
                f"ATS score computed successfully. "
                f"{'Below' if scoring_result['below_threshold'] else 'Above'} "
                f"threshold ({scoring_result['threshold']}%)."
            ),
        }

        logger.info(
            f"ATS score computed: user={user.id}, resume={resume.id}, "
            f"job={job_id_str}, score={scoring_result['final_ats_score']}"
        )

        return Response(response_data, status=status.HTTP_200_OK)


class M3SuggestionsView(APIView):
    """
    POST /api/v1/suggestions/

    Generates AI-powered resume optimization suggestions by comparing
    a parsed resume's skills against a target job's requirements.

    Workflow:
      1. Authenticates request and validates JOB_SEEKER role.
      2. Validates request body (resume_id required, job_id optional).
      3. Retrieves resume version, enforces strict ownership.
      4. Ensures the resume has been parsed (Day-3 prerequisite).
      5. If job_id provided: resolves job data for targeted suggestions.
      6. Delegates to Intern 4's (Domain-3) ResumeSuggestionsModule.
      7. Returns structured suggestions with free rule-based fallback.

    Protected: Requires valid JWT and JOB_SEEKER role.
    Ownership: Strict — candidate can only get suggestions for their own resume.
    Fallback: Always returns suggestions — rule-based if LLM unavailable.
    """
    serializer_class = SuggestionsResponseSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        operation_id="m3_ai_suggestions",
        summary="AI Resume Optimization Suggestions (M3)",
        description=(
            "Generates AI-powered resume optimization suggestions by comparing "
            "extracted resume skills against a target job's requirements. "
            "Uses Intern 4's ResumeSuggestionsModule with free rule-based fallback. "
            "Requires the resume to be parsed first. "
            "Protected: JOB_SEEKER role only. Ownership-enforced."
        ),
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "resume_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the Resume or ResumeVersion",
                    },
                    "job_id": {
                        "type": "string",
                        "description": "Optional job ID for job-targeted suggestions",
                    },
                },
                "required": ["resume_id"],
            }
        },
        responses={
            200: SuggestionsResponseSerializer,
            400: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
            503: OpenApiTypes.OBJECT,
        },
        tags=["AI Suggestions (M3)"],
    )
    def post(self, request):
        user = request.user
        resume_id_str = str(request.data.get("resume_id", "")).strip()
        job_id_str = str(request.data.get("job_id", "")).strip() or None

        # ── 1. Validate required fields ──
        if not resume_id_str:
            return Response(
                {
                    "error": "Validation Error",
                    "detail": "'resume_id' is required.",
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 2. Validate UUID format ──
        try:
            target_uuid = uuid.UUID(resume_id_str)
        except (ValueError, AttributeError):
            return Response(
                {
                    "error": "Validation Error",
                    "detail": "Invalid resume_id format. Expected UUID.",
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 3. Look up Resume or ResumeVersion ──
        resume = Resume.objects.filter(id=target_uuid).first()
        version = None

        if resume:
            version = (
                resume.versions.filter(is_active=True).first()
                or resume.versions.order_by("-version_number").first()
            )
        else:
            version = (
                ResumeVersion.objects.filter(id=target_uuid)
                .select_related("resume")
                .first()
            )
            if version:
                resume = version.resume

        if not resume or not version:
            return Response(
                {
                    "error": "Not Found",
                    "detail": "Resume or version not found.",
                    "status_code": 404,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Enforce Strict Ownership ──
        if resume.owner_id != user.id:
            logger.warning(
                f"Unauthorized suggestions attempt: user={user.id} "
                f"tried to get suggestions for resume={resume.id} "
                f"owned by user={resume.owner_id}"
            )
            return Response(
                {
                    "error": "Forbidden",
                    "detail": "You do not have permission to get suggestions for this resume.",
                    "status_code": 403,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── 5. Verify resume is parsed ──
        if version.parsed_status != "PARSED" or not version.parsed_text:
            return Response(
                {
                    "error": "Validation Error",
                    "detail": (
                        "Resume must be parsed before requesting suggestions. "
                        "Call POST /api/v1/resumes/{id}/parse first."
                    ),
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 6. Collect resume skills from DB ──
        resume_skills = list(
            ResumeSkill.objects.filter(resume_version=version)
            .select_related("skill")
            .values_list("skill__name", flat=True)
        )

        # ── 7. Resolve job data (optional) ──
        job_title = "Target Position"
        job_required_skills = []

        if job_id_str:
            try:
                job_data = resolve_job_data(job_id_str)
                job_title = job_data.get("title", job_title)
                job_required_skills = job_data.get("skills", [])
            except ValueError as e:
                return Response(
                    {
                        "error": "Not Found",
                        "detail": str(e),
                        "status_code": 404,
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        # ── 8. Compute suggestions via Intern 4's module ──
        try:
            suggestion_result = compute_suggestions(
                resume_skills=resume_skills,
                job_required_skills=job_required_skills,
                job_title=job_title,
            )
        except RuntimeError as e:
            return Response(
                {
                    "error": "Downstream Unavailable",
                    "detail": str(e),
                    "status_code": 503,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.exception(
                f"Unexpected suggestions failure for resume={resume.id}: {e}"
            )
            return Response(
                {
                    "error": "Internal Error",
                    "detail": "Failed to generate suggestions.",
                    "status_code": 500,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ── 9. Map Intern 4's output to Day-1 contract format ──
        generation_mode = suggestion_result.get("generation_mode", "Rule-based/Template Fallback")
        source = "ai_generated" if "LLM" in generation_mode else "rule_based"

        # Transform flat suggestion strings into structured suggestion items
        raw_suggestions = suggestion_result.get("suggestions", [])
        structured_suggestions = []
        for idx, suggestion_text in enumerate(raw_suggestions):
            structured_suggestions.append({
                "category": "skills",
                "priority": "high" if idx == 0 else "medium",
                "title": f"Suggestion {idx + 1}",
                "detail": suggestion_text,
                "related_skills": suggestion_result.get("missing_skills", [])[:3] if idx == 0 else None,
            })

        response_data = {
            "resume_id": str(resume.id),
            "job_id": job_id_str,
            "job_title": job_title,
            "source": source,
            "keyword_match_pct": suggestion_result.get("keyword_match_pct", 0.0),
            "matched_skills": suggestion_result.get("matched_skills", []),
            "missing_skills": suggestion_result.get("missing_skills", []),
            "suggestions": structured_suggestions,
            "generated_at": timezone.now().isoformat(),
            "detail": f"Suggestions generated successfully ({source}).",
        }

        logger.info(
            f"Suggestions generated: user={user.id}, resume={resume.id}, "
            f"source={source}, count={len(structured_suggestions)}"
        )

        return Response(response_data, status=status.HTTP_200_OK)


class M3RecommendationsView(APIView):
    """
    GET /api/v1/recommendations/

    Returns upgraded AI-powered job recommendations by combining
    semantic similarity with swipe-history heuristic signals.

    Workflow:
      1. Authenticates request and validates JOB_SEEKER role.
      2. If resume_id provided: retrieves parsed resume text for semantic matching.
      3. Delegates to Intern 4's (Domain-3) UpgradedRecommendationEngine.
      4. Returns ranked job recommendations with match percentages.

    Protected: Requires valid JWT and JOB_SEEKER role.
    Backward compatible: Preserves existing M2 recommendation path.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        operation_id="m3_upgraded_recommendations",
        summary="AI-Powered Job Recommendations (M3)",
        description=(
            "Returns upgraded job recommendations using semantic similarity "
            "and swipe-history heuristic. Optionally accepts a resume_id "
            "to personalize recommendations based on parsed resume content. "
            "Protected: JOB_SEEKER role only."
        ),
        parameters=[
            OpenApiParameter(
                name="resume_id",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Resume UUID for personalized semantic matching",
            ),
            OpenApiParameter(
                name="limit",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Max number of recommendations (default: 5)",
            ),
        ],
        responses={
            200: RecommendationsResponseSerializer,
            400: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
            503: OpenApiTypes.OBJECT,
        },
        tags=["Recommendations (M3)"],
    )
    def get(self, request):
        user = request.user
        resume_id_str = request.query_params.get("resume_id", "").strip()
        limit_str = request.query_params.get("limit", "5").strip()

        # ── 1. Parse limit ──
        try:
            top_k = min(int(limit_str), 20)
        except (ValueError, TypeError):
            top_k = 5

        # ── 2. Resolve resume text if resume_id provided ──
        resume_text = ""
        resume = None

        if resume_id_str:
            try:
                target_uuid = uuid.UUID(resume_id_str)
            except (ValueError, AttributeError):
                return Response(
                    {
                        "error": "Validation Error",
                        "detail": "Invalid resume_id format. Expected UUID.",
                        "status_code": 400,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            resume = Resume.objects.filter(id=target_uuid).first()
            version = None

            if resume:
                version = (
                    resume.versions.filter(is_active=True).first()
                    or resume.versions.order_by("-version_number").first()
                )
            else:
                version = (
                    ResumeVersion.objects.filter(id=target_uuid)
                    .select_related("resume")
                    .first()
                )
                if version:
                    resume = version.resume

            if not resume or not version:
                return Response(
                    {
                        "error": "Not Found",
                        "detail": "Resume or version not found.",
                        "status_code": 404,
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Enforce ownership
            if resume.owner_id != user.id:
                return Response(
                    {
                        "error": "Forbidden",
                        "detail": "You do not have permission to use this resume for recommendations.",
                        "status_code": 403,
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Use parsed text if available
            if version.parsed_text:
                resume_text = version.parsed_text
            else:
                # Construct basic text from resume skills
                skills = list(
                    ResumeSkill.objects.filter(resume_version=version)
                    .select_related("skill")
                    .values_list("skill__name", flat=True)
                )
                resume_text = f"Skills: {', '.join(skills)}" if skills else ""

        # If no resume provided, create a basic text from user context
        if not resume_text:
            resume_text = f"Job seeker user {user.id} looking for opportunities."

        # ── 3. Get recommendations from Intern 4's engine ──
        try:
            recommendations = get_upgraded_recommendations(
                user_id=str(user.id),
                resume_text=resume_text,
                top_k=top_k,
            )
        except RuntimeError as e:
            return Response(
                {
                    "error": "Downstream Unavailable",
                    "detail": str(e),
                    "status_code": 503,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.exception(
                f"Unexpected recommendation failure for user={user.id}: {e}"
            )
            return Response(
                {
                    "error": "Internal Error",
                    "detail": "Failed to generate recommendations.",
                    "status_code": 500,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ── 4. Enrich each recommendation with match_type ──
        for rec in recommendations:
            rec["match_type"] = "hybrid"

        # ── 5. Build response ──
        response_data = {
            "user_id": str(user.id),
            "resume_id": str(resume.id) if resume else None,
            "recommendations": recommendations,
            "count": len(recommendations),
            "match_type": "hybrid",
            "detail": (
                f"Upgraded AI-powered recommendations generated. "
                f"{len(recommendations)} jobs ranked by semantic similarity + swipe history."
            ),
        }

        logger.info(
            f"Recommendations generated: user={user.id}, "
            f"count={len(recommendations)}, top_k={top_k}"
        )

        return Response(response_data, status=status.HTTP_200_OK)
