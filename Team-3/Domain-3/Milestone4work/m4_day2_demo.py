import sys
import os
import json

# Ensure current directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from alert_trigger_service import AlertTriggerService

def run_m4_day2_demo():
    print("=" * 65)
    print("   SWIPEX MILESTONE 4 - DAY 2 DEMO (INTERN 4: AI/ML)")
    print("   Domain: Alert-Trigger Service & Skill-Gap Analytics Module")
    print("=" * 65)

    service = AlertTriggerService(match_threshold=75.0)

    # Candidate Profile & Target Jobs
    candidate_profile = {
        "user_id": "usr_789",
        "resume_version_id": "resume_v2.1",
        "skills": ["Python", "FastAPI", "Git"],
        "swiped_right_job_ids": [501],
        "alert_match_threshold_override": 70.0
    }

    sample_job = {
        "job_id": 501,
        "job_title": "Senior AI Software Engineer",
        "company": "FastTech AI",
        "company_type": "Startup",
        "applicant_count": 6,
        "is_recently_posted": True,
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"]
    }

    ats_match_score = 75.0

    # 1. Process Job for Alerts (Day 2 Main Requirement)
    print("\n--- [TASK 1] Alert-Trigger Service Processing ---")
    alert_result = service.process_job_for_alerts(
        candidate_profile=candidate_profile,
        job=sample_job,
        ats_match_score=ats_match_score
    )
    print(json.dumps(alert_result, indent=2))

    # 2. Candidate Dashboard Analytics (Skill-Gap + Resume Performance)
    print("\n--- [TASK 2] Candidate Dashboard Analytics Computation ---")
    target_jobs = [
        {"job_id": 1, "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"]},
        {"job_id": 2, "required_skills": ["Python", "FastAPI", "Docker", "Kubernetes"]},
        {"job_id": 3, "required_skills": ["Python", "FastAPI", "PostgreSQL", "ChromaDB"]}
    ]

    mock_events = [
        {"event_type": "view"}, {"event_type": "view"}, {"event_type": "view"}, {"event_type": "view"},
        {"event_type": "apply"}, {"event_type": "apply"},
        {"event_type": "shortlist"},
        {"event_type": "interview"}
    ]

    analytics_result = service.compute_candidate_analytics(
        candidate_profile=candidate_profile,
        target_jobs=target_jobs,
        application_events=mock_events
    )
    print(json.dumps(analytics_result, indent=2))

    print("\n" + "=" * 65)
    print("SUCCESS: Milestone 4 Day 2 Execution Complete!")
    print("=" * 65)

if __name__ == "__main__":
    run_m4_day2_demo()
