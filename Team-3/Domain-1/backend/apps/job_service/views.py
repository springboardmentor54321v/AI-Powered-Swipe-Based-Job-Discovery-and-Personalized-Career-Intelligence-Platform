"""
SwipeX Job & Swipe Service Views (Milestone 2 — Day 2)

Implements the Job listing, Job detail, Swipe recording, and Swipe history
endpoints. These views act as gateway-forwarding proxies that route requests
to the downstream Job Service (Domain-2) on JOB_SERVICE_URL.

Authentication & RBAC:
  - Job listing and detail endpoints are public (AllowAny).
  - Swipe endpoints require JWT authentication and JOB_SEEKER role.
  - User identity is injected as trusted X-User-Id header by the gateway proxy.
"""

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status, serializers
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from apps.auth_service.authentication import JWTAuthentication
from apps.auth_service.permissions import IsJobSeeker
from gateway.proxy import forward_to_downstream


# ============================================================
# Job Service Views
# ============================================================

class ListJobsView(APIView):
    """
    GET /api/v1/jobs/
    Public endpoint for paginated job listings with optional filtering.
    Forwards to Intern 3's Job Service at JOB_SERVICE_URL/api/v1/jobs.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="page",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Page number for paginated results (default: 1)"
            ),
            OpenApiParameter(
                name="page_size",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Number of items per page (default: 20, max: 100)"
            ),
            OpenApiParameter(
                name="type",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Employment type (e.g. Full-time, Internship, Contract)"
            ),
            OpenApiParameter(
                name="location",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter jobs by location substring (e.g. Hyderabad, Bengaluru)"
            ),
            OpenApiParameter(
                name="remote",
                type=bool,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter by remote status (true / false)"
            ),
            OpenApiParameter(
                name="salary_min",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Minimum annual salary filter (in INR)"
            ),
            OpenApiParameter(
                name="salary_max",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Maximum annual salary filter (in INR)"
            ),
            OpenApiParameter(
                name="skills",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Comma-separated skill keywords to match (e.g. Python,Django,React)"
            ),
            OpenApiParameter(
                name="company_type",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter by company type (e.g. Startup, Enterprise, MNC)"
            ),
        ],
        operation_id="list_jobs",
        summary="List Job Postings",
        description="Public endpoint. Fetches paginated job listings with optional multi-criteria filtering from the downstream Job Service.",
        responses={200: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
        tags=["Jobs"],
    )
    def get(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath="api/v1/jobs",
            service_name="Job Service",
        )


class JobSearchView(APIView):
    """
    GET /api/v1/jobs/search
    Public endpoint for multi-criteria job search.
    Supports keyword matching across title & description, location, job type,
    salary min/max, experience level, skills, remote filtering, and pagination.
    Forwards to Intern 3's Job Service at JOB_SERVICE_URL/api/v1/jobs/search.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="keyword",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Free-text search term matched against job title and description"
            ),
            OpenApiParameter(
                name="location",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="City, region, or location string"
            ),
            OpenApiParameter(
                name="job_type",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Employment contract type (Full-time, Part-time, Internship, Contract)"
            ),
            OpenApiParameter(
                name="salary_min",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Minimum annual compensation"
            ),
            OpenApiParameter(
                name="salary_max",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Maximum annual compensation"
            ),
            OpenApiParameter(
                name="experience_level",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Required experience band (Fresher, Junior, Mid-Level, Senior, Lead)"
            ),
            OpenApiParameter(
                name="skills",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Comma-separated required skill tokens"
            ),
            OpenApiParameter(
                name="is_remote",
                type=bool,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter for remote positions only"
            ),
            OpenApiParameter(
                name="page",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Page number for paginated search results (default: 1)"
            ),
            OpenApiParameter(
                name="page_size",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Number of items returned per page (default: 20, max: 100)"
            ),
        ],
        operation_id="search_jobs",
        summary="Search and Filter Jobs",
        description="Advanced search endpoint matching jobs across multiple dimensions: keyword search across title/description, location, experience level, salary brackets, and required skills.",
        responses={200: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
        tags=["Jobs"],
    )
    def get(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath="api/v1/jobs/search",
            service_name="Job Service",
        )


class JobDetailView(APIView):
    """
    GET /api/v1/jobs/{job_id}
    Public endpoint for retrieving detailed information about a specific job posting.
    Forwards to Intern 3's Job Service at JOB_SERVICE_URL/api/v1/jobs/{job_id}.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="job_id",
                type=str,
                location=OpenApiParameter.PATH,
                required=True,
                description="Unique identifier of the job posting (e.g. 101)"
            ),
        ],
        operation_id="get_job_detail",
        summary="Get Job Details by ID",
        description="Public endpoint. Fetches comprehensive job details including description, company info, and compensation from the downstream Job Service.",
        responses={200: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
        tags=["Jobs"],
    )
    def get(self, request, job_id):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath=f"api/v1/jobs/{job_id}",
            service_name="Job Service",
        )


# ============================================================
# Company Service Views
# ============================================================

class ListCompaniesView(APIView):
    """
    GET /api/v1/companies/
    Public directory endpoint. Retrieves list of employer companies, industry sectors,
    headquarters, and company metadata.
    Forwards to Intern 3's Service at JOB_SERVICE_URL/api/v1/companies.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="page",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Page number for pagination (default: 1)"
            ),
            OpenApiParameter(
                name="page_size",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Number of companies per page (default: 20, max: 100)"
            ),
            OpenApiParameter(
                name="industry",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter by industry sector (e.g. Software, Financial Services, Healthcare)"
            ),
            OpenApiParameter(
                name="company_type",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter by organizational tier (e.g. Startup, Enterprise, MNC)"
            ),
            OpenApiParameter(
                name="search",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Keyword search across company name"
            ),
        ],
        operation_id="list_companies",
        summary="List Companies",
        description="Public directory endpoint. Retrieves list of employer companies, industry sectors, headquarters, and company metadata.",
        responses={200: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
        tags=["Companies"],
    )
    def get(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath="api/v1/companies",
            service_name="Company Service",
        )


class CompanyDetailView(APIView):
    """
    GET /api/v1/companies/{company_id}
    Public endpoint for retrieving detailed profile of a specific company.
    Forwards to Intern 3's Service at JOB_SERVICE_URL/api/v1/companies/{company_id}.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="company_id",
                type=str,
                location=OpenApiParameter.PATH,
                required=True,
                description="Unique identifier of the company (e.g. 1)"
            ),
        ],
        operation_id="get_company_detail",
        summary="Get Company Details by ID",
        description="Public endpoint. Fetches detailed profile of a specific company including industry, headquarters, and active jobs count.",
        responses={200: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
        tags=["Companies"],
    )
    def get(self, request, company_id):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath=f"api/v1/companies/{company_id}",
            service_name="Company Service",
        )



# ============================================================
# Swipe Service Views
# ============================================================

# Milestone 2 action → Domain-2 direction mapping
# Domain-2 Pydantic validator strictly requires direction in {"left", "right"}
ACTION_TO_DIRECTION = {
    "apply": "right",
    "save": "right",
    "skip": "left",
    # Backward compatibility with Milestone 1 vocabulary
    "right": "right",
    "left": "left",
}


VALID_ACTIONS = list(ACTION_TO_DIRECTION.keys())


class SwipeActionSerializer(serializers.Serializer):
    """Validates the swipe request body per the Milestone 2 API contract."""
    job_id = serializers.IntegerField(
        required=True,
        min_value=1,
        help_text="Target job ID to swipe on (e.g. 101)"
    )
    action = serializers.ChoiceField(
        choices=VALID_ACTIONS,
        required=True,
        help_text="Swipe action: apply, save, skip (or legacy: right, left)"
    )


class RecordSwipeView(APIView):
    """
    POST /api/v1/swipes/
    Protected endpoint. Records a candidate's swipe interaction on a job posting.
    Requires JWT authentication and JOB_SEEKER role.

    Supported Milestone 2 actions: apply, save, skip
    Backward compatible with Milestone 1: right, left

    The authenticated user's identity is injected as X-User-Id by the gateway
    proxy — the client cannot spoof their identity.
    """
    serializer_class = SwipeActionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        operation_id="record_candidate_swipe",
        request=SwipeActionSerializer,
        summary="Record Candidate Swipe",
        description=(
            "Allows a JOB_SEEKER to apply, save, or skip a job posting. "
            "Protected endpoint requiring Bearer JWT. The authenticated user's "
            "identity is securely injected — client-supplied identity headers are stripped."
        ),
        responses={
            200: OpenApiTypes.OBJECT,
            201: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
            503: OpenApiTypes.OBJECT,
        },
        tags=["Swipes"],
    )
    def post(self, request):
        serializer = SwipeActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation Error",
                    "detail": serializer.errors,
                    "status_code": status.HTTP_400_BAD_REQUEST,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated = serializer.validated_data
        action = validated["action"]
        direction = ACTION_TO_DIRECTION[action]

        # Build the downstream payload using Domain-2's expected field names
        import json
        downstream_body = json.dumps({
            "job_id": validated["job_id"],
            "direction": direction,
        })

        # Manually override request body for downstream forwarding
        # We need to create a modified request that carries the translated payload
        from django.http import QueryDict
        original_body = request._request.body

        class PatchedRequest:
            """Thin wrapper to override the request body for downstream forwarding."""
            def __init__(self, original_request, new_body):
                self._original = original_request
                self._new_body = new_body.encode("utf-8") if isinstance(new_body, str) else new_body

            def __getattr__(self, name):
                if name == "body":
                    return self._new_body
                if name == "data":
                    return json.loads(self._new_body)
                if name == "FILES":
                    return {}
                return getattr(self._original, name)

        patched = PatchedRequest(request, downstream_body)

        return forward_to_downstream(
            request=patched,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath="api/v1/swipes",
            service_name="Swipe Service",
        )


class SwipeHistoryView(APIView):
    """
    GET /api/v1/swipes/history
    Protected endpoint. Retrieves the authenticated candidate's swipe history.
    Requires JWT authentication and JOB_SEEKER role.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(
        operation_id="get_candidate_swipe_history",
        summary="Get Candidate Swipe History",
        description="Protected endpoint for JOB_SEEKER role. Retrieves the authenticated candidate's recorded swipe history from the downstream Swipe Service.",
        responses={200: OpenApiTypes.OBJECT, 401: OpenApiTypes.OBJECT, 403: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
        tags=["Swipes"],
    )
    def get(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"),
            subpath="api/v1/swipes/history",
            service_name="Swipe Service",
        )
