"""
SwipeX Resume Service Views — Milestone 3 (Day 2)

New views for Resume Upload and Resume List endpoints.
Separate from the existing M2 gateway proxy views in views.py.

POST /api/v1/resumes/upload  — Upload a resume file (PDF/DOCX)
GET  /api/v1/resumes/        — List authenticated user's resumes

Authentication & RBAC:
  - Both endpoints require JWT authentication and JOB_SEEKER role.
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
)
from .storage import validate_resume_file, save_resume_file, get_file_path
from .extraction_service import extract_resume_content

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

