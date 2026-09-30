"""Tests for the Day 3 keyword ATS engine."""

from scoring.keyword_ats import calculate_keyword_ats


def test_keyword_score_returns_matches_and_missing_items():
    result = calculate_keyword_ats(
        resume_text=(
            "Backend Developer using Python, Django, SQL, "
            "REST API and Git."
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

    assert result["matched_skills"] == [
        "python",
        "django",
        "sql",
    ]

    assert result["missing_skills"] == [
        "docker",
    ]

    assert result["matched_keywords"] == [
        "rest api",
        "git",
    ]

    assert result["missing_keywords"] == [
        "aws",
    ]

    assert result["keyword_score"] == 71.43
    assert result["below_threshold"] is True


def test_keyword_matching_is_case_insensitive():
    result = calculate_keyword_ats(
        resume_text="Python and REST API experience.",
        resume_skills=[
            "Python",
            "REST API",
        ],
        required_skills=[
            "python",
        ],
        required_keywords=[
            "rest api",
        ],
    )

    assert result["keyword_score"] == 100.0
    assert result["missing_skills"] == []
    assert result["missing_keywords"] == []


def test_duplicate_requirements_are_counted_once():
    result = calculate_keyword_ats(
        resume_text="Python developer.",
        resume_skills=[
            "python",
        ],
        required_skills=[
            "python",
        ],
        required_keywords=[
            "Python",
        ],
    )

    assert result["total_requirements"] == 1
    assert result["keyword_score"] == 100.0


def test_empty_requirements_return_zero_score():
    result = calculate_keyword_ats(
        resume_text="Python developer.",
        resume_skills=[
            "python",
        ],
        required_skills=[],
        required_keywords=[],
    )

    assert result["keyword_score"] == 0.0
    assert result["total_requirements"] == 0