import json
import urllib.parse
from django.conf import settings
from django.contrib.auth import get_user_model
import requests
from apps.users.models import Role, RoleEnum
from .jwt_utils import generate_access_token, generate_refresh_token

User = get_user_model()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

def get_oauth_config():
    """Retrieve Google OAuth2 configuration from Django settings."""
    client_id = getattr(settings, "GOOGLE_CLIENT_ID", "").strip()
    client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", "").strip()
    redirect_uri = getattr(settings, "GOOGLE_REDIRECT_URI", "").strip()
    return client_id, client_secret, redirect_uri

def is_oauth_configured() -> bool:
    """Check if valid Google OAuth credentials have been supplied."""
    client_id, client_secret, redirect_uri = get_oauth_config()
    placeholders = ["", "placeholder_google_client_id", "your_google_client_id_here"]
    return client_id not in placeholders and client_secret not in ["", "placeholder_google_client_secret", "your_google_client_secret_here"]

def build_google_authorization_url(state: str = "swipex_oauth_state") -> str:
    """Construct the Google OAuth2 consent URL."""
    client_id, _, redirect_uri = get_oauth_config()
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
        "prompt": "consent",
    }
    return f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"

def process_google_callback(code: str):
    """
    Exchange Google authorization code for user profile,
    find or create user, assign JOB_SEEKER role, and issue SwipeX tokens.
    """
    client_id, client_secret, redirect_uri = get_oauth_config()

    token_data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    token_res = requests.post(GOOGLE_TOKEN_URL, data=token_data, timeout=10)
    if not token_res.ok:
        raise ValueError(f"Failed to exchange token with Google: {token_res.text}")

    tokens = token_res.json()
    google_access_token = tokens.get("access_token")

    userinfo_res = requests.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {google_access_token}"},
        timeout=10
    )
    if not userinfo_res.ok:
        raise ValueError(f"Failed to retrieve Google user profile: {userinfo_res.text}")

    profile = userinfo_res.json()
    email = profile.get("email", "").lower().strip()
    name = profile.get("name") or email.split("@")[0]
    google_id = str(profile.get("sub", ""))

    if not email:
        raise ValueError("Google user profile did not include a valid email address.")

    # Find existing user by oauth_provider_id or email
    user = User.objects.filter(oauth_provider="google", oauth_provider_id=google_id).first()
    if not user:
        user = User.objects.filter(email__iexact=email).first()
        if user:
            # Link existing account with Google provider
            user.oauth_provider = "google"
            user.oauth_provider_id = google_id
            user.save(update_fields=["oauth_provider", "oauth_provider_id"])
        else:
            # Create new user with safest default role: JOB_SEEKER
            job_seeker_role, _ = Role.objects.get_or_create(
                name=RoleEnum.JOB_SEEKER,
                defaults={"description": "Candidate exploring and applying for jobs."}
            )
            user = User.objects.create_user(
                email=email,
                name=name,
                password=None, # Unusable password
                role=job_seeker_role,
                oauth_provider="google",
                oauth_provider_id=google_id
            )

    access_token = generate_access_token(user)
    refresh_token = generate_refresh_token(user)

    return {
        "user_id": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role.name.lower(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }
