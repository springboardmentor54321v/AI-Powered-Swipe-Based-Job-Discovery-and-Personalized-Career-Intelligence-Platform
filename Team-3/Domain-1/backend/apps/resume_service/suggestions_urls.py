"""
SwipeX AI Suggestions URL Patterns (Milestone 3 — Day 5)

URL pattern for the AI suggestions endpoint.
Registered in config/urls.py under /api/v1/suggestions/.
"""

from django.urls import path
from .m3_views import M3SuggestionsView

urlpatterns = [
    path("", M3SuggestionsView.as_view(), name="m3-suggestions"),
]
