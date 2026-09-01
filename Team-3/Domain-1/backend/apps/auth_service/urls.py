from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    GoogleOAuthView,
    GoogleOAuthCallbackView,
    RefreshTokenView,
    CurrentUserView,
    JobSeekerProtectedView,
    RecruiterProtectedView,
    AdminProtectedView,
)

urlpatterns = [
    # Core Day 3 Authentication APIs
    path("register", RegisterView.as_view(), name="auth-register"),
    path("login", LoginView.as_view(), name="auth-login"),
    path("oauth/google", GoogleOAuthView.as_view(), name="auth-google-oauth"),
    path("oauth/google/callback", GoogleOAuthCallbackView.as_view(), name="auth-google-callback"),
    path("refresh", RefreshTokenView.as_view(), name="auth-refresh"),
    path("me", CurrentUserView.as_view(), name="auth-me"),

    # RBAC Demonstration / Test Endpoints (Sections 10 & 11)
    path("test/job-seeker-only", JobSeekerProtectedView.as_view(), name="test-job-seeker-only"),
    path("test/recruiter-only", RecruiterProtectedView.as_view(), name="test-recruiter-only"),
    path("test/admin-only", AdminProtectedView.as_view(), name="test-admin-only"),
]
