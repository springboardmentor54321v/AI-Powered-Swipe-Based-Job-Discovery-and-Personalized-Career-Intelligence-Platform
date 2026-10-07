import sys
import os
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from insights_and_trends import HiringTrendsAndInsightsEngine

def run_m4_day3_demo():
    print("=" * 65)
    print("   SWIPEX MILESTONE 4 - DAY 3 DEMO (INTERN 4: AI/ML)")
    print("   Domain: Hiring-Trend Data & Alert Volume Anti-Spam Tuning")
    print("=" * 65)

    engine = HiringTrendsAndInsightsEngine()

    sample_market_jobs = [
        {"job_id": 1, "job_title": "AI Dev", "company_type": "Startup", "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"]},
        {"job_id": 2, "job_title": "ML Engineer", "company_type": "Startup", "required_skills": ["Python", "PyTorch", "Docker", "ChromaDB"]},
        {"job_id": 3, "job_title": "Backend Eng", "company_type": "MNC", "required_skills": ["Python", "FastAPI", "PostgreSQL", "SQL"]},
        {"job_id": 4, "job_title": "DevOps Engineer", "company_type": "Startup", "required_skills": ["Docker", "Kubernetes", "Git"]}
    ]

    # 1. Generate Hiring Trends (Day 3 Task)
    print("\n--- [TASK 1] Hiring-Trend Data Visualization ---")
    trends = engine.generate_hiring_trends(sample_market_jobs)
    print(json.dumps(trends, indent=2))

    # 2. Tune Alert Volume (Day 3 Anti-Spam Tuning)
    print("\n--- [TASK 2] Alert Volume Anti-Spam Volume Tuning ---")
    raw_alerts = [
        {"alert_type": "low_competition", "priority": "MEDIUM", "title": "Low Competition"},
        {"alert_type": "high_match", "priority": "HIGH", "title": "High Match (85%)"},
        {"alert_type": "startup_hiring", "priority": "MEDIUM", "title": "Startup Hiring"},
        {"alert_type": "instant_job", "priority": "HIGH", "title": "Instant Job Alert"}
    ]

    tuned_alerts = engine.tune_alert_volume_to_avoid_spam(raw_alerts, max_alerts_per_batch=2)
    print("Filtered & Prioritized Alerts (Max 2 per batch):")
    print(json.dumps(tuned_alerts, indent=2))

    print("\n" + "=" * 65)
    print("SUCCESS: Milestone 4 Day 3 Execution Complete!")
    print("=" * 65)

if __name__ == "__main__":
    run_m4_day3_demo()
