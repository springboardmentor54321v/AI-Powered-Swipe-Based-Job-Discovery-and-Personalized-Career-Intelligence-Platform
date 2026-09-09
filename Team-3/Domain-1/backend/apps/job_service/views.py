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
# Swipe Service Views
# ============================================================

# Milestone 2 action → Domain-2 direction mapping
ACTION_TO_DIRECTION = {
    "apply": "right",
    "save": "save",
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
