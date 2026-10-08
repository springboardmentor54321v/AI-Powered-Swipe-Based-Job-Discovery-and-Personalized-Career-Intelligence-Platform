"""Competition indicators for jobs: applicant count, Low/Medium/High level, posted-time, early window.

Counts are computed live from `applications` with ONE grouped query per request, so they are always
exactly right (no counter to drift). Thresholds are env-configurable:

    High   : applicants >= COMP_HIGH_COUNT (15)   or  applicants/day >= COMP_HIGH_VELOCITY (6)
    Medium : applicants >= COMP_MEDIUM_COUNT (5)  or  applicants/day >= COMP_MEDIUM_VELOCITY (2)
    Low    : otherwise

`early_window_open` is true while a job is younger than EARLY_WINDOW_HOURS (48). A candidate is an
`applied_early` applicant when they applied inside that window.
"""
import os
from datetime import datetime, timedelta

from sqlalchemy import func

from app.extensions import db
from app.models.application import Application

HIGH_COUNT = int(os.getenv("COMP_HIGH_COUNT", "15"))
HIGH_VELOCITY = float(os.getenv("COMP_HIGH_VELOCITY", "6"))
MEDIUM_COUNT = int(os.getenv("COMP_MEDIUM_COUNT", "5"))
MEDIUM_VELOCITY = float(os.getenv("COMP_MEDIUM_VELOCITY", "2"))
EARLY_WINDOW_HOURS = float(os.getenv("EARLY_WINDOW_HOURS", "48"))


def _naive_utc(dt):
    return dt.replace(tzinfo=None) if dt is not None and dt.tzinfo else dt


def age_hours(created_at, now=None):
    if created_at is None:
        return 0.0
    now = now or datetime.utcnow()
    return max(0.0, (now - _naive_utc(created_at)).total_seconds() / 3600)


def level_for(count, hours):
    """-> 'Low' | 'Medium' | 'High' from applicant count and job age (hours)."""
    velocity = count / max(hours / 24.0, 1.0)  # applicants per day, job age floored at one day
    if count >= HIGH_COUNT or velocity >= HIGH_VELOCITY:
        return "High"
    if count >= MEDIUM_COUNT or velocity >= MEDIUM_VELOCITY:
        return "Medium"
    return "Low"


def posted_ago(hours):
    if hours < 1:
        return "Just now"
    if hours < 24:
        return f"{int(hours)} hour{'s' if int(hours) != 1 else ''} ago"
    days = int(hours // 24)
    if days < 30:
        return f"{days} day{'s' if days != 1 else ''} ago"
    return f"{days // 30} month{'s' if days // 30 != 1 else ''} ago"


def applicant_counts(job_ids):
    ids = list({int(i) for i in job_ids if i is not None})
    if not ids:
        return {}
    rows = (db.session.query(Application.job_id, func.count(Application.id))
            .filter(Application.job_id.in_(ids)).group_by(Application.job_id).all())
    return {jid: n for jid, n in rows}


def indicators(created_at, count, now=None):
    hours = age_hours(created_at, now)
    level = level_for(count, hours)
    return {
        "applicant_count": count, "applicantCount": count,
        "competition_level": level, "competition": level,
        "posted_at": created_at.isoformat() if created_at else None,
        "posted_ago": posted_ago(hours), "postedAgo": posted_ago(hours),
        "is_new": hours <= 24,
        "early_window_open": hours <= EARLY_WINDOW_HOURS,
        "early_window_hours": EARLY_WINDOW_HOURS,
    }


def enrich(job_dicts, jobs_by_id, viewer_id=None, id_key="id"):
    """Add competition fields to already-built job dicts (mutates and returns them).

    jobs_by_id: {job_id: Job} (for created_at). With viewer_id, also adds `applied` / `applied_early`."""
    counts = applicant_counts([d.get(id_key) for d in job_dicts])
    now = datetime.utcnow()
    mine = {}
    if viewer_id:
        rows = (db.session.query(Application.job_id, Application.applied_at)
                .filter(Application.user_id == int(viewer_id),
                        Application.job_id.in_(list(counts) or [-1])).all())
        mine = {jid: at for jid, at in rows}
    for d in job_dicts:
        job = jobs_by_id.get(d.get(id_key))
        if job is None:
            continue
        d.update(indicators(job.created_at, counts.get(job.id, 0), now))
        if viewer_id:
            at = mine.get(job.id)
            d["applied"] = at is not None
            d["applied_early"] = bool(at and job.created_at and
                                      _naive_utc(at) - _naive_utc(job.created_at) <= timedelta(hours=EARLY_WINDOW_HOURS))
    return job_dicts


def level_of_jobs(jobs):
    """{job_id: level} for a list of Job objects (used by filters and alerts)."""
    counts = applicant_counts([j.id for j in jobs])
    now = datetime.utcnow()
    return {j.id: level_for(counts.get(j.id, 0), age_hours(j.created_at, now)) for j in jobs}
