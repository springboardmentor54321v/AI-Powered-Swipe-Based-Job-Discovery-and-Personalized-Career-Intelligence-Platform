from django.urls import path
from .views import MatchingEngineView

urlpatterns = [
    path("", MatchingEngineView.as_view(), name="matching-engine"),
]
