"""
SwipeX Milestone 3 — Day 3 Resume Parse Service Tests

Automated test suite covering:
  1. Parse PDF resume success (text + skills extracted)
  2. Parse DOCX resume success (text + skills extracted)
  3. Ownership enforcement (Candidate B cannot parse Candidate A's resume)
  4. RBAC: Recruiter denied parse (403 Forbidden)
  5. Unauthenticated request denied (401 Unauthorized)
  6. Non-existent resume UUID (404 Not Found)
  7. Malformed UUID format (400 Bad Request)
  8. Missing storage file on disk (404 Not Found)
  9. Database persistence: parsed_text, parsed_status, Skill, and ResumeSkill
  10. Idempotency: re-parsing updates records without duplicating ResumeSkill rows
  11. Direct parse by ResumeVersion UUID
  12. Malformed file returns controlled error and records FAILED status
"""

import os
import uuid
import tempfile
import shutil
from pathlib import Path
from io import BytesIO

from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token
from apps.resume_service.models import Resume, ResumeVersion, Skill, ResumeSkill
from apps.resume_service.storage import save_resume_file


class M3ResumeParseTests(TestCase):
    """Test suite for POST /api/v1/resumes/{id}/parse endpoint."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_media_dir = Path(tempfile.mkdtemp(prefix="swipex_test_parse_media_"))

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        if cls.test_media_dir.exists():
            shutil.rmtree(cls.test_media_dir, ignore_errors=True)

    def setUp(self):
        self.settings_override = override_settings(RESUME_STORAGE_PATH=str(self.test_media_dir))
        self.settings_override.enable()

        self.client = APIClient()

        # Roles
        self.candidate_role, _ = Role.objects.get_or_create(
            name=RoleEnum.JOB_SEEKER,
            defaults={"description": "Job Seeker"}
        )
        self.recruiter_role, _ = Role.objects.get_or_create(
            name=RoleEnum.RECRUITER,
            defaults={"description": "Employer"}
        )

        # Job Seeker A (owner)
        self.user_a = User.objects.create_user(
            email="candidate_a@example.com",
            name="Candidate A",
            password="TestPassword123!",
            role=self.candidate_role,
        )
        self.token_a = generate_access_token(self.user_a)

        # Job Seeker B (other candidate)
        self.user_b = User.objects.create_user(
            email="candidate_b@example.com",
            name="Candidate B",
            password="TestPassword123!",
            role=self.candidate_role,
        )
        self.token_b = generate_access_token(self.user_b)

        # Recruiter
        self.recruiter = User.objects.create_user(
            email="recruiter@example.com",
            name="Recruiter One",
            password="TestPassword123!",
            role=self.recruiter_role,
        )
        self.token_recruiter = generate_access_token(self.recruiter)

        # Copy sample_resume.pdf from Domain-3
        d3_sample = (
            Path(__file__).resolve().parent.parent.parent.parent
            / "Domain-3"
            / "Milestone3work"
            / "sample_resume.pdf"
        )
        if d3_sample.exists():
            self.pdf_bytes = d3_sample.read_bytes()
        else:
            self.pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"

        # Helper to upload a resume for user_a
        self.resume, self.version = self._create_test_resume(
            user=self.user_a,
            filename="developer_resume.pdf",
            content=self.pdf_bytes,
            content_type="application/pdf"
        )

    def tearDown(self):
        self.settings_override.disable()

    def _create_test_resume(self, user, filename, content, content_type):
        """Helper to create Resume and ResumeVersion backed by physical file on disk."""
        file_obj = BytesIO(content)
        file_obj.name = filename
        file_obj.size = len(content)
        file_obj.content_type = content_type

        storage_key, file_size, sha_hash, ct = save_resume_file(user.id, filename, file_obj)

        resume, _ = Resume.objects.get_or_create(owner=user)
        version = ResumeVersion.objects.create(
            resume=resume,
            version_number=1,
            original_filename=filename,
            content_type=ct,
            storage_key=storage_key,
            file_size_bytes=file_size,
            sha256_hash=sha_hash,
            is_active=True,
        )
        return resume, version

    # ── Test 1: Successful PDF parse ──
    def test_01_parse_pdf_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        url = f"/api/v1/resumes/{self.resume.id}/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(data["resume_id"], str(self.resume.id))
        self.assertEqual(data["version_id"], str(self.version.id))
        self.assertEqual(data["parsed_status"], "PARSED")
        self.assertTrue(len(data["parsed_text"]) > 0)
        self.assertIsInstance(data["extracted_skills"], list)
        self.assertIsInstance(data["parsed_skills"], list)
        # Verify known skills from sample_resume.pdf
        self.assertIn("python", [s.lower() for s in data["extracted_skills"]])

    # ── Test 2: Successful DOCX parse ──
    def test_02_parse_docx_success(self):
        import docx
        doc = docx.Document()
        doc.add_paragraph("Full stack engineer experienced in Python, React, PostgreSQL, and Docker.")
        docx_io = BytesIO()
        doc.save(docx_io)
        docx_bytes = docx_io.getvalue()

        resume_docx, version_docx = self._create_test_resume(
            user=self.user_a,
            filename="resume.docx",
            content=docx_bytes,
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        url = f"/api/v1/resumes/{version_docx.id}/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(data["parsed_status"], "PARSED")
        skills = [s.lower() for s in data["extracted_skills"]]
        self.assertIn("python", skills)
        self.assertIn("react", skills)
        self.assertIn("postgresql", skills)
        self.assertIn("docker", skills)

    # ── Test 3: Ownership enforcement ──
    def test_03_ownership_isolation(self):
        # Candidate B attempts to parse Candidate A's resume
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        url = f"/api/v1/resumes/{self.resume.id}/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("permission", response.json().get("detail", "").lower())

    # ── Test 4: Recruiter denied parse (RBAC) ──
    def test_04_recruiter_denied_parse(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_recruiter}")
        url = f"/api/v1/resumes/{self.resume.id}/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Test 5: Unauthenticated denied ──
    def test_05_unauthenticated_denied_parse(self):
        url = f"/api/v1/resumes/{self.resume.id}/parse"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Test 6: Non-existent resume UUID ──
    def test_06_nonexistent_resume_id(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        random_uuid = uuid.uuid4()
        url = f"/api/v1/resumes/{random_uuid}/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Test 7: Malformed UUID format ──
    def test_07_invalid_uuid_format(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        url = "/api/v1/resumes/not-a-valid-uuid/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Test 8: Missing storage file on disk ──
    def test_08_missing_disk_file(self):
        # Delete file from disk
        file_path = self.test_media_dir / self.version.storage_key
        if file_path.exists():
            file_path.unlink()

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        url = f"/api/v1/resumes/{self.resume.id}/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Test 9: Database persistence verification ──
    def test_09_database_persistence(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        url = f"/api/v1/resumes/{self.resume.id}/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh from database
        self.version.refresh_from_db()
        self.assertEqual(self.version.parsed_status, "PARSED")
        self.assertTrue(len(self.version.parsed_text) > 0)
        self.assertIsNotNone(self.version.parsed_at)

        # Verify ResumeSkill records
        resume_skills = ResumeSkill.objects.filter(resume_version=self.version)
        self.assertTrue(resume_skills.exists())

        skill_names = [rs.skill.name.lower() for rs in resume_skills]
        self.assertIn("python", skill_names)

    # ── Test 10: Idempotency (multiple calls don't duplicate rows) ──
    def test_10_repeat_parse_idempotency(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        url = f"/api/v1/resumes/{self.resume.id}/parse"

        # First call
        res1 = self.client.post(url)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        count_first = ResumeSkill.objects.filter(resume_version=self.version).count()

        # Second call
        res2 = self.client.post(url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        count_second = ResumeSkill.objects.filter(resume_version=self.version).count()

        # Row counts must match exactly (no duplicate skill rows created)
        self.assertEqual(count_first, count_second)

    # ── Test 11: Parse directly using ResumeVersion UUID ──
    def test_11_parse_by_version_id(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        url = f"/api/v1/resumes/{self.version.id}/parse"

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["version_id"], str(self.version.id))
        self.assertEqual(data["parsed_status"], "PARSED")

    # ── Test 12: Corrupted file returns controlled error ──
    def test_12_corrupted_file_handling(self):
        corrupted_content = b"%PDF-1.4 Corrupted content with invalid PDF binary tokens !!!@@@###"
        _, corrupted_version = self._create_test_resume(
            user=self.user_a,
            filename="corrupted.pdf",
            content=corrupted_content,
            content_type="application/pdf"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        url = f"/api/v1/resumes/{corrupted_version.id}/parse"

        response = self.client.post(url)
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR])

        corrupted_version.refresh_from_db()
        self.assertEqual(corrupted_version.parsed_status, "FAILED")
