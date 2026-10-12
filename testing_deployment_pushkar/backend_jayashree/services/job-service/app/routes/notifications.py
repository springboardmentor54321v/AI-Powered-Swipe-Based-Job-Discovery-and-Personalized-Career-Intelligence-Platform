from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.notification import Notification

notifications_bp = Blueprint("notifications", __name__)


def _uid():
    try:
        return int(get_jwt_identity())
    except (TypeError, ValueError):
        return None


@notifications_bp.get("/")
@jwt_required()
def list_notifications():
    user_id = _uid()
    if user_id is None:
        return {"success": False, "message": "Invalid user identity"}, 401

    query = Notification.query.filter_by(user_id=user_id)
    if request.args.get("unread") == "true":
        query = query.filter_by(is_read=False)

    limit = min(max(request.args.get("limit", 50, type=int), 1), 200)
    offset = max(request.args.get("offset", 0, type=int), 0)

    items = (
        query.order_by(Notification.created_at.desc(), Notification.id.desc())
        .offset(offset).limit(limit).all()
    )
    unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return {
        "success": True,
        "count": len(items),
        "unread_count": unread,
        "notifications": [n.to_dict() for n in items],
    }, 200


@notifications_bp.post("/<int:notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    user_id = _uid()
    note = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not note:
        return {"success": False, "message": "Notification not found"}, 404
    note.is_read = True
    db.session.commit()
    return {"success": True, "notification": note.to_dict()}, 200


@notifications_bp.post("/read-all")
@jwt_required()
def mark_all_read():
    user_id = _uid()
    updated = (
        Notification.query.filter_by(user_id=user_id, is_read=False)
        .update({"is_read": True}, synchronize_session=False)
    )
    db.session.commit()
    return {"success": True, "updated": updated}, 200


@notifications_bp.delete("/<int:notification_id>")
@jwt_required()
def delete_notification(notification_id):
    user_id = _uid()
    note = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not note:
        return {"success": False, "message": "Notification not found"}, 404
    db.session.delete(note)
    db.session.commit()
    return {"success": True}, 200


@notifications_bp.delete("/")
@jwt_required()
def clear_notifications():
    user_id = _uid()
    deleted = Notification.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    db.session.commit()
    return {"success": True, "deleted": deleted}, 200


# ============================================================
# ALERT PREFERENCES
# ============================================================
import re  # noqa: E402

from app import delivery  # noqa: E402
from app.models.alert_preference import AlertPreference  # noqa: E402

_BOOLS = ("instant_job", "startup_hiring", "high_match", "low_competition", "channel_email", "channel_push")
_HHMM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def _prefs_payload(prefs):
    return {
        "success": True,
        "preferences": prefs,
        "delivery": {"email_backend": delivery.email_backend(), "push_configured": delivery.push_configured()},
    }


@notifications_bp.get("/preferences")
@jwt_required()
def get_preferences():
    row = AlertPreference.query.filter_by(user_id=_uid()).first()
    return _prefs_payload(row.to_dict() if row else dict(AlertPreference.DEFAULTS)), 200


@notifications_bp.put("/preferences")
@jwt_required()
def update_preferences():
    data = request.get_json(silent=True) or {}
    changes = {}
    for key in _BOOLS:
        if key in data:
            if not isinstance(data[key], bool):
                return {"success": False, "message": f"{key} must be true or false"}, 400
            changes[key] = data[key]
    if "match_threshold" in data:
        value = data["match_threshold"]
        if isinstance(value, bool) or not isinstance(value, int) or not 0 <= value <= 100:
            return {"success": False, "message": "match_threshold must be an integer from 0 to 100"}, 400
        changes["match_threshold"] = value
    for key in ("quiet_start", "quiet_end"):
        if key in data:
            value = data[key]
            if value in (None, ""):
                changes[key] = None
            elif isinstance(value, str) and _HHMM.match(value):
                changes[key] = value
            else:
                return {"success": False, "message": f"{key} must be HH:MM (24 hour) or null"}, 400
    if "tz_offset_minutes" in data:
        value = data["tz_offset_minutes"]
        if isinstance(value, bool) or not isinstance(value, int) or not -840 <= value <= 840:
            return {"success": False, "message": "tz_offset_minutes must be an integer between -840 and 840"}, 400
        changes["tz_offset_minutes"] = value
    if "push_token" in data:
        token = data["push_token"]
        changes["push_token"] = str(token)[:255] if token else None
    if not changes:
        return {"success": False, "message": "No valid preference fields were provided"}, 400

    row = AlertPreference.query.filter_by(user_id=_uid()).first()
    if not row:
        row = AlertPreference(user_id=_uid(), **AlertPreference.DEFAULTS)
        db.session.add(row)
    for key, value in changes.items():
        setattr(row, key, value)
    db.session.commit()
    return _prefs_payload(row.to_dict()), 200
