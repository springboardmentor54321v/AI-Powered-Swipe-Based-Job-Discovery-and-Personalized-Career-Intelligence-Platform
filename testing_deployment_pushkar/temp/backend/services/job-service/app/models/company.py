from app.extensions import db


class Company(db.Model):
    __tablename__ = "companies"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(150),
        nullable=False,
        unique=True,
        index=True
    )

    category = db.Column(
        db.String(50),
        nullable=False,
        index=True
    )

    industry = db.Column(
        db.String(150),
        nullable=False,
        index=True
    )

    location = db.Column(
        db.String(150),
        nullable=True
    )

    employee_count = db.Column(
        db.String(100),
        nullable=True
    )

    founded_year = db.Column(
        db.Integer,
        nullable=True
    )

    website = db.Column(
        db.String(255),
        nullable=True
    )

    logo = db.Column(
        db.String(500),
        nullable=True
    )

    about = db.Column(
        db.Text,
        nullable=True
    )

    rating = db.Column(
        db.Float,
        nullable=True
    )

    tech_stack = db.Column(
        db.JSON,
        nullable=False,
        default=list
    )

    benefits = db.Column(
        db.JSON,
        nullable=False,
        default=list
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

    def to_dict(self, open_jobs_count=0):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "industry": self.industry,
            "location": self.location,
            "employeeCount": self.employee_count,
            "foundedYear": self.founded_year,
            "website": self.website,
            "logo": self.logo,
            "about": self.about,
            "rating": self.rating,
            "techStack": self.tech_stack or [],
            "benefits": self.benefits or [],
            "openJobsCount": open_jobs_count,
            "createdAt": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updatedAt": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            )
        }