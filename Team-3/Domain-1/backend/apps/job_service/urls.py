from django.urls import path
from .views import ListJobsView, JobDetailView

urlpatterns = [
    path("", ListJobsView.as_view(), name="jobs-list"),
    path("<str:job_id>", JobDetailView.as_view(), name="jobs-detail"),
]
