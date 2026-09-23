"""
SwipeX Resume Service Serializers (Milestone 3 — Day 2)

Serializers for the Resume Upload and Resume List API responses,
aligned with the Day-1 OpenAPI contract (milestone-3-api-contract.yaml).
"""

from rest_framework import serializers
from .models import Resume, ResumeVersion


class ResumeVersionSerializer(serializers.ModelSerializer):
    """
    Serializes a ResumeVersion for the list and detail responses.
    Maps to the Day-1 contract's ResumeVersionDetailResponse schema.
    """
    version_id = serializers.UUIDField(source="id", read_only=True)

    class Meta:
        model = ResumeVersion
        fields = [
            "version_id",
            "version_number",
            "original_filename",
            "content_type",
            "file_size_bytes",
            "sha256_hash",
            "label",
            "is_active",
            "uploaded_at",
        ]
        read_only_fields = fields


class ResumeUploadResponseSerializer(serializers.Serializer):
    """
    Serializes the upload response per the Day-1 contract's
    ResumeUploadResponse schema.

    Note: parsed_skills and extraction_status are included for contract
    compatibility but will always be empty/pending on Day 2.
    Actual skill extraction is a Day-3 responsibility.
    """
    resume_id = serializers.UUIDField()
    version_id = serializers.UUIDField()
    version_number = serializers.IntegerField()
    original_filename = serializers.CharField()
    content_type = serializers.CharField()
    file_size_bytes = serializers.IntegerField()
    sha256_hash = serializers.CharField()
    label = serializers.CharField(allow_null=True)
    is_active = serializers.BooleanField()
    uploaded_at = serializers.DateTimeField()
    extraction_status = serializers.CharField()


class ResumeSummarySerializer(serializers.ModelSerializer):
    """
    Serializes a Resume for the list response per the Day-1 contract's
    ResumeSummary schema.
    """
    resume_id = serializers.UUIDField(source="id", read_only=True)
    current_version = serializers.SerializerMethodField()
    version_count = serializers.SerializerMethodField()
    versions = ResumeVersionSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = [
            "resume_id",
            "created_at",
            "updated_at",
            "version_count",
            "current_version",
            "versions",
        ]
        read_only_fields = fields

    def get_version_count(self, obj):
        return obj.versions.count()

    def get_current_version(self, obj):
        active = obj.versions.filter(is_active=True).first()
        if active:
            return ResumeVersionSerializer(active).data
        return None


class ResumeListResponseSerializer(serializers.Serializer):
    """
    Wraps the resume list in a paginated response per the Day-1 contract.
    """
    count = serializers.IntegerField()
    results = ResumeSummarySerializer(many=True)
