"""
SwipeX Milestone 3 - Rule-Based Resume Suggestions

This module generates resume-improvement suggestions using simple rules.
It does not use an LLM, external API, API key, or internet connection.

Place this file in your project as:
    suggestions/rule_based_suggestions.py
"""

from __future__ import annotations

from typing import Iterable


# Project requirement from the Milestone 3 SRS.
ATS_THRESHOLD = 80.0


def _clean_items(items: Iterable[str] | None) -> list[str]:
    """Clean, normalize, and deduplicate skills or keywords."""
    if items is None:
        return []

    cleaned: list[str] = []
    seen: set[str] = set()

    for item in items:
        value = " ".join(str(item).strip().split())
        normalized_value = value.casefold()

        if value and normalized_value not in seen:
            cleaned.append(value)
            seen.add(normalized_value)

    return cleaned


def generate_suggestions(
    ats_score: float,
    missing_skills: Iterable[str] | None = None,
    missing_keywords: Iterable[str] | None = None,
    resume_text: str = "",
) -> list[str]:
    """Generate suggestions from ATS results.

    Args:
        ats_score: Final ATS score from 0 to 100.
        missing_skills: Skills required by the job but not found in the resume.
        missing_keywords: Keywords required by the job but not found in the resume.
        resume_text: Extracted text from the user's PDF resume.

    Returns:
        A list of clear resume-improvement suggestions.

    Raises:
        ValueError: If ats_score is outside the range 0 to 100.

    Important:
        The function never tells a user to falsely claim a skill. It says to
        add a missing skill only if the user genuinely has that experience.
    """
    score = float(ats_score)

    if not 0.0 <= score <= 100.0:
        raise ValueError("ats_score must be between 0 and 100")

    skills = _clean_items(missing_skills)
    keywords = _clean_items(missing_keywords)
    text = resume_text.strip()
    suggestions: list[str] = []

    # Rule 1: Report missing skills safely.
    if skills:
        skill_text = ", ".join(skills)
        suggestions.append(
            f"If you genuinely have experience with {skill_text}, "
            "describe it in your skills, work, or project section."
        )

    # Rule 2: Report missing job keywords safely.
    if keywords:
        keyword_text = ", ".join(keywords)
        suggestions.append(
            "Where accurate, naturally include these relevant job terms "
            f"in the bullet points that describe your experience: {keyword_text}."
        )

    # Rule 3: Give specific feedback when the score is below the target.
    if score < ATS_THRESHOLD:
        suggestions.append(
            f"Your ATS score is {score:.1f}%, below the {ATS_THRESHOLD:.0f}% "
            "target. Tailor your resume to this job without adding skills "
            "you do not genuinely have."
        )

    # Rule 4: Suggest measurable achievements when no number is found.
    # This is a simple and explainable heuristic, not a claim that the resume
    # definitely lacks achievements.
    if text and not any(character.isdigit() for character in text):
        suggestions.append(
            "Add measurable achievements, such as accuracy, time saved, "
            "performance improvement, users served, revenue, or project impact."
        )

    # Rule 5: Handle empty or unreadable extracted text.
    if not text:
        suggestions.append(
            "Add detailed responsibilities, projects, skills, and measurable "
            "achievements so the resume can be matched more accurately."
        )

    # Rule 6: Always return useful feedback, even when no specific issue was found.
    if not suggestions:
        suggestions.append(
            "Review the resume for clear responsibilities, relevant skills, "
            "and measurable achievements related to this job."
        )

    return suggestions


if __name__ == "__main__":
    # Example local test. This block runs only when the file is executed
    # directly; it does not run when the function is imported by an API.
    sample_suggestions = generate_suggestions(
        ats_score=72.5,
        missing_skills=["Docker", "PyTorch"],
        missing_keywords=["AWS", "REST API"],
        resume_text=(
            "Developed Python applications and improved model accuracy."
        ),
    )

    print("Rule-based resume suggestions:\n")
    for number, suggestion in enumerate(sample_suggestions, start=1):
        print(f"{number}. {suggestion}")
