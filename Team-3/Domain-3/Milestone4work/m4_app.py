import sys
import os
import json
from typing import List, Dict, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Robust sys.path setup
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from alert_rules import AlertRulesEngine
from metrics_spec import CareerIntelligenceMetricsEngine
from alert_trigger_service import AlertTriggerService
from insights_and_trends import HiringTrendsAndInsightsEngine

app = FastAPI(
    title="SwipeX Milestone 4 AI/ML Intelligence API (Intern 4)",
    description="Interactive Live Service for Smart Notification Alerts, Skill-Gap Analytics, Recommendation Insights & Hiring Trends.",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Engines
trigger_service = AlertTriggerService(match_threshold=75.0)
trends_engine = HiringTrendsAndInsightsEngine()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "milestone": "Milestone 4 - Final Production Increment",
        "service": "Domain 4 - Smart Alerts & Analytics Intelligence API",
        "swagger_docs": "http://127.0.0.1:8000/docs",
        "intern_role": "Intern 4 (AI/ML)"
    }

# 1. ENDPOINT 1: Evaluate Smart Alert Triggers (Day 1 & Day 2)
@app.post("/api/v1/ai/m4/evaluate-alerts", summary="Evaluate Job for Smart Notification Alerts")
def evaluate_alerts(
    user_id: str = Query("usr_789"),
    job_title: str = Query("AI Backend Developer"),
    company: str = Query("FastTech AI"),
    company_type: str = Query("Startup"),
    applicant_count: int = Query(6),
    ai_match_score: float = Query(82.5),
    is_recently_posted: bool = Query(True)
):
    candidate = {
        "user_id": user_id,
        "skills": ["Python", "FastAPI", "Git"],
        "swiped_right_job_ids": [501]
    }
    job = {
        "job_id": 501,
        "job_title": job_title,
        "company": company,
        "company_type": company_type,
        "applicant_count": applicant_count,
        "is_recently_posted": is_recently_posted,
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"]
    }
    return trigger_service.process_job_for_alerts(candidate, job, ai_match_score)

# 2. ENDPOINT 2: Skill-Gap Analysis & Dashboard Analytics (Day 2)
@app.post("/api/v1/ai/m4/skill-gap-analysis", summary="Compute Skill-Gap Analysis for Candidate")
def compute_skill_gap(
    candidate_skills: List[str] = Query(["Python", "FastAPI", "Git"])
):
    candidate = {"user_id": "usr_789", "skills": candidate_skills, "resume_version_id": "v2.1"}
    target_jobs = [
        {"job_id": 1, "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"]},
        {"job_id": 2, "required_skills": ["Python", "FastAPI", "Docker", "Kubernetes"]},
        {"job_id": 3, "required_skills": ["Python", "FastAPI", "PostgreSQL", "ChromaDB"]}
    ]
    events = [
        {"event_type": "view"}, {"event_type": "view"}, {"event_type": "apply"}, {"event_type": "shortlist"}
    ]
    return trigger_service.compute_candidate_analytics(candidate, target_jobs, events)

# 3. ENDPOINT 3: Hiring Trends & Market Skill Demand (Day 3)
@app.get("/api/v1/ai/m4/hiring-trends", summary="Get Hiring Trends & In-Demand Market Skills")
def get_hiring_trends():
    market_jobs = [
        {"job_id": 1, "company_type": "Startup", "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"]},
        {"job_id": 2, "company_type": "Startup", "required_skills": ["Python", "PyTorch", "Docker", "ChromaDB"]},
        {"job_id": 3, "company_type": "MNC", "required_skills": ["Python", "FastAPI", "PostgreSQL", "SQL"]},
        {"job_id": 4, "company_type": "Startup", "required_skills": ["Docker", "Kubernetes", "Git"]}
    ]
    return trends_engine.generate_hiring_trends(market_jobs)

if __name__ == "__main__":
    print("🚀 Starting SwipeX Milestone 4 AI/ML FastAPI Server on http://127.0.0.1:8000/docs...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
