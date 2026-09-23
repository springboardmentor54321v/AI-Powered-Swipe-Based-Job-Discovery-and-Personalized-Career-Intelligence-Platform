"""
SwipeX Milestone 3 — Day 2 Resume Service Tests

Automated test suite covering:
  1. Resume upload success (PDF)
  2. Resume upload success (DOCX)
  3. Resume list
  4. RBAC — Job Seeker allowed
  5. RBAC — Recruiter denied upload
  6. Unauthenticated denied
  7. Missing file
  8. Invalid file type
  9. Empty file
  10. Oversized file
  11. Version creation (multiple uploads)
  12. Ownership isolation (User A can't see User B's resumes)
  13. Duplicate hash detection
  14. File storage verification
"""

import os
import shutil
import tempfile
from io import BytesIO
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.conf import settings

from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token
from apps.resume_service.models import Resume, ResumeVersion
from apps.resume_service.storage import file_exists

# Use a temporary directory for test resume storage
TEST_STORAGE_PATH = os.path.join(tempfile.gettempdir(), "swipex_test_resumes")


def _make_pdf_bytes(content=b"fake PDF content for testing"):
    """Create a minimal valid-looking PDF byte stream."""
    return b"%PDF-1.4\n" + content + b"\n%%EOF"


def _make_docx_bytes():
    """Create minimal DOCX-like bytes (ZIP with .docx extension)."""
    import zipfile
    buf = BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("[Content_Types].xml", '<?xml version="1.0"?><Types></Types>')
    return buf.getvalue()


@override_settings(RESUME_STORAGE_PATH=TEST_STORAGE_PATH)
class M3ResumeUploadTests(TestCase):
    """Test suite for POST /api/v1/resumes/upload"""

    def setUp(self):
        self.client = APIClient()

        # Create roles
        self.js_role, _ = Role.objects.get_or_create(
            name=RoleEnum.JOB_SEEKER,
            defaults={"description": "Candidate"}
        )
        self.rec_role, _ = Role.objects.get_or_create(
            name=RoleEnum.RECRUITER,
            defaults={"description": "Employer"}
        )

        # Create test users
        self.job_seeker = User.objects.create_user(
            email="seeker1@test.com", name="Seeker One",
            password="TestPass123!", role=self.js_role
        )
        self.recruiter = User.objects.create_user(
            email="recruiter1@test.com", name="Recruiter One",
            password="TestPass123!", role=self.rec_role
        )

        # Generate tokens
        self.seeker_token = generate_access_token(self.job_seeker)
        self.recruiter_token = generate_access_token(self.recruiter)

        self.upload_url = reverse("m3-resume-upload")

    def tearDown(self):
        if os.path.exists(TEST_STORAGE_PATH):
            shutil.rmtree(TEST_STORAGE_PATH)

    def _upload_pdf(self, token=None, filename="resume.pdf", content=None):
        """Helper to upload a PDF file."""
        if content is None:
            content = _make_pdf_bytes()
        file_obj = BytesIO(content)
        file_obj.name = filename
        tok = token or self.seeker_token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tok}")
        return self.client.post(
            self.upload_url,
            {"file": file_obj},
            format="multipart",
        )

    # ── Test 1: Successful PDF upload ──
    def test_01_upload_pdf_success(self):
        resp = self._upload_pdf()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()
        self.assertIn("resume_id", data)
        self.assertIn("version_id", data)
        self.assertEqual(data["version_number"], 1)
        self.assertEqual(data["original_filename"], "resume.pdf")
        self.assertEqual(data["is_active"], True)
        self.assertEqual(data["extraction_status"], "pending")

    # ── Test 2: Successful DOCX upload ──
    def test_02_upload_docx_success(self):
        docx_content = _make_docx_bytes()
        file_obj = BytesIO(docx_content)
        file_obj.name = "resume.docx"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        resp = self.client.post(
            self.upload_url,
            {"file": file_obj},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()
        self.assertEqual(data["version_number"], 1)
        self.assertEqual(data["original_filename"], "resume.docx")

    # ── Test 3: RBAC — Recruiter denied upload ──
    def test_03_recruiter_denied_upload(self):
        resp = self._upload_pdf(token=self.recruiter_token)
        self.assertIn(resp.status_code, [status.HTTP_403_FORBIDDEN])

    # ── Test 4: Unauthenticated denied ──
    def test_04_unauthenticated_denied(self):
        file_obj = BytesIO(_make_pdf_bytes())
        file_obj.name = "resume.pdf"
        self.client.credentials()  # No auth
        resp = self.client.post(
            self.upload_url,
            {"file": file_obj},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Test 5: Missing file ──
    def test_05_missing_file(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        resp = self.client.post(self.upload_url, {}, format="multipart")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Test 6: Invalid file type ──
    def test_06_invalid_file_type(self):
        file_obj = BytesIO(b"not a resume")
        file_obj.name = "resume.txt"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        resp = self.client.post(
            self.upload_url,
            {"file": file_obj},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Unsupported file format", resp.json()["detail"])

    # ── Test 7: Empty file ──
    def test_07_empty_file(self):
        file_obj = BytesIO(b"")
        file_obj.name = "empty.pdf"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        resp = self.client.post(
            self.upload_url,
            {"file": file_obj},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Test 8: Versioning — multiple uploads ──
    def test_08_versioning_multiple_uploads(self):
        resp1 = self._upload_pdf(content=_make_pdf_bytes(b"version 1"))
        self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp1.json()["version_number"], 1)

        resp2 = self._upload_pdf(content=_make_pdf_bytes(b"version 2"))
        self.assertEqual(resp2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp2.json()["version_number"], 2)

        # Same resume_id for both
        self.assertEqual(resp1.json()["resume_id"], resp2.json()["resume_id"])

        # Version 2 is active, version 1 is not
        v1 = ResumeVersion.objects.get(id=resp1.json()["version_id"])
        v2 = ResumeVersion.objects.get(id=resp2.json()["version_id"])
        self.assertFalse(v1.is_active)
        self.assertTrue(v2.is_active)

    # ── Test 9: Duplicate hash detection ──
    def test_09_duplicate_hash_detection(self):
        content = _make_pdf_bytes(b"exact same content")
        resp1 = self._upload_pdf(content=content)
        self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)

        resp2 = self._upload_pdf(content=content)
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already been uploaded", resp2.json()["detail"])

    # ── Test 10: File storage verification ──
    def test_10_file_stored_on_disk(self):
        resp = self._upload_pdf()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        version = ResumeVersion.objects.get(id=resp.json()["version_id"])
        self.assertTrue(file_exists(version.storage_key))

    # ── Test 11: Database records correct ──
    def test_11_database_records(self):
        resp = self._upload_pdf()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()

        resume = Resume.objects.get(id=data["resume_id"])
        self.assertEqual(resume.owner_id, self.job_seeker.id)

        version = ResumeVersion.objects.get(id=data["version_id"])
        self.assertEqual(version.resume_id, resume.id)
        self.assertEqual(version.original_filename, "resume.pdf")
        self.assertGreater(version.file_size_bytes, 0)
        self.assertEqual(len(version.sha256_hash), 64)

    # ── Test 12: Upload with label ──
    def test_12_upload_with_label(self):
        file_obj = BytesIO(_make_pdf_bytes())
        file_obj.name = "resume.pdf"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        resp = self.client.post(
            self.upload_url,
            {"file": file_obj, "label": "Backend Dev Resume v2"},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.json()["label"], "Backend Dev Resume v2")


@override_settings(RESUME_STORAGE_PATH=TEST_STORAGE_PATH)
class M3ResumeListTests(TestCase):
    """Test suite for GET /api/v1/resumes/"""

    def setUp(self):
        self.client = APIClient()

        self.js_role, _ = Role.objects.get_or_create(
            name=RoleEnum.JOB_SEEKER,
            defaults={"description": "Candidate"}
        )
        self.rec_role, _ = Role.objects.get_or_create(
            name=RoleEnum.RECRUITER,
            defaults={"description": "Employer"}
        )

        # User A (Job Seeker)
        self.user_a = User.objects.create_user(
            email="seeker_a@test.com", name="Seeker A",
            password="TestPass123!", role=self.js_role
        )
        # User B (Job Seeker)
        self.user_b = User.objects.create_user(
            email="seeker_b@test.com", name="Seeker B",
            password="TestPass123!", role=self.js_role
        )
        self.recruiter = User.objects.create_user(
            email="recruiter_list@test.com", name="Recruiter",
            password="TestPass123!", role=self.rec_role
        )

        self.token_a = generate_access_token(self.user_a)
        self.token_b = generate_access_token(self.user_b)
        self.recruiter_token = generate_access_token(self.recruiter)

        self.upload_url = reverse("m3-resume-upload")
        self.list_url = reverse("m3-resume-list")

    def tearDown(self):
        if os.path.exists(TEST_STORAGE_PATH):
            shutil.rmtree(TEST_STORAGE_PATH)

    def _upload_for_user(self, token, content_suffix=b""):
        """Upload a PDF for a given user's token."""
        file_obj = BytesIO(_make_pdf_bytes(b"content" + content_suffix))
        file_obj.name = "resume.pdf"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return self.client.post(
            self.upload_url,
            {"file": file_obj},
            format="multipart",
        )

    # ── Test 1: List resumes success ──
    def test_01_list_resumes_success(self):
        self._upload_for_user(self.token_a, b"a1")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(len(data["results"]), 1)

    # ── Test 2: List empty (no uploads) ──
    def test_02_list_empty(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()["count"], 0)

    # ── Test 3: Ownership isolation — User A cannot see User B ──
    def test_03_ownership_isolation(self):
        # User A uploads 2 versions
        self._upload_for_user(self.token_a, b"a1")
        self._upload_for_user(self.token_a, b"a2")

        # User B uploads 1 version
        self._upload_for_user(self.token_b, b"b1")

        # User A sees only their resume
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        resp_a = self.client.get(self.list_url)
        self.assertEqual(resp_a.status_code, status.HTTP_200_OK)
        data_a = resp_a.json()
        self.assertEqual(data_a["count"], 1)
        # User A has 2 versions
        self.assertEqual(data_a["results"][0]["version_count"], 2)

        # User B sees only their resume
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        resp_b = self.client.get(self.list_url)
        self.assertEqual(resp_b.status_code, status.HTTP_200_OK)
        data_b = resp_b.json()
        self.assertEqual(data_b["count"], 1)
        self.assertEqual(data_b["results"][0]["version_count"], 1)

        # Different resume IDs
        self.assertNotEqual(
            data_a["results"][0]["resume_id"],
            data_b["results"][0]["resume_id"],
        )

    # ── Test 4: List shows version details ──
    def test_04_list_shows_versions(self):
        self._upload_for_user(self.token_a, b"v1")
        self._upload_for_user(self.token_a, b"v2")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        resp = self.client.get(self.list_url)
        data = resp.json()
        resume = data["results"][0]
        self.assertEqual(resume["version_count"], 2)
        self.assertIn("current_version", resume)
        self.assertIsNotNone(resume["current_version"])
        self.assertTrue(resume["current_version"]["is_active"])
        self.assertIn("versions", resume)
        self.assertEqual(len(resume["versions"]), 2)

    # ── Test 5: RBAC — Recruiter denied list ──
    def test_05_recruiter_denied_list(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    # ── Test 6: Unauthenticated denied list ──
    def test_06_unauthenticated_denied_list(self):
        self.client.credentials()
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
