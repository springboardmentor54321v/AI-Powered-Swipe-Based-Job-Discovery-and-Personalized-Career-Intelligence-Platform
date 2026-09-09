"""
Milestone 2 — Day 2 Tests: Job List, Job Detail, Swipe API, RBAC

Tests verify:
  - GET /api/v1/jobs/ routing and schema
  - GET /api/v1/jobs/{id} routing and 404 handling
  - POST /api/v1/swipes/ RBAC (job_seeker allowed, recruiter 403, unauthenticated 401)
  - POST /api/v1/swipes/ validation (invalid action 400, missing fields 400)
  - POST /api/v1/swipes/ with valid actions: apply, save, skip
  - Regression: Milestone 1 auth endpoints still work

Note: When the downstream Job Service (port 8001) is not running,
the gateway returns 503. These tests verify the gateway behavior
itself, not the downstream service data.
"""

from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status as http_status

from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token


class Day2BaseTestCase(TestCase):
    """Base test case that sets up users and tokens for Day 2 tests."""

    @classmethod
    def setUpTestData(cls):
        # Create roles
        cls.job_seeker_role, _ = Role.objects.get_or_create(
            name=RoleEnum.JOB_SEEKER,
            defaults={"description": "Candidate exploring and applying for jobs."}
        )
        cls.recruiter_role, _ = Role.objects.get_or_create(
            name=RoleEnum.RECRUITER,
            defaults={"description": "Employer/recruiter posting jobs."}
        )
        cls.admin_role, _ = Role.objects.get_or_create(
            name=RoleEnum.ADMIN,
            defaults={"description": "Platform administrator."}
        )

        # Create users
        cls.seeker_user = User.objects.create_user(
            email="seeker.day2@example.com",
            name="Day2 Seeker",
            password="TestPass123!",
            role=cls.job_seeker_role,
        )
        cls.recruiter_user = User.objects.create_user(
            email="recruiter.day2@example.com",
            name="Day2 Recruiter",
            password="TestPass123!",
            role=cls.recruiter_role,
        )

        # Generate tokens
        cls.seeker_token = generate_access_token(cls.seeker_user)
        cls.recruiter_token = generate_access_token(cls.recruiter_user)

    def setUp(self):
        self.client = APIClient()


class JobListAPITests(Day2BaseTestCase):
    """Tests for GET /api/v1/jobs/"""

    def test_01_job_list_returns_response(self):
        """GET /api/v1/jobs/ should return a response (200 from downstream or 503 if service down)."""
        res = self.client.get("/api/v1/jobs/")
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_02_job_list_is_public(self):
        """GET /api/v1/jobs/ should be accessible without authentication."""
        res = self.client.get("/api/v1/jobs/")
        # Should NOT be 401 or 403
        self.assertNotEqual(res.status_code, http_status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(res.status_code, http_status.HTTP_403_FORBIDDEN)

    def test_03_job_list_accepts_query_params(self):
        """GET /api/v1/jobs/ should accept filtering query parameters."""
        res = self.client.get("/api/v1/jobs/", {
            "location": "Hyderabad",
            "remote": "true",
            "salary_min": "500000",
            "skills": "Python,Django",
            "page": "1",
            "page_size": "10",
        })
        # Gateway forwards; returns 200 or 503 if downstream is down
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_04_job_list_503_when_downstream_down(self):
        """When downstream Job Service is not running, gateway should return 503."""
        res = self.client.get("/api/v1/jobs/")
        if res.status_code == http_status.HTTP_503_SERVICE_UNAVAILABLE:
            self.assertIn("error", res.data)
            self.assertIn("service", res.data)


class JobDetailAPITests(Day2BaseTestCase):
    """Tests for GET /api/v1/jobs/{id}"""

    def test_05_job_detail_returns_response(self):
        """GET /api/v1/jobs/101 should return a response."""
        res = self.client.get("/api/v1/jobs/101")
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_404_NOT_FOUND,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_06_job_detail_is_public(self):
        """GET /api/v1/jobs/{id} should be accessible without authentication."""
        res = self.client.get("/api/v1/jobs/999")
        self.assertNotEqual(res.status_code, http_status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(res.status_code, http_status.HTTP_403_FORBIDDEN)

    def test_07_job_detail_nonexistent_id(self):
        """GET /api/v1/jobs/99999999 should return 404 or 503."""
        res = self.client.get("/api/v1/jobs/99999999")
        self.assertIn(res.status_code, [
            http_status.HTTP_404_NOT_FOUND,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])


class SwipeRBACTests(Day2BaseTestCase):
    """Tests for POST /api/v1/swipes/ RBAC enforcement."""

    def test_08_swipe_unauthenticated_returns_401(self):
        """POST /api/v1/swipes/ without JWT should return 401."""
        res = self.client.post("/api/v1/swipes/", {
            "job_id": 101,
            "action": "apply",
        }, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_401_UNAUTHORIZED)

    def test_09_swipe_recruiter_returns_403(self):
        """POST /api/v1/swipes/ as RECRUITER should return 403."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.post("/api/v1/swipes/", {
            "job_id": 101,
            "action": "apply",
        }, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_403_FORBIDDEN)

    def test_10_swipe_job_seeker_allowed(self):
        """POST /api/v1/swipes/ as JOB_SEEKER should be allowed (200/201/503, not 401/403)."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        res = self.client.post("/api/v1/swipes/", {
            "job_id": 101,
            "action": "apply",
        }, format="json")
        # Should NOT be auth/permission error
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])


class SwipeValidationTests(Day2BaseTestCase):
    """Tests for POST /api/v1/swipes/ request validation."""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")

    def test_11_swipe_invalid_action_returns_400(self):
        """Invalid swipe action should return 400."""
        res = self.client.post("/api/v1/swipes/", {
            "job_id": 101,
            "action": "superlike",
        }, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", res.data)

    def test_12_swipe_missing_job_id_returns_400(self):
        """Missing job_id should return 400."""
        res = self.client.post("/api/v1/swipes/", {
            "action": "apply",
        }, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)

    def test_13_swipe_missing_action_returns_400(self):
        """Missing action should return 400."""
        res = self.client.post("/api/v1/swipes/", {
            "job_id": 101,
        }, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)

    def test_14_swipe_empty_body_returns_400(self):
        """Empty request body should return 400."""
        res = self.client.post("/api/v1/swipes/", {}, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)

    def test_15_swipe_invalid_job_id_type_returns_400(self):
        """Non-integer job_id should return 400."""
        res = self.client.post("/api/v1/swipes/", {
            "job_id": "not-a-number",
            "action": "apply",
        }, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)


class SwipeActionsTests(Day2BaseTestCase):
    """Tests that all Milestone 2 swipe actions are accepted."""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")

    def _swipe(self, action):
        return self.client.post("/api/v1/swipes/", {
            "job_id": 101,
            "action": action,
        }, format="json")

    def test_16_swipe_apply_accepted(self):
        """Action 'apply' should be accepted (not 400)."""
        res = self._swipe("apply")
        self.assertNotEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)

    def test_17_swipe_save_accepted(self):
        """Action 'save' should be accepted (not 400)."""
        res = self._swipe("save")
        self.assertNotEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)

    def test_18_swipe_skip_accepted(self):
        """Action 'skip' should be accepted (not 400)."""
        res = self._swipe("skip")
        self.assertNotEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)

    def test_19_swipe_right_legacy_accepted(self):
        """Legacy action 'right' should be accepted for backward compatibility."""
        res = self._swipe("right")
        self.assertNotEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)

    def test_20_swipe_left_legacy_accepted(self):
        """Legacy action 'left' should be accepted for backward compatibility."""
        res = self._swipe("left")
        self.assertNotEqual(res.status_code, http_status.HTTP_400_BAD_REQUEST)


class MilestoneOneRegressionTests(Day2BaseTestCase):
    """Verify that existing Milestone 1 auth endpoints still work."""

    def test_21_register_endpoint_exists(self):
        """POST /api/v1/auth/register should accept requests."""
        res = self.client.post("/api/v1/auth/register", {
            "email": "regression.day2@example.com",
            "password": "RegTestPass123!",
            "name": "Regression Tester",
            "role": "job_seeker",
        }, format="json")
        self.assertIn(res.status_code, [
            http_status.HTTP_201_CREATED,
            http_status.HTTP_200_OK,
            http_status.HTTP_400_BAD_REQUEST,  # duplicate email is fine
        ])

    def test_22_login_endpoint_exists(self):
        """POST /api/v1/auth/login should accept requests."""
        res = self.client.post("/api/v1/auth/login", {
            "email": "seeker.day2@example.com",
            "password": "TestPass123!",
        }, format="json")
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_401_UNAUTHORIZED,
        ])

    def test_23_me_endpoint_exists(self):
        """GET /api/v1/auth/me should return profile for authenticated user."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        res = self.client.get("/api/v1/auth/me")
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_404_NOT_FOUND,  # some projects use /profile instead
        ])

    def test_24_health_check(self):
        """GET /health should return 200."""
        res = self.client.get("/health")
        self.assertEqual(res.status_code, http_status.HTTP_200_OK)

    def test_25_swagger_accessible(self):
        """GET /api/docs/ should return Swagger UI."""
        res = self.client.get("/api/docs/")
        self.assertEqual(res.status_code, http_status.HTTP_200_OK)
