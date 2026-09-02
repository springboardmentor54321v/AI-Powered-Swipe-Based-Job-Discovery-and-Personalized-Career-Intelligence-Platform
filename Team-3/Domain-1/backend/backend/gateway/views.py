from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.auth_service.authentication import JWTAuthentication
from apps.auth_service.permissions import IsJobSeeker, IsJobSeekerOrRecruiter
from .proxy import forward_to_downstream


# ============================================================
# Job & Swipe Gateway Forwarding Views (Intern 2 Integration)
# ============================================================

class GatewayJobListView(APIView):
    """
    GET /api/v1/jobs
    Gateway entry point for job listings.
    Forwards query parameters (type, location, remote, salary_min, salary_max, skills)
    to Intern 2's downstream Job Service.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="location",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter jobs by location (e.g. Hyderabad, Bangalore)"
            ),
            OpenApiParameter(
                name="remote",
                type=bool,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter by remote job status (true / false)"
            ),
            OpenApiParameter(
                name="salary_min",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Minimum annual salary filter"
            ),
            OpenApiParameter(
                name="salary_max",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Maximum annual salary filter"
            ),
            OpenApiParameter(
                name="skills",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Comma-separated skill keywords (e.g. Python,Django,React)"
            ),
        ],
        summary="List Job Postings",
        description="Public endpoint. Fetches job listings with optional filtering forwarded to Intern 2 Job Service."
    )
    def get(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath="api/v1/jobs",
            service_name="Job Service",
        )


class GatewayJobDetailView(APIView):
    """
    GET /api/v1/jobs/{job_id}
    Gateway entry point for job detail inspection.
    Forwards request to Intern 2's downstream Job Service.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="job_id",
                type=str,
                location=OpenApiParameter.PATH,
                required=True,
                description="Unique identifier of the job posting (e.g. 101, 290925001457)"
            )
        ],
        summary="Get Job Details by ID",
        description="Public endpoint. Fetches detailed job information from Intern 2 Job Service."
    )
    def get(self, request, job_id):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath=f"api/v1/jobs/{job_id}",
            service_name="Job Service",
        )


class SwipeActionSerializer(serializers.Serializer):
    job_id = serializers.CharField(required=True, help_text="Target job ID (e.g. 101, 290925001457)")
    direction = serializers.ChoiceField(
        choices=["right", "left"],
        default="right",
        help_text="Swipe direction ('right' = like/apply, 'left' = pass)"
    )


class GatewaySwipeView(APIView):
    """
    POST /api/v1/swipes
    Gateway entry point for recording candidate swipes.
    Protected Route: Requires valid JWT and JOB_SEEKER role.
    Forwards payload {"job_id": "...", "direction": "right"} to Intern 2's Swipe Service.
    """
    serializer_class = SwipeActionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        request=SwipeActionSerializer,
        summary="Record Candidate Swipe",
        description="Allows a JOB_SEEKER to like ('right') or pass ('left') on a job posting. Protected endpoint requiring Bearer JWT."
    )
    def post(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath="api/v1/swipes",
            service_name="Swipe Service",
        )


class GatewaySwipeHistoryView(APIView):
    """
    GET /api/v1/swipes/history
    Gateway entry point for candidate swipe history.
    Protected Route: Requires valid JWT and JOB_SEEKER role.
    Forwards request to Intern 2's Swipe Service with authenticated user context.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        summary="Get Candidate Swipe History",
        description="Protected endpoint for JOB_SEEKER role. Retrieves candidate's recorded swipe history."
    )
    def get(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath="api/v1/swipes/history",
            service_name="Swipe Service",
        )


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

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
