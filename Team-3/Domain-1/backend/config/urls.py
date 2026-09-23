from django.contrib import admin
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from drf_spectacular.utils import extend_schema, OpenApiTypes
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

class HealthCheckView(APIView):
    """
    Development health check endpoint (GET /health).
    Verifies Django backend process is running and responding.
    """
    @extend_schema(
        summary="Service Health Check",
        description="Verifies Django backend process is alive and responding.",
        responses={200: OpenApiTypes.OBJECT},
        tags=["System"],
    )
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)

urlpatterns = [
    # Admin Panel
    path("admin/", admin.site.urls),

    # Development Health Check
    path("health", HealthCheckView.as_view(), name="health-check"),

    # OpenAPI Schema & Swagger UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    # Microservices routing under /api/v1 prefix
    path("api/v1/auth/", include("apps.auth_service.urls")),
    path("api/v1/jobs/", include("apps.job_service.urls")),
    path("api/v1/companies/", include("apps.job_service.companies_urls")),
    path("api/v1/swipes/", include("apps.job_service.swipes_urls")),
    path("api/v1/resume/", include("apps.resume_service.urls")),
    path("api/v1/recommendations/", include("apps.resume_service.recommendations_urls")),
    path("api/v1/matching/", include("apps.resume_service.matching_urls")),

    # Milestone 3 — Resume Service (new versioned endpoints)
    path("api/v1/resumes/", include("apps.resume_service.m3_urls")),
]


