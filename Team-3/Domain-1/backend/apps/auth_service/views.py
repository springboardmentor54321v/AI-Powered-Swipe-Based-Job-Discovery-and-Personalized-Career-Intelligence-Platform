from django.http import HttpResponseRedirect
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from .authentication import JWTAuthentication
from .permissions import IsAuthenticated, IsJobSeeker, IsRecruiter, IsAdmin
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    CurrentUserSerializer,
)
from .oauth_service import (
    is_oauth_configured,
    build_google_authorization_url,
    process_google_callback,
    get_oauth_config,
)


class RegisterView(APIView):
    """
    POST /api/v1/auth/register
    Creates a new user account with hashed password and assigned role.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation error", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        return Response(
            {"user_id": str(user.id)},
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    POST /api/v1/auth/login
    Authenticates user credentials and returns access token, refresh token, and role.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid email or password", "details": serializer.errors},
                status=status.HTTP_401_UNAUTHORIZED
            )

        data = serializer.validated_data
        return Response(
            {
                "access_token": data["access_token"],
                "refresh_token": data["refresh_token"],
                "role": data["role"],
            },
            status=status.HTTP_200_OK
        )


class GoogleOAuthView(APIView):
    """
    GET /api/v1/auth/oauth/google
    Entry point initiating Google OAuth2 sign-in.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if not is_oauth_configured():
            client_id, _, redirect_uri = get_oauth_config()
            return Response(
                {
                    "message": "Google OAuth2 entry point reached.",
                    "status": "configuration_required",
                    "detail": "Live Google OAuth sign-in requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET configured in .env.",
                    "configured_redirect_uri": redirect_uri,
                    "target_provider": "https://accounts.google.com/o/oauth2/v2/auth"
                },
                status=status.HTTP_200_OK
            )

        # Live Google OAuth redirection
        auth_url = build_google_authorization_url()
        return HttpResponseRedirect(auth_url)


class GoogleOAuthCallbackView(APIView):
    """
    GET /api/v1/auth/oauth/google/callback
    Handles Google OAuth2 redirect callback, validates authorization code,
    and returns SwipeX authentication tokens.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get("code")
        if not code:
            return Response(
                {"error": "Missing authorization code parameter from Google."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            auth_data = process_google_callback(code)
            return Response(auth_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Google OAuth2 authentication failed", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RefreshTokenView(APIView):
    """
    POST /api/v1/auth/refresh
    Obtains a newly minted access token using a valid refresh token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid or expired refresh token", "details": serializer.errors},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(
            {"access_token": serializer.validated_data["access_token"]},
            status=status.HTTP_200_OK
        )


class CurrentUserView(APIView):
    """
    GET /api/v1/auth/me
    Returns current authenticated user identity and role.
    Requires: Authorization: Bearer <access_token>
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================
# Example RBAC Demonstration Endpoints (Section 10 & 11)
# ============================================================

class JobSeekerProtectedView(APIView):
    """Protected endpoint accessible exclusively by JOB_SEEKER role."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsJobSeeker]

    def get(self, request):
        return Response(
            {
                "status": "success",
                "message": "Access granted: Candidate verified.",
                "user_id": str(request.user.id),
                "role": request.user.role.name.lower()
            },
            status=status.HTTP_200_OK
        )


class RecruiterProtectedView(APIView):
    """Protected endpoint accessible exclusively by RECRUITER role."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsRecruiter]

    def get(self, request):
        return Response(
            {
                "status": "success",
                "message": "Access granted: Recruiter verified.",
                "user_id": str(request.user.id),
                "role": request.user.role.name.lower()
            },
            status=status.HTTP_200_OK
        )


class AdminProtectedView(APIView):
    """Protected endpoint accessible exclusively by ADMIN role."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(
            {
                "status": "success",
                "message": "Access granted: Administrator verified.",
                "user_id": str(request.user.id),
                "role": request.user.role.name.lower()
            },
            status=status.HTTP_200_OK
        )
