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

import logging
from django.db import transaction
from django.db.models import Max
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiTypes

from apps.auth_service.authentication import JWTAuthentication
from apps.auth_service.permissions import IsJobSeeker
from .models import Resume, ResumeVersion
from .serializers import (
    ResumeUploadResponseSerializer,
    ResumeSummarySerializer,
)
from .storage import validate_resume_file, save_resume_file

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
