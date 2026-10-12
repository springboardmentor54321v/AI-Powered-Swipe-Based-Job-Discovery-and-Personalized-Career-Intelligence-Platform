import os


class Config:

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret"
    )

    # IMPORTANT:
    # Must be the SAME JWT secret used by Auth Service
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "dev-jwt-secret"
    )

    # Job Service uses its own PostgreSQL database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:822101@127.0.0.1:5432/swipex_jobs"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False