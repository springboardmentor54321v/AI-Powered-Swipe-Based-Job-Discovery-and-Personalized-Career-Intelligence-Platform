import sys
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

# Add Domain-3 to path to consume Intern 4's AI engine directly
sys.path.insert(0, r"r:\new projects\resume-ats\Team-3\Domain-3\Milestone4work")
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
    @extend_schema(responses={200: dict})
    def get(self, request):
        if str(request.user.role).lower() != "job_seeker":
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
    @extend_schema(responses={200: dict})
    def get(self, request):
        if str(request.user.role).lower() != "recruiter":
            return Response(status=403)
        # Mocking Postgres query since we can't easily query the unmanaged schema without full model mappings for daily aggregates here
        return Response({"job_id": request.GET.get('job_id'), "funnel": "data"})

class AdminTrendsView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(responses={200: dict})
    def get(self, request):
        if str(request.user.role).lower() != "admin":
            return Response(status=403)
        if trends_engine:
            return Response(trends_engine.generate_hiring_trends([]))
        return Response({"error": "AI Engine not available"})