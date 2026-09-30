"""
Milestone 2 heuristic Matching Engine.

This service intentionally uses simple rule-based scoring.  It reads the live
Job and Swipe services through the internal Docker network; it is not the
trained AI/ML model planned for Milestone 3.
"""

import os
from datetime import datetime, timezone
from typing import Annotated, Any

import httpx
from fastapi import FastAPI, Header, HTTPException, Query, status

app = FastAPI(title="SwipeX Matching Engine", version="0.1.0")

JOB_SERVICE_URL = os.getenv("JOB_SERVICE_URL", "http://job-service:8000").rstrip("/")
DEFAULT_SKILLS = {"python", "sql", "django", "docker"}
DEFAULT_LOCATION = "hyderabad"


def competition_level(applicant_count: int) -> str:
    if applicant_count < 50:
        return "Low"
    if applicant_count < 100:
        return "Medium"
    return "High"


def days_since_posted(value: str | None) -> int:
    if not value:
        return 999
    try:
        posted = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return max(0, (datetime.now(timezone.utc) - posted).days)
    except ValueError:
        return 999


def skill_set(job: dict[str, Any]) -> set[str]:
    return {str(item).strip().lower() for item in job.get("skills", []) if str(item).strip()}


def profile_for_request(skills: str | None, location: str | None) -> tuple[set[str], str]:
    requested_skills = {item.strip().lower() for item in (skills or "").split(",") if item.strip()}
    return requested_skills or DEFAULT_SKILLS, (location or DEFAULT_LOCATION).strip().lower()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "matching-engine"}


@app.get("/api/v1/recommendations")
async def recommendations(
    user_id: str | None = Query(None),
    skills: str | None = Query(None),
    location: str | None = Query(None),
    x_user_id: Annotated[str | None, Header()] = None,
) -> dict[str, Any]:
    """Return ranked jobs using live jobs and the authenticated user's swipe history."""
    if not x_user_id or not x_user_id.isdigit():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Trusted user identity is required")
    if user_id and user_id != x_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can request recommendations only for yourself")

    headers = {"X-User-Id": x_user_id}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            jobs_response, history_response = await client.get(
                f"{JOB_SERVICE_URL}/api/v1/jobs"
            ), await client.get(
                f"{JOB_SERVICE_URL}/api/v1/swipes/history", headers=headers
            )
            jobs_response.raise_for_status()
            history_response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Job/Swipe Service is unavailable") from exc

    jobs = jobs_response.json()
    history = history_response.json()
    skipped_ids = {str(item.get("job_id")) for item in history if item.get("direction") == "left"}
    liked_ids = {str(item.get("job_id")) for item in history if item.get("direction") == "right"}
    jobs_by_id = {str(job.get("job_id")): job for job in jobs}
    liked_skills = set().union(*(skill_set(jobs_by_id[job_id]) for job_id in liked_ids if job_id in jobs_by_id))
    user_skills, preferred_location = profile_for_request(skills, location)

    ranked: list[dict[str, Any]] = []
    for job in jobs:
        job_id = str(job.get("job_id"))
        if job_id in skipped_ids:
            continue
        job_skills = skill_set(job)
        overlap = len(user_skills & job_skills) / max(1, len(job_skills))
        location_fit = 1.0 if job.get("remote") or str(job.get("location", "")).lower() == preferred_location else 0.0
        preference_fit = len(liked_skills & job_skills) / max(1, len(job_skills)) if liked_skills else 0.5
        score = round((overlap * 55 + location_fit * 20 + preference_fit * 25), 2)
        tags: list[str] = []
        if overlap >= 0.4:
            tags.append("Matches your skills")
        if location_fit:
            tags.append("Remote friendly" if job.get("remote") else "Matches your location")
        if liked_skills and preference_fit >= 0.3:
            tags.append("Similar to jobs you liked")
        level = competition_level(int(job.get("applicant_count", 0)))
        if level == "Low":
            tags.append("Low competition")
        if days_since_posted(job.get("posted_at")) <= 2:
            tags.append("Recently posted")
        ranked.append({
            "job_id": job.get("job_id"),
            "title": job.get("title"),
            "company": job.get("company"),
            "match_percentage": score,
            "reason_tags": tags or ["General match"],
            "competition_level": level,
        })

    ranked.sort(key=lambda item: item["match_percentage"], reverse=True)
    return {"recommendations": ranked, "generated_by": "heuristic-v0"}
