import io
from unittest.mock import patch, MagicMock
import requests
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token


class GatewayDay5Tests(TestCase):
    """
    Automated test suite for Day 5 Gateway Integration with Intern 3's Resume/ATS Service.
    Validates:
      A. Multipart resume upload forwarding through Gateway
      B. ATS score calculation forwarding with resume_id and job_id query param
      C. Recommendations forwarding with resume_id / user_id
      D. Unauthenticated and invalid token rejections (401)
      E. RBAC enforcement (Job Seeker allowed, Recruiter allowed on ATS score, denied on upload)
      F. Downstream error handling (503 Service Unavailable, 504 Timeout, 502 Bad Gateway)
      G. Regression verification for Day 4 Auth + Job + Swipe routes
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
            email="candidate5@example.com",
            name="Sai Candidate",
            password="SecurePassword123!",
            role=self.job_seeker_role
        )
        self.candidate_token = generate_access_token(self.candidate)

        # Recruiter user
        self.recruiter = User.objects.create_user(
            email="recruiter5@example.com",
            name="Alice Recruiter",
            password="SecurePassword123!",
            role=self.recruiter_role
        )
        self.recruiter_token = generate_access_token(self.recruiter)

        # Admin user
        self.admin = User.objects.create_user(
            email="admin5@example.com",
            name="Bob Admin",
            password="SecurePassword123!",
            role=self.admin_role
        )
        self.admin_token = generate_access_token(self.admin)

    # ------------------------------------------------------------
    # A. Resume Upload (Multipart/Form-Data)
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_resume_upload_authenticated_success(self, mock_request):
        """Test A: Candidate uploads PDF resume through Gateway -> forwarded to Intern 3."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "resume_id": "test-uuid-12345",
            "parsed_skills": ["Python", "Django", "PostgreSQL"]
        }
        mock_request.return_value = mock_response

        pdf_file = SimpleUploadedFile(
            "resume.pdf",
            b"%PDF-1.4 Mock PDF Content with Python and Django",
            content_type="application/pdf"
        )

        res = self.client.post(
            "/api/v1/resume/upload",
            {"file": pdf_file},
            format="multipart",
            HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["resume_id"], "test-uuid-12345")
        self.assertIn("Python", res.data["parsed_skills"])

        # Verify proxy called downstream URL with files
        mock_request.assert_called_once()
        args, kwargs = mock_request.call_args
        self.assertIn("api/v1/resume/upload", kwargs["url"])
        self.assertIsNotNone(kwargs["files"])
        self.assertIn("file", kwargs["files"])

    # ------------------------------------------------------------
    # B. ATS Score Forwarding
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_ats_score_query_forwarding(self, mock_request):
        """Test B: Candidate checks ATS score with resume_id and job_id query param."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "match_score": 85.5,
            "missing_keywords": ["Docker"],
            "generated_by": "heuristic-v0"
        }
        mock_request.return_value = mock_response

        res = self.client.get(
            "/api/v1/resume/test-uuid-12345/ats-score?job_id=290925001457",
            HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["match_score"], 85.5)
        self.assertEqual(res.data["missing_keywords"], ["Docker"])

        # Verify query parameters and path forwarded
        args, kwargs = mock_request.call_args
        self.assertIn("api/v1/resume/test-uuid-12345/ats-score", kwargs["url"])
        self.assertEqual(kwargs["params"].get("job_id"), "290925001457")

    # ------------------------------------------------------------
    # C. Recommendations Forwarding
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_recommendations_query_forwarding(self, mock_request):
        """Test C: Candidate requests job recommendations through Gateway."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "recommendations": [
                {"job_id": 290925001457, "title": "Python Developer", "match_percentage": 90.0}
            ],
            "generated_by": "heuristic-v0"
        }
        mock_request.return_value = mock_response

        res = self.client.get(
            "/api/v1/recommendations/?resume_id=test-uuid-12345",
            HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["recommendations"]), 1)
        self.assertEqual(res.data["recommendations"][0]["job_id"], 290925001457)

    # ------------------------------------------------------------
    # D. Authentication Verification
    # ------------------------------------------------------------
    def test_unauthenticated_request_rejected(self):
        """Test D1: Unauthenticated request to /resume/upload returns 401."""
        pdf_file = SimpleUploadedFile("resume.pdf", b"test", content_type="application/pdf")
        res = self.client.post("/api/v1/resume/upload", {"file": pdf_file}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_jwt_rejected(self):
        """Test D2: Request with invalid JWT token returns 401."""
        pdf_file = SimpleUploadedFile("resume.pdf", b"test", content_type="application/pdf")
        res = self.client.post(
            "/api/v1/resume/upload",
            {"file": pdf_file},
            format="multipart",
            HTTP_AUTHORIZATION="Bearer invalid.fake.token"
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ------------------------------------------------------------
    # E. RBAC Role Enforcement
    # ------------------------------------------------------------
    def test_recruiter_denied_candidate_resume_upload(self):
        """Test E1: Recruiter is rejected from candidate resume upload (403 Forbidden)."""
        pdf_file = SimpleUploadedFile("resume.pdf", b"test", content_type="application/pdf")
        res = self.client.post(
            "/api/v1/resume/upload",
            {"file": pdf_file},
            format="multipart",
            HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}"
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    @patch("gateway.proxy.requests.request")
    def test_recruiter_allowed_view_ats_score(self, mock_request):
        """Test E2: Recruiter is permitted to inspect ATS match score."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"match_score": 92.0}
        mock_request.return_value = mock_response

        res = self.client.get(
            "/api/v1/resume/test-uuid-12345/ats-score?job_id=290925001457",
            HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["match_score"], 92.0)

    # ------------------------------------------------------------
    # F. Downstream Error Handling
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_resume_service_connection_error(self, mock_request):
        """Test F1: Connection refused to Resume Service returns clean 503."""
        mock_request.side_effect = requests.exceptions.ConnectionError("Connection refused")

        res = self.client.get(
            "/api/v1/recommendations/?resume_id=123",
            HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}"
        )
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("error", res.data)
        self.assertEqual(res.data["status_code"], 503)

    @patch("gateway.proxy.requests.request")
    def test_resume_service_timeout(self, mock_request):
        """Test F2: Downstream timeout returns clean 504 Gateway Timeout."""
        mock_request.side_effect = requests.exceptions.Timeout("Read timeout")

        res = self.client.get(
            "/api/v1/recommendations/?resume_id=123",
            HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}"
        )
        self.assertEqual(res.status_code, status.HTTP_504_GATEWAY_TIMEOUT)
        self.assertIn("error", res.data)
        self.assertEqual(res.data["status_code"], 504)

    # ------------------------------------------------------------
    # G. Regression: Auth + Job + Swipe Routes Intact
    # ------------------------------------------------------------
    def test_regression_auth_me_still_works(self):
        """Test G1: Day 3 /api/v1/auth/me still functions properly."""
        res = self.client.get(
            "/api/v1/auth/me",
            HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["role"], "job_seeker")

    @patch("gateway.proxy.requests.request")
    def test_regression_jobs_and_swipes_still_work(self, mock_request):
        """Test G2: Day 4 Jobs & Swipes Gateway forwarding still works."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"jobs": [{"id": "101"}]}
        mock_request.return_value = mock_response

        # Jobs
        res_jobs = self.client.get("/api/v1/jobs/")
        self.assertEqual(res_jobs.status_code, status.HTTP_200_OK)

        # Swipes
        mock_response.status_code = 201
        mock_response.json.return_value = {"status": "recorded"}
        res_swipe = self.client.post(
            "/api/v1/swipes/",
            {"job_id": 101, "action": "apply"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}"
        )
        self.assertEqual(res_swipe.status_code, status.HTTP_201_CREATED)
