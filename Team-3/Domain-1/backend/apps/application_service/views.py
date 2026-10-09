from django.db import connection, transaction
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Application, ApplicationStatusEvent
from .serializers import ApplicationSerializer, ApplicationStatusEventSerializer


APPLICANT_STATUSES = {"saved", "applied"}
RECRUITER_TRANSITIONS = {
    "applied": {"shortlisted", "rejected"},
    "shortlisted": {"interview", "rejected"},
    "interview": {"rejected"},
}


def role_name(user):
    role = getattr(user, "role", None)
    return str(getattr(role, "name", role or "")).upper()


def owned_job_ids(user_id):
    # `jobs` is owned by Domain 2; keeping this small query here avoids a
    # duplicate Django model and uses the shared PostgreSQL schema.
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM public.jobs WHERE recruiter_id = %s", [user_id])
        return [row[0] for row in cursor.fetchall()]


class ApplicationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        role = role_name(self.request.user)
        if role == "JOB_SEEKER":
            return Application.objects.filter(applicant=self.request.user).order_by("-created_at")
        if role == "RECRUITER":
            return Application.objects.filter(job_id__in=owned_job_ids(self.request.user.id)).order_by("-created_at")
        if role == "ADMIN":
            return Application.objects.all().order_by("-created_at")
        return Application.objects.none()

    def post(self, request, *args, **kwargs):
        if role_name(request.user) != "JOB_SEEKER":
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            job_id = int(request.data.get("job_id"))
        except (TypeError, ValueError):
            return Response({"detail": "job_id must be a positive integer"}, status=400)
        if job_id < 1:
            return Response({"detail": "job_id must be a positive integer"}, status=400)
        requested_status = request.data.get("status", "applied")
        if requested_status not in APPLICANT_STATUSES:
            return Response({"detail": "Applicants may create saved or applied applications"}, status=400)
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM public.jobs WHERE id = %s", [job_id])
            if cursor.fetchone() is None:
                return Response({"detail": "Job not found"}, status=404)
        from apps.resume_service.models import ResumeVersion
        active_resume = ResumeVersion.objects.filter(
            resume__owner=request.user,
        ).order_by("-version_number").first()
        application, created = Application.objects.get_or_create(
            job_id=job_id,
            applicant=request.user,
            defaults={
                "status": requested_status,
                "resume_version_id": active_resume.id if active_resume else None,
            },
        )
        if not created and application.status == "saved" and requested_status == "applied":
            application.status = "applied"
            application.save(update_fields=["status", "updated_at"])
        return Response(ApplicationSerializer(application).data, status=201 if created else 200)


class JobApplicantsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    from drf_spectacular.utils import extend_schema
    @extend_schema(tags=['Jobs'])
    def get(self, request, job_id):
        role = role_name(request.user)
        try:
            job_id = int(job_id)
        except (TypeError, ValueError):
            return Response({"detail": "job_id must be an integer"}, status=400)
        if role == "RECRUITER" and job_id not in owned_job_ids(request.user.id):
            return Response(status=403)
        if role not in {"RECRUITER", "ADMIN"}:
            return Response(status=403)
        apps = Application.objects.filter(job_id=job_id).order_by("-created_at")
        return Response(ApplicationSerializer(apps, many=True).data)


class ApplicationStatusUpdateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def patch(self, request, pk):
        role = role_name(request.user)
        if role not in {"RECRUITER", "ADMIN"}:
            return Response(status=403)
        try:
            app = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            return Response(status=404)
        if role == "RECRUITER" and app.job_id not in owned_job_ids(request.user.id):
            return Response(status=403)
        new_status = request.data.get("status")
        if new_status not in {"shortlisted", "interview", "rejected"}:
            return Response({"detail": "Invalid recruiter status"}, status=400)
        if new_status == app.status:
            return Response(ApplicationSerializer(app).data)
        if new_status not in RECRUITER_TRANSITIONS.get(app.status, set()):
            return Response({"detail": f"Transition from {app.status} to {new_status} is not allowed"}, status=409)
        with transaction.atomic():
            app.status = new_status
            app.updated_at = timezone.now()
            app.save(update_fields=["status", "updated_at"])
            # The PostgreSQL trigger records the transition atomically. Attach
            # the authenticated actor to that newly created audit event.
            audit_event = ApplicationStatusEvent.objects.filter(application=app).order_by("-id").first()
            if audit_event:
                ApplicationStatusEvent.objects.filter(pk=audit_event.pk).update(actor_id=request.user.id)
            from apps.notification_service.models import AlertPreference, Notification
            notification = Notification.objects.create(
                user=app.applicant,
                type="application_status",
                title="Application status updated",
                body=f"Your application status changed to {new_status}.",
                payload={"application_id": str(app.id), "job_id": app.job_id, "status": new_status},
            )
            preferences = dict(AlertPreference.objects.filter(
                user=app.applicant,
                alert_type="application_status",
            ).values_list("channel", "enabled"))
        if preferences.get("email", True):
            send_mail(
                subject="Application status update",
                message=f"Your application status changed to {new_status}.",
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@swipex.app"),
                recipient_list=[app.applicant.email],
                fail_silently=True,
            )
        if preferences.get("in_app", True):
            try:
                from asgiref.sync import async_to_sync
                from channels.layers import get_channel_layer
                async_to_sync(get_channel_layer().group_send)(
                    f"user_{app.applicant_id}",
                    {"type": "notification.message", "message": {
                        "id": str(notification.id), "type": notification.type,
                        "title": notification.title, "body": notification.body,
                        "payload": notification.payload, "created_at": notification.created_at.isoformat(),
                    }},
                )
            except Exception:
                # Persisted notifications remain available via REST if websocket
                # pub/sub is temporarily unavailable.
                pass
        return Response(ApplicationSerializer(app).data)


class ApplicationHistoryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationStatusEventSerializer

    def get(self, request, pk):
        try:
            app = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            return Response(status=404)
        role = role_name(request.user)
        if role == "JOB_SEEKER" and app.applicant_id != request.user.id:
            return Response(status=403)
        if role == "RECRUITER" and app.job_id not in owned_job_ids(request.user.id):
            return Response(status=403)
        if role not in {"JOB_SEEKER", "RECRUITER", "ADMIN"}:
            return Response(status=403)
        events = ApplicationStatusEvent.objects.filter(application=app).order_by("-occurred_at")
        return Response(ApplicationStatusEventSerializer(events, many=True).data)
