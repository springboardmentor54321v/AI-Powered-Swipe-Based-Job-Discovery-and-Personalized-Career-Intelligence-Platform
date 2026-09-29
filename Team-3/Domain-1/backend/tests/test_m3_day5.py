"""
SwipeX Milestone 3 — Day 5 AI Suggestions & Upgraded Recommendations Tests

Automated test suite covering:
  Part 1: AI Suggestions (POST /api/v1/suggestions/)
    1. Successful suggestions with parsed resume and target job
    2. Successful suggestions with parsed resume without job_id (general suggestions)
    3. Missing resume_id returns 400 Bad Request
    4. Malformed resume_id returns 400 Bad Request
    5. Non-existent resume_id returns 404 Not Found
    6. Non-existent job_id returns 404 Not Found
    7. Ownership enforcement: Candidate B denied suggestions for Candidate A's resume (403)
    8. Unparsed resume rejected with 400 Bad Request
    9. RBAC: Recruiter denied suggestions (403 Forbidden)
    10. Unauthenticated request denied (401 Unauthorized)

  Part 2: Upgraded Recommendations (GET /api/v1/recommendations/)
    11. Successful recommendations for authenticated job seeker
    12. Personalized recommendations with candidate's parsed resume
    13. Ownership enforcement: Candidate B denied personalized recs with Candidate A's resume (403)
    14. Malformed resume_id returns 400 Bad Request
    15. Limit query param respected (top_k limit)
    16. RBAC: Recruiter denied recommendations (403 Forbidden)
    17. Unauthenticated request denied (401 Unauthorized)
"""

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


class M3Day5Tests(TestCase):
    """Test suite for Day-5 endpoints: AI Suggestions and Upgraded Recommendations."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_media_dir = Path(tempfile.mkdtemp(prefix="swipex_test_day5_media_"))

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
            email="candidate_a_day5@example.com",
            name="Candidate A Day5",
            password="TestPassword123!",
            role=self.candidate_role,
        )
        self.token_a = generate_access_token(self.user_a)

        # Job Seeker B (other candidate)
        self.user_b = User.objects.create_user(
            email="candidate_b_day5@example.com",
            name="Candidate B Day5",
            password="TestPassword123!",
            role=self.candidate_role,
        )
        self.token_b = generate_access_token(self.user_b)

        # Recruiter
        self.recruiter = User.objects.create_user(
            email="recruiter_day5@example.com",
            name="Recruiter Day5",
            password="TestPassword123!",
            role=self.recruiter_role,
        )
        self.token_recruiter = generate_access_token(self.recruiter)

        # Create parsed resume for User A
        self.resume_a, self.version_a = self._create_parsed_resume(
            user=self.user_a,
            filename="user_a_resume.pdf",
            parsed_text="Senior Python Backend Developer with 5 years experience in Django, REST APIs, and PostgreSQL.",
            skills=["Python", "Django", "PostgreSQL", "REST API", "Git"]
        )

        # Unparsed Candidate & Resume
        self.user_unparsed = User.objects.create_user(
            email="candidate_unparsed_day5@example.com",
            name="Candidate Unparsed",
            password="TestPassword123!",
            role=self.candidate_role,
        )
        self.token_unparsed = generate_access_token(self.user_unparsed)

        self.unparsed_resume, self.unparsed_version = self._create_test_resume(
            user=self.user_unparsed,
            filename="unparsed_resume.pdf",
            content=b"%PDF-1.4 mock resume content",
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
            version_number=resume.versions.count() + 1,
            original_filename=filename,
            content_type=ct,
            storage_key=storage_key,
            file_size_bytes=file_size,
            sha256_hash=sha_hash,
            is_active=True,
        )
        return resume, version

    def _create_parsed_resume(self, user, filename, parsed_text, skills):
        """Helper to create a fully parsed resume with associated skills."""
        resume, version = self._create_test_resume(
            user=user,
            filename=filename,
            content=b"%PDF-1.4 test parsed resume content",
            content_type="application/pdf"
        )
        version.parsed_status = "PARSED"
        version.parsed_text = parsed_text
        version.save()

        for skill_name in skills:
            skill_obj, _ = Skill.objects.get_or_create(
                normalized_name=skill_name.lower().strip(),
                defaults={"name": skill_name}
            )
            ResumeSkill.objects.get_or_create(
                resume_version=version,
                skill=skill_obj,
                defaults={"source": "test", "confidence": 95.0}
            )

        return resume, version

    # ════════════════════════════════════════════════════════════
    # PART 1: AI Suggestions (POST /api/v1/suggestions/)
    # ════════════════════════════════════════════════════════════

    def test_01_suggestions_success_with_job(self):
        """Candidate gets AI suggestions targeting a specific job."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        payload = {
            "resume_id": str(self.resume_a.id),
            "job_id": "270925008041",  # From cleaned_jobs.csv
        }
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data["resume_id"], str(self.resume_a.id))
        self.assertEqual(data["job_id"], "270925008041")
        self.assertIn("job_title", data)
        self.assertIn("source", data)
        self.assertIn(data["source"], ["rule_based", "ai_generated"])
        self.assertIn("keyword_match_pct", data)
        self.assertIsInstance(data["matched_skills"], list)
        self.assertIsInstance(data["missing_skills"], list)
        self.assertIsInstance(data["suggestions"], list)
        self.assertGreater(len(data["suggestions"]), 0)

        # Check suggestion item structure
        first_suggestion = data["suggestions"][0]
        self.assertIn("category", first_suggestion)
        self.assertIn("priority", first_suggestion)
        self.assertIn("title", first_suggestion)
        self.assertIn("detail", first_suggestion)

    def test_02_suggestions_success_without_job(self):
        """Candidate gets general suggestions with only resume_id."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        payload = {
            "resume_id": str(self.resume_a.id),
        }
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data["resume_id"], str(self.resume_a.id))
        self.assertIsNone(data["job_id"])
        self.assertIn("suggestions", data)
        self.assertGreater(len(data["suggestions"]), 0)

    def test_03_suggestions_missing_resume_id(self):
        """Request without resume_id returns 400 Bad Request."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        response = self.client.post("/api/v1/suggestions/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("resume_id", response.json()["detail"].lower())

    def test_04_suggestions_malformed_uuid(self):
        """Request with non-UUID resume_id returns 400 Bad Request."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        payload = {"resume_id": "not-a-valid-uuid"}
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("UUID", response.json()["detail"])

    def test_05_suggestions_non_existent_resume(self):
        """Request with random UUID returns 404 Not Found."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        payload = {"resume_id": str(uuid.uuid4())}
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_06_suggestions_non_existent_job(self):
        """Request with invalid job_id returns 404 Not Found."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        payload = {
            "resume_id": str(self.resume_a.id),
            "job_id": "999999",
        }
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_07_suggestions_ownership_enforcement(self):
        """Candidate B cannot request suggestions for Candidate A's resume."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        payload = {
            "resume_id": str(self.resume_a.id),
        }
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_08_suggestions_unparsed_resume(self):
        """Attempting suggestions on an unparsed resume returns 400 Bad Request."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_unparsed}")
        payload = {
            "resume_id": str(self.unparsed_resume.id),
        }
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("parsed", response.json()["detail"].lower())

    def test_09_suggestions_recruiter_denied(self):
        """Recruiter role is rejected with 403 Forbidden."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_recruiter}")
        payload = {
            "resume_id": str(self.resume_a.id),
        }
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_10_suggestions_unauthenticated(self):
        """Request without auth header returns 401 Unauthorized."""
        payload = {
            "resume_id": str(self.resume_a.id),
        }
        response = self.client.post("/api/v1/suggestions/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ════════════════════════════════════════════════════════════
    # PART 2: Upgraded Recommendations (GET /api/v1/recommendations/)
    # ════════════════════════════════════════════════════════════

    def test_11_recommendations_success(self):
        """Authenticated job seeker gets upgraded recommendations."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        response = self.client.get("/api/v1/resumes/recommendations")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data["user_id"], str(self.user_a.id))
        self.assertIn("recommendations", data)
        self.assertIn("count", data)
        self.assertEqual(data["match_type"], "hybrid")
        self.assertIsInstance(data["recommendations"], list)

        if data["recommendations"]:
            rec = data["recommendations"][0]
            self.assertIn("job_id", rec)
            self.assertIn("job_title", rec)
            self.assertIn("company", rec)
            self.assertIn("semantic_similarity_score", rec)
            self.assertIn("swipe_boost", rec)
            self.assertIn("final_match_percentage", rec)
            self.assertEqual(rec["match_type"], "hybrid")

    def test_12_recommendations_with_resume(self):
        """Job seeker gets personalized recommendations using parsed resume."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        response = self.client.get(f"/api/v1/resumes/recommendations?resume_id={self.resume_a.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data["resume_id"], str(self.resume_a.id))
        self.assertGreater(data["count"], 0)

    def test_13_recommendations_ownership_enforcement(self):
        """Candidate B cannot use Candidate A's resume for recommendations."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        response = self.client.get(f"/api/v1/resumes/recommendations?resume_id={self.resume_a.id}")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_14_recommendations_malformed_resume_id(self):
        """Malformed UUID for resume_id returns 400 Bad Request."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        response = self.client.get("/api/v1/resumes/recommendations?resume_id=not-a-uuid")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_15_recommendations_limit_param(self):
        """Passing limit parameter restricts the number of returned recommendations."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        response = self.client.get("/api/v1/resumes/recommendations?limit=2")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertLessEqual(len(data["recommendations"]), 2)

    def test_16_recommendations_recruiter_denied(self):
        """Recruiter role is rejected from recommendations (403 Forbidden)."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_recruiter}")
        response = self.client.get("/api/v1/resumes/recommendations")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_17_recommendations_unauthenticated(self):
        """Unauthenticated request is rejected with 401 Unauthorized."""
        response = self.client.get("/api/v1/resumes/recommendations")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
