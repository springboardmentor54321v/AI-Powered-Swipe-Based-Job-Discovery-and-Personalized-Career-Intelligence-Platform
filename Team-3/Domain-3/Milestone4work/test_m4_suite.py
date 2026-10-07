import sys
import os
import unittest
import time

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from alert_rules import AlertRulesEngine
from metrics_spec import CareerIntelligenceMetricsEngine
from alert_trigger_service import AlertTriggerService
from insights_and_trends import HiringTrendsAndInsightsEngine

class TestMilestone4AIMLSuite(unittest.TestCase):
    """
    Milestone 4 - Day 4: Unit Testing & Production Latency Checks.
    1. Runs offline unit tests on alert rules, metrics engines, and hiring trends.
    2. Performs AI service response latency spot-check (< 50ms requirement).
    """

    def setUp(self):
        self.alert_rules = AlertRulesEngine(default_match_threshold=75.0)
        self.metrics_engine = CareerIntelligenceMetricsEngine()
        self.trigger_service = AlertTriggerService(match_threshold=75.0)
        self.trends_engine = HiringTrendsAndInsightsEngine()

    def test_high_match_alert_trigger(self):
        """Test High Match alert condition."""
        user = {"user_id": "u1"}
        job = {"job_id": 101, "job_title": "AI Engineer", "company": "Tech Corp"}
        alerts = self.alert_rules.evaluate_alert_triggers(user, job, ai_match_score=85.0)
        
        high_match_alert = next((a for a in alerts if a["alert_type"] == "high_match"), None)
        self.assertIsNotNone(high_match_alert)
        self.assertEqual(high_match_alert["priority"], "HIGH")

    def test_skill_gap_computation(self):
        """Test Skill-Gap analysis formula."""
        skills = ["Python", "FastAPI"]
        target_jobs = [
            {"required_skills": ["Python", "FastAPI", "Docker"]},
            {"required_skills": ["Python", "FastAPI", "PostgreSQL"]}
        ]
        gap = self.metrics_engine.compute_skill_gap(skills, target_jobs)
        self.assertIn("Docker", gap["top_skill_gaps"])
        self.assertIn("PostgreSQL", gap["top_skill_gaps"])

    def test_alert_volume_anti_spam_tuning(self):
        """Test alert volume filtering and prioritization."""
        raw_alerts = [
            {"alert_type": "medium_alert", "priority": "MEDIUM"},
            {"alert_type": "high_alert_1", "priority": "HIGH"},
            {"alert_type": "high_alert_2", "priority": "HIGH"}
        ]
        tuned = self.trends_engine.tune_alert_volume_to_avoid_spam(raw_alerts, max_alerts_per_batch=2)
        self.assertEqual(len(tuned), 2)
        self.assertEqual(tuned[0]["priority"], "HIGH")
        self.assertEqual(tuned[1]["priority"], "HIGH")

    def test_ai_service_response_latency(self):
        """Spot-check execution latency for production readiness (< 50ms target)."""
        start_time = time.time()
        
        user = {"user_id": "u1", "skills": ["Python", "FastAPI"]}
        job = {"job_id": 101, "job_title": "AI Engineer", "company": "Tech Corp", "required_skills": ["Python", "FastAPI", "Docker"]}
        
        self.trigger_service.process_job_for_alerts(user, job, ats_match_score=80.0)
        
        latency_ms = (time.time() - start_time) * 1000
        print(f"\n[Latency Spot-Check] AI Alert Service Processing Time: {round(latency_ms, 2)} ms")
        self.assertLess(latency_ms, 50.0)

if __name__ == "__main__":
    unittest.main()
