"""
SwipeX ATS Scoring URL Patterns (Milestone 3 — Day 4)

URL pattern for the ATS scoring endpoint.
Registered in config/urls.py under /api/v1/ats/.
"""

from django.urls import path
from .m3_views import M3ATSScoreView

urlpatterns = [
    path("score", M3ATSScoreView.as_view(), name="m3-ats-score"),
]
