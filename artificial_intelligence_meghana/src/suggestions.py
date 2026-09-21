"""
AI Resume Optimization Suggestion Module
Fallbacks to templates when LLM is inaccessible, per Day 5 requirements.
"""

def generate_suggestions(ats_result: dict) -> list[str]:
    """
    Generate resume optimization suggestions based on the ATS rule-based scoring results.
    Doesn't query a live LLM out of Milestone 3 bounds, utilizes template-based rule fallback.
    """
    suggestions = []
    
    if not ats_result:
        suggestions.append("Upload a valid resume and select a job to see optimization suggestions.")
        return suggestions
        
    score = ats_result.get("score", 0)
    missing_skills = ats_result.get("missing_skills", [])
    missing_keywords = ats_result.get("missing_keywords", [])
    
    # 1. Missing Skills Suggestions
    if missing_skills:
        for sk in missing_skills:
            suggestions.append(f"Consider learning or adding the skill '{sk}' to your resume to better match this job.")
            
    # 2. Missing Keywords Suggestions
    if missing_keywords:
        for kw in missing_keywords:
            suggestions.append(f"Your resume does not mention the keyword '{kw}'. Try adding it if you have relevant experience.")

    # 3. Weak ATS coverage suggestions
    if score < 50:
        suggestions.append("Your ATS score is weak (<50%). Focus on customizing your summary and experience bullet points to match the job description.")
    elif score >= 80:
        suggestions.append("Great job! Your resume has a strong keyword and skill overlap with this position.")
    
    # Fallback to avoid empty lists
    if not suggestions:
        suggestions.append("Your resume looks solid, but always remember to double-check formatting and clarity.")
        
    # Remove duplicates but preserve order
    seen = set()
    deduped = []
    for s in suggestions:
        if s not in seen:
            seen.add(s)
            deduped.append(s)
            
    return deduped
