from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from .extensions import db, bcrypt, jwt, oauth, revoked_tokens
from .routes.auth import auth_bp


# Load variables from .env
load_dotenv()


def create_app():
    app = Flask(__name__)

    # --------------------------------------------------
    # Load configuration
    # --------------------------------------------------

    app.config.from_object("app.config.Config")

    # --------------------------------------------------
    # Initialize extensions
    # --------------------------------------------------

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    oauth.init_app(app)

    # --------------------------------------------------
    # Google OAuth
    # --------------------------------------------------
    #
    # IMPORTANT:
    # Do NOT use server_metadata_url.
    # Do NOT use the "openid" scope.
    #
    # This prevents Authlib from trying to validate an
    # ID token using Google's JWK endpoint.
    # --------------------------------------------------

    oauth.register(
        name="google",

        client_id=app.config.get("GOOGLE_CLIENT_ID"),
        client_secret=app.config.get("GOOGLE_CLIENT_SECRET"),

        authorize_url="https://accounts.google.com/o/oauth2/v2/auth",

        access_token_url="https://oauth2.googleapis.com/token",

        api_base_url="https://www.googleapis.com/oauth2/v2/",

        client_kwargs={
            "scope": "email profile"
        },
    )

    # --------------------------------------------------
    # JWT revoked-token check
    # --------------------------------------------------

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return jwt_payload.get("jti") in revoked_tokens

    # --------------------------------------------------
    # CORS
    # --------------------------------------------------

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
        supports_credentials=True,
    )

    # --------------------------------------------------
    # Register routes
    # --------------------------------------------------

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/v1/auth"
    )

    # --------------------------------------------------
    # Database
    # --------------------------------------------------

    with app.app_context():
        db.create_all()

    # --------------------------------------------------
    # Health check
    # --------------------------------------------------

    @app.get("/health")
    def health():
        return {
            "success": True,
            "service": "auth-service"
        }

    return app