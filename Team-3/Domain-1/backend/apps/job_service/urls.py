from django.urls import path
from .views import ListJobsView, JobDetailView, JobSearchView

urlpatterns = [
    path("", ListJobsView.as_view(), name="jobs-list"),
    path("search", JobSearchView.as_view(), name="jobs-search"),
    path("<str:job_id>", JobDetailView.as_view(), name="jobs-detail"),
]

