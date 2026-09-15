"""
Milestone 2 — Day 3 Tests: Job Search, Company Directory, Company Detail, RBAC

Tests verify:
  - GET /api/v1/jobs/search routing, query params, pagination, and schema
  - GET /api/v1/companies/ routing, filtering, pagination, and schema
  - GET /api/v1/companies/{id} routing and 404 handling
  - RBAC: All search and company directory endpoints are public (Job Seeker, Recruiter, Unauthenticated)
  - Full mocked downstream success responses (200 OK) for search and companies
  - Regression: Day 2 endpoints (jobs list, job detail, swipes RBAC, swipe history) remain functional
  - Regression: Milestone 1 auth & health endpoints remain functional
"""

from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status as http_status

from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token


class Day3BaseTestCase(TestCase):
    """Base test case that sets up users, roles, and tokens for Day 3 tests."""

    @classmethod
    def setUpTestData(cls):
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

        cls.seeker_user = User.objects.create_user(
            email="seeker.day3@example.com",
            name="Day3 Seeker",
            password="TestPass123!",
            role=cls.job_seeker_role,
        )
        cls.recruiter_user = User.objects.create_user(
            email="recruiter.day3@example.com",
            name="Day3 Recruiter",
            password="TestPass123!",
            role=cls.recruiter_role,
        )

        cls.seeker_token = generate_access_token(cls.seeker_user)
        cls.recruiter_token = generate_access_token(cls.recruiter_user)

    def setUp(self):
        self.client = APIClient()


class JobSearchAPITests(Day3BaseTestCase):
    """Tests for GET /api/v1/jobs/search"""

    def test_01_search_endpoint_is_public(self):
        """GET /api/v1/jobs/search should be publicly accessible without authentication."""
        res = self.client.get("/api/v1/jobs/search")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_02_search_accepts_keyword_param(self):
        """GET /api/v1/jobs/search?keyword=Python should accept keyword parameter."""
        res = self.client.get("/api/v1/jobs/search", {"keyword": "Python"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_03_search_accepts_location_param(self):
        """GET /api/v1/jobs/search?location=Hyderabad should accept location parameter."""
        res = self.client.get("/api/v1/jobs/search", {"location": "Hyderabad"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_04_search_accepts_job_type_param(self):
        """GET /api/v1/jobs/search?job_type=Full-time should accept job_type parameter."""
        res = self.client.get("/api/v1/jobs/search", {"job_type": "Full-time"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_05_search_accepts_salary_min_max(self):
        """GET /api/v1/jobs/search should accept salary_min and salary_max parameters."""
        res = self.client.get("/api/v1/jobs/search", {
            "salary_min": "800000",
            "salary_max": "2000000",
        })
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_06_search_accepts_experience_level(self):
        """GET /api/v1/jobs/search?experience_level=Fresher should accept experience_level."""
        res = self.client.get("/api/v1/jobs/search", {"experience_level": "Fresher"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_07_search_accepts_skills_param(self):
        """GET /api/v1/jobs/search?skills=Python,Django should accept skills."""
        res = self.client.get("/api/v1/jobs/search", {"skills": "Python,Django"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_08_search_accepts_remote_param(self):
        """GET /api/v1/jobs/search?is_remote=true should accept is_remote."""
        res = self.client.get("/api/v1/jobs/search", {"is_remote": "true"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_09_search_accepts_pagination_params(self):
        """GET /api/v1/jobs/search should accept page and page_size."""
        res = self.client.get("/api/v1/jobs/search", {
            "page": "1",
            "page_size": "10",
        })
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_10_search_accepts_multi_criteria(self):
        """GET /api/v1/jobs/search should accept combined multi-criteria filters."""
        res = self.client.get("/api/v1/jobs/search", {
            "keyword": "Engineer",
            "location": "Bengaluru",
            "is_remote": "true",
            "salary_min": "500000",
            "salary_max": "1500000",
            "experience_level": "Mid-Level",
            "skills": "Docker,Python",
            "page": "1",
            "page_size": "20",
        })
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])


class CompaniesAPITests(Day3BaseTestCase):
    """Tests for GET /api/v1/companies/ and GET /api/v1/companies/{id}"""

    def test_11_companies_list_is_public(self):
        """GET /api/v1/companies/ should be publicly accessible."""
        res = self.client.get("/api/v1/companies/")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_12_companies_accepts_industry_filter(self):
        """GET /api/v1/companies/?industry=FinTech should accept industry filter."""
        res = self.client.get("/api/v1/companies/", {"industry": "FinTech"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_13_companies_accepts_company_type_filter(self):
        """GET /api/v1/companies/?company_type=Startup should accept company_type filter."""
        res = self.client.get("/api/v1/companies/", {"company_type": "Startup"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_14_companies_accepts_search_param(self):
        """GET /api/v1/companies/?search=Microsoft should accept search keyword."""
        res = self.client.get("/api/v1/companies/", {"search": "Microsoft"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_15_companies_accepts_pagination_params(self):
        """GET /api/v1/companies/ should accept page and page_size."""
        res = self.client.get("/api/v1/companies/", {"page": "1", "page_size": "5"})
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_16_company_detail_is_public(self):
        """GET /api/v1/companies/1 should be publicly accessible."""
        res = self.client.get("/api/v1/companies/1")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_404_NOT_FOUND,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_17_company_detail_nonexistent_returns_404_or_503(self):
        """GET /api/v1/companies/999999 should return 404 or 503."""
        res = self.client.get("/api/v1/companies/999999")
        self.assertIn(res.status_code, [
            http_status.HTTP_404_NOT_FOUND,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])


class Day3RBACTests(Day3BaseTestCase):
    """Tests verifying RBAC behavior on Search and Company endpoints."""

    def test_18_search_job_seeker_allowed(self):
        """Job Seeker can access GET /api/v1/jobs/search."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        res = self.client.get("/api/v1/jobs/search")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])

    def test_19_search_recruiter_allowed(self):
        """Recruiter can also access GET /api/v1/jobs/search."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.get("/api/v1/jobs/search")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])

    def test_20_companies_job_seeker_allowed(self):
        """Job Seeker can access GET /api/v1/companies/."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        res = self.client.get("/api/v1/companies/")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])

    def test_21_companies_recruiter_allowed(self):
        """Recruiter can access GET /api/v1/companies/."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.get("/api/v1/companies/")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])

    def test_22_company_detail_job_seeker_allowed(self):
        """Job Seeker can access GET /api/v1/companies/1."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.seeker_token}")
        res = self.client.get("/api/v1/companies/1")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])

    def test_23_company_detail_recruiter_allowed(self):
        """Recruiter can access GET /api/v1/companies/1."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.get("/api/v1/companies/1")
        self.assertNotIn(res.status_code, [
            http_status.HTTP_401_UNAUTHORIZED,
            http_status.HTTP_403_FORBIDDEN,
        ])


class MockedDownstreamTests(Day3BaseTestCase):
    """
    Tests verifying full gateway proxy forwarding logic, status codes,
    and contract JSON responses by mocking downstream HTTP responses.
    """

    @patch("gateway.proxy.requests.Session.request")
    def test_24_search_success_mock(self, mock_request):
        """Verify GET /api/v1/jobs/search returns 200 with contract-compliant payload."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.content = b'{"count": 1, "pagination": {"total_count": 1, "page": 1, "page_size": 20, "total_pages": 1, "has_next": false, "has_prev": false}, "results": [{"id": 1, "title": "Software Engineer"}]}'
        mock_resp.headers = {"Content-Type": "application/json"}
        mock_resp.json.return_value = {
            "count": 1,
            "pagination": {
                "total_count": 1,
                "page": 1,
                "page_size": 20,
                "total_pages": 1,
                "has_next": False,
                "has_prev": False,
            },
            "results": [{"id": 1, "title": "Software Engineer"}],
        }
        mock_request.return_value = mock_resp

        res = self.client.get("/api/v1/jobs/search", {"keyword": "Software"})
        self.assertEqual(res.status_code, http_status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(len(data["results"]), 1)
        self.assertEqual(data["results"][0]["title"], "Software Engineer")
        self.assertIn("pagination", data)

    @patch("gateway.proxy.requests.Session.request")
    def test_25_companies_list_success_mock(self, mock_request):
        """Verify GET /api/v1/companies/ returns 200 with directory listing."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.content = b'{"count": 2, "pagination": {"total_count": 2, "page": 1, "page_size": 20, "total_pages": 1, "has_next": false, "has_prev": false}, "results": [{"id": 1, "name": "Tata Consultancy Services"}, {"id": 2, "name": "Razorpay"}]}'
        mock_resp.headers = {"Content-Type": "application/json"}
        mock_resp.json.return_value = {
            "count": 2,
            "pagination": {
                "total_count": 2,
                "page": 1,
                "page_size": 20,
                "total_pages": 1,
                "has_next": False,
                "has_prev": False,
            },
            "results": [
                {"id": 1, "name": "Tata Consultancy Services"},
                {"id": 2, "name": "Razorpay"},
            ],
        }
        mock_request.return_value = mock_resp

        res = self.client.get("/api/v1/companies/")
        self.assertEqual(res.status_code, http_status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data["count"], 2)
        self.assertEqual(len(data["results"]), 2)
        self.assertEqual(data["results"][0]["name"], "Tata Consultancy Services")

    @patch("gateway.proxy.requests.Session.request")
    def test_26_company_detail_success_mock(self, mock_request):
        """Verify GET /api/v1/companies/4 returns 200 with company profile."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.content = b'{"id": 4, "name": "Microsoft", "company_type": "MNC", "industry": "Technology", "headquarters": "Hyderabad", "active_jobs_count": 1}'
        mock_resp.headers = {"Content-Type": "application/json"}
        mock_resp.json.return_value = {
            "id": 4,
            "name": "Microsoft",
            "company_type": "MNC",
            "industry": "Technology",
            "headquarters": "Hyderabad",
            "active_jobs_count": 1,
        }
        mock_request.return_value = mock_resp

        res = self.client.get("/api/v1/companies/4")
        self.assertEqual(res.status_code, http_status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data["id"], 4)
        self.assertEqual(data["name"], "Microsoft")
        self.assertEqual(data["headquarters"], "Hyderabad")

    @patch("gateway.proxy.requests.Session.request")
    def test_27_company_detail_not_found_mock(self, mock_request):
        """Verify GET /api/v1/companies/999 returns 404 when company does not exist."""
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        mock_resp.content = b'{"detail": "Company 999 not found"}'
        mock_resp.headers = {"Content-Type": "application/json"}
        mock_resp.json.return_value = {"detail": "Company 999 not found"}
        mock_request.return_value = mock_resp

        res = self.client.get("/api/v1/companies/999")
        self.assertEqual(res.status_code, http_status.HTTP_404_NOT_FOUND)
        self.assertEqual(res.json()["detail"], "Company 999 not found")


class Day2And1RegressionTests(Day3BaseTestCase):
    """Verify Day 2 and Milestone 1 features remain completely unaffected."""

    def test_28_job_list_regression(self):
        """GET /api/v1/jobs/ continues to work."""
        res = self.client.get("/api/v1/jobs/")
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_29_job_detail_regression(self):
        """GET /api/v1/jobs/101 continues to work."""
        res = self.client.get("/api/v1/jobs/101")
        self.assertIn(res.status_code, [
            http_status.HTTP_200_OK,
            http_status.HTTP_404_NOT_FOUND,
            http_status.HTTP_503_SERVICE_UNAVAILABLE,
        ])

    def test_30_swipe_unauthenticated_regression(self):
        """POST /api/v1/swipes/ without JWT still returns 401."""
        res = self.client.post("/api/v1/swipes/", {
            "job_id": 101,
            "action": "apply",
        }, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_401_UNAUTHORIZED)

    def test_31_swipe_recruiter_forbidden_regression(self):
        """POST /api/v1/swipes/ as RECRUITER still returns 403."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.post("/api/v1/swipes/", {
            "job_id": 101,
            "action": "apply",
        }, format="json")
        self.assertEqual(res.status_code, http_status.HTTP_403_FORBIDDEN)

    def test_32_swipe_history_recruiter_forbidden_regression(self):
        """GET /api/v1/swipes/history as RECRUITER still returns 403."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.recruiter_token}")
        res = self.client.get("/api/v1/swipes/history")
        self.assertEqual(res.status_code, http_status.HTTP_403_FORBIDDEN)

    def test_33_health_check_regression(self):
        """GET /health still returns 200."""
        res = self.client.get("/health")
        self.assertEqual(res.status_code, http_status.HTTP_200_OK)

    def test_34_swagger_regression(self):
        """GET /api/docs/ still returns Swagger UI."""
        res = self.client.get("/api/docs/")
        self.assertEqual(res.status_code, http_status.HTTP_200_OK)
