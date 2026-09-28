"""
SwipeX Resume File Storage (Milestone 3 — Day 2)

Local disk storage module matching Intern 3's 'disk' driver pattern
from Domain-2/resume-backend/src/storage.js.

Storage key format: {user_id}/{uuid}-{sanitized_filename}
Storage root: RESUME_STORAGE_PATH env var (default: media/resumes/)

This module does NOT duplicate Intern 3's storage implementation.
It provides the same interface within the Django/DRF stack so that
Domain-1 can handle file uploads directly.
"""

import os
import re
import uuid
import hashlib
import logging
from pathlib import Path
from django.conf import settings

logger = logging.getLogger("resume_service.storage")

# Accepted MIME types per Day-1 contract
ACCEPTED_CONTENT_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}

ACCEPTED_EXTENSIONS = {".pdf", ".docx"}

# Max file size: 5 MB per Day-1 contract
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def get_storage_root() -> Path:
    """Return the absolute path to the resume storage directory."""
    storage_path = getattr(settings, "RESUME_STORAGE_PATH", None)
    if storage_path:
        return Path(storage_path)
    return Path(settings.BASE_DIR) / "media" / "resumes"


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage.
    Matches Intern 3's pattern: filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    """
    return re.sub(r"[^a-zA-Z0-9._-]", "_", filename)


def generate_storage_key(user_id, filename: str) -> str:
    """
    Generate a unique storage key following Intern 3's pattern:
    {candidateId}/{uuid}-{sanitized_filename}
    """
    safe_name = sanitize_filename(filename)
    return f"{user_id}/{uuid.uuid4()}-{safe_name}"


def compute_sha256(file_obj) -> str:
    """Compute SHA-256 hash of file content."""
    hasher = hashlib.sha256()
    file_obj.seek(0)
    if hasattr(file_obj, "chunks"):
        for chunk in file_obj.chunks(8192):
            hasher.update(chunk)
    else:
        while True:
            chunk = file_obj.read(8192)
            if not chunk:
                break
            hasher.update(chunk)
    file_obj.seek(0)
    return hasher.hexdigest()


def validate_resume_file(file_obj):
    """
    Validate the uploaded resume file.
    Returns (is_valid, error_message).
    """
    if file_obj is None:
        return False, "No file provided. The 'file' field is required."

    # Check file size
    file_size = getattr(file_obj, "size", None)
    if file_size is None:
        file_obj.seek(0, os.SEEK_END)
        file_size = file_obj.tell()
        file_obj.seek(0)

    if file_size == 0:
        return False, "Uploaded file is empty."

    if file_size > MAX_FILE_SIZE_BYTES:
        size_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
        return False, f"File size exceeds the maximum allowed size of {size_mb:.0f} MB."

    # Check file extension
    filename = getattr(file_obj, "name", "") or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ACCEPTED_EXTENSIONS:
        return False, f"Unsupported file format. Accepted: .pdf, .docx"

    # Check content type (with fallback — some clients don't set it correctly)
    content_type = getattr(file_obj, "content_type", "") or ""
    if content_type and content_type not in ACCEPTED_CONTENT_TYPES:
        # Allow if extension is valid even if MIME type is generic
        if content_type not in ("application/octet-stream", ""):
            return False, f"Unsupported file format. Accepted: .pdf, .docx"

    return True, None


def save_resume_file(user_id, filename: str, file_obj) -> tuple:
    """
    Save a resume file to local disk storage.

    Args:
        user_id: Owner user ID (used as directory prefix)
        filename: Original filename
        file_obj: Django UploadedFile or file-like object

    Returns:
        (storage_key, file_size_bytes, sha256_hash, content_type)

    Raises:
        IOError: If the file cannot be written to disk.
    """
    storage_root = get_storage_root()
    storage_key = generate_storage_key(user_id, filename)
    file_path = storage_root / storage_key

    # Ensure the directory exists
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Compute hash before writing
    sha256_hash = compute_sha256(file_obj)

    # Determine content type
    content_type = getattr(file_obj, "content_type", "") or "application/octet-stream"
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf" and content_type == "application/octet-stream":
        content_type = "application/pdf"
    elif ext == ".docx" and content_type == "application/octet-stream":
        content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    # Write file to disk
    file_obj.seek(0)
    with open(file_path, "wb") as dest:
        if hasattr(file_obj, "chunks"):
            for chunk in file_obj.chunks(8192):
                dest.write(chunk)
        else:
            while True:
                chunk = file_obj.read(8192)
                if not chunk:
                    break
                dest.write(chunk)

    file_size = getattr(file_obj, "size", None)
    if file_size is None:
        file_size = file_path.stat().st_size

    logger.info(f"Resume file saved: key={storage_key}, size={file_size}, hash={sha256_hash[:12]}...")

    return storage_key, file_size, sha256_hash, content_type


def file_exists(storage_key: str) -> bool:
    """Check if a stored resume file exists on disk."""
    file_path = get_storage_root() / storage_key
    return file_path.is_file()


def get_file_path(storage_key: str) -> Path:
    """Return the absolute Path to a stored resume file."""
    return get_storage_root() / storage_key
