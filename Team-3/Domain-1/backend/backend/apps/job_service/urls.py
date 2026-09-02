from django.urls import path
from .views import ListJobsPlaceholderView, JobDetailPlaceholderView

urlpatterns = [
    path("", ListJobsPlaceholderView.as_view(), name="jobs-list"),
    path("<str:job_id>", JobDetailPlaceholderView.as_view(), name="jobs-detail"),
]
