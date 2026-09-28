"""
SwipeX Resume Service M3 URL Patterns (Milestone 3 — Day 2)

New URL patterns for the M3 Resume endpoints.
Registered in config/urls.py under /api/v1/resumes/.
"""

from django.urls import path
from .m3_views import M3ResumeUploadView, M3ResumeListView, M3ResumeParseView

urlpatterns = [
    path("upload", M3ResumeUploadView.as_view(), name="m3-resume-upload"),
    path("", M3ResumeListView.as_view(), name="m3-resume-list"),
    path("<str:resume_id>/parse", M3ResumeParseView.as_view(), name="m3-resume-parse"),
]
