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