"""Alert triggers: when a recruiter posts a job, notify the seekers it is relevant to.

Alert types (highest priority first; a user gets at most ONE alert per job):
  high_match      AI match score >= the user's threshold (default 75)             default ON
  startup_hiring  the company is a startup and the match is at least 40            default OFF
  low_competition the job's competition level is Low and the match is at least 50 default ON
  instant_job     any new job, regardless of match                                 default OFF

Volume control: at most MAX_ALERTS_PER_DAY alert notifications per user per day. Quiet hours (the
user's local time) suppress email/push only; the in-app notification is always created.
"""
import threading
from datetime import datetime, timedelta

from flask import current_app
from sqlalchemy import text

from app import competition, delivery
from app.extensions import db
from app.models.alert_preference import AlertPreference
from app.models.job import Job
from app.models.notification import Notification
from app.services import _rows, ai_candidate_scores

ALERT_TYPES = ("high_match", "startup_hiring", "low_competition", "instant_job")
NOTIFICATION_TYPE = {"high_match": "high_match", "startup_hiring": "startup",
                     "low_competition": "low_competition", "instant_job": "instant_job"}
MAX_ALERTS_PER_DAY = 10
MAX_RECIPIENTS = 1000
CHUNK = 200


def is_startup(job):
    rows = _rows("SELECT category FROM companies WHERE lower(name) = :n LIMIT 1", {"n": (job.company or "").lower()})
    return bool(rows) and "startup" in str(rows[0]["category"] or "").lower()


def in_quiet_hours(prefs, now_utc=None):
    """True if the user's local time falls inside their quiet window (handles overnight windows)."""
    if not prefs.get("quiet_start") or not prefs.get("quiet_end"):
        return False
    local = (now_utc or datetime.utcnow()) + timedelta(minutes=int(prefs.get("tz_offset_minutes") or 0))
    now_m = local.hour * 60 + local.minute

    def minutes(s):
        h, m = s.split(":")
        return int(h) * 60 + int(m)

    a, b = minutes(prefs["quiet_start"]), minutes(prefs["quiet_end"])
    return (a <= now_m < b) if a <= b else (now_m >= a or now_m < b)


def choose_alert(prefs, score, level, startup):
    """-> alert type or None. Pure function (unit tested)."""
    if prefs["high_match"] and score is not None and score >= prefs["match_threshold"]:
        return "high_match"
    if prefs["startup_hiring"] and startup and (score or 0) >= 40:
        return "startup_hiring"
    if prefs["low_competition"] and level == "Low" and (score or 0) >= 50:
        return "low_competition"
    if prefs["instant_job"]:
        return "instant_job"
    return None


def _copy(alert, job, score):
    pct = f"{int(score)}% match" if score is not None else "new"
    if alert == "high_match":
        return (f"High match: {job.title}", f"{job.company} is hiring a {job.title}. It is a {pct} with your skills.")
    if alert == "startup_hiring":
        return (f"Startup hiring: {job.title}", f"{job.company}, a startup, just posted {job.title} ({pct}).")
    if alert == "low_competition":
        return (f"Low competition: {job.title}",
                f"{job.title} at {job.company} has very few applicants so far ({pct}). Apply early!")
    return (f"New job: {job.title}", f"{job.company} just posted {job.title} in {job.location}.")


def _prefs_for(user_ids):
    rows = AlertPreference.query.filter(AlertPreference.user_id.in_(user_ids or [-1])).all()
    got = {r.user_id: r.to_dict() | {"push_token": r.push_token} for r in rows}
    return {u: got.get(u) or (AlertPreference.DEFAULTS | {"push_token": None}) for u in user_ids}


def _alerts_today(user_ids):
    since = datetime.utcnow() - timedelta(hours=24)
    rows = (db.session.query(Notification.user_id, db.func.count(Notification.id))
            .filter(Notification.user_id.in_(user_ids or [-1]),
                    Notification.type.in_(list(NOTIFICATION_TYPE.values())),
                    Notification.created_at >= since)
            .group_by(Notification.user_id).all())
    return dict(rows)


def fan_out_new_job(job_id):
    """Create alert notifications (+ email) for a newly posted job. Returns {user_id: alert_type}."""
    job = db.session.get(Job, job_id)
    if not job or (job.status or "Active").lower() != "active":
        return {}
    seekers = _rows("SELECT id, email, name FROM users WHERE role = 'JOB_SEEKER' ORDER BY id LIMIT :n",
                    {"n": MAX_RECIPIENTS})
    if not seekers:
        return {}
    ids = [s["id"] for s in seekers]
    emails = {s["id"]: s["email"] for s in seekers}

    scores = {}
    for i in range(0, len(ids), CHUNK):
        scores.update(ai_candidate_scores(job.id, ids[i:i + CHUNK], timeout=30))

    prefs = _prefs_for(ids)
    today = _alerts_today(ids)
    level = competition.level_of_jobs([job])[job.id]
    startup = is_startup(job)
    sent = {}
    for uid in ids:
        if today.get(uid, 0) >= MAX_ALERTS_PER_DAY:
            continue
        p = prefs[uid]
        score = (scores.get(uid) or {}).get("score")
        alert = choose_alert(p, score, level, startup)
        if not alert:
            continue
        title, message = _copy(alert, job, score)
        db.session.add(Notification(user_id=uid, type=NOTIFICATION_TYPE[alert], title=title[:200],
                                    message=message, job_id=job.id, link=f"/jobs/{job.id}"))
        sent[uid] = alert
        if not in_quiet_hours(p):
            if p["channel_email"]:
                delivery.send_email(emails.get(uid), title, message + "\n\nOpen SwipeX to apply.")
            if p["channel_push"]:
                delivery.send_push(p.get("push_token"), title, message)
    db.session.commit()
    return sent


def fan_out_new_job_async(job_id):
    """Run fan_out_new_job in a background thread so posting a job returns immediately."""
    app = current_app._get_current_object()

    def run():
        with app.app_context():
            try:
                fan_out_new_job(job_id)
            except Exception as exc:
                db.session.rollback()
                print("ALERT FAN-OUT ERROR:", exc)

    threading.Thread(target=run, daemon=True).start()
