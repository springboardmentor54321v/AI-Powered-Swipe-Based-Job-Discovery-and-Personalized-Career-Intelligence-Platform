"""Analytics per role. Everything is plain SQL on the shared Postgres.

GET /analytics/seeker       own funnel, swipe/application activity, resume performance
GET /analytics/recruiter    applicants per job, status funnel, application trend (recruiters only)
GET /analytics/admin        platform-wide totals and trends (admins only)
GET /analytics/trends       hiring trends: jobs posted per day, in-demand skills, startup vs MNC activity

Date range: ?days=30 (1-365) or ?from=YYYY-MM-DD&to=YYYY-MM-DD
"""
from datetime import date, datetime, timedelta

from flask import Blueprint, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from sqlalchemy import text

from app import competition
from app.extensions import db
from app.models.job import Job
from app.services import STATUSES

analytics_bp = Blueprint("analytics", __name__)

PROGRESSED = ("Shortlisted", "Interview", "Offered", "Hired")
INTERVIEWED = ("Interview", "Offered", "Hired")


def _uid():
    return int(get_jwt_identity())


def _range():
    """-> (start_datetime, end_datetime_exclusive, error_response)"""
    try:
        if request.args.get("from") or request.args.get("to"):
            start = datetime.fromisoformat(request.args.get("from") or "1970-01-01")
            end = datetime.fromisoformat(request.args.get("to") or date.today().isoformat()) + timedelta(days=1)
            if end <= start:
                raise ValueError("to must be after from")
        else:
            days = request.args.get("days", 30, type=int)
            if not 1 <= days <= 365:
                raise ValueError("days must be between 1 and 365")
            end = datetime.utcnow() + timedelta(days=1)
            start = end - timedelta(days=days + 1)
        return start, end, None
    except ValueError as exc:
        return None, None, ({"success": False, "message": f"Invalid date range: {exc}"}, 400)


def _rows(sql, **params):
    return [dict(r._mapping) for r in db.session.execute(text(sql), params)]


def _series(rows, start, end):
    """[{date, count}] with zero-filled days so charts have no gaps."""
    got = {str(r["day"]): r["n"] for r in rows}
    out, d = [], start.date()
    while d < end.date():
        out.append({"date": d.isoformat(), "count": got.get(d.isoformat(), 0)})
        d += timedelta(days=1)
    return out


def _funnel(status_counts):
    """Funnel by *reached* stage: an Interview candidate has also been Applied and Shortlisted."""
    order = ["Applied", "Under Review", "Shortlisted", "Interview", "Offered", "Hired"]
    reached = {s: 0 for s in order}
    for status, n in status_counts.items():
        if status in order:
            for s in order[: order.index(status) + 1]:
                reached[s] += n
        # Rejected candidates were at least Applied
        elif status == "Rejected":
            reached["Applied"] += n
    return [{"stage": s, "count": reached[s]} for s in order] + \
           [{"stage": "Rejected", "count": status_counts.get("Rejected", 0)}]


def _skills_demand(limit=12, start=None, end=None, job_filter=""):
    sql = ("SELECT trim(s) AS skill, count(*) AS n FROM jobs j, unnest(string_to_array(j.skills, ',')) AS s "
           "WHERE trim(s) <> '' AND lower(coalesce(j.status,'Active')) = 'active' " + job_filter)
    params = {"limit": limit}
    if start is not None:
        sql += " AND j.created_at >= :start AND j.created_at < :end"
        params.update(start=start, end=end)
    sql += " GROUP BY trim(s) ORDER BY n DESC, skill LIMIT :limit"
    return _rows(sql, **params)


def _company_type_activity(start, end):
    return _rows(
        "SELECT CASE WHEN lower(c.category) LIKE '%startup%' THEN 'Startup' WHEN lower(c.category) LIKE '%mnc%' "
        "THEN 'MNC' WHEN c.category IS NULL THEN 'Unknown' ELSE 'Other' END AS type, "
        "count(DISTINCT j.id) AS jobs, count(a.id) AS applications "
        "FROM jobs j LEFT JOIN companies c ON lower(c.name) = lower(j.company) "
        "LEFT JOIN applications a ON a.job_id = j.id AND a.applied_at >= :start AND a.applied_at < :end "
        "WHERE j.created_at >= :start AND j.created_at < :end GROUP BY 1 ORDER BY 2 DESC", start=start, end=end)


@analytics_bp.get("/seeker")
@jwt_required()
def seeker():
    start, end, err = _range()
    if err:
        return err
    uid = _uid()
    sw = {r["action"]: r["n"] for r in _rows(
        "SELECT action, count(*) AS n FROM swipes WHERE user_id = :u GROUP BY action", u=uid)}
    saved = _rows("SELECT count(*) AS n FROM saved_jobs WHERE user_id = :u", u=uid)[0]["n"]
    status_counts = {r["status"]: r["n"] for r in _rows(
        "SELECT status, count(*) AS n FROM applications WHERE user_id = :u GROUP BY status", u=uid)}
    by_day = _rows("SELECT date(applied_at) AS day, count(*) AS n FROM applications WHERE user_id = :u "
                   "AND applied_at >= :s AND applied_at < :e GROUP BY 1", u=uid, s=start, e=end)
    resumes = _rows(
        "SELECT r.id AS resume_id, r.filename, r.created_at, r.ats_score, count(a.id) AS applications, "
        "count(a.id) FILTER (WHERE a.status = ANY(:prog)) AS shortlisted_or_better, "
        "count(a.id) FILTER (WHERE a.status = ANY(:itv)) AS interviews, "
        "count(a.id) FILTER (WHERE a.status = 'Rejected') AS rejected "
        "FROM resumes r LEFT JOIN applications a ON a.resume_id = r.id AND a.user_id = r.user_id "
        "WHERE r.user_id = :u GROUP BY r.id ORDER BY r.id DESC", u=uid, prog=list(PROGRESSED), itv=list(INTERVIEWED))
    for r in resumes:
        r["created_at"] = r["created_at"].isoformat() if r["created_at"] else None
        r["shortlist_rate"] = round(100 * r["shortlisted_or_better"] / r["applications"], 1) if r["applications"] else None
    total_apps = sum(status_counts.values())
    return {
        "success": True, "range": {"from": start.date().isoformat(), "to": (end - timedelta(days=1)).date().isoformat()},
        "totals": {"applications": total_apps, "saved": saved, "swiped_right": sw.get("RIGHT", 0),
                   "swiped_left": sw.get("LEFT", 0)},
        "status_counts": status_counts,
        "funnel": _funnel(status_counts),
        "applications_by_day": _series(by_day, start, end),
        "resume_performance": resumes,
    }, 200


@analytics_bp.get("/recruiter")
@jwt_required()
def recruiter():
    if get_jwt().get("role") != "RECRUITER":
        return {"success": False, "message": "Only recruiters can view recruiter analytics"}, 403
    start, end, err = _range()
    if err:
        return err
    rid = _uid()
    jobs = Job.query.filter_by(recruiter_id=rid).order_by(Job.id.desc()).all()
    counts = competition.applicant_counts([j.id for j in jobs])
    levels = competition.level_of_jobs(jobs)
    per_job = [{"job_id": j.id, "title": j.title, "company": j.company, "status": j.status,
                "applicants": counts.get(j.id, 0), "competition_level": levels[j.id]} for j in jobs]
    per_job.sort(key=lambda x: -x["applicants"])
    status_counts = {r["status"]: r["n"] for r in _rows(
        "SELECT a.status, count(*) AS n FROM applications a JOIN jobs j ON j.id = a.job_id "
        "WHERE j.recruiter_id = :r GROUP BY a.status", r=rid)}
    by_day = _rows("SELECT date(a.applied_at) AS day, count(*) AS n FROM applications a JOIN jobs j ON j.id = a.job_id "
                   "WHERE j.recruiter_id = :r AND a.applied_at >= :s AND a.applied_at < :e GROUP BY 1",
                   r=rid, s=start, e=end)
    top_skills = _rows(
        "SELECT s AS skill, count(*) AS n FROM applications a JOIN jobs j ON j.id = a.job_id "
        "JOIN users u ON u.id = a.user_id, jsonb_array_elements_text(u.skills::jsonb) AS s "
        "WHERE j.recruiter_id = :r GROUP BY s ORDER BY n DESC, s LIMIT 10", r=rid)
    return {
        "success": True, "range": {"from": start.date().isoformat(), "to": (end - timedelta(days=1)).date().isoformat()},
        "totals": {"jobs": len(jobs), "active_jobs": sum(1 for j in jobs if (j.status or "Active") == "Active"),
                   "applicants": sum(status_counts.values())},
        "applicants_per_job": per_job[:15],
        "status_counts": status_counts, "funnel": _funnel(status_counts),
        "applications_by_day": _series(by_day, start, end),
        "top_applicant_skills": top_skills,
    }, 200


@analytics_bp.get("/admin")
@jwt_required()
def admin():
    if get_jwt().get("role") != "ADMIN":
        return {"success": False, "message": "Only admins can view platform analytics"}, 403
    start, end, err = _range()
    if err:
        return err
    one = lambda sql, **p: _rows(sql, **p)[0]["n"]  # noqa: E731
    status_counts = {r["status"]: r["n"] for r in _rows("SELECT status, count(*) AS n FROM applications GROUP BY status")}
    return {
        "success": True, "range": {"from": start.date().isoformat(), "to": (end - timedelta(days=1)).date().isoformat()},
        "totals": {"users": one("SELECT count(*) AS n FROM users"), "jobs": one("SELECT count(*) AS n FROM jobs"),
                   "active_jobs": one("SELECT count(*) AS n FROM jobs WHERE lower(coalesce(status,'Active')) = 'active'"),
                   "applications": sum(status_counts.values()), "resumes": one("SELECT count(*) AS n FROM resumes")},
        "users_by_role": {r["role"]: r["n"] for r in _rows("SELECT role, count(*) AS n FROM users GROUP BY role")},
        "status_counts": status_counts, "funnel": _funnel(status_counts),
        "signups_by_day": _series(_rows("SELECT date(created_at) AS day, count(*) AS n FROM users WHERE created_at >= :s "
                                        "AND created_at < :e GROUP BY 1", s=start, e=end), start, end),
        "jobs_by_day": _series(_rows("SELECT date(created_at) AS day, count(*) AS n FROM jobs WHERE created_at >= :s "
                                     "AND created_at < :e GROUP BY 1", s=start, e=end), start, end),
        "applications_by_day": _series(_rows("SELECT date(applied_at) AS day, count(*) AS n FROM applications "
                                             "WHERE applied_at >= :s AND applied_at < :e GROUP BY 1", s=start, e=end),
                                       start, end),
        "top_skills": _skills_demand(10),
        "company_type_activity": _company_type_activity(start, end),
    }, 200


@analytics_bp.get("/trends")
@jwt_required()
def trends():
    start, end, err = _range()
    if err:
        return err
    jobs_by_day = _rows("SELECT date(created_at) AS day, count(*) AS n FROM jobs WHERE created_at >= :s AND created_at < :e "
                        "GROUP BY 1", s=start, e=end)
    return {
        "success": True, "range": {"from": start.date().isoformat(), "to": (end - timedelta(days=1)).date().isoformat()},
        "jobs_posted_by_day": _series(jobs_by_day, start, end),
        "top_skills": _skills_demand(12, start, end),
        "company_type_activity": _company_type_activity(start, end),
    }, 200
