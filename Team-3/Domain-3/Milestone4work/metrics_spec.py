from typing import Dict, List, Any

class CareerIntelligenceMetricsEngine:
    """
    Milestone 4 - Day 1 & Day 2: Analytics & Career Intelligence Metrics Engine.
    Defines specs and computations for:
    1. Skill-Gap Analysis: Identifies skills demanded by target market/jobs but absent in candidate resume.
    2. Resume Performance Tracking: Tracks views, applies, shortlists, and interview rates per resume version.
    3. Recommendation Insights: Explains WHY a job was recommended (e.g. 70% skill match + 20% right-swipe boost).
    4. Hiring-Trend Visualization: Aggregates top in-demand skills and hiring activity (Startup vs MNC).
    """

    def compute_skill_gap(self, candidate_skills: List[str], target_jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        candidate_set = {s.lower().strip() for s in candidate_skills}
        market_skill_counts = {}

        total_target_jobs = len(target_jobs)
        for job in target_jobs:
            for skill in job.get("required_skills", []):
                s_clean = skill.strip()
                s_lower = s_clean.lower()
                market_skill_counts[s_clean] = market_skill_counts.get(s_clean, 0) + 1

        missing_skills_frequency = {}
        for skill_name, count in market_skill_counts.items():
            if skill_name.lower() not in candidate_set:
                demand_pct = (count / total_target_jobs * 100) if total_target_jobs > 0 else 0.0
                missing_skills_frequency[skill_name] = round(demand_pct, 1)

        # Sort missing skills by market demand percentage descending
        sorted_gaps = dict(sorted(missing_skills_frequency.items(), key=lambda item: item[1], reverse=True))

        return {
            "candidate_skills_count": len(candidate_skills),
            "target_jobs_analyzed": total_target_jobs,
            "top_skill_gaps": sorted_gaps,
            "primary_gap_to_learn": list(sorted_gaps.keys())[0] if sorted_gaps else None
        }

    def compute_resume_performance(self, resume_version_id: str, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        views = sum(1 for e in events if e.get("event_type") == "view")
        applies = sum(1 for e in events if e.get("event_type") == "apply")
        shortlists = sum(1 for e in events if e.get("event_type") == "shortlist")
        interviews = sum(1 for e in events if e.get("event_type") == "interview")

        apply_conversion_rate = (applies / views * 100) if views > 0 else 0.0
        shortlist_rate = (shortlists / applies * 100) if applies > 0 else 0.0
        interview_rate = (interviews / shortlists * 100) if shortlists > 0 else 0.0

        return {
            "resume_version_id": resume_version_id,
            "total_views": views,
            "total_applies": applies,
            "total_shortlists": shortlists,
            "total_interviews": interviews,
            "apply_conversion_rate_pct": round(apply_conversion_rate, 2),
            "shortlist_rate_pct": round(shortlist_rate, 2),
            "interview_conversion_rate_pct": round(interview_rate, 2)
        }

    def generate_recommendation_insights(self, candidate_skills: List[str], job: Dict[str, Any], swipe_boost: float = 0.0) -> Dict[str, Any]:
        job_skills = job.get("required_skills", [])
        resume_set = {s.lower().strip() for s in candidate_skills}
        
        matching_skills = [s for s in job_skills if s.lower().strip() in resume_set]
        missing_skills = [s for s in job_skills if s.lower().strip() not in resume_set]

        reasons = []
        if matching_skills:
            reasons.append(f"Matches {len(matching_skills)} of your core skills ({', '.join(matching_skills[:3])}).")
        if swipe_boost > 0:
            reasons.append("Boosted because you swiped right on similar roles previously.")
        if job.get("company_type") == "Startup":
            reasons.append("Fast-growing startup hiring actively.")
        if job.get("applicant_count", 99) < 10:
            reasons.append("Low competition opportunity (< 10 applicants).")

        return {
            "job_id": job.get("job_id"),
            "job_title": job.get("job_title"),
            "company": job.get("company"),
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "recommendation_reasons": reasons
        }
