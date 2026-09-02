import datetime
import jwt
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed

class TokenExpiredError(AuthenticationFailed):
    default_detail = "Token has expired."

class TokenInvalidError(AuthenticationFailed):
    default_detail = "Invalid or corrupted token."

def get_jwt_secret() -> str:
    """Retrieve the JWT secret key from Django settings."""
    return getattr(settings, "JWT_SECRET_KEY", "dev-jwt-secret-fallback")

def get_jwt_algorithm() -> str:
    """Retrieve the JWT algorithm from Django settings."""
    return getattr(settings, "JWT_ALGORITHM", "HS256")

def generate_access_token(user) -> str:
    """
    Generate short-lived access token encoding user_id and role.
    Payload adheres to SRS contract:
    {
      "sub": "user_id",
      "role": "job_seeker",
      "exp": 1234567890
    }
    """
    expire_minutes = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    now = datetime.datetime.now(datetime.timezone.utc)
    exp = now + datetime.timedelta(minutes=expire_minutes)

    role_str = user.role.name.lower() if hasattr(user, "role") and user.role else "job_seeker"

    payload = {
        "sub": str(user.id),
        "role": role_str,
        "name": user.name,
        "email": user.email,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    return jwt.encode(payload, get_jwt_secret(), algorithm=get_jwt_algorithm())

def generate_refresh_token(user) -> str:
    """
    Generate long-lived refresh token for token rotation.
    """
    expire_days = getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", 7)
    now = datetime.datetime.now(datetime.timezone.utc)
    exp = now + datetime.timedelta(days=expire_days)

    payload = {
        "sub": str(user.id),
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    return jwt.encode(payload, get_jwt_secret(), algorithm=get_jwt_algorithm())

def decode_token(token: str, expected_type: str = "access") -> dict:
    """
    Decode and validate a JWT token, ensuring type match and expiry.
    """
    try:
        payload = jwt.decode(
            token,
            get_jwt_secret(),
            algorithms=[get_jwt_algorithm()]
        )
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError("Token has expired.")
    except jwt.InvalidTokenError:
        raise TokenInvalidError("Invalid or corrupted token.")

    token_type = payload.get("type")
    if expected_type and token_type != expected_type:
        raise TokenInvalidError(f"Invalid token type: expected '{expected_type}', got '{token_type}'.")

    return payload
