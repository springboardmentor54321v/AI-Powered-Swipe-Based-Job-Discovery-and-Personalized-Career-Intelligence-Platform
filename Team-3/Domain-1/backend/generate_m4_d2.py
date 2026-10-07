import os
import textwrap

base_dir = r"r:\new projects\resume-ats\Team-3\Domain-1\backend"

files_to_create = {
    "apps/auth_service/middleware.py": """
import urllib.parse
import jwt
from django.conf import settings
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if user_id:
            return User.objects.get(id=user_id)
    except Exception:
        pass
    return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        parsed_qs = urllib.parse.parse_qs(query_string)
        token = parsed_qs.get("token", [None])[0]
        
        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
    """,
    "apps/notification_service/models.py": """
from django.db import models
from apps.users.models import User
import uuid

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    type = models.CharField(max_length=50)
    title = models.CharField(max_length=180)
    body = models.CharField(max_length=4000)
    payload = models.JSONField(default=dict)
    read_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'app"."notification'

class AlertPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    alert_type = models.CharField(max_length=50)
    channel = models.CharField(max_length=50)
    enabled = models.BooleanField(default=True)
    quiet_start = models.TimeField(null=True, blank=True)
    quiet_end = models.TimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'app"."alert_preference'
        unique_together = (('user', 'alert_type', 'channel'),)
    """,
    "apps/notification_service/serializers.py": """
from rest_framework import serializers
from .models import Notification, AlertPreference

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class AlertPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertPreference
        fields = '__all__'
    """,
    "apps/notification_service/views.py": """
from rest_framework import generics, status
from rest_framework.views import APIView
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

    def get(self, request):
        count = Notification.objects.filter(user=request.user, read_at__isnull=True).count()
        return Response({"unread_count": count})

class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

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
    """,
    "apps/notification_service/urls.py": """
from django.urls import path
from .views import NotificationListView, UnreadCountView, MarkReadView, AlertPreferenceView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications-list'),
    path('unread-count', UnreadCountView.as_view(), name='notifications-unread'),
    path('<uuid:pk>/read', MarkReadView.as_view(), name='notifications-read'),
]
    """,
    "apps/notification_service/consumers.py": """
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        self.group_name = f"user_{self.scope['user'].id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if not self.scope["user"].is_anonymous:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
    """,
    "apps/notification_service/routing.py": """
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/notifications/?$', consumers.NotificationConsumer.as_asgi()),
]
    """,
    "apps/job_service/competition_views.py": """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection

class CompetitionDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, job_id):
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT applicant_count, competition_level, competition_updated_at 
                FROM jobs WHERE id = %s
            ''', [job_id])
            row = cursor.fetchone()
            if not row:
                return Response({"detail": "Job not found"}, status=404)
                
            return Response({
                "job_id": job_id,
                "applicant_count": row[0],
                "competition_level": row[1],
                "competition_updated_at": row[2]
            })
    """
}

for rel_path, content in files_to_create.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip())
print("Files generated.")
