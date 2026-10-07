from django.urls import path
from .views import ApplicationListView, JobApplicantsView, ApplicationStatusUpdateView, ApplicationHistoryView

urlpatterns = [
    path('', ApplicationListView.as_view(), name='app-list'),
    path('<uuid:pk>/status', ApplicationStatusUpdateView.as_view(), name='app-status-update'),
    path('<uuid:pk>/history', ApplicationHistoryView.as_view(), name='app-history'),
]