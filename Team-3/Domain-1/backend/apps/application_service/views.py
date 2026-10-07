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

    def get(self, request, job_id):
        # In a real scenario, check if recruiter owns the job. 
        # Since jobs are mock/forwarded, we assume auth via JWT roles.
        if request.user.role != "RECRUITER":
            return Response(status=403)
        apps = Application.objects.filter(job_id=job_id)
        return Response(ApplicationSerializer(apps, many=True).data)

class ApplicationStatusUpdateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

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

class ApplicationHistoryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationStatusEventSerializer

    def get(self, request, pk):
        try:
            app = Application.objects.get(pk=pk)
            if request.user.role == "JOB_SEEKER" and app.applicant != request.user:
                return Response(status=403)
            events = ApplicationStatusEvent.objects.filter(application=app).order_by('-occurred_at')
            return Response(ApplicationStatusEventSerializer(events, many=True).data)
        except Application.DoesNotExist:
            return Response(status=404)