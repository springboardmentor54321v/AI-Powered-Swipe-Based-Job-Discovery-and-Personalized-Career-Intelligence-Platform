
"""Day 4 blended ATS scoring."""

try:
    # Used when running from the project root:
    # python -m scoring.blended_ats
    from .keyword_ats import calculate_keyword_ats
    from .semantic_similarity import calculate_semantic_similarity

except ImportError:
    # Used when running directly inside the scoring folder:
    # python blended_ats.py
    from keyword_ats import calculate_keyword_ats
    from semantic_similarity import calculate_semantic_similarity


KEYWORD_WEIGHT = 0.40
SEMANTIC_WEIGHT = 0.60
ATS_THRESHOLD = 80.0


def calculate_blended_ats(
    resume_text,
    resume_skills,
    required_skills,
    required_keywords,
    job_description,
):
    """Calculate the final blended ATS score.

    Formula:

        Final ATS Score =
        Keyword Score * 0.40
        + Semantic Score * 0.60
    """

    if KEYWORD_WEIGHT + SEMANTIC_WEIGHT != 1.0:
        raise ValueError(
            "KEYWORD_WEIGHT and SEMANTIC_WEIGHT must add up to 1.0"
        )

    keyword_result = calculate_keyword_ats(
        resume_text=resume_text,
        resume_skills=resume_skills,
        required_skills=required_skills,
        required_keywords=required_keywords,
    )

    similarity, semantic_score = calculate_semantic_similarity(
        resume_text=resume_text,
        job_description=job_description,
    )

    keyword_score = keyword_result["keyword_score"]

    final_score = (
        keyword_score * KEYWORD_WEIGHT
        + semantic_score * SEMANTIC_WEIGHT
    )

    final_score = round(final_score, 2)

    return {
        "keyword_score": keyword_score,
        "semantic_similarity": similarity,
        "semantic_score": semantic_score,
        "final_ats_score": final_score,
        "matched_skills": keyword_result["matched_skills"],
        "missing_skills": keyword_result["missing_skills"],
        "matched_keywords": keyword_result["matched_keywords"],
        "missing_keywords": keyword_result["missing_keywords"],
        "below_threshold": final_score < ATS_THRESHOLD,
        "threshold": ATS_THRESHOLD,
    }


def main():
    """Run a sample blended ATS calculation."""

    # Sample resume text.
    # Later, this will come from resume_versions.extracted_text.
    resume_text = (
        "Backend Developer experienced with Python, Django, SQL, "
        "REST API and Git."
    )

    # Sample skills detected from the resume.
    # Later, these will come from resume_skills.skill_name.
    resume_skills = [
        "python",
        "django",
        "sql",
        "git",
        "rest api",
    ]

    # Sample job requirements.
    # Later, these will come from jobs.required_skills.
    required_skills = [
        "python",
        "django",
        "sql",
        "docker",
    ]

    # Sample job keywords.
    # Later, these will come from jobs.required_keywords.
    required_keywords = [
        "rest api",
        "git",
        "aws",
    ]

    # Sample job description.
    # Later, this will come from the real job record.
    job_description = (
        "We are looking for a backend developer with Python, Django, "
        "SQL, Docker, REST API, Git, and AWS experience."
    )

    result = calculate_blended_ats(
        resume_text=resume_text,
        resume_skills=resume_skills,
        required_skills=required_skills,
        required_keywords=required_keywords,
        job_description=job_description,
    )

    print()
    print("Day 4 blended ATS result:")
    print()

    for key, value in result.items():
        print("{}: {}".format(key, value))


if __name__ == "__main__":
    main()
