"""Day 5 rule-based resume suggestion service.

This module uses deterministic rules only.
It does not use an LLM.
"""


from typing import Any, Dict, List


ATS_THRESHOLD = 80.0


def generate_suggestions_from_ats(
    ats_result: Dict[str, Any],
) -> List[str]:
    """Generate suggestions from a blended ATS result."""

    if not isinstance(ats_result, dict):
        raise TypeError("ats_result must be a dictionary")

    score = float(
        ats_result.get("final_ats_score", 0.0)
    )

    missing_skills = (
        ats_result.get("missing_skills", [])
        or []
    )

    missing_keywords = (
        ats_result.get("missing_keywords", [])
        or []
    )

    suggestions = []

    if missing_skills:
        skill_text = ", ".join(
            str(skill)
            for skill in missing_skills
        )

        suggestions.append(
            "If you genuinely have experience with "
            + skill_text
            + ", describe it in your skills, "
            "work, or project section."
        )

    if missing_keywords:
        keyword_text = ", ".join(
            str(keyword)
            for keyword in missing_keywords
        )

        suggestions.append(
            "Where accurate, naturally include these "
            "job terms in relevant experience descriptions: "
            + keyword_text
            + "."
        )

    if score < ATS_THRESHOLD:
        suggestions.append(
            "Your ATS score is "
            + "{:.2f}".format(score)
            + "%, below the "
            + "{:.0f}".format(ATS_THRESHOLD)
            + "% target. Tailor your resume to this job "
            "without adding skills you do not genuinely have."
        )

    if not suggestions:
        suggestions.append(
            "Your resume is a strong match. Continue using "
            "clear responsibilities and measurable achievements."
        )

    return suggestions


def build_suggestions_response(
    ats_result: Dict[str, Any],
) -> Dict[str, Any]:
    """Build the response returned by the suggestions API."""

    score = round(
        float(
            ats_result.get("final_ats_score", 0.0)
        ),
        2,
    )

    return {
        "source": "rule_based",
        "ats_score": score,
        "suggestions": generate_suggestions_from_ats(
            ats_result
        ),
    }


def main():
    """Run a local rule-based suggestion example."""

    sample_ats_result = {
        "final_ats_score": 78.66,
        "missing_skills": ["docker"],
        "missing_keywords": ["aws"],
    }

    response = build_suggestions_response(
        sample_ats_result
    )

    print("Rule-based suggestion response:")
    print(response)


if __name__ == "__main__":
    main()
