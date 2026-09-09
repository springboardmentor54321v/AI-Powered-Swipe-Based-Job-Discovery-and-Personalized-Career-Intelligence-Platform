from django.urls import path
from .views import UploadResumeView, ATSScoreView

urlpatterns = [
    path("upload", UploadResumeView.as_view(), name="resume-upload"),
    path("<str:resume_id>/ats-score", ATSScoreView.as_view(), name="resume-ats-score"),
]
