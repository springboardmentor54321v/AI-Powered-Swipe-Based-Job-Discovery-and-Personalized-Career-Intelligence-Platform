import os


class Config:
    # ---------------------------------------------------------
    # Flask
    # ---------------------------------------------------------
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret"
    )

    # ---------------------------------------------------------
    # JWT
    # ---------------------------------------------------------
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "dev-jwt-secret"
    )
    
    from datetime import timedelta

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # ---------------------------------------------------------
    # Database
    # Auth Service -> swipex_auth
    # ---------------------------------------------------------
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:822101@127.0.0.1:5432/swipex_auth"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---------------------------------------------------------
    # Google OAuth
    # ---------------------------------------------------------
    GOOGLE_CLIENT_ID = os.getenv(
        "GOOGLE_CLIENT_ID"
    )

    GOOGLE_CLIENT_SECRET = os.getenv(
        "GOOGLE_CLIENT_SECRET"
    )

    GOOGLE_REDIRECT_URI = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "http://127.0.0.1:5001/api/v1/auth/google/callback"
    )

    # ---------------------------------------------------------
    # Frontend
    # ---------------------------------------------------------
    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000"
    )