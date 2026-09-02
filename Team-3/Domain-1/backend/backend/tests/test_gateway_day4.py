from unittest.mock import patch, MagicMock
import requests
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token


class GatewayDay4Tests(TestCase):
    """
    Automated test suite for Day 4 Gateway Integration & RBAC Route Enforcement.
    Tests all 10 scenarios defined in SRS Section 20.
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
            email="candidate@example.com",
            name="Sai Candidate",
            password="SecurePassword123!",
            role=self.job_seeker_role
        )
        self.candidate_token = generate_access_token(self.candidate)

        # Recruiter user
        self.recruiter = User.objects.create_user(
            email="recruiter@example.com",
            name="Alice Recruiter",
            password="SecurePassword123!",
            role=self.recruiter_role
        )
        self.recruiter_token = generate_access_token(self.recruiter)

        # Admin user
        self.admin = User.objects.create_user(
            email="admin@example.com",
            name="Bob Admin",
            password="SecurePassword123!",
            role=self.admin_role
        )
        self.admin_token = generate_access_token(self.admin)

    # ------------------------------------------------------------
    # TEST 1: Job listing through Gateway (GET /api/v1/jobs)
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_01_job_listing_through_gateway(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "jobs": [
                {"id": "101", "title": "Software Engineer", "company": "Tech Corp"}
            ]
        }
        mock_request.return_value = mock_resp

        res = self.client.get("/api/v1/jobs")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["jobs"]), 1)
        self.assertEqual(res.data["jobs"][0]["title"], "Software Engineer")
        mock_request.assert_called_once()

    # ------------------------------------------------------------
    # TEST 2: Job filtering query parameters forward through Gateway
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_02_job_filtering_through_gateway(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"jobs": []}
        mock_request.return_value = mock_resp

        query_url = "/api/v1/jobs?location=Hyderabad&remote=true&skills=python,django"
        res = self.client.get(query_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Verify query parameters were passed to downstream
        called_args, called_kwargs = mock_request.call_args
        params = called_kwargs.get("params", {})
        self.assertEqual(params.get("location"), "Hyderabad")
        self.assertEqual(params.get("remote"), "true")
        self.assertEqual(params.get("skills"), "python,django")

    # ------------------------------------------------------------
    # TEST 3: Job details through Gateway (GET /api/v1/jobs/{job_id})
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_03_job_details_through_gateway(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "id": "101",
            "title": "Backend Engineer",
            "description": "Django / Python backend development"
        }
        mock_request.return_value = mock_resp

        res = self.client.get("/api/v1/jobs/101")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["id"], "101")

        called_args, called_kwargs = mock_request.call_args
        self.assertTrue(called_kwargs.get("url", "").endswith("/api/v1/jobs/101"))

    # ------------------------------------------------------------
    # TEST 4: Swipe through Gateway (POST /api/v1/swipes)
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_04_swipe_through_gateway(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 201
        mock_resp.json.return_value = {
            "status": "recorded",
            "job_id": "101",
            "direction": "right"
        }
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        swipe_payload = {"job_id": "101", "direction": "right"}
        res = self.client.post("/api/v1/swipes", swipe_payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["status"], "recorded")

        # Verify downstream request received user context headers
        called_args, called_kwargs = mock_request.call_args
        headers = called_kwargs.get("headers", {})
        self.assertEqual(headers.get("X-User-Id"), str(self.candidate.id))
        self.assertEqual(headers.get("X-User-Role"), "job_seeker")

    # ------------------------------------------------------------
    # TEST 5: Swipe history through Gateway (GET /api/v1/swipes/history)
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_05_swipe_history_through_gateway(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "history": [
                {"job_id": "101", "direction": "right", "timestamp": "2026-09-01T12:00:00Z"}
            ]
        }
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        res = self.client.get("/api/v1/swipes/history")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["history"]), 1)

    # ------------------------------------------------------------
    # TEST 6: Protected route without JWT -> 401 Unauthorized
    # ------------------------------------------------------------
    def test_06_protected_route_without_jwt(self):
        self.client.credentials() # Clear headers
        res = self.client.post("/api/v1/swipes", {"job_id": "101", "direction": "right"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        res_history = self.client.get("/api/v1/swipes/history")
        self.assertEqual(res_history.status_code, status.HTTP_401_UNAUTHORIZED)

    # ------------------------------------------------------------
    # TEST 7: Protected route with invalid JWT -> 401 Unauthorized
    # ------------------------------------------------------------
    def test_07_protected_route_with_invalid_jwt(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer corrupted.or.invalid.token")
        res = self.client.post("/api/v1/swipes", {"job_id": "101", "direction": "right"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ------------------------------------------------------------
    # TEST 8: Protected route with wrong role -> 403 Forbidden
    # ------------------------------------------------------------
    def test_08_protected_route_with_wrong_role(self):
        # Recruiter trying to swipe on jobs -> 403 Forbidden
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.post("/api/v1/swipes", {"job_id": "101", "direction": "right"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin trying to swipe on jobs -> 403 Forbidden
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        res_admin = self.client.post("/api/v1/swipes", {"job_id": "101", "direction": "right"}, format="json")
        self.assertEqual(res_admin.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------
    # TEST 9: Protected route with correct role -> Allowed & Forwarded
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_09_protected_route_with_correct_role(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"status": "ok"}
        mock_request.return_value = mock_resp

        # Candidate with JOB_SEEKER role succeeds
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")
        res = self.client.get("/api/v1/swipes/history")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    # ------------------------------------------------------------
    # TEST 10: Resume / ATS Gateway Placeholder routes exist
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_10_resume_ats_gateway_placeholders(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"service": "Resume Service", "placeholder": True}
        mock_request.return_value = mock_resp

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.candidate_token}")

        # POST /api/v1/resume/upload
        res_upload = self.client.post("/api/v1/resume/upload", {"filename": "resume.pdf"}, format="json")
        self.assertEqual(res_upload.status_code, status.HTTP_200_OK)

        # GET /api/v1/resume/{resume_id}/ats-score
        res_ats = self.client.get("/api/v1/resume/res_123/ats-score")
        self.assertEqual(res_ats.status_code, status.HTTP_200_OK)

        # GET /api/v1/recommendations
        res_rec = self.client.get("/api/v1/recommendations")
        self.assertEqual(res_rec.status_code, status.HTTP_200_OK)

    # ------------------------------------------------------------
    # Downstream Error Handling: Connection Refused -> 503 Service Unavailable
    # ------------------------------------------------------------
    @patch("gateway.proxy.requests.request")
    def test_downstream_service_unavailable(self, mock_request):
        mock_request.side_effect = requests.exceptions.ConnectionError("Connection refused")

        res = self.client.get("/api/v1/jobs")
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("error", res.data)
        self.assertEqual(res.data["status_code"], 503)
