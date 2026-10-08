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

class JobApplicantsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    from drf_spectacular.utils import extend_schema
    @extend_schema(tags=['Jobs'])
    def get(self, request, job_id):
        # In a real scenario, check if recruiter owns the job. 
        # Since jobs are mock/forwarded, we assume auth via JWT roles.
        if str(request.user.role).lower() != "recruiter":
            return Response(status=403)
        apps = Application.objects.filter(job_id=job_id)
        return Response(ApplicationSerializer(apps, many=True).data)

class ApplicationStatusUpdateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def patch(self, request, pk):
        if str(request.user.role).lower() != "recruiter":
            return Response(status=403)
            
        try:
            app = Application.objects.get(pk=pk)
            new_status = request.data.get("status")
            if new_status and new_status != app.status:
                # Trigger DB event (trigger does it, but we can also fire email)
                from_status = app.status
                app.status = new_status
                app.save()
                
                # Fallback: create event if DB trigger didn't
                ApplicationStatusEvent.objects.create(
                    application=app,
                    job_id=app.job_id,
                    applicant=app.applicant,
                    from_status=from_status,
                    to_status=new_status,
                    actor_id=request.user.id
                )
                
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

class ApplicationHistoryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationStatusEventSerializer

    def get(self, request, pk):
        try:
            app = Application.objects.get(pk=pk)
            if str(request.user.role).lower() == "job_seeker" and app.applicant != request.user:
                return Response(status=403)
            events = ApplicationStatusEvent.objects.filter(application=app).order_by('-occurred_at')
            return Response(ApplicationStatusEventSerializer(events, many=True).data)
        except Application.DoesNotExist:
            return Response(status=404)