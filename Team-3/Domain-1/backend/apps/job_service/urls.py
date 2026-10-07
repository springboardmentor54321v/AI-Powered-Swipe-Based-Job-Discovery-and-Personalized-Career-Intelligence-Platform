from django.urls import path
from .views import ListJobsView, JobDetailView, JobSearchView
from .competition_views import CompetitionDetailView
from apps.application_service.views import JobApplicantsView

urlpatterns = [
    path("", ListJobsView.as_view(), name="jobs-list"),
    path("search", JobSearchView.as_view(), name="jobs-search"),
    path("<str:job_id>", JobDetailView.as_view(), name="jobs-detail"),
    path("<str:job_id>/competition", CompetitionDetailView.as_view(), name="jobs-competition"),
    path("<str:job_id>/applications", JobApplicantsView.as_view(), name="job-applicants"),
]

