from flask import Flask
from flask_jwt_extended import JWTManager
from app.extensions import db
from app.routes.applications import applications_bp


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///applications.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["JWT_SECRET_KEY"] = "your-secret-key"
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(
        applications_bp,
        url_prefix="/applications"
    )

    with app.app_context():
        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5005,
        debug=True
    )