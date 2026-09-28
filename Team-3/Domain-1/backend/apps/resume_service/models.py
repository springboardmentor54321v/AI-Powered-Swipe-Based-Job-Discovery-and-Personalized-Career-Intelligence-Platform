"""
SwipeX Resume Service Models (Milestone 3 — Day 2)

Django ORM models for Resume and ResumeVersion, mapping to Intern 3's
Domain-2 schema concepts (resumes table with candidate_id, filename,
content_type, storage_key, size_bytes).

Architecture:
  Resume (1) ──► ResumeVersion (many)
  - Each Job Seeker has one Resume record.
  - Each file upload creates a new ResumeVersion.
  - Previous versions are preserved (never overwritten).
  - is_active marks the current/default version.
"""

import uuid
from django.db import models
from django.conf import settings


class Resume(models.Model):
    """
    Root resume record for a Job Seeker.
    Maps to Intern 3's concept of grouping uploads by candidate_id.
    One Resume per user; multiple ResumeVersions per Resume.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="UUID primary key (matches Intern 3's TEXT UUID id)"
    )
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resume",
        help_text="The Job Seeker who owns this resume (maps to candidate_id)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resumes"
        verbose_name = "Resume"
        verbose_name_plural = "Resumes"

    def __str__(self):
        return f"Resume {self.id} (owner={self.owner_id})"


class ResumeVersion(models.Model):
    """
    A specific version of a resume file upload.
    Maps to a single row in Intern 3's resumes table (each upload = new row).

    Field mapping from Intern 3's schema:
      id           → id (UUID)
      candidate_id → resume.owner (via FK)
      filename     → original_filename
      content_type → content_type
      storage_key  → storage_key
      size_bytes   → file_size_bytes
      created_at   → uploaded_at
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="UUID primary key"
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="versions",
        help_text="Parent resume record"
    )
    version_number = models.PositiveIntegerField(
        help_text="Auto-incremented version number within this resume"
    )
    original_filename = models.TextField(
        help_text="Original filename of the uploaded file (maps to Intern 3's filename)"
    )
    content_type = models.CharField(
        max_length=100,
        help_text="MIME type of the uploaded file (maps to Intern 3's content_type)"
    )
    storage_key = models.TextField(
        unique=True,
        help_text="Storage path/key for file retrieval (maps to Intern 3's storage_key)"
    )
    file_size_bytes = models.BigIntegerField(
        help_text="File size in bytes (maps to Intern 3's size_bytes)"
    )
    sha256_hash = models.CharField(
        max_length=64,
        help_text="SHA-256 hash of file content for integrity/deduplication"
    )
    label = models.TextField(
        blank=True,
        null=True,
        help_text="Optional human-readable label for this version"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this is the current/active version"
    )
    parsed_text = models.TextField(
        blank=True,
        default="",
        help_text="Cleaned text extracted from the resume file"
    )
    parsed_status = models.CharField(
        max_length=20,
        default="PENDING",
        choices=[
            ("PENDING", "Pending"),
            ("PARSED", "Parsed"),
            ("FAILED", "Failed"),
        ],
        help_text="Status of text and skill extraction"
    )
    parsed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when parsing completed"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Upload timestamp (maps to Intern 3's created_at)"
    )

    class Meta:
        db_table = "resume_versions"
        verbose_name = "Resume Version"
        verbose_name_plural = "Resume Versions"
        ordering = ["-version_number"]
        indexes = [
            models.Index(fields=["resume", "-version_number"], name="idx_rv_resume_version"),
            models.Index(fields=["sha256_hash"], name="idx_rv_sha256"),
        ]

    def __str__(self):
        return f"Version {self.version_number} of Resume {self.resume_id}"


class Skill(models.Model):
    """
    Catalog of skills, matching Intern 3's skills table in Domain-2:
      id INTEGER PRIMARY KEY
      name TEXT NOT NULL UNIQUE
      normalized_name TEXT NOT NULL UNIQUE
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Skill display name (e.g. Python, REST API)"
    )
    normalized_name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Normalized lowercase skill name for consistent matching"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "skills"
        verbose_name = "Skill"
        verbose_name_plural = "Skills"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ResumeSkill(models.Model):
    """
    Join table between ResumeVersion and Skill, matching Intern 3's resume_skills table:
      resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE
      source TEXT NOT NULL DEFAULT 'parsed'
      confidence REAL
      PRIMARY KEY (resume_id, skill_id)
    """
    resume_version = models.ForeignKey(
        ResumeVersion,
        on_delete=models.CASCADE,
        related_name="resume_skills",
        help_text="The resume version this skill was extracted from"
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="resume_skills",
        help_text="The matched skill from the catalog"
    )
    source = models.CharField(
        max_length=50,
        default="parsed",
        help_text="Extraction source (parsed, manual, nlp_ner)"
    )
    confidence = models.FloatField(
        null=True,
        blank=True,
        default=1.0,
        help_text="Extraction confidence score (0.0 - 1.0 or percentage)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "resume_skills"
        verbose_name = "Resume Skill"
        verbose_name_plural = "Resume Skills"
        unique_together = ("resume_version", "skill")
        indexes = [
            models.Index(fields=["skill"], name="idx_rs_skill_id"),
        ]

    def __str__(self):
        return f"{self.skill.name} in {self.resume_version}"
