"""
SwipeX - Matching Engine (Milestone 2)
Owner: Intern 4 - AI/ML Career Intelligence

Purpose:
    Heuristic (rule-based) job recommendation service.
    Scores jobs for a user using profile fit + swipe history.
    This is NOT a trained AI/ML model - that comes in Milestone 3.

Run locally:
    uvicorn matching_engine:app --reload --port 8004

Endpoint:
    GET /api/v1/recommendations?user_id=<id>
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum

app = FastAPI(title="SwipeX Matching Engine", version="0.1.0")


# ---------------------------------------------------------------------------
# 1. Data Models
# ---------------------------------------------------------------------------

class SwipeAction(str, Enum):
    LIKE = "like"     # right swipe / apply / save
    SKIP = "skip"      # left swipe


class Job(BaseModel):
    job_id: str
    title: str
    company: str
    location: str
    skills: List[str]
    experience_required: int          # in years
    competition_level: str            # "Low" / "Medium" / "High"
    posted_days_ago: int


class UserProfile(BaseModel):
    user_id: str
    skills: List[str]
    location: str
    experience_years: int


class RecommendationResult(BaseModel):
    job_id: str
    match_score: float
    reason_tags: List[str]


# ---------------------------------------------------------------------------
# 2. Mock / Seed Data (stand-in until Intern 3 / Intern 2 APIs are live)
#    Once the real Job Service (Intern 2) and Swipe Service are pushed to
#    GitHub, replace get_seed_jobs() / get_user_profile() / get_swipe_history()
#    with real API calls (via requests/httpx) instead of these mocks.
# ---------------------------------------------------------------------------

def get_seed_jobs() -> List[Job]:
    return [
        Job(job_id="J001", title="Backend Developer", company="Acme Corp",
            location="Hyderabad", skills=["Python", "Django", "SQL"],
            experience_required=1, competition_level="Medium", posted_days_ago=2),
        Job(job_id="J002", title="Frontend Developer", company="Nimbus Startup",
            location="Bangalore", skills=["React", "JavaScript", "CSS"],
            experience_required=0, competition_level="Low", posted_days_ago=1),
        Job(job_id="J003", title="Data Analyst", company="Global MNC",
            location="Hyderabad", skills=["SQL", "Excel", "Python"],
            experience_required=2, competition_level="High", posted_days_ago=10),
        Job(job_id="J004", title="ML Intern", company="NewFound AI",
            location="Remote", skills=["Python", "Pandas", "NumPy"],
            experience_required=0, competition_level="Low", posted_days_ago=3),
    ]


def get_user_profile(user_id: str) -> UserProfile:
    # Mock profile - replace with a real Profile Service / DB call later
    return UserProfile(
        user_id=user_id,
        skills=["Python", "SQL", "Django"],
        location="Hyderabad",
        experience_years=1,
    )


def get_swipe_history(user_id: str) -> Dict[str, SwipeAction]:
    # Mock swipe history: job_id -> action
    # Replace with a real call to Intern 2's Swipe Service once available
    return {
        "J003": SwipeAction.SKIP,   # user skipped a high-competition job
        "J004": SwipeAction.LIKE,   # user liked a Python/ML job
    }


# ---------------------------------------------------------------------------
# 3. Scoring Logic (heuristic formula v0, tuned on Day 4)
# ---------------------------------------------------------------------------

WEIGHTS = {
    "skills": 0.4,
    "location": 0.2,
    "experience": 0.2,
    "swipe_history": 0.2,
}


def score_skills(user: UserProfile, job: Job) -> float:
    if not job.skills:
        return 0.0
    overlap = set(s.lower() for s in user.skills) & set(s.lower() for s in job.skills)
    return len(overlap) / len(job.skills)


def score_location(user: UserProfile, job: Job) -> float:
    if job.location.lower() == "remote":
        return 1.0
    return 1.0 if user.location.lower() == job.location.lower() else 0.0


def score_experience(user: UserProfile, job: Job) -> float:
    diff = user.experience_years - job.experience_required
    if diff < 0:
        # Under-qualified: reduce score based on the gap
        return max(0.0, 1.0 + diff * 0.5)
    # Over-qualified is fine, slight taper for large gaps
    return max(0.3, 1.0 - diff * 0.05)


def score_swipe_history(job: Job, history: Dict[str, SwipeAction]) -> float:
    """
    Adjusts score using the user's past swipe behaviour (Day 3 requirement).
    Since we don't have this exact job in history most of the time, we use
    it to nudge scores for jobs sharing traits with liked/skipped jobs.
    """
    action = history.get(job.job_id)
    if action == SwipeAction.LIKE:
        return 1.0
    if action == SwipeAction.SKIP:
        return 0.0
    return 0.5  # neutral - no prior signal


def build_reason_tags(user: UserProfile, job: Job, s_skills: float,
                       s_location: float, s_experience: float) -> List[str]:
    tags = []
    if s_skills >= 0.5:
        tags.append("Matches your skills")
    if s_location == 1.0:
        tags.append("Near your location" if job.location.lower() != "remote" else "Remote friendly")
    if job.competition_level == "Low":
        tags.append("Low competition")
    if job.posted_days_ago <= 2:
        tags.append("Recently posted")
    if s_experience >= 0.9:
        tags.append("Good experience fit")
    if not tags:
        tags.append("General match")
    return tags


def calculate_match_score(user: UserProfile, job: Job,
                           history: Dict[str, SwipeAction]) -> RecommendationResult:
    s_skills = score_skills(user, job)
    s_location = score_location(user, job)
    s_experience = score_experience(user, job)
    s_history = score_swipe_history(job, history)

    total = (
        s_skills * WEIGHTS["skills"]
        + s_location * WEIGHTS["location"]
        + s_experience * WEIGHTS["experience"]
        + s_history * WEIGHTS["swipe_history"]
    )
    match_score = round(total * 100, 2)  # percentage, 0-100

    reason_tags = build_reason_tags(user, job, s_skills, s_location, s_experience)

    return RecommendationResult(job_id=job.job_id, match_score=match_score, reason_tags=reason_tags)


def rank_jobs_for_user(user_id: str) -> List[RecommendationResult]:
    user = get_user_profile(user_id)
    history = get_swipe_history(user_id)
    jobs = get_seed_jobs()

    # Bug fix (Day 6): skip jobs the user already swiped LEFT (skip) on -
    # QA flagged that skipped jobs were still showing up in the feed.
    active_jobs = [j for j in jobs if history.get(j.job_id) != SwipeAction.SKIP]

    results = [calculate_match_score(user, job, history) for job in active_jobs]
    results.sort(key=lambda r: r.match_score, reverse=True)
    return results


# ---------------------------------------------------------------------------
# 4. API Endpoint
# ---------------------------------------------------------------------------

@app.get("/api/v1/recommendations", response_model=List[RecommendationResult])
def get_recommendations(user_id: str = Query(..., description="ID of the user to recommend jobs for")):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    return rank_jobs_for_user(user_id)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "matching-engine"}
