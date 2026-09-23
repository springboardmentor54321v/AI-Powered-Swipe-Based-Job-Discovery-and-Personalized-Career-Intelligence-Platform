"""Day 3 keyword-based ATS scoring for SwipeX."""

from __future__ import annotations

import re
from typing import Any, Iterable, List, Optional


ATS_THRESHOLD = 80.0


def normalize(value: str) -> str:
    """Normalize text for reliable comparison."""

    value = str(value).casefold().strip()
    value = re.sub(r"[^a-z0-9+#.]+", " ", value)

    return " ".join(value.split())


def clean_unique(values: Optional[Iterable[str]]) -> List[str]:
    """Clean values and remove duplicates while preserving order."""

    result: List[str] = []
    seen = set()

    for value in values or []:
        normalized = normalize(value)

        if normalized and normalized not in seen:
            result.append(normalized)
            seen.add(normalized)

    return result


def contains_term(text: str, term: str) -> bool:
    """Check whether a keyword exists in the resume text."""

    normalized_text = normalize(text)

    if not normalized_text or not term:
        return False

    return (
        re.search(
            r"(?<![a-z0-9+#])"
            + re.escape(term)
            + r"(?![a-z0-9+#])",
            normalized_text,
        )
        is not None
    )


def calculate_keyword_ats(
    resume_text: str,
    resume_skills: Iterable[str],
    required_skills: Iterable[str],
    required_keywords: Iterable[str],
) -> dict[str, Any]:
    """Calculate the keyword-based ATS score.

    Required skills are compared with extracted resume skills.

    Required keywords are searched inside the complete resume text.

    Formula:

        Keyword Score =
        matched requirements / total requirements * 100
    """

    if not isinstance(resume_text, str):
        raise TypeError("resume_text must be a string")

    normalized_resume_skills = set(clean_unique(resume_skills))

    skills = clean_unique(required_skills)
    keywords = clean_unique(required_keywords)

    matched_skills = [
        skill
        for skill in skills
        if skill in normalized_resume_skills
    ]

    missing_skills = [
        skill
        for skill in skills
        if skill not in normalized_resume_skills
    ]

    matched_keywords = [
        keyword
        for keyword in keywords
        if contains_term(resume_text, keyword)
    ]

    missing_keywords = [
        keyword
        for keyword in keywords
        if not contains_term(resume_text, keyword)
    ]

    # Combine skills and keywords.
    # Duplicate requirements are counted only once.
    all_requirements = clean_unique(skills + keywords)

    matched_requirements = set(
        matched_skills + matched_keywords
    )

    matched_count = len(
        matched_requirements.intersection(all_requirements)
    )

    total_count = len(all_requirements)

    if total_count == 0:
        keyword_score = 0.0
    else:
        keyword_score = (
            matched_count / total_count
        ) * 100.0

    return {
        "keyword_score": round(keyword_score, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "below_threshold": keyword_score < ATS_THRESHOLD,
        "threshold": ATS_THRESHOLD,
        "matched_count": matched_count,
        "total_requirements": total_count,
    }


if __name__ == "__main__":
    result = calculate_keyword_ats(
        resume_text=(
            "Backend Developer experienced with Python, "
            "Django, SQL, REST API and Git."
        ),
        resume_skills=[
            "python",
            "django",
            "sql",
            "git",
            "rest api",
        ],
        required_skills=[
            "python",
            "django",
            "sql",
            "docker",
        ],
        required_keywords=[
            "rest api",
            "git",
            "aws",
        ],
    )

    print("Day 3 keyword ATS result:")

    for key, value in result.items():
        print("{}: {}".format(key, value))
