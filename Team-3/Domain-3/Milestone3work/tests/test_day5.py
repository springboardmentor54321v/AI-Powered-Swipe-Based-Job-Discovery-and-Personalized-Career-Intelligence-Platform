"""Day 5 tests for suggestions and recommendations."""


from recommendation.recommendation_engine import (
    action_to_swipe_score,
    add_swipe_scores_from_history,
    rank_recommendations,
)

from suggestions.suggestion_service import (
    build_suggestions_response,
)


def test_rule_based_suggestions_use_missing_items():
    """Check suggestions from missing skills and keywords."""

    ats_result = {
        "final_ats_score": 78.66,
        "missing_skills": ["docker"],
        "missing_keywords": ["aws"],
    }

    response = build_suggestions_response(
        ats_result
    )

    assert response["source"] == "rule_based"
    assert response["ats_score"] == 78.66

    assert len(response["suggestions"]) == 3

    assert any(
        "docker" in suggestion
        for suggestion in response["suggestions"]
    )

    assert any(
        "aws" in suggestion
        for suggestion in response["suggestions"]
    )

    assert any(
        "78.66" in suggestion
        for suggestion in response["suggestions"]
    )


def test_no_missing_items_returns_positive_suggestion():
    """Check the suggestion for a strong resume match."""

    ats_result = {
        "final_ats_score": 85.0,
        "missing_skills": [],
        "missing_keywords": [],
    }

    response = build_suggestions_response(
        ats_result
    )

    assert response["source"] == "rule_based"
    assert response["ats_score"] == 85.0
    assert len(response["suggestions"]) == 1
    assert "strong match" in response["suggestions"][0]


def test_action_to_swipe_score():
    """Check the agreed action-to-score conversion."""

    assert action_to_swipe_score("apply") == 100.0
    assert action_to_swipe_score("right") == 100.0
    assert action_to_swipe_score("left") == 0.0
    assert action_to_swipe_score("dislike") == 0.0
    assert action_to_swipe_score("unknown") == 50.0
    assert action_to_swipe_score(None) == 50.0


def test_history_is_converted_to_job_swipe_scores():
    """Check Gateway history integration."""

    jobs = [
        {
            "job_id": 1,
            "semantic_score": 80.0,
        },
        {
            "job_id": 2,
            "semantic_score": 90.0,
        },
        {
            "job_id": 3,
            "semantic_score": 75.0,
        },
    ]

    swipe_history = [
        {
            "job_id": 1,
            "action": "apply",
        },
        {
            "job_id": 2,
            "action": "left",
        },
    ]

    result = add_swipe_scores_from_history(
        jobs,
        swipe_history,
    )

    assert result[0]["swipe_score"] == 100.0
    assert result[1]["swipe_score"] == 0.0

    # No history means neutral preference.
    assert result[2]["swipe_score"] == 50.0


def test_recommendations_are_ranked_by_score():
    """Check that jobs are sorted highest first."""

    jobs = [
        {
            "job_id": "101",
            "semantic_score": 80.0,
            "swipe_score": 50.0,
        },
        {
            "job_id": "102",
            "semantic_score": 90.0,
            "swipe_score": 90.0,
        },
    ]

    ranked_jobs = rank_recommendations(jobs)

    assert ranked_jobs[0]["job_id"] == "102"
    assert ranked_jobs[0]["recommendation_score"] == 90.0

    assert ranked_jobs[1]["job_id"] == "101"
    assert ranked_jobs[1]["recommendation_score"] == 71.0


def test_recommendation_scores_are_clamped():
    """Check that scores remain between 0 and 100."""

    jobs = [
        {
            "job_id": "101",
            "semantic_score": 150.0,
            "swipe_score": -10.0,
        }
    ]

    ranked_jobs = rank_recommendations(jobs)

    assert ranked_jobs[0]["semantic_score"] == 100.0
    assert ranked_jobs[0]["swipe_score"] == 0.0
    assert ranked_jobs[0]["recommendation_score"] == 70.0


def test_recommendation_weights_must_add_to_one():
    """Check that invalid weights are rejected."""

    jobs = [
        {
            "job_id": "101",
            "semantic_score": 80.0,
            "swipe_score": 50.0,
        }
    ]

    try:
        rank_recommendations(
            jobs,
            semantic_weight=0.80,
            swipe_weight=0.30,
        )
    except ValueError as error:
        assert "add up to 1.0" in str(error)
    else:
        raise AssertionError(
            "Expected ValueError for invalid weights"
        )
