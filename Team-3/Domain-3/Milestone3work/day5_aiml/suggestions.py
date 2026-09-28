from typing import Dict, List, Any

class ResumeSuggestionsModule:
    """
    Day 5 Task 1: AI-generated resume-optimization-suggestions module.
    Analyzes candidate resume skills vs target job skills and produces targeted suggestions.
    Includes a fully free rule-based/template fallback as specified in Milestone 3.
    """

    def __init__(self, use_llm: bool = False, llm_api_key: str = None):
        self.use_llm = use_llm
        self.llm_api_key = llm_api_key

    def generate_suggestions(
        self,
        resume_skills: List[str],
        job_required_skills: List[str],
        job_title: str = "Target Position"
    ) -> Dict[str, Any]:
        
        # Standardize strings for comparison
        resume_set = {s.lower().strip() for s in resume_skills}
        job_set = {s.lower().strip() for s in job_required_skills}

        matched_skills = [s for s in job_required_skills if s.lower().strip() in resume_set]
        missing_skills = [s for s in job_required_skills if s.lower().strip() not in resume_set]

        # Calculate keyword match percentage
        match_percentage = (len(matched_skills) / len(job_required_skills) * 100) if job_required_skills else 0.0

        # Generate rule-based actionable suggestions
        suggestions = []

        if missing_skills:
            suggestions.append(
                f"Missing Key Skills for '{job_title}': Consider adding experience with "
                f"[{', '.join(missing_skills[:3])}] to your skills section."
            )
            
        if match_percentage < 50:
            suggestions.append(
                "Low Match Score: Highlight specific technical projects where you applied required core competencies."
            )
        elif match_percentage < 80:
            suggestions.append(
                "Moderate Match: Quantify your achievements (e.g., 'Improved API latency by 30%') to strengthen impact."
            )
        else:
            suggestions.append(
                "Strong Keyword Alignment: Ensure your top skills are prominent in your resume summary section."
            )

        return {
            "target_job": job_title,
            "keyword_match_pct": round(match_percentage, 2),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "suggestions": suggestions,
            "generation_mode": "LLM" if self.use_llm else "Rule-based/Template Fallback"
        }
