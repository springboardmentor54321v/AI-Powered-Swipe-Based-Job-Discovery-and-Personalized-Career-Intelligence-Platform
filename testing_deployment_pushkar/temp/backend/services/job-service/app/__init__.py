from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from app.extensions import db

load_dotenv()


def create_app():

    app = Flask(__name__)

    # =========================================================
    # CONFIG
    # =========================================================

    app.config.from_object("app.config.Config")

    # =========================================================
    # JWT
    # =========================================================

    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

    # Optional - increase JWT lifetime if your Config
    # doesn't already define these.
    #
    # Keep the actual values in Config if you have them there.
    #
    # Example:
    #
    # from datetime import timedelta
    # app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    # app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

    # =========================================================
    # CORS
    # =========================================================

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

    # =========================================================
    # HANDLE PREFLIGHT REQUESTS
    # =========================================================
    #
    # Browser sends:
    #
    # OPTIONS /api/v1/companies/
    #
    # before:
    #
    # GET /api/v1/companies/
    #
    # Never require JWT for OPTIONS.
    # =========================================================

    @app.before_request
    def handle_preflight():

        if request.method == "OPTIONS":
            return "", 204

    # =========================================================
    # DATABASE
    # =========================================================

    db.init_app(app)

    # =========================================================
    # JWT MANAGER
    # =========================================================

    JWTManager(app)

    # =========================================================
    # JOB ROUTES
    # =========================================================

    from app.routes.jobs import jobs_bp

    app.register_blueprint(
        jobs_bp,
        url_prefix="/api/v1/jobs",
    )

    # =========================================================
    # COMPANY ROUTES
    # =========================================================

    try:

        from app.routes.companies import companies_bp

        app.register_blueprint(
            companies_bp,
            url_prefix="/api/v1/companies",
        )

        print(
            "✓ Company routes registered"
        )

    except ImportError:

        print(
            "⚠ Company blueprint not found: "
            "app.routes.companies"
        )

    # =========================================================
    # HEALTH CHECK
    # =========================================================

    @app.get("/health")
    def health():

        return {
            "success": True,
            "service": "swipex-job-service",
            "status": "healthy",
        }, 200

    # =========================================================
    # DEBUG ROUTE LIST
    # =========================================================

    print("\n========== REGISTERED ROUTES ==========")

    for rule in app.url_map.iter_rules():

        print(
            f"{sorted(rule.methods)} "
            f"{rule}"
        )

    print("=======================================\n")

    return app


# from flask import Flask
# from flask_cors import CORS
# from flask_jwt_extended import JWTManager
# from dotenv import load_dotenv

# from app.extensions import db

# load_dotenv()


# def create_app():
#     app = Flask(__name__)

#     app.config.from_object("app.config.Config")

#     app.config["JWT_TOKEN_LOCATION"] = ["headers"]
#     app.config["JWT_HEADER_NAME"] = "Authorization"
#     app.config["JWT_HEADER_TYPE"] = "Bearer"

#     CORS(
#         app,
#         resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
#         supports_credentials=True,
#     )

#     db.init_app(app)
#     JWTManager(app)

#     from app.routes.jobs import jobs_bp
#     app.register_blueprint(jobs_bp, url_prefix="/api/v1/jobs")

#     return app