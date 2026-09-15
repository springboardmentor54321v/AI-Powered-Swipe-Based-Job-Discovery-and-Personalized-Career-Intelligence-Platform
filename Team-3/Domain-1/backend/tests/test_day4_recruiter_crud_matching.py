from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token


class Day4RecruiterCrudAndMatchingTests(TestCase):
    """
    Milestone 2 - Day 4 Automated Test Suite
    Covers:
      1. Job Freshness and Competition Fields (posted_time, posted_at, applicant_count, competition_level)
      2. Matching Engine Gateway Integration (/api/v1/matching/ and /api/v1/recommendations/)
      3. Recruiter Job Posting CRUD Stub (Create, Read, Update, Delete)
      4. RBAC Enforcement (Job Seeker 403, Unauthenticated 401, Recruiter/Admin 200/201)
    """

    def setUp(self):
        self.client = APIClient()

        # Seed roles
        self.job_seeker_role, _ = Role.objects.get_or_create(
            name=RoleEnum.JOB_SEEKER,
            defaults={"description": "Candidate"}
        )
        self.recruiter_role, _ = Role.objects.get_or_create(
            name=RoleEnum.RECRUITER,
            defaults={"description": "Recruiter"}
        )
        self.admin_role, _ = Role.objects.get_or_create(
            name=RoleEnum.ADMIN,
            defaults={"description": "Administrator"}
        )

        # Candidate user
        self.candidate = User.objects.create_user(
            email="candidate_day4@example.com",
            name="Aarav Candidate",
            password="SecurePassword123!",
            role=self.job_seeker_role
        )
        self.candidate_token = generate_access_token(self.candidate)

        # Recruiter user
        self.recruiter = User.objects.create_user(
            email="recruiter_day4@example.com",
            name="Diya Recruiter",
            password="SecurePassword123!",
            role=self.recruiter_role
        )
        self.recruiter_token = generate_access_token(self.recruiter)

        # Admin user
        self.admin = User.objects.create_user(
            email="admin_day4@example.com",
            name="Kabir Admin",
            password="SecurePassword123!",
            role=self.admin_role
        )
        self.admin_token = generate_access_token(self.admin)

    # ------------------------------------------------------------
    # 1. Job Freshness and Competition Fields Exposure
    # ------------------------------------------------------------

    @patch("gateway.proxy.requests.request")
    def test_01_job_list_exposes_freshness_and_competition_fields(self, mock_request):
        """GET /api/v1/jobs/ must expose posted_time, posted_at, applicant_count, and competition_level."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "jobs": [
                {
                    "job_id": 101,
                    "title": "Full Stack Python Developer",
                    "company": "Tata Consultancy Services",
                    "posted_at": "2026-09-14T09:30:00Z",
                    "applicant_count": 14,
                    "competition_level": "LOW",
                    "freshness": "JUST_POSTED",
                }
            ],
            "count": 1
        }
        mock_request.return_value = mock_resp

        res = self.client.get("/api/v1/jobs/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        first_job = res.data["jobs"][0]
        self.assertIn("applicant_count", first_job)
        self.assertEqual(first_job["applicant_count"], 14)
        self.assertIn("competition_level", first_job)
        self.assertEqual(first_job["competition_level"], "LOW")
        self.assertIn("posted_time", first_job)
        self.assertIn("posted_at", first_job)
        self.assertEqual(first_job["posted_time"], "2026-09-14T09:30:00Z")

    @patch("gateway.proxy.requests.request")
    def test_02_job_detail_exposes_freshness_and_competition_fields(self, mock_request):
        """GET /api/v1/jobs/{id} must expose posted_time, posted_at, applicant_count, and competition_level."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "job_id": 101,
            "title": "Full Stack Python Developer",
            "company": "Tata Consultancy Services",
            "posted_at": "2026-09-14T09:30:00Z",
            "applicant_count": 14,
            "competition_level": "LOW",
            "freshness": "JUST_POSTED",
        }
        mock_request.return_value = mock_resp

        res = self.client.get("/api/v1/jobs/101")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["applicant_count"], 14)
        self.assertEqual(res.data["competition_level"], "LOW")
        self.assertEqual(res.data["posted_time"], "2026-09-14T09:30:00Z")
        self.assertEqual(res.data["posted_at"], "2026-09-14T09:30:00Z")

    # ------------------------------------------------------------
    # 2. Matching Engine Gateway Registration
    # ------------------------------------------------------------

    @patch("gateway.proxy.requests.request")
    def test_03_matching_engine_route_accessible_through_gateway(self, mock_request):
        """GET /api/v1/matching/ forwards to Domain-3 Matching Engine with user context."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "recommendations": [
                {
                    "job_id": 260925025955,
                    "title": "Python Developer",
                    "match_percentage": 85.0,
                    "generated_by": "heuristic-v0"
                }
            ],
            "generated_by": "heuristic-v0"
        }
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        res = self.client.get("/api/v1/matching/?resume_id=test-uuid-999")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["recommendations"]), 1)
        self.assertEqual(res.data["recommendations"][0]["match_percentage"], 85.0)

        # Verify downstream request received user context headers
        called_args, called_kwargs = mock_request.call_args
        headers = called_kwargs.get("headers", {})
        self.assertEqual(headers.get("X-User-Id"), str(self.candidate.id))
        self.assertEqual(headers.get("X-User-Role"), "job_seeker")

    @patch("gateway.proxy.requests.request")
    def test_03b_recommendations_endpoint_backward_compatibility(self, mock_request):
        """GET /api/v1/recommendations/ still forwards correctly to Domain-3."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "recommendations": [],
            "generated_by": "heuristic-v0"
        }
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        res = self.client.get("/api/v1/recommendations/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["generated_by"], "heuristic-v0")

    # ------------------------------------------------------------
    # 3. Recruiter Job Posting CRUD Stub (Create, Read, Update, Delete)
    # ------------------------------------------------------------

    @patch("gateway.proxy.requests.request")
    def test_04_recruiter_can_create_job(self, mock_request):
        """POST /api/v1/jobs/ creates a job posting when authenticated as Recruiter."""
        mock_resp = MagicMock()
        mock_resp.status_code = 201
        mock_resp.json.return_value = {
            "id": 105,
            "job_id": 105,
            "title": "Lead Python Architect",
            "company": "Tech Innovations",
            "location": "Bengaluru",
            "salary_min": 2500000,
            "salary_max": 3500000,
            "applicant_count": 0,
            "competition_level": "LOW",
            "freshness": "JUST_POSTED",
            "posted_at": "2026-09-15T09:00:00Z",
        }
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        payload = {
            "title": "Lead Python Architect",
            "company": "Tech Innovations",
            "location": "Bengaluru",
            "salary_min": 2500000,
            "salary_max": 3500000,
            "skills": ["python", "django", "aws", "kubernetes"],
            "description": "Architect cloud-scale microservices."
        }
        res = self.client.post("/api/v1/jobs/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["title"], "Lead Python Architect")
        self.assertEqual(res.data["competition_level"], "LOW")
        self.assertEqual(res.data["posted_time"], "2026-09-15T09:00:00Z")

        # Verify downstream received recruiter user headers
        called_args, called_kwargs = mock_request.call_args
        headers = called_kwargs.get("headers", {})
        self.assertEqual(headers.get("X-User-Id"), str(self.recruiter.id))
        self.assertEqual(headers.get("X-User-Role"), "recruiter")

    @patch("gateway.proxy.requests.request")
    def test_05_recruiter_can_update_job(self, mock_request):
        """PUT /api/v1/jobs/{id} updates a job posting when authenticated as Recruiter."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "id": 105,
            "job_id": 105,
            "title": "Lead Python Architect (Updated)",
            "location": "Remote",
            "salary_min": 2800000,
            "salary_max": 4000000,
            "applicant_count": 0,
            "competition_level": "LOW",
            "posted_at": "2026-09-15T09:00:00Z",
        }
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        update_payload = {
            "title": "Lead Python Architect (Updated)",
            "location": "Remote",
            "salary_min": 2800000,
            "salary_max": 4000000
        }
        res = self.client.put("/api/v1/jobs/105", update_payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["title"], "Lead Python Architect (Updated)")
        self.assertEqual(res.data["posted_time"], "2026-09-15T09:00:00Z")

    @patch("gateway.proxy.requests.request")
    def test_06_recruiter_can_delete_job(self, mock_request):
        """DELETE /api/v1/jobs/{id} deletes a job posting when authenticated as Recruiter."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "status": "deleted",
            "job_id": 105,
            "detail": "Job successfully deleted"
        }
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.delete("/api/v1/jobs/105")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "deleted")

    # ------------------------------------------------------------
    # 4. RBAC Enforcement (Job Seeker / Anonymous Denied Recruiter CRUD)
    # ------------------------------------------------------------

    def test_07_job_seeker_cannot_create_job(self):
        """Job Seeker attempting POST /api/v1/jobs/ must be denied with 403 Forbidden."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        payload = {"title": "Unauthorized Job Posting"}
        res = self.client.post("/api/v1/jobs/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_08_job_seeker_cannot_update_job(self):
        """Job Seeker attempting PUT /api/v1/jobs/{id} must be denied with 403 Forbidden."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        payload = {"title": "Unauthorized Job Update"}
        res = self.client.put("/api/v1/jobs/101", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_09_job_seeker_cannot_delete_job(self):
        """Job Seeker attempting DELETE /api/v1/jobs/{id} must be denied with 403 Forbidden."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        res = self.client.delete("/api/v1/jobs/101")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_10_unauthenticated_cannot_create_or_modify_job(self):
        """Anonymous user cannot perform Recruiter CRUD -> 401 Unauthorized."""
        self.client.credentials()  # Clear credentials
        res_post = self.client.post("/api/v1/jobs/", {"title": "Test"}, format="json")
        self.assertEqual(res_post.status_code, status.HTTP_401_UNAUTHORIZED)

        res_put = self.client.put("/api/v1/jobs/101", {"title": "Test"}, format="json")
        self.assertEqual(res_put.status_code, status.HTTP_401_UNAUTHORIZED)

        res_delete = self.client.delete("/api/v1/jobs/101")
        self.assertEqual(res_delete.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("gateway.proxy.requests.request")
    def test_11_job_seeker_can_browse_and_view_details(self, mock_request):
        """Job Seeker can freely read job list and details (GET is public)."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"job_id": 101, "title": "Developer"}
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        res_list = self.client.get("/api/v1/jobs/")
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)

        res_detail = self.client.get("/api/v1/jobs/101")
        self.assertEqual(res_detail.status_code, status.HTTP_200_OK)

    def test_12_recruiter_validation_error_on_missing_title(self):
        """POST /api/v1/jobs/ with missing title returns 400 Bad Request."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.post("/api/v1/jobs/", {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", res.data)
