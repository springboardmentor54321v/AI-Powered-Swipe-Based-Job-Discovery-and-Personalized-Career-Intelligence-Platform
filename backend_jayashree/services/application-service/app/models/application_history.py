from datetime import datetime

from app.extensions import db


class ApplicationHistory(db.Model):
    __tablename__ = "application_history"

    id = db.Column(db.Integer, primary_key=True)

    application_id = db.Column(
        db.Integer,
        db.ForeignKey("applications.id"),
        nullable=False
    )

    old_status = db.Column(db.String(20), nullable=True)

    new_status = db.Column(db.String(20), nullable=False)

    changed_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "old_status": self.old_status,
            "new_status": self.new_status,
            "changed_at": self.changed_at.isoformat()
        }