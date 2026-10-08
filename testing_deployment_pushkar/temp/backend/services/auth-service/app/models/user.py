from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    # Basic account information
    name = db.Column(db.String(100), nullable=False)

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = db.Column(
        db.String(255),
        nullable=True
    )

    # JOB_SEEKER / RECRUITER / ADMIN
    role = db.Column(
        db.String(30),
        nullable=False,
        default="JOB_SEEKER",
        index=True
    )

    # local / google / local+google
    auth_provider = db.Column(
        db.String(30),
        nullable=False,
        default="local"
    )

    # Profile information
    phone = db.Column(db.String(30), nullable=True)

    location = db.Column(db.String(150), nullable=True)

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

    # PostgreSQL JSONB
    skills = db.Column(
        db.JSON,
        nullable=False,
        default=list
    )

    profile_completion = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False
    )
    designation = db.Column(
    db.String(100),
    nullable=True
    )

    company_name = db.Column(
        db.String(150),
        nullable=True
    )

    website = db.Column(
        db.String(255),
        nullable=True
    )

    industry = db.Column(
        db.String(100),
        nullable=True
    )

    company_size = db.Column(
        db.String(50),
        nullable=True
    )

    company_description = db.Column(
        db.Text,
        nullable=True
    )

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
            "profile_completion": self.profile_completion,
            "designation": self.designation,
            "company_name": self.company_name,
            "website": self.website,
            "industry": self.industry,
            "company_size": self.company_size,
            "company_description": self.company_description,

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            )
        }