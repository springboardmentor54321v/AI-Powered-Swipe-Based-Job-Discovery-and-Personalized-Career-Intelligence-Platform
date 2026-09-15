from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.users.models import Role, RoleEnum
from .jwt_utils import generate_access_token, generate_refresh_token, decode_token

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    """
    Serializer for POST /api/v1/auth/register
    Validates input, checks duplicate emails, enforces role constraints,
    hashes the password, and creates the user.
    """
    name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=6, write_only=True, required=True)
    role = serializers.CharField(required=False, default="job_seeker")

    def validate_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Name cannot be blank.")
        return cleaned

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return normalized

    def validate_role(self, value):
        role_str = value.strip().upper()

        # Map common string formats (e.g. "job_seeker" -> "JOB_SEEKER")
        role_map = {
            "JOB_SEEKER": RoleEnum.JOB_SEEKER,
            "JOBSEEKER": RoleEnum.JOB_SEEKER,
            "RECRUITER": RoleEnum.RECRUITER,
            "ADMIN": RoleEnum.ADMIN,
        }

        if role_str not in role_map:
            raise serializers.ValidationError(
                f"Invalid role '{value}'. Supported roles: job_seeker, recruiter."
            )

        target_role = role_map[role_str]

        # Security boundary: Disallow self-registering as ADMIN through public endpoint
        if target_role == RoleEnum.ADMIN:
            raise serializers.ValidationError("Public self-registration for the ADMIN role is not permitted.")

        try:
            return Role.objects.get(name=target_role)
        except Role.DoesNotExist:
            raise serializers.ValidationError(f"Role '{value}' is not configured in database.")

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            password=validated_data["password"],
            role=validated_data["role"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for POST /api/v1/auth/login
    Authenticates email and password, returning JWT access & refresh tokens.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password", "")

        try:
            user = User.objects.select_related("role").get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This user account is inactive.")

        # Generate tokens
        access_token = generate_access_token(user)
        refresh_token = generate_refresh_token(user)

        role_str = user.role.name.lower() if user.role else "job_seeker"

        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "role": role_str,
        }


class RefreshTokenSerializer(serializers.Serializer):
    """
    Serializer for POST /api/v1/auth/refresh
    Validates refresh token and returns a newly minted access token.
    """
    refresh_token = serializers.CharField(required=True)

    def validate(self, attrs):
        refresh_token = attrs.get("refresh_token")
        payload = decode_token(refresh_token, expected_type="refresh")

        user_id = payload.get("sub")
        if not user_id:
            raise serializers.ValidationError("Invalid token payload: missing user identity.")

        try:
            user = User.objects.select_related("role").get(id=int(user_id), is_active=True)
        except (User.DoesNotExist, ValueError):
            raise serializers.ValidationError("User associated with refresh token no longer exists.")

        new_access_token = generate_access_token(user)
        return {"access_token": new_access_token}


class CurrentUserSerializer(serializers.ModelSerializer):
    """
    Serializer for GET /api/v1/auth/me
    Returns current user identity and role.
    """
    user_id = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["user_id", "name", "role"]

    def get_user_id(self, obj) -> str:
        return str(obj.id)

    def get_role(self, obj) -> str:
        return obj.role.name.lower() if obj.role else "job_seeker"


class RegisterResponseSerializer(serializers.Serializer):
    """Response serializer for POST /api/v1/auth/register"""
    user_id = serializers.CharField(help_text="Unique identifier of newly registered user")


class LoginResponseSerializer(serializers.Serializer):
    """Response serializer for POST /api/v1/auth/login"""
    access_token = serializers.CharField(help_text="JWT access token")
    refresh_token = serializers.CharField(help_text="JWT refresh token")
    role = serializers.CharField(help_text="User role (e.g. job_seeker, recruiter, admin)")


class RefreshTokenResponseSerializer(serializers.Serializer):
    """Response serializer for POST /api/v1/auth/refresh"""
    access_token = serializers.CharField(help_text="Newly minted JWT access token")


class MessageResponseSerializer(serializers.Serializer):
    """Generic status/message response serializer for protected role endpoints"""
    status = serializers.CharField(help_text="Status indicator (e.g. success)")
    message = serializers.CharField(help_text="Informational message")
    user_id = serializers.CharField(required=False, help_text="User ID")
    role = serializers.CharField(required=False, help_text="User role")


class GoogleOAuthResponseSerializer(serializers.Serializer):
    """Response serializer for GET /api/v1/auth/oauth/google when unconfigured"""
    message = serializers.CharField()
    status = serializers.CharField()
    detail = serializers.CharField()
    configured_redirect_uri = serializers.CharField()
    target_provider = serializers.CharField()
