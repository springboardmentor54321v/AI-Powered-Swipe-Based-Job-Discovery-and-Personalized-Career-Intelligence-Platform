from app.extensions import db


class SavedJob(db.Model):
    __tablename__ = "saved_jobs"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, nullable=False)

    job_id = db.Column(
        db.Integer,
        db.ForeignKey("jobs.id"),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    job = db.relationship(
        "Job",
        backref=db.backref("saved_jobs", lazy=True)
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "job_id",
            name="uq_saved_job_user_job"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "job_id": self.job_id,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "job": self.job.to_dict() if self.job else None,
        }