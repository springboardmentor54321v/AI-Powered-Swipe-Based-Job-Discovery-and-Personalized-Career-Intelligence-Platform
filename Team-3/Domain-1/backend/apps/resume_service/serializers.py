"""
SwipeX Resume Service Serializers (Milestone 3 — Day 2)

Serializers for the Resume Upload and Resume List API responses,
aligned with the Day-1 OpenAPI contract (milestone-3-api-contract.yaml).
"""

from rest_framework import serializers
from .models import Resume, ResumeVersion, ResumeSkill, Skill


class ResumeVersionSerializer(serializers.ModelSerializer):
    """
    Serializes a ResumeVersion for the list and detail responses.
    Maps to the Day-1 contract's ResumeVersionDetailResponse schema.
    """
    version_id = serializers.UUIDField(source="id", read_only=True)
    skills = serializers.SerializerMethodField()

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
            "parsed_status",
            "parsed_at",
            "uploaded_at",
            "skills",
        ]
        read_only_fields = fields

    def get_skills(self, obj):
        return [rs.skill.name for rs in obj.resume_skills.select_related("skill").all()]


class ResumeUploadResponseSerializer(serializers.Serializer):
    """
    Serializes the upload response per the Day-1 contract's
    ResumeUploadResponse schema.
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


class ExtractedSkillSerializer(serializers.ModelSerializer):
    """
    Serializes a skill extracted from a resume version.
    Maps to Intern 3's resume_skills table.
    """
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    normalized_name = serializers.CharField(source="skill.normalized_name", read_only=True)

    class Meta:
        model = ResumeSkill
        fields = ["skill_name", "normalized_name", "source", "confidence"]


class ResumeParseResponseSerializer(serializers.Serializer):
    """
    Serializes the response from POST /api/v1/resumes/{id}/parse.
    Returns parsed_text, extracted_skills, and structured skill details.
    """
    resume_id = serializers.UUIDField()
    version_id = serializers.UUIDField()
    version_number = serializers.IntegerField()
    original_filename = serializers.CharField()
    parsed_status = serializers.CharField()
    parsed_text = serializers.CharField()
    extracted_skills = serializers.ListField(child=serializers.CharField())
    parsed_skills = serializers.ListField(child=serializers.CharField())
    skills = ExtractedSkillSerializer(many=True, required=False)
    parsed_at = serializers.DateTimeField()
    detail = serializers.CharField(required=False)


class ResumeSummarySerializer(serializers.ModelSerializer):
    """
    Serializes a Resume for the list response per the Day-1 contract's
    ResumeSummary schema.
    """
    resume_id = serializers.UUIDField(source="id", read_only=True)
    current_version = serializers.SerializerMethodField()
    version_count = serializers.SerializerMethodField()
    skills_summary = serializers.SerializerMethodField()
    versions = ResumeVersionSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = [
            "resume_id",
            "created_at",
            "updated_at",
            "version_count",
            "skills_summary",
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

    def get_skills_summary(self, obj):
        active = obj.versions.filter(is_active=True).first()
        if active:
            return [rs.skill.name for rs in active.resume_skills.select_related("skill").all()[:6]]
        return []


class ATSScoreResponseSerializer(serializers.Serializer):
    """
    Serializes the response from POST /api/v1/ats/score.
    Returns blended ATS score with keyword and semantic components.

    Formula (from Intern 4):
        final_ats_score = (0.40 × keyword_match_score) + (0.60 × semantic_similarity_score)
    """
    resume_id = serializers.UUIDField()
    version_id = serializers.UUIDField()
    job_id = serializers.CharField()
    job_title = serializers.CharField(required=False, allow_blank=True)
    keyword_score = serializers.FloatField()
    semantic_similarity = serializers.FloatField()
    semantic_score = serializers.FloatField()
    final_ats_score = serializers.FloatField()
    matched_skills = serializers.ListField(child=serializers.CharField())
    missing_skills = serializers.ListField(child=serializers.CharField())
    matched_keywords = serializers.ListField(child=serializers.CharField())
    missing_keywords = serializers.ListField(child=serializers.CharField())
    below_threshold = serializers.BooleanField()
    threshold = serializers.FloatField()
    detail = serializers.CharField(required=False)


class SuggestionItemSerializer(serializers.Serializer):
    """
    Serializes a single AI-generated resume optimization suggestion.
    Maps to the Day-1 contract's suggestion item schema.
    """
    category = serializers.CharField()
    priority = serializers.CharField()
    title = serializers.CharField()
    detail = serializers.CharField()
    related_skills = serializers.ListField(
        child=serializers.CharField(), required=False, allow_null=True
    )


class SuggestionsResponseSerializer(serializers.Serializer):
    """
    Serializes the response from POST /api/v1/suggestions/.
    Returns AI-generated resume optimization suggestions per the Day-1 contract.
    Supports both LLM-powered and free rule-based fallback modes.
    """
    resume_id = serializers.UUIDField()
    job_id = serializers.CharField(allow_null=True, required=False)
    job_title = serializers.CharField(required=False)
    source = serializers.CharField()
    keyword_match_pct = serializers.FloatField()
    matched_skills = serializers.ListField(child=serializers.CharField())
    missing_skills = serializers.ListField(child=serializers.CharField())
    suggestions = SuggestionItemSerializer(many=True)
    generated_at = serializers.DateTimeField()
    detail = serializers.CharField(required=False)


class RecommendationItemSerializer(serializers.Serializer):
    """
    Serializes a single job recommendation from Intern 4's
    UpgradedRecommendationEngine.
    """
    job_id = serializers.IntegerField()
    job_title = serializers.CharField()
    company = serializers.CharField()
    required_skills = serializers.ListField(child=serializers.CharField())
    semantic_similarity_score = serializers.FloatField()
    swipe_boost = serializers.FloatField()
    final_match_percentage = serializers.FloatField()
    match_type = serializers.CharField(required=False)


class RecommendationsResponseSerializer(serializers.Serializer):
    """
    Serializes the response from GET /api/v1/recommendations/.
    Returns upgraded AI-powered job recommendations with semantic
    similarity and swipe-history blending.
    """
    user_id = serializers.CharField()
    resume_id = serializers.UUIDField(allow_null=True, required=False)
    recommendations = RecommendationItemSerializer(many=True)
    count = serializers.IntegerField()
    match_type = serializers.CharField()
    detail = serializers.CharField(required=False)


class ResumeListResponseSerializer(serializers.Serializer):
    """
    Wraps the resume list in a paginated response per the Day-1 contract.
    """
    count = serializers.IntegerField()
    results = ResumeSummarySerializer(many=True)

