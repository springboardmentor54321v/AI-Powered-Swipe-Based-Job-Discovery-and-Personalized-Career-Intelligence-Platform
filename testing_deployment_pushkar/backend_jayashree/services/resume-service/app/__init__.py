from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv

from .config import Config
from .extensions import db, jwt
# from .models import Job, Swipe, Company
# from .routes.jobs import jobs_bp
# from .routes.companies import companies_bp
from .models.resume import Resume
from .routes.resume import resume_bp
from .schema import ensure_schema

load_dotenv()


def create_app():
    app = Flask(__name__)

    # ---------------------------------------------------------
    # CONFIG
    # ---------------------------------------------------------
    app.config.from_object(Config)

    # ---------------------------------------------------------
    # DATABASE
    # ---------------------------------------------------------
    db.init_app(app)

    # ---------------------------------------------------------
    # JWT
    # ---------------------------------------------------------
    jwt.init_app(app)

    # ---------------------------------------------------------
    # CORS
    # ---------------------------------------------------------
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
            "X-Requested-With",
            "Accept",
        ],
        expose_headers=[
            "Content-Type",
            "Authorization",
        ],
        supports_credentials=False,
        max_age=600,
    )

    # ---------------------------------------------------------
    # EXPLICIT PREFLIGHT HANDLING
    # ---------------------------------------------------------
    #
    # This makes sure OPTIONS requests are answered before
    # JWT-protected endpoints are executed.
    #
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            return "", 204

    # ---------------------------------------------------------
    # BLUEPRINTS
    # ---------------------------------------------------------
    # app.register_blueprint(
    #     jobs_bp,
    #     url_prefix="/api/v1/jobs"
    # )

    # app.register_blueprint(
    #     companies_bp,
    #     url_prefix="/api/v1/companies"
    # )
    
    app.register_blueprint(
    resume_bp,
    url_prefix="/api/v1/resumes"
)

    # ---------------------------------------------------------
    # DATABASE TABLE CREATION
    # ---------------------------------------------------------
    with app.app_context():
        db.create_all()
        ensure_schema(db)

    # ---------------------------------------------------------
    # HEALTH CHECK
    # ---------------------------------------------------------
    @app.get("/health")
    def health():
        return {
            "success": True,
            "service": "resume-service"
        }

    return app