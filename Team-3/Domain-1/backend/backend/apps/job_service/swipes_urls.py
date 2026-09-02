from django.urls import path
from .views import SaveSwipePlaceholderView, SwipeHistoryPlaceholderView

urlpatterns = [
    path("", SaveSwipePlaceholderView.as_view(), name="swipes-record"),
    path("history", SwipeHistoryPlaceholderView.as_view(), name="swipes-history"),
]
