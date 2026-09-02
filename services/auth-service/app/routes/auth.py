from datetime import datetime, timedelta, timezone
import secrets

from flask import (
    Blueprint,
    request,
    redirect,
    url_for,
    current_app,
    jsonify
)
from app.utils.auth import roles_required
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt,
    get_jwt_identity
)
from app.extensions import db, bcrypt, oauth, revoked_tokens
from app.models.user import User
from app.models.password_reset import PasswordResetToken

auth_bp = Blueprint("auth", __name__)

VALID_ROLES = {"JOB_SEEKER", "RECRUITER", "ADMIN"}

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "JOB_SEEKER").upper()

    if not name or not email or not password:
        return {
            "success": False,
            "message": "name, email and password are required"
        }, 400

    if role not in VALID_ROLES:
        return {
            "success": False,
            "message": "Invalid role"
        }, 400

    if User.query.filter_by(email=email).first():
        return {
            "success": False,
            "message": "Email already registered"
        }, 409

    user = User(
        name=name,
        email=email,
        password_hash=bcrypt.generate_password_hash(password).decode("utf-8"),
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return {
        "success": True,
        "message": "User registered successfully",
        "user": user.to_dict()
    }, 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(
        user.password_hash, password or ""
    ):
        return {
            "success": False,
            "message": "Invalid email or password"
        }, 401

    access_token = create_access_token(
    identity=str(user.id),
    additional_claims={"role": user.role}
    )

    refresh_token = create_refresh_token(
    identity=str(user.id),
    additional_claims={"role": user.role}
    )
    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
	"refresh_token": refresh_token,
        "user": user.to_dict()
    }, 200
@auth_bp.get("/google")
def google_login():
    redirect_uri = current_app.config.get(
        "GOOGLE_REDIRECT_URI"
    )

    if not redirect_uri:
        redirect_uri = request.host_url.rstrip("/") + url_for(
            "auth.google_callback"
        )

    return oauth.google.authorize_redirect(
        redirect_uri
    )


@auth_bp.get("/google/callback")
def google_callback():
    try:
        # ==================================================
        # 1. Exchange authorization code for Google token
        # ==================================================

        token = oauth.google.authorize_access_token()

        current_app.logger.info(
            "Google token received successfully"
        )

        access_token = token.get("access_token")

        if not access_token:
            current_app.logger.error(
                "Google token response did not contain access_token: %s",
                token
            )

            return {
                "success": False,
                "message": "Google did not return an access token"
            }, 400

        # ==================================================
        # 2. Get Google user information
        # ==================================================

        try:
            response = oauth.google.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                token={
                    "access_token": access_token,
                    "token_type": token.get(
                        "token_type",
                        "Bearer"
                    )
                }
            )

        except Exception as google_error:
            current_app.logger.exception(
                "Google userinfo request failed"
            )

            return {
                "success": False,
                "message": "Unable to connect to Google user information service",
                "error": str(google_error)
            }, 502

        # ==================================================
        # 3. Validate Google response
        # ==================================================

        current_app.logger.info(
            "Google userinfo status: %s",
            response.status_code
        )

        if response.status_code != 200:
            current_app.logger.error(
                "Google userinfo failed: %s",
                response.text
            )

            return {
                "success": False,
                "message": "Unable to retrieve Google user information",
                "google_status": response.status_code,
                "google_response": response.text
            }, 400

        user_info = response.json()

        current_app.logger.info(
            "Google user information retrieved successfully"
        )

        # ==================================================
        # 4. Extract Google information
        # ==================================================

        google_id = user_info.get("id")
        email = user_info.get("email")
        name = (
            user_info.get("name")
            or user_info.get("given_name")
            or "Google User"
        )

        if not google_id:
            return {
                "success": False,
                "message": "Google user ID was not provided"
            }, 400

        if not email:
            return {
                "success": False,
                "message": "Google account email was not provided"
            }, 400

        email = email.strip().lower()

        # ==================================================
        # 5. Find existing SwipeX user
        # ==================================================

        user = User.query.filter_by(
            email=email
        ).first()

        # ==================================================
        # 6. Create new Google user
        # ==================================================

        if not user:
            user = User(
                name=name,
                email=email,
                password_hash=None,
                role="JOB_SEEKER",
                auth_provider="google",
                phone=None,
                location=None,
                desired_role=None,
                experience=None,
                preferred_salary=None,
                bio=None,
                skills=[],
                profile_completion=0,
            )

            db.session.add(user)
            db.session.commit()

            current_app.logger.info(
                "Created new Google user: %s",
                email
            )

        # ==================================================
        # 7. Existing local account
        # ==================================================

        else:
            # Existing account found.
            # Allow Google login for the same email.
            if name and user.name != name:
                user.name = name

            if not user.auth_provider:
                user.auth_provider = "google"

            db.session.commit()

        # ==================================================
        # 8. Create SwipeX JWT
        # ==================================================

        swipex_access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role
            }
        )

        swipex_refresh_token = create_refresh_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role
            }
        )

        current_app.logger.info(
            "SwipeX JWT created for Google user: %s",
            email
        )

        # ==================================================
        # 9. Redirect to React
        # ==================================================

        frontend_url = current_app.config.get(
            "FRONTEND_URL",
            "http://localhost:3000"
        )

        return redirect(
            f"{frontend_url}/auth/google/callback"
            f"?access_token={swipex_access_token}"
            f"&refresh_token={swipex_refresh_token}"
        )

    except Exception as e:
        current_app.logger.exception(
            "Google OAuth callback failed"
        )

        return {
            "success": False,
            "message": "Google authentication failed",
            "error": str(e)
        }, 500

# @auth_bp.get("/google/callback")
# def google_callback():

#     token = oauth.google.authorize_access_token()

#     user_info = token.get("userinfo")

#     if not user_info:
#         return {
#             "success": False,
#             "message": "Unable to retrieve Google user information"
#         }, 400


#     google_id = user_info.get("sub")

#     email = user_info.get("email")

#     name = (
#         user_info.get("name")
#         or user_info.get("given_name")
#         or "Google User"
#     )


#     if not email:

#         return {
#             "success": False,
#             "message": "Google account email not available"
#         }, 400


#     email = email.strip().lower()


#     # ==========================================================
#     # FIND EXISTING USER
#     # ==========================================================

#     user = User.query.filter_by(
#         email=email
#     ).first()


#     # ==========================================================
#     # CREATE NEW GOOGLE USER
#     # ==========================================================

#     if not user:

#         user = User(

#             name=name,

#             email=email,

#             password_hash=None,

#             role="JOB_SEEKER",

#             auth_provider="google",

#             phone=None,

#             location=None,

#             desired_role=None,

#             experience=None,

#             preferred_salary=None,

#             bio=None,

#             skills=[],

#             profile_completion=0,

#         )

#         db.session.add(user)

#         db.session.commit()


#     # ==========================================================
#     # EXISTING LOCAL ACCOUNT
#     # ==========================================================

#     else:

#         if user.auth_provider == "local":

#             return {
#                 "success": False,
#                 "message":
#                     "An account with this email already exists. Please login using email and password."
#             }, 409


#         # Keep Google profile name updated when available.
#         if name and user.name != name:

#             user.name = name

#             db.session.commit()


#     # ==========================================================
#     # JWT
#     # ==========================================================

#     access_token = create_access_token(

#         identity=str(user.id),

#         additional_claims={
#             "role": user.role
#         }

#     )


#     refresh_token = create_refresh_token(

#         identity=str(user.id),

#         additional_claims={
#             "role": user.role
#         }

#     )


#     # ==========================================================
#     # RESPONSE
#     # ==========================================================

#     # return {

#     #     "success": True,

#     #     "message":
#     #         "Google login successful",

#     #     "access_token":
#     #         access_token,

#     #     "refresh_token":
#     #         refresh_token,

#     #     "user":
#     #         user.to_dict(),

#     # }, 200
#     frontend_url = current_app.config.get(
#     "FRONTEND_URL",
#     "http://localhost:3000"
#     )

#     return redirect(
#         f"{frontend_url}/auth/google/callback"
#         f"?access_token={access_token}"
#         f"&refresh_token={refresh_token}"
#     )   
@auth_bp.route("/me", methods=["GET", "PUT"])
@jwt_required()
def current_user():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }, 404

    # ==================================================
    # GET CURRENT USER
    # ==================================================

    if request.method == "GET":
        return {
            "success": True,
            "user": user.to_dict()
        }, 200

    # ==================================================
    # UPDATE CURRENT USER
    # ==================================================

    data = request.get_json() or {}

    if "name" in data:
        user.name = data["name"]

    if "email" in data:
        user.email = data["email"]

    if "phone" in data:
        user.phone = data["phone"]

    if "location" in data:
        user.location = data["location"]

    if "desiredRole" in data:
        user.desired_role = data["desiredRole"]

    elif "desired_role" in data:
        user.desired_role = data["desired_role"]

    if "experience" in data:
        user.experience = data["experience"]

    if "preferredSalary" in data:
        user.preferred_salary = data["preferredSalary"]

    elif "preferred_salary" in data:
        user.preferred_salary = data["preferred_salary"]

    if "bio" in data:
        user.bio = data["bio"]

    if "skills" in data:
        user.skills = (
            data["skills"]
            if isinstance(data["skills"], list)
            else []
        )

    # --------------------------------------------------
    # Calculate profile completion
    # --------------------------------------------------

    fields = [
        user.name,
        user.email,
        user.phone,
        user.location,
        user.desired_role,
        user.experience,
        user.preferred_salary,
        user.bio,
        user.skills,
    ]

    completed = 0

    for field in fields:
        if isinstance(field, list):
            if field:
                completed += 1
        elif field:
            completed += 1

    user.profile_completion = round(
        (completed / len(fields)) * 100
    )

    db.session.commit()

    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }, 200
@auth_bp.get("/admin-test")
@roles_required("ADMIN")
def admin_test():
    return {
        "success": True,
        "message": "Admin access granted"
    }, 200
# @auth_bp.put("/me")
# @jwt_required()
# def update_current_user():
#     user_id = get_jwt_identity()

#     user = User.query.get(int(user_id))

#     if not user:
#         return {
#             "success": False,
#             "message": "User not found"
#         }, 404

#     data = request.get_json() or {}

#     name = data.get("name")
#     email = data.get("email")

#     if name:
#         user.name = name

#     if email:
#         existing_user = User.query.filter(
#             User.email == email,
#             User.id != int(user_id)
#         ).first()

#         if existing_user:
#             return {
#                 "success": False,
#                 "message": "Email already registered"
#             }, 409

#         user.email = email

#     if not name and not email:
#         return {
#             "success": False,
#             "message": "At least name or email is required"
#         }, 400

#     db.session.commit()

#     return {
#         "success": True,
#         "message": "Profile updated successfully",
#         "user": user.to_dict()
#     }, 200
@auth_bp.put("/change-password")
@jwt_required()
def change_password():
    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }, 404

    data = request.get_json() or {}

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return {
            "success": False,
            "message": "current_password and new_password are required"
        }, 400

    if not bcrypt.check_password_hash(
        user.password_hash,
        current_password
    ):
        return {
            "success": False,
            "message": "Current password is incorrect"
        }, 401

    if current_password == new_password:
        return {
            "success": False,
            "message": "New password must be different from current password"
        }, 400

    if len(new_password) < 8:
        return {
            "success": False,
            "message": "New password must be at least 8 characters"
        }, 400

    user.password_hash = bcrypt.generate_password_hash(
        new_password
    ).decode("utf-8")

    db.session.commit()

    return {
        "success": True,
        "message": "Password changed successfully"
    }, 200
@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    claims = get_jwt()

    new_access_token = create_access_token(
        identity=str(user_id),
        additional_claims={
            "role": claims.get("role")
        }
    )

    return {
        "success": True,
        "message": "Access token refreshed successfully",
        "access_token": new_access_token
    }, 200
@auth_bp.post("/logout")
@jwt_required()
def logout():
    jti = get_jwt().get("jti")

    revoked_tokens.add(jti)

    return {
        "success": True,
        "message": "Logout successful"
    }, 200
@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json() or {}

    email = data.get("email")

    if not email:
        return {
            "success": False,
            "message": "Email is required"
        }, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return {
            "success": False,
            "message": "If the email exists, a password reset token has been generated"
        }, 200

    # Invalidate previous unused tokens
    old_tokens = PasswordResetToken.query.filter_by(
        user_id=user.id,
        used=False
    ).all()

    for old_token in old_tokens:
        old_token.used = True

    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)

    token = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15)
    )

    db.session.add(token)
    db.session.commit()

    return {
        "success": True,
        "message": "Password reset token generated",
        "reset_token": reset_token
    }, 200
@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json() or {}

    token_value = data.get("token")
    new_password = data.get("new_password")

    if not token_value or not new_password:
        return {
            "success": False,
            "message": "token and new_password are required"
        }, 400

    if len(new_password) < 8:
        return {
            "success": False,
            "message": "New password must be at least 8 characters"
        }, 400

    reset_token = PasswordResetToken.query.filter_by(
        token=token_value,
        used=False
    ).first()

    if not reset_token:
        return {
            "success": False,
            "message": "Invalid or already used reset token"
        }, 400

    if reset_token.is_expired():
        reset_token.used = True
        db.session.commit()

        return {
            "success": False,
            "message": "Reset token has expired"
        }, 400

    user = User.query.get(reset_token.user_id)

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }, 404

    user.password_hash = bcrypt.generate_password_hash(
        new_password
    ).decode("utf-8")

    reset_token.used = True

    db.session.commit()

    return {
        "success": True,
        "message": "Password reset successfully"
    }, 200