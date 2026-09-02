from app.extensions import db


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, nullable=False)

    job_id = db.Column(
        db.Integer,
        db.ForeignKey("jobs.id"),
        nullable=False
    )

    resume_id = db.Column(
        db.Integer,
        nullable=True
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="Applied"
    )

    applied_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    job = db.relationship(
        "Job",
        backref=db.backref("applications", lazy=True)
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "job_id",
            name="uq_application_user_job"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "job_id": self.job_id,
            "resume_id": self.resume_id,
            "status": self.status,
            "applied_at": (
                self.applied_at.isoformat()
                if self.applied_at
                else None
            ),
            "job": self.job.to_dict() if self.job else None,
        }