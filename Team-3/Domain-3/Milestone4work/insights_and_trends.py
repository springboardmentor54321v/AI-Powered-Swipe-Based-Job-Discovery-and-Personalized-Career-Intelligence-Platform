import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from typing import Dict, List, Any

class HiringTrendsAndInsightsEngine:
    """
    Milestone 4 - Day 3: Recommendation Insights & Hiring-Trend Data Visualization Module.
    Outputs:
    1. Recommendation Insights: Detailed breakdown of why a job was recommended & swipe behavior summary.
    2. Hiring-Trend Data: Top in-demand skills in candidate domain, startup vs MNC hiring activity.
    3. Alert Frequency & Volume Tuning: Prevents alert spam by enforcing frequency caps per user.
    """

    def generate_hiring_trends(self, market_jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_jobs = len(market_jobs)
        skill_counts = {}
        startup_count = 0
        mnc_count = 0

        for job in market_jobs:
            # Aggregate skills
            for skill in job.get("required_skills", []):
                s_clean = skill.strip()
                skill_counts[s_clean] = skill_counts.get(s_clean, 0) + 1

            # Company Type Aggregation
            c_type = job.get("company_type", "").lower()
            if c_type == "startup" or job.get("is_startup", False):
                startup_count += 1
            else:
                mnc_count += 1

        sorted_skills = dict(sorted(skill_counts.items(), key=lambda item: item[1], reverse=True))
        
        # Calculate percentage demand
        top_in_demand_skills = [
            {
                "skill": skill,
                "demand_count": count,
                "market_percentage": round((count / total_jobs * 100), 1) if total_jobs > 0 else 0.0
            }
            for skill, count in list(sorted_skills.items())[:5]
        ]

        return {
            "total_jobs_analyzed": total_jobs,
            "top_in_demand_skills": top_in_demand_skills,
            "hiring_activity_by_company_type": {
                "startup_jobs": startup_count,
                "mnc_jobs": mnc_count,
                "startup_share_pct": round((startup_count / total_jobs * 100), 1) if total_jobs > 0 else 0.0,
                "mnc_share_pct": round((mnc_count / total_jobs * 100), 1) if total_jobs > 0 else 0.0
            }
        }

    def tune_alert_volume_to_avoid_spam(
        self,
        triggered_alerts: List[Dict[str, Any]],
        max_alerts_per_batch: int = 2
    ) -> List[Dict[str, Any]]:
        """
        Day 3 Tuning Requirement: Filters and prioritizes alerts to prevent user alert spam.
        High Priority alerts (High Match, Instant Job) are prioritized over Medium Priority.
        """
        priority_map = {"HIGH": 1, "MEDIUM": 2, "LOW": 3}
        sorted_alerts = sorted(triggered_alerts, key=lambda a: priority_map.get(a.get("priority", "LOW"), 3))
        
        return sorted_alerts[:max_alerts_per_batch]
