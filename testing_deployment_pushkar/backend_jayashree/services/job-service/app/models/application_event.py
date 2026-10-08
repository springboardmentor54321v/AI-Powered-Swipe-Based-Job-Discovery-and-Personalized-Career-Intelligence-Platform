from app.extensions import db


class ApplicationStatusEvent(db.Model):
    """One row per status change of an application: the timeline shown to candidates."""

    __tablename__ = "application_status_events"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey("applications.id"), nullable=False, index=True)
    from_status = db.Column(db.String(30), nullable=True)
    to_status = db.Column(db.String(30), nullable=False)
    note = db.Column(db.Text, nullable=True)
    actor_id = db.Column(db.Integer, nullable=True)  # users.id of whoever made the change
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "from_status": self.from_status,
            "to_status": self.to_status,
            "note": self.note,
            "actor_id": self.actor_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
