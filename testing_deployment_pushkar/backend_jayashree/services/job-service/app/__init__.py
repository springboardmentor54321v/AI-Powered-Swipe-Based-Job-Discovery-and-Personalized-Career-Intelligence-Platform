from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv

from .config import Config
from .extensions import db, jwt
from .models import (  # noqa: F401  (register tables)
    Job, Swipe, Company, SavedJob, Application, Notification, ApplicationStatusEvent, AlertPreference,
)
from .routes.jobs import jobs_bp
from .routes.recruiter import recruiter_bp
from .routes.notifications import notifications_bp
from .routes.companies import companies_bp
from .routes.tracking import tracking_bp
from .routes.analytics import analytics_bp
from .schema import ensure_schema

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                ]
            }
        },
        methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allow_headers=[
            "Content-Type",
            "Authorization",
        ],
        expose_headers=[
            "Content-Type",
            "Authorization",
        ],
        supports_credentials=False,
        max_age=600,
    )

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            return "", 204

    app.register_blueprint(
        jobs_bp,
        url_prefix="/api/v1/jobs"
    )

    # Recruiter endpoints share the /jobs prefix: /jobs/applicants, /jobs/<id>/applicants,
    # /jobs/applications/<id>
    app.register_blueprint(
        recruiter_bp,
        url_prefix="/api/v1/jobs"
    )

    # Application tracking board + status timeline share the /jobs prefix
    app.register_blueprint(
        tracking_bp,
        url_prefix="/api/v1/jobs"
    )

    app.register_blueprint(
        analytics_bp,
        url_prefix="/api/v1/analytics"
    )

    app.register_blueprint(
        notifications_bp,
        url_prefix="/api/v1/notifications"
    )

    app.register_blueprint(
        companies_bp,
        url_prefix="/api/v1/companies"
    )

    with app.app_context():
        db.create_all()
        ensure_schema(db)

    @app.get("/health")
    def health():
        return {
            "success": True,
            "service": "job-service"
        }

    return app