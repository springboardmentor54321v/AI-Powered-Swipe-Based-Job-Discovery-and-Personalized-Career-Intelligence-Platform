from app.extensions import db


class SavedJob(db.Model):
    __tablename__ = "saved_jobs"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    user_id = db.Column(
        db.Integer,
        nullable=False,
    )

    job_id = db.Column(
        db.Integer,
        db.ForeignKey("jobs.id"),
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
    )

    job = db.relationship(
        "Job",
        backref=db.backref(
            "saved_jobs",
            lazy=True,
        ),
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "job_id",
            name="uq_saved_job_user_job",
        ),
    )