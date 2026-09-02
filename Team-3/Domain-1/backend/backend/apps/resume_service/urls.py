from django.urls import path
from .views import UploadResumePlaceholderView, ATSScorePlaceholderView

urlpatterns = [
    path("upload", UploadResumePlaceholderView.as_view(), name="resume-upload"),
    path("<str:resume_id>/ats-score", ATSScorePlaceholderView.as_view(), name="resume-ats-score"),
]
