from django.conf import settings
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.auth_service.authentication import JWTAuthentication
from apps.auth_service.permissions import IsJobSeeker, IsJobSeekerOrRecruiter
from .proxy import forward_to_downstream

# ============================================================
# Resume & ATS Gateway Forwarding Views (Intern 3 Integration)
# ============================================================

class ResumeUploadSerializer(serializers.Serializer):
    file = serializers.FileField(help_text="Candidate PDF Resume file to upload")


class GatewayResumeUploadView(APIView):
    """
    POST /api/v1/resume/upload
    Gateway endpoint for candidate resume upload.
    Protected Route: Requires valid JWT and JOB_SEEKER role.
    Forwards multipart/form-data to Intern 3's Resume Service.
    """
    serializer_class = ResumeUploadSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
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
                        "description": "Candidate PDF Resume file to upload"
                    }
                },
                "required": ["file"]
            }
        },
        summary="Upload Candidate Resume (PDF)",
        description="Uploads candidate PDF resume. Protected endpoint for JOB_SEEKER. Forwards multipart/form-data to Intern 3 Resume Service."
    )
    def post(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "RESUME_SERVICE_URL", "http://127.0.0.1:8002"),
            subpath="api/v1/resume/upload",
            service_name="Resume Service",
        )


class GatewayATSScoreView(APIView):
    """
    GET /api/v1/resume/{resume_id}/ats-score
    Gateway endpoint for ATS scoring.
    Protected Route: Requires valid JWT and JOB_SEEKER or RECRUITER role.
    Routes to configured Intern 3 Resume/ATS Service URL.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeekerOrRecruiter]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="resume_id",
                type=str,
                location=OpenApiParameter.PATH,
                required=True,
                description="Uploaded Resume UUID"
            ),
            OpenApiParameter(
                name="job_id",
                type=str,
                location=OpenApiParameter.QUERY,
                required=True,
                default="290925001457",
                description="Target Job ID from dataset to compare skills against (e.g. 290925001457)"
            )
        ],
        summary="Get Resume ATS Match Score",
        description="Retrieves ATS match score and missing keywords for given resume_id and job_id. Accessible by JOB_SEEKER and RECRUITER."
    )
    def get(self, request, resume_id):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "RESUME_SERVICE_URL", "http://127.0.0.1:8002"),
            subpath=f"api/v1/resume/{resume_id}/ats-score",
            service_name="Resume/ATS Service",
        )


class GatewayRecommendationsView(APIView):
    """
    GET /api/v1/recommendations
    Gateway endpoint for career recommendations.
    Protected Route: Requires valid JWT and JOB_SEEKER role.
    Routes to configured Intern 3 Recommendation Service URL.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="resume_id",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Uploaded Resume ID to generate matching job recommendations for"
            ),
            OpenApiParameter(
                name="user_id",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Candidate User ID"
            )
        ],
        summary="Get Career Recommendations",
        description="Returns recommended jobs matching candidate skills from Intern 3 Recommendation Service. Protected endpoint for JOB_SEEKER."
    )
    def get(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "RESUME_SERVICE_URL", "http://127.0.0.1:8002"),
            subpath="api/v1/recommendations",
            service_name="Recommendation Service",
        )
