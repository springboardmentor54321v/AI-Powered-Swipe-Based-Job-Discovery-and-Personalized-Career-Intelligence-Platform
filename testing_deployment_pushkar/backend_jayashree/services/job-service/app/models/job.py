from app.extensions import db


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)

    # Auth Service user ID
    recruiter_id = db.Column(db.Integer, nullable=False, index=True)

    title = db.Column(db.String(150), nullable=False)
    company = db.Column(db.String(150), nullable=False)

    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(150), nullable=False)

    # Comma-separated skills for now
    skills = db.Column(db.String(1000), nullable=False)

    salary = db.Column(db.String(100), nullable=True)

    employment_type = db.Column(db.String(50), nullable=True)
    experience_level = db.Column(db.String(100), nullable=True)
    work_mode = db.Column(db.String(50), nullable=True)

    deadline = db.Column(db.Date, nullable=True)

    qualifications = db.Column(db.Text, nullable=True)

    status = db.Column(
        db.String(30),
        nullable=False,
        default="Active"
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

    def to_dict(self):
        return {
            "id": self.id,
            "recruiter_id": self.recruiter_id,
            "title": self.title,
            "company": self.company,
            "description": self.description,
            "location": self.location,
            "skills": self.skills,
            "salary": self.salary,
            "employment_type": self.employment_type,
            "experience_level": self.experience_level,
            "work_mode": self.work_mode,
            "deadline": (
                self.deadline.isoformat()
                if self.deadline
                else None
            ),
            "qualifications": self.qualifications,
            "status": self.status,
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