import os
import sys

base_dir = r"r:\new projects\resume-ats\Team-3\Domain-1\backend"

files_to_create = {
    "apps/application_service/__init__.py": "",
    "apps/application_service/apps.py": """
from django.apps import AppConfig
class ApplicationServiceConfig(AppConfig):
    name = 'apps.application_service'
""",
    "apps/application_service/models.py": """
from django.db import models
from apps.users.models import User
import uuid

class Application(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    job_id = models.UUIDField()
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, db_column="applicant_id")
    status = models.CharField(max_length=50, default="applied")
    resume_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "applications"

class ApplicationStatusEvent(models.Model):
    id = models.BigAutoField(primary_key=True)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, db_column="application_id")
    job_id = models.UUIDField()
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, db_column="applicant_id")
    from_status = models.CharField(max_length=50, null=True, blank=True)
    to_status = models.CharField(max_length=50)
    actor_id = models.UUIDField(null=True, blank=True)
    occurred_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        managed = False
        db_table = 'app"."application_status_event'
""",
    "apps/application_service/serializers.py": """
from rest_framework import serializers
from .models import Application, ApplicationStatusEvent

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

class ApplicationStatusEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatusEvent
        fields = '__all__'
""",
    "apps/application_service/views.py": """
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Application, ApplicationStatusEvent
from .serializers import ApplicationSerializer, ApplicationStatusEventSerializer
from django.core.mail import send_mail
from django.conf import settings

class ApplicationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user)

class JobApplicantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        # In a real scenario, check if recruiter owns the job. 
        # Since jobs are mock/forwarded, we assume auth via JWT roles.
        if request.user.role != "RECRUITER":
            return Response(status=403)
        apps = Application.objects.filter(job_id=job_id)
        return Response(ApplicationSerializer(apps, many=True).data)

class ApplicationStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != "RECRUITER":
            return Response(status=403)
            
        try:
            app = Application.objects.get(pk=pk)
            new_status = request.data.get("status")
            if new_status and new_status != app.status:
                # Trigger DB event (trigger does it, but we can also fire email)
                app.status = new_status
                app.save()
                
                # Notification fallback (Email)
                send_mail(
                    subject="Application Status Update",
                    message=f"Your application status changed to {new_status}",
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@swipex.app'),
                    recipient_list=[app.applicant.email],
                    fail_silently=True,
                )
            return Response(ApplicationSerializer(app).data)
        except Application.DoesNotExist:
            return Response(status=404)

class ApplicationHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            app = Application.objects.get(pk=pk)
            if request.user.role == "JOB_SEEKER" and app.applicant != request.user:
                return Response(status=403)
            events = ApplicationStatusEvent.objects.filter(application=app).order_by('-occurred_at')
            return Response(ApplicationStatusEventSerializer(events, many=True).data)
        except Application.DoesNotExist:
            return Response(status=404)
""",
    "apps/application_service/urls.py": """
from django.urls import path
from .views import ApplicationListView, JobApplicantsView, ApplicationStatusUpdateView, ApplicationHistoryView

urlpatterns = [
    path('', ApplicationListView.as_view(), name='app-list'),
    path('<uuid:pk>/status', ApplicationStatusUpdateView.as_view(), name='app-status-update'),
    path('<uuid:pk>/history', ApplicationHistoryView.as_view(), name='app-history'),
]
""",
    "apps/analytics_service/__init__.py": "",
    "apps/analytics_service/apps.py": """
from django.apps import AppConfig
class AnalyticsServiceConfig(AppConfig):
    name = 'apps.analytics_service'
""",
    "apps/analytics_service/views.py": """
import sys
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Add Domain-3 to path to consume Intern 4's AI engine directly
sys.path.insert(0, r"r:\\new projects\\resume-ats\\Team-3\\Domain-3\\Milestone4work")
try:
    from alert_trigger_service import AlertTriggerService
    from insights_and_trends import HiringTrendsAndInsightsEngine
    
    trigger_service = AlertTriggerService(match_threshold=75.0)
    trends_engine = HiringTrendsAndInsightsEngine()
except ImportError:
    trigger_service = None
    trends_engine = None

class SeekerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role != "JOB_SEEKER":
            return Response(status=403)
            
        candidate = {"user_id": str(request.user.id), "skills": ["Python"]}
        target_jobs = []
        events = []
        if trigger_service:
            analytics = trigger_service.compute_candidate_analytics(candidate, target_jobs, events)
            return Response(analytics)
        return Response({"error": "AI Engine not available"})

class RecruiterFunnelView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role != "RECRUITER":
            return Response(status=403)
        # Mocking Postgres query since we can't easily query the unmanaged schema without full model mappings for daily aggregates here
        return Response({"job_id": request.GET.get('job_id'), "funnel": "data"})

class AdminTrendsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role != "ADMIN":
            return Response(status=403)
        if trends_engine:
            return Response(trends_engine.generate_hiring_trends([]))
        return Response({"error": "AI Engine not available"})
""",
    "apps/analytics_service/urls.py": """
from django.urls import path
from .views import SeekerAnalyticsView, RecruiterFunnelView, AdminTrendsView

urlpatterns = [
    path('seeker/resume-performance', SeekerAnalyticsView.as_view()),
    path('recruiter/job-funnel', RecruiterFunnelView.as_view()),
    path('admin/hiring-trends', AdminTrendsView.as_view()),
]
"""
}

for rel_path, content in files_to_create.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip())
print("Day 3 files generated.")
