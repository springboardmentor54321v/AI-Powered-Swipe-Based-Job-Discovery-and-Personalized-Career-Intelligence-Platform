"""
ATS Scoring Engine v1 module for SwipeX Intern 4 AI/ML Career Intelligence Service.
Calculates keyword-match ATS score, detects missing skills/keywords deterministically.
"""

# Threshold below which missing skills/keywords are forcibly reported
ATS_MISSING_THRESHOLD = 80.0

def score_resume_against_job(resume_data: dict, job_data: dict, semantic_engine=None, config: dict=None) -> dict:
    """
    Calculate blended ATS match score and detect missing keywords/skills.
    
    :param resume_data: dict containing "skills" (list) and "text" (str, optional)
    :param job_data: dict containing "required_skills" (list) and "keywords" (list, optional)
    :param semantic_engine: Optional initialized SemanticEngine instance (Day 4)
    :param config: Optional dict of scoring weights (e.g. {"keyword_weight": 0.6, "semantic_weight": 0.4})
    :return: dict containing structured matching results.
    """
    # 1. Parsing Inputs
    resume_skills = resume_data.get("skills", [])
    resume_text = resume_data.get("text", "")
    
    job_skills = job_data.get("required_skills", [])
    job_keywords = job_data.get("keywords", [])
    
    # 2. Extract and Normalize Job Info
    unique_job_skills = []
    seen_job_skills = set()
    for s in job_skills:
        if s and isinstance(s, str):
            clean_s = s.strip()
            lower_s = clean_s.lower()
            if lower_s and lower_s not in seen_job_skills:
                seen_job_skills.add(lower_s)
                unique_job_skills.append(clean_s)

    unique_job_keywords = []
    seen_job_keywords = set()
    for k in job_keywords:
        if k and isinstance(k, str):
            clean_k = k.strip()
            lower_k = clean_k.lower()
            if lower_k and lower_k not in seen_job_keywords:
                seen_job_keywords.add(lower_k)
                unique_job_keywords.append(clean_k)

    # 3. Process Resume Context
    resume_skills_lower = {s.strip().lower() for s in resume_skills if s and isinstance(s, str)}
    resume_text_lower = resume_text.lower() if isinstance(resume_text, str) else ""

    # 4. Keyword Scoring Mechanics
    matched_skills = []
    missing_skills = []
    
    for req_clean in unique_job_skills:
        if req_clean.lower() in resume_skills_lower:
            matched_skills.append(req_clean)
        else:
            missing_skills.append(req_clean)
            
    matched_keywords = []
    missing_keywords = []
    
    for kw_clean in unique_job_keywords:
        kw_lower = kw_clean.lower()
        # Direct string check in resume text or skills
        if kw_lower in resume_text_lower or kw_lower in resume_skills_lower:
            matched_keywords.append(kw_clean)
        else:
            missing_keywords.append(kw_clean)

    # 5. Keyword Percentage Math
    total_required = len(unique_job_skills) + len(unique_job_keywords)
    matched_total = len(matched_skills) + len(matched_keywords)
    
    if total_required == 0:
        keyword_score = 100.0
    else:
        keyword_score = round((matched_total / total_required) * 100.0, 2)
        
    keyword_score = float(keyword_score)
        
    # --- Intercept for Semantic Scope (Day 4) ---
    semantic_score = None
    if semantic_engine and (resume_text or resume_skills) and (job_data.get("description") or job_data.get("title")):
        try:
            # Combine text appropriately for dense embeddings
            cand_text = resume_text + " " + " ".join(resume_skills)
            job_text = str(job_data.get("description", "")) + " " + str(job_data.get("title", ""))
            
            # Fire deterministic similarity check
            semantic_score = semantic_engine.calculate_semantic_similarity(
                text1=cand_text, 
                text2=job_text
            )
        except Exception:
            semantic_score = None

    # Final Score Calculation
    final_score = float(keyword_score)
    if semantic_score is not None and config:
        kw_w = float(config.get("keyword_weight", 1.0))
        sem_w = float(config.get("semantic_weight", 0.0))
        final_score = round(keyword_score * kw_w + semantic_score * sem_w, 2)
        
    # Maintain threshold boundaries
    return_missing_skills = missing_skills if final_score < ATS_MISSING_THRESHOLD else []
    return_missing_keywords = missing_keywords if final_score < ATS_MISSING_THRESHOLD else []

    status_tag = "heuristic-v1" if semantic_score is None else "blended-v1"

    # Strict output contract compliant with Milestone 3 requirements and M2 backward compatibility
    return {
        "score": final_score,
        "keyword_score": keyword_score,
        "semantic_score": semantic_score,
        "matched_skills": matched_skills,
        "missing_skills": return_missing_skills,
        "matched_keywords": matched_keywords,
        "missing_keywords": return_missing_keywords,
        
        # M2 Backwards Config keys compatibility guarantees mapping
        "match_score": final_score, 
        "generated_by": status_tag
    }


def calculate_ats_score(resume_skills: list[str], job_required_skills: list[str]) -> dict:
    """
    Backward-compatibility function wrapping score_resume_against_job specifically 
    for Intern 3 / Intern 4 M2 systems that expect exactly 2 positional arguments.
    """
    res = score_resume_against_job(
        resume_data={"skills": resume_skills, "text": ""},
        job_data={"required_skills": job_required_skills, "keywords": []}
    )
    return res

if __name__ == "__main__":
    print("=== SwipeX ATS Scoring Engine (src/ats.py) ===")
    sample_resume = {"skills": ["Python", "SQL"], "text": "I know kubernetes and docker."}
    sample_job = {"required_skills": ["Python", "AWS"], "keywords": ["Docker", "Agile"]}
    out = score_resume_against_job(sample_resume, sample_job)
    print("Outcome:", out)
