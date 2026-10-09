from rest_framework import generics, status
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification, AlertPreference
from .serializers import NotificationSerializer, AlertPreferenceSerializer
from django.utils.timezone import now
from datetime import time

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(responses={200: dict})

    def get(self, request):
        count = Notification.objects.filter(user=request.user, read_at__isnull=True).count()
        return Response({"unread_count": count})

class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(responses={200: dict})

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
            if not notif.read_at:
                notif.read_at = now()
                notif.save()
            return Response({"id": notif.id, "read_at": notif.read_at})
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class AlertPreferenceView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(responses={200: dict})

    def get(self, request):
        prefs = AlertPreference.objects.filter(user=request.user)
        return Response(AlertPreferenceSerializer(prefs, many=True).data)

    def put(self, request):
        data = request.data.get("preferences", [])
        if not isinstance(data, list):
            return Response({"detail": "preferences must be a list"}, status=status.HTTP_400_BAD_REQUEST)
        allowed_types = {
            "application_status", "job_match", "message", "system",
            "high_match", "low_competition", "startup_hiring", "instant_job",
        }
        allowed_channels = {"in_app", "email", "push"}
        for pref in data:
            if not isinstance(pref, dict):
                return Response({"detail": "Each preference must be an object"}, status=status.HTTP_400_BAD_REQUEST)
            alert_type = pref.get("alert_type")
            channel = pref.get("channel")
            if alert_type not in allowed_types or channel not in allowed_channels:
                return Response({"detail": "Invalid alert_type or channel"}, status=status.HTTP_400_BAD_REQUEST)
            if not isinstance(pref.get("enabled", True), bool):
                return Response({"detail": "enabled must be a boolean"}, status=status.HTTP_400_BAD_REQUEST)
            match_threshold = pref.get("match_threshold")
            if match_threshold is not None:
                try:
                    match_threshold = float(match_threshold)
                except (TypeError, ValueError):
                    return Response({"detail": "match_threshold must be between 0 and 100"}, status=status.HTTP_400_BAD_REQUEST)
                if not 0 <= match_threshold <= 100:
                    return Response({"detail": "match_threshold must be between 0 and 100"}, status=status.HTTP_400_BAD_REQUEST)
            quiet_start = pref.get("quiet_start")
            quiet_end = pref.get("quiet_end")
            if (quiet_start is None) != (quiet_end is None):
                return Response({"detail": "quiet_start and quiet_end must both be set or omitted"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                if quiet_start is not None:
                    quiet_start = time.fromisoformat(quiet_start)
                    quiet_end = time.fromisoformat(quiet_end)
            except (TypeError, ValueError):
                return Response({"detail": "Quiet hours must use HH:MM[:SS] format"}, status=status.HTTP_400_BAD_REQUEST)
            defaults = {
                'enabled': pref.get('enabled', True),
                'quiet_start': quiet_start,
                'quiet_end': quiet_end,
            }
            if "match_threshold" in pref:
                defaults['match_threshold'] = match_threshold
            AlertPreference.objects.update_or_create(
                user=request.user,
                alert_type=alert_type,
                channel=channel,
                defaults=defaults,
            )
        return Response({"status": "updated"})
