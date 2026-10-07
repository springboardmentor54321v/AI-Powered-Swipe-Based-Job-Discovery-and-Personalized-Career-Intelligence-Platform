import sys
import os

# Insert path at line 1 before imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from typing import Dict, List, Any
from alert_rules import AlertRulesEngine
from metrics_spec import CareerIntelligenceMetricsEngine

class AlertTriggerService:
    """
    Milestone 4 - Day 2: Alert-Trigger Service & Skill-Gap Computation Service.
    Reuses Milestone 3 ATS match scores to evaluate alert conditions for candidate jobs.
    Integrates with Intern 2 (Backend) by outputting alert trigger events ready for WebSocket/Redis PubSub notification queues.
    """

    def __init__(self, match_threshold: float = 75.0):
        self.alert_rules = AlertRulesEngine(default_match_threshold=match_threshold)
        self.metrics_engine = CareerIntelligenceMetricsEngine()

    def process_job_for_alerts(
        self,
        candidate_profile: Dict[str, Any],
        job: Dict[str, Any],
        ats_match_score: float
    ) -> Dict[str, Any]:
        """
        Evaluates a job listing against candidate profile and ATS match score.
        Returns triggered alert payloads and recommendation insights.
        """
        user_override = candidate_profile.get("alert_match_threshold_override")
        
        # 1. Trigger Alert Evaluation
        triggered_alerts = self.alert_rules.evaluate_alert_triggers(
            user_profile=candidate_profile,
            job_data=job,
            ai_match_score=ats_match_score,
            user_threshold_override=user_override
        )

        # 2. Compute Recommendation Insights ("Why Recommended")
        swipe_boost = 0.20 if job.get("job_id") in candidate_profile.get("swiped_right_job_ids", []) else 0.0
        insights = self.metrics_engine.generate_recommendation_insights(
            candidate_skills=candidate_profile.get("skills", []),
            job=job,
            swipe_boost=swipe_boost
        )

        return {
            "user_id": candidate_profile.get("user_id"),
            "job_id": job.get("job_id"),
            "ats_match_score": round(ats_match_score, 1),
            "alerts_triggered_count": len(triggered_alerts),
            "triggered_alerts": triggered_alerts,
            "recommendation_insights": insights
        }

    def compute_candidate_analytics(
        self,
        candidate_profile: Dict[str, Any],
        target_jobs: List[Dict[str, Any]],
        application_events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Computes skill gap analysis and resume performance metrics for user dashboards.
        """
        candidate_skills = candidate_profile.get("skills", [])
        resume_version_id = candidate_profile.get("resume_version_id", "v1.0")

        skill_gap_report = self.metrics_engine.compute_skill_gap(candidate_skills, target_jobs)
        resume_perf_report = self.metrics_engine.compute_resume_performance(resume_version_id, application_events)

        return {
            "user_id": candidate_profile.get("user_id"),
            "skill_gap_analysis": skill_gap_report,
            "resume_performance": resume_perf_report
        }
