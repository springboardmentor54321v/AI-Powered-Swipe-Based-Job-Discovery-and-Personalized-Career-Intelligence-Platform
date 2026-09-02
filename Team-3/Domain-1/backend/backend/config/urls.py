from django.contrib import admin
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

class HealthCheckView(APIView):
    """
    Development health check endpoint (GET /health).
    Verifies Django backend process is running and responding.
    """
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
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui-alt"),

    # Identity & Authentication Service (Intern 1)
    path("api/v1/auth/", include("apps.auth_service.urls")),

    # API Gateway Routes (Intern 2 Job/Swipe integration & Intern 3 Resume/ATS placeholder)
    path("api/v1/", include("gateway.urls")),
]
