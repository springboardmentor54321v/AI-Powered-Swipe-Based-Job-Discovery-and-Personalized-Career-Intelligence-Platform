import os


class Config:
    # --------------------------------------------------
    # Security
    # --------------------------------------------------

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret"
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "dev-jwt-secret"
    )

    # --------------------------------------------------
    # PostgreSQL Database
    # --------------------------------------------------

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:822101@127.0.0.1:5432/swipex_auth"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --------------------------------------------------
    # Google OAuth
    # --------------------------------------------------

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

    # --------------------------------------------------
    # Frontend
    # --------------------------------------------------

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000"
    )