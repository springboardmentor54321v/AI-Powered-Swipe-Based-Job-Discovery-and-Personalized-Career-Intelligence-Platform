import datetime
import jwt
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.conf import settings
from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token, generate_refresh_token, get_jwt_secret, get_jwt_algorithm

class AuthenticationDay3Tests(TestCase):
    """
    Automated test suite for Day 3 Authentication & RBAC implementation.
    Covers all 13 SRS required validation scenarios.
    """

    def setUp(self):
        self.client = APIClient()

        # Ensure default roles exist in test database
        self.job_seeker_role, _ = Role.objects.get_or_create(
            name=RoleEnum.JOB_SEEKER,
            defaults={"description": "Candidate"}
        )
        self.recruiter_role, _ = Role.objects.get_or_create(
            name=RoleEnum.RECRUITER,
            defaults={"description": "Employer"}
        )
        self.admin_role, _ = Role.objects.get_or_create(
            name=RoleEnum.ADMIN,
            defaults={"description": "Administrator"}
        )

        # Create a sample test user
        self.user_password = "SecurePassword123!"
        self.user = User.objects.create_user(
            email="candidate@example.com",
            name="Sai",
            password=self.user_password,
            role=self.job_seeker_role
        )

        # Create a recruiter user
        self.recruiter_user = User.objects.create_user(
            email="recruiter@example.com",
            name="Alice",
            password=self.user_password,
            role=self.recruiter_role
        )

        # Create an admin user
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            name="Bob",
            password=self.user_password,
            role=self.admin_role
        )

    # 1. Successful registration
    def test_01_successful_registration(self):
        url = "/api/v1/auth/register"
        data = {
            "name": "New Candidate",
            "email": "new_candidate@example.com",
            "password": "Password123!",
            "role": "job_seeker"
        }
        res = self.client.post(url, data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("user_id", res.data)

        # Verify in database
        created_user = User.objects.get(email="new_candidate@example.com")
        self.assertEqual(created_user.name, "New Candidate")
        self.assertEqual(created_user.role.name, RoleEnum.JOB_SEEKER)
        self.assertTrue(created_user.check_password("Password123!"))

    # 2. Duplicate email rejection
    def test_02_duplicate_email_rejection(self):
        url = "/api/v1/auth/register"
        data = {
            "name": "Duplicate Sai",
            "email": "candidate@example.com", # Already exists
            "password": "Password123!",
            "role": "job_seeker"
        }
        res = self.client.post(url, data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", res.data.get("details", {}))

    # 3. Successful login
    def test_03_successful_login(self):
        url = "/api/v1/auth/login"
        data = {
            "email": "candidate@example.com",
            "password": self.user_password
        }
        res = self.client.post(url, data, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", res.data)
        self.assertIn("refresh_token", res.data)
        self.assertEqual(res.data["role"], "job_seeker")

    # 4. Invalid login rejection
    def test_04_invalid_login_rejection(self):
        url = "/api/v1/auth/login"
        data = {
            "email": "candidate@example.com",
            "password": "WrongPassword!"
        }
        res = self.client.post(url, data, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", res.data)

    # 5. Access token generation & structure
    def test_05_access_token_generation(self):
        token = generate_access_token(self.user)
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[get_jwt_algorithm()])
        self.assertEqual(payload["sub"], str(self.user.id))
        self.assertEqual(payload["role"], "job_seeker")
        self.assertEqual(payload["type"], "access")
        self.assertIn("exp", payload)

    # 6. Refresh token flow
    def test_06_refresh_token_flow(self):
        refresh_token = generate_refresh_token(self.user)
        url = "/api/v1/auth/refresh"
        res = self.client.post(url, {"refresh_token": refresh_token}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", res.data)

        # Validate that the returned token works
        new_token = res.data["access_token"]
        payload = jwt.decode(new_token, get_jwt_secret(), algorithms=[get_jwt_algorithm()])
        self.assertEqual(payload["sub"], str(self.user.id))

    # 7. /me with valid token
    def test_07_me_with_valid_token(self):
        token = generate_access_token(self.user)
        url = "/api/v1/auth/me"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["user_id"], str(self.user.id))
        self.assertEqual(res.data["name"], "Sai")
        self.assertEqual(res.data["role"], "job_seeker")

    # 8. /me without token
    def test_08_me_without_token(self):
        url = "/api/v1/auth/me"
        self.client.credentials() # No Authorization header
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # 9. /me with invalid token
    def test_09_me_with_invalid_token(self):
        url = "/api/v1/auth/me"
        self.client.credentials(HTTP_AUTHORIZATION="Bearer totally_invalid_token_string")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # 10. /me with expired token
    def test_10_me_with_expired_token(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        expired_payload = {
            "sub": str(self.user.id),
            "role": "job_seeker",
            "type": "access",
            "iat": int((now - datetime.timedelta(hours=2)).timestamp()),
            "exp": int((now - datetime.timedelta(hours=1)).timestamp()),
        }
        expired_token = jwt.encode(expired_payload, get_jwt_secret(), algorithm=get_jwt_algorithm())

        url = "/api/v1/auth/me"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {expired_token}")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # 11. RBAC allows correct role
    def test_11_rbac_allows_correct_role(self):
        # 1. Job Seeker accesses Job Seeker protected view
        js_token = generate_access_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {js_token}")
        res = self.client.get("/api/v1/auth/test/job-seeker-only")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "success")

        # 2. Recruiter accesses Recruiter protected view
        rec_token = generate_access_token(self.recruiter_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {rec_token}")
        res = self.client.get("/api/v1/auth/test/recruiter-only")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "success")

        # 3. Admin accesses Admin protected view
        adm_token = generate_access_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {adm_token}")
        res = self.client.get("/api/v1/auth/test/admin-only")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "success")

    # 12. RBAC rejects incorrect role
    def test_12_rbac_rejects_incorrect_role(self):
        # Job Seeker attempts to access Recruiter and Admin views -> 403 Forbidden
        js_token = generate_access_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {js_token}")

        res_rec = self.client.get("/api/v1/auth/test/recruiter-only")
        self.assertEqual(res_rec.status_code, status.HTTP_403_FORBIDDEN)

        res_adm = self.client.get("/api/v1/auth/test/admin-only")
        self.assertEqual(res_adm.status_code, status.HTTP_403_FORBIDDEN)

        # Recruiter attempts to access Admin view -> 403 Forbidden
        rec_token = generate_access_token(self.recruiter_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {rec_token}")
        res_adm2 = self.client.get("/api/v1/auth/test/admin-only")
        self.assertEqual(res_adm2.status_code, status.HTTP_403_FORBIDDEN)

    # 13. Google OAuth route behavior
    def test_13_google_oauth_behavior(self):
        url = "/api/v1/auth/oauth/google"
        res = self.client.get(url)
        # Without real credentials configured locally, returns configuration guidance status
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("configured_redirect_uri", res.data)

        # Test callback with missing code
        res_cb = self.client.get("/api/v1/auth/oauth/google/callback")
        self.assertEqual(res_cb.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", res_cb.data)
