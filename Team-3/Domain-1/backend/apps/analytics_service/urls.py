from django.urls import path
from .views import SeekerAnalyticsView, RecruiterFunnelView, AdminTrendsView

urlpatterns = [
    path('seeker/resume-performance', SeekerAnalyticsView.as_view()),
    path('recruiter/job-funnel', RecruiterFunnelView.as_view()),
    path('admin/hiring-trends', AdminTrendsView.as_view()),
]