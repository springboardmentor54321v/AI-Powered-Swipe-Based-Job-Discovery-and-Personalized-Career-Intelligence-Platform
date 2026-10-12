"""Cross-cutting helpers for the job service.

All services share ONE PostgreSQL database, so a few read-only lookups (users, resumes) are plain
SQL on the shared tables instead of HTTP calls. Every lookup is fail-soft: if the table is not there
yet or the AI service is down, the main request still succeeds.
"""
import os

import requests
from sqlalchemy import bindparam, text

from app.extensions import db
from app.models.notification import Notification
from app.models.application_event import ApplicationStatusEvent

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8000").rstrip("/")

# Canonical recruiter pipeline stages
STATUSES = ["Applied", "Under Review", "Shortlisted", "Interview", "Offered", "Hired", "Rejected"]
_STATUS_LOOKUP = {s.lower(): s for s in STATUSES}
_STATUS_LOOKUP.update({"under_review": "Under Review", "review": "Under Review", "offer": "Offered",
                       "shortlist": "Shortlisted", "interviewing": "Interview", "reject": "Rejected"})


def normalize_status(value):
    return _STATUS_LOOKUP.get(str(value or "").strip().lower())


# ----------------------------------------------------------------------------- shared-table lookups

def _rows(sql, params=None, expanding=()):
    stmt = text(sql)
    if expanding:
        stmt = stmt.bindparams(*[bindparam(name, expanding=True) for name in expanding])
    try:
        with db.engine.connect() as conn:
            return [dict(r._mapping) for r in conn.execute(stmt, params or {})]
    except Exception as exc:  # table missing, connection hiccup...
        print("LOOKUP WARNING:", exc)
        return []


def lookup_users(user_ids):
    """{id: {id, name, email, phone, location, skills, experience, bio, desired_role}}"""
    ids = sorted({int(i) for i in user_ids})
    if not ids:
        return {}
    rows = _rows(
        "SELECT id, name, email, phone, location, skills, experience, bio, desired_role "
        "FROM users WHERE id IN :ids", {"ids": ids}, expanding=("ids",))
    return {r["id"]: r for r in rows}


def latest_resumes(user_ids):
    """{user_id: {id, filename}} - the newest resume of each user."""
    ids = sorted({int(i) for i in user_ids})
    if not ids:
        return {}
    rows = _rows(
        "SELECT DISTINCT ON (user_id) id, user_id, filename FROM resumes "
        "WHERE user_id IN :ids ORDER BY user_id, id DESC", {"ids": ids}, expanding=("ids",))
    return {r["user_id"]: r for r in rows}


def latest_resume_id(user_id):
    return (latest_resumes([user_id]).get(int(user_id)) or {}).get("id")


# ----------------------------------------------------------------------------- notifications

def create_notification(user_id, type_, title, message, job_id=None, application_id=None, link=None):
    """Add a notification to the current session (caller commits together with its own change)."""
    note = Notification(
        user_id=int(user_id), type=type_, title=title[:200], message=message,
        job_id=job_id, application_id=application_id, link=link,
    )
    db.session.add(note)
    return note


_STATUS_COPY = {
    "Under Review": ("Your application is under review",
                     "{company} is now reviewing your application for {title}."),
    "Shortlisted": ("You've been shortlisted!",
                    "Good news! {company} shortlisted you for {title}."),
    "Interview": ("Interview invitation",
                  "{company} would like to interview you for {title}. Watch your email for next steps."),
    "Offered": ("You have an offer",
                "{company} has extended an offer for {title}. Congratulations!"),
    "Hired": ("Congratulations, you're hired!",
              "{company} has confirmed you for {title}."),
    "Rejected": ("Application update",
                 "{company} has decided not to move forward with your application for {title}. "
                 "More matches are waiting for you in Discover."),
    "Applied": ("Application moved back to Applied",
                "{company} moved your application for {title} back to the first stage."),
}


def notify_status_change(application, job, new_status, recruiter_message=None):
    """Tell the candidate that a recruiter moved their application. Returns the Notification."""
    title, body = _STATUS_COPY.get(new_status, ("Application update", "Your application for {title} is now {status}."))
    message = body.format(company=job.company, title=job.title, status=new_status)
    if recruiter_message and str(recruiter_message).strip():
        message += f' Message from the recruiter: "{str(recruiter_message).strip()[:500]}"'
    return create_notification(
        application.user_id, "application", title, message,
        job_id=job.id, application_id=application.id, link="/applications",
    )


def record_status_event(application, from_status, to_status, actor_id=None, note=None):
    """Append to the application's status timeline (same transaction as the change)."""
    ev = ApplicationStatusEvent(application_id=application.id, from_status=from_status, to_status=to_status,
                                actor_id=actor_id, note=(note or None))
    db.session.add(ev)
    return ev


def notify_new_application(job, application, candidate_name):
    """Tell the recruiter that somebody applied (and open the application's timeline)."""
    record_status_event(application, None, "Applied", actor_id=application.user_id)
    return create_notification(
        job.recruiter_id, "application", "New application",
        f"{candidate_name or 'A candidate'} applied for {job.title}.",
        job_id=job.id, application_id=application.id,
        link=f"/recruiter/applicants/{application.id}",
    )


# ----------------------------------------------------------------------------- AI scoring (fail-soft)

def _ai_headers():
    key = os.getenv("INTERNAL_API_KEY", "")
    return {"X-Internal-Key": key} if key else {}


def ai_candidate_scores(job_id, user_ids, timeout=6):
    """{user_id: {score, matching_skills, missing_skills}} from the AI service, or {} if unavailable."""
    user_ids = sorted({int(u) for u in user_ids})
    if not user_ids:
        return {}
    try:
        resp = requests.post(
            f"{AI_SERVICE_URL}/api/v1/match/candidates",
            json={"job_id": int(job_id), "user_ids": user_ids}, timeout=timeout,
            headers=_ai_headers())
        if resp.status_code != 200:
            return {}
        return {int(k): v for k, v in (resp.json().get("scores") or {}).items()}
    except Exception as exc:
        print("AI SCORE WARNING:", exc)
        return {}
