from rest_framework import generics, status
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification, AlertPreference
from .serializers import NotificationSerializer, AlertPreferenceSerializer
from django.utils.timezone import now

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
        for pref in data:
            AlertPreference.objects.update_or_create(
                user=request.user,
                alert_type=pref['alert_type'],
                channel=pref['channel'],
                defaults={
                    'enabled': pref.get('enabled', True),
                    'quiet_start': pref.get('quiet_start'),
                    'quiet_end': pref.get('quiet_end')
                }
            )
        return Response({"status": "updated"})