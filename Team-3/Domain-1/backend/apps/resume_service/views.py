"""
SwipeX Resume & ATS Service Views (Milestone 2 — Day 2)

Replaces Milestone 1 placeholder views with real gateway-forwarding proxies
that route requests to the downstream Resume/ATS Service (Domain-3) on
RESUME_SERVICE_URL.

Authentication & RBAC:
  - Resume upload requires JWT authentication and JOB_SEEKER role.
  - ATS score view requires JWT authentication and JOB_SEEKER or RECRUITER role.
  - Recommendations require JWT authentication and JOB_SEEKER role.
"""

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from apps.auth_service.authentication import JWTAuthentication
from apps.auth_service.permissions import IsJobSeeker, IsJobSeekerOrRecruiter
from gateway.proxy import forward_to_downstream


class ResumeUploadSerializer(serializers.Serializer):
    file = serializers.FileField(help_text="Candidate PDF Resume file to upload")


class UploadResumeView(APIView):
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

    @extend_schema(exclude=True)
    def post(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "RESUME_SERVICE_URL", "http://127.0.0.1:8002"),
            subpath="api/v1/resume/upload",
            service_name="Resume Service",
        )


class ATSScoreView(APIView):
    """
    GET /api/v1/resume/{resume_id}/ats-score
    Gateway endpoint for ATS scoring.
    Protected Route: Requires valid JWT and JOB_SEEKER or RECRUITER role.
    Routes to configured Intern 3 Resume/ATS Service URL.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeekerOrRecruiter]

    @extend_schema(exclude=True)
    def get(self, request, resume_id):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "RESUME_SERVICE_URL", "http://127.0.0.1:8002"),
            subpath=f"api/v1/resume/{resume_id}/ats-score",
            service_name="Resume/ATS Service",
        )


class RecommendationsView(APIView):
    """
    GET /api/v1/recommendations
    Gateway endpoint for career recommendations.
    Protected Route: Requires valid JWT and JOB_SEEKER role.
    Routes to configured Intern 3 Recommendation Service URL.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    @extend_schema(exclude=True)
    def get(self, request):
        return forward_to_downstream(
            request=request,
            target_base_url=getattr(settings, "MATCHING_ENGINE_URL", "http://127.0.0.1:8004"),
            subpath="api/v1/recommendations",
            service_name="Matching Engine",
        )


class MatchingEngineView(APIView):
    """
    GET /api/v1/matching
    Gateway endpoint for the Career Intelligence Matching Engine.
    Protected Route: Requires valid JWT and JOB_SEEKER role.
    Routes to Intern 4's Matching Engine in Domain-3 at MATCHING_ENGINE_URL/api/v1/recommendations.
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
                description="Uploaded Resume UUID to generate heuristic or AI matching scores for"
            ),
            OpenApiParameter(
                name="user_id",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Candidate User ID"
            ),
        ],
        operation_id="get_matching_recommendations",
        summary="Run Matching Engine",
        description="Gateway endpoint connecting to Intern 4's Domain-3 Matching Engine. Returns ranked job recommendations with heuristic match percentages.",
        responses={200: OpenApiTypes.OBJECT, 401: OpenApiTypes.OBJECT, 403: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
        tags=["Matching Engine"],
    )
    def get(self, request):
        target_url = getattr(settings, "MATCHING_ENGINE_URL", getattr(settings, "RESUME_SERVICE_URL", "http://127.0.0.1:8002"))
        return forward_to_downstream(
            request=request,
            target_base_url=target_url,
            subpath="api/v1/recommendations",
            service_name="Matching Engine",
        )

