from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(255),
        nullable=True
    )

    role = db.Column(
        db.String(30),
        nullable=False,
        default="JOB_SEEKER"
    )

    auth_provider = db.Column(
        db.String(30),
        nullable=False,
        default="local"
    )

    # ==========================================================
    # PROFILE INFORMATION
    # ==========================================================

    phone = db.Column(
        db.String(30),
        nullable=True
    )

    location = db.Column(
        db.String(150),
        nullable=True
    )

    desired_role = db.Column(
        db.String(150),
        nullable=True
    )

    experience = db.Column(
        db.String(50),
        nullable=True
    )

    preferred_salary = db.Column(
        db.String(100),
        nullable=True
    )

    bio = db.Column(
        db.Text,
        nullable=True
    )

    skills = db.Column(
        db.JSON,
        nullable=True
    )

    profile_completion = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )


    # ==========================================================
    # SERIALIZATION
    # ==========================================================

    def to_dict(self):

        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "auth_provider": self.auth_provider,

            "phone": self.phone,
            "location": self.location,
            "desired_role": self.desired_role,
            "experience": self.experience,
            "preferred_salary": self.preferred_salary,
            "bio": self.bio,

            "skills": self.skills or [],

            "profile_completion":
                self.profile_completion,
        }