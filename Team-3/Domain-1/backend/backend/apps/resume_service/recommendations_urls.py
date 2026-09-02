from django.urls import path
from .views import RecommendationsPlaceholderView

urlpatterns = [
    path("", RecommendationsPlaceholderView.as_view(), name="recommendations-list"),
]
