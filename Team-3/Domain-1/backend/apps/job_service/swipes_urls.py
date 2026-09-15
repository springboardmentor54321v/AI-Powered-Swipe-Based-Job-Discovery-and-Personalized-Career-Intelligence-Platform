from django.urls import path
from .views import RecordSwipeView, SwipeHistoryView

urlpatterns = [
    path("", RecordSwipeView.as_view(), name="swipes-record"),
    path("history", SwipeHistoryView.as_view(), name="swipes-history"),
]
