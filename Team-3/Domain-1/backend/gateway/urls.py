from django.urls import path
from .views import (
    GatewayResumeUploadView,
    GatewayATSScoreView,
    GatewayRecommendationsView,
)

urlpatterns = [
    # Resume & ATS Gateway Endpoints (Intern 3 Integration)
    path("resume/upload", GatewayResumeUploadView.as_view(), name="gateway-resume-upload"),
    path("resume/<str:resume_id>/ats-score", GatewayATSScoreView.as_view(), name="gateway-resume-ats-score"),
    path("recommendations", GatewayRecommendationsView.as_view(), name="gateway-recommendations"),
    path("recommendations/", GatewayRecommendationsView.as_view(), name="gateway-recommendations-slash"),
]
