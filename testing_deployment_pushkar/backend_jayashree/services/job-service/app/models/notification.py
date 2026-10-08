from app.extensions import db


class Notification(db.Model):
    """In-app notification for any user (candidate or recruiter)."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    # users.id from the auth service (same database, no cross-service foreign key)
    user_id = db.Column(db.Integer, nullable=False, index=True)

    # application | job | system
    type = db.Column(db.String(30), nullable=False, default="system")

    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)

    job_id = db.Column(db.Integer, nullable=True)
    application_id = db.Column(db.Integer, nullable=True)

    # Frontend route to open when the notification is clicked
    link = db.Column(db.String(255), nullable=True)

    is_read = db.Column(db.Boolean, nullable=False, default=False)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
    )

    __table_args__ = (
        db.Index("ix_notifications_user_read_created", "user_id", "is_read", "created_at"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "jobId": self.job_id,
            "applicationId": self.application_id,
            "link": self.link,
            "read": bool(self.is_read),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
