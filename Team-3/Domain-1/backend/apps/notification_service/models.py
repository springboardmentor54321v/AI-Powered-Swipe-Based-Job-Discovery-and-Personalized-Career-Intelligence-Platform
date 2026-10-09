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
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    alert_type = models.CharField(max_length=50)
    channel = models.CharField(max_length=50)
    enabled = models.BooleanField(default=True)
    match_threshold = models.FloatField(null=True, blank=True)
    quiet_start = models.TimeField(null=True, blank=True)
    quiet_end = models.TimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'app"."alert_preference'
        unique_together = (('user', 'alert_type', 'channel'),)
