from django.urls import path
from .views import (
    GatewayJobListView,
    GatewayJobDetailView,
    GatewaySwipeView,
    GatewaySwipeHistoryView,
    GatewayResumeUploadView,
    GatewayATSScoreView,
    GatewayRecommendationsView,
)

urlpatterns = [
    # Job Service Gateway Endpoints (Intern 2)
    path("jobs", GatewayJobListView.as_view(), name="gateway-jobs-list"),
    path("jobs/", GatewayJobListView.as_view(), name="gateway-jobs-list-slash"),
    path("jobs/<str:job_id>", GatewayJobDetailView.as_view(), name="gateway-job-detail"),

    # Swipe Service Gateway Endpoints (Intern 2)
    path("swipes", GatewaySwipeView.as_view(), name="gateway-swipes"),
    path("swipes/", GatewaySwipeView.as_view(), name="gateway-swipes-slash"),
    path("swipes/history", GatewaySwipeHistoryView.as_view(), name="gateway-swipes-history"),

    # Resume & ATS Placeholder Endpoints (Intern 3)
    path("resume/upload", GatewayResumeUploadView.as_view(), name="gateway-resume-upload"),
    path("resume/<str:resume_id>/ats-score", GatewayATSScoreView.as_view(), name="gateway-resume-ats-score"),
    path("recommendations", GatewayRecommendationsView.as_view(), name="gateway-recommendations"),
    path("recommendations/", GatewayRecommendationsView.as_view(), name="gateway-recommendations-slash"),
]
