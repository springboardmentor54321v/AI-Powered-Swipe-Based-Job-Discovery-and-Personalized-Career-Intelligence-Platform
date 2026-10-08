from app.extensions import db


class AlertPreference(db.Model):
    """Per-user alert settings. A missing row means the defaults below."""

    __tablename__ = "alert_preferences"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, unique=True, index=True)

    # alert types
    instant_job = db.Column(db.Boolean, nullable=False, default=False)
    startup_hiring = db.Column(db.Boolean, nullable=False, default=False)
    high_match = db.Column(db.Boolean, nullable=False, default=True)
    low_competition = db.Column(db.Boolean, nullable=False, default=True)

    # channels (in-app is always on: it is the fallback)
    channel_email = db.Column(db.Boolean, nullable=False, default=False)
    channel_push = db.Column(db.Boolean, nullable=False, default=False)

    match_threshold = db.Column(db.Integer, nullable=False, default=75)
    quiet_start = db.Column(db.String(5), nullable=True)   # "22:00"
    quiet_end = db.Column(db.String(5), nullable=True)     # "07:00"
    tz_offset_minutes = db.Column(db.Integer, nullable=False, default=0)  # client offset from UTC
    push_token = db.Column(db.String(255), nullable=True)

    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    DEFAULTS = {
        "instant_job": False, "startup_hiring": False, "high_match": True, "low_competition": True,
        "channel_email": False, "channel_push": False, "match_threshold": 75,
        "quiet_start": None, "quiet_end": None, "tz_offset_minutes": 0,
    }
    FIELDS = tuple(DEFAULTS)

    def to_dict(self):
        return {f: getattr(self, f) for f in self.FIELDS}
