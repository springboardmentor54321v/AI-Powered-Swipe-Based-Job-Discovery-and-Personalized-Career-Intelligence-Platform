from app.extensions import db


class Application(db.Model):
    __tablename__ = "applications"

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

    resume_id = db.Column(
        db.Integer,
        nullable=True,
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="Applied",
    )

    applied_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
    )

    # Last time the recruiter changed the stage
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=True,
    )

    # Private notes written by the recruiter (never shown to the candidate)
    recruiter_notes = db.Column(db.Text, nullable=True)

    job = db.relationship(
        "Job",
        backref=db.backref(
            "applications",
            lazy=True,
        ),
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "job_id",
            name="uq_application_user_job",
        ),
    )