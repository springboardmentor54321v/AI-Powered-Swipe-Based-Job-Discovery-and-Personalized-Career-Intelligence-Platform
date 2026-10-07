from typing import Dict, List, Any, Optional

class AlertRulesEngine:
    """
    Milestone 4 - Day 1: Alert Rules Definition & Trigger Intelligence.
    Defines thresholds and conditions for firing 4 types of smart notifications:
    1. High-Match Alert: AI match score above user-defined or default threshold (e.g. >= 75%)
    2. Low-Competition Alert: Job applicant count below threshold (e.g. < 10 applicants) & early applicant window
    3. Startup Hiring Alert: Job posted by a startup company tag
    4. Instant Job Alert: Recently posted job matching user target skills
    """

    def __init__(self, default_match_threshold: float = 75.0, low_competition_threshold: int = 10):
        self.default_match_threshold = default_match_threshold
        self.low_competition_threshold = low_competition_threshold

    def evaluate_alert_triggers(
        self,
        user_profile: Dict[str, Any],
        job_data: Dict[str, Any],
        ai_match_score: float,
        user_threshold_override: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        
        triggered_alerts = []
        effective_threshold = user_threshold_override if user_threshold_override is not None else self.default_match_threshold

        # 1. High-Match Alert Trigger
        if ai_match_score >= effective_threshold:
            triggered_alerts.append({
                "alert_type": "high_match",
                "priority": "HIGH",
                "title": f"High Match Alert ({round(ai_match_score, 1)}% Match)",
                "message": f"Job '{job_data.get('job_title')}' at {job_data.get('company')} matches your resume profile with {round(ai_match_score, 1)}% alignment!",
                "job_id": job_data.get("job_id"),
                "ai_score": round(ai_match_score, 1)
            })

        # 2. Low-Competition Alert Trigger
        applicant_count = job_data.get("applicant_count", 0)
        if applicant_count < self.low_competition_threshold:
            triggered_alerts.append({
                "alert_type": "low_competition",
                "priority": "MEDIUM",
                "title": "Low Competition Opportunity",
                "message": f"Be one of the first applicants for '{job_data.get('job_title')}'! Only {applicant_count} applicants so far.",
                "job_id": job_data.get("job_id"),
                "applicant_count": applicant_count
            })

        # 3. Startup Hiring Alert Trigger
        company_type = job_data.get("company_type", "").lower()
        if company_type == "startup" or job_data.get("is_startup", False):
            triggered_alerts.append({
                "alert_type": "startup_hiring",
                "priority": "MEDIUM",
                "title": "Fast-Growing Startup Alert",
                "message": f"Startup {job_data.get('company')} is actively hiring for '{job_data.get('job_title')}'.",
                "job_id": job_data.get("job_id"),
                "company": job_data.get("company")
            })

        # 4. Instant Job Alert Trigger (Newly posted within last 24h & matches skills)
        if job_data.get("is_recently_posted", False) and ai_match_score >= 60.0:
            triggered_alerts.append({
                "alert_type": "instant_job",
                "priority": "HIGH",
                "title": "Instant Job Alert",
                "message": f"Fresh job opening '{job_data.get('job_title')}' was just posted!",
                "job_id": job_data.get("job_id"),
                "posted_at": job_data.get("posted_at")
            })

        return triggered_alerts
