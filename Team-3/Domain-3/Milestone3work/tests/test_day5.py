from unittest.mock import patch

from recommendation.recommendation_engine import get_swipe_preference, rank_jobs
from recommendation.resume_suggestions import generate_rule_based_suggestions, generate_suggestions


def test_missing_skill_generates_high_priority_suggestion():
    result = generate_rule_based_suggestions(missing_skills=["Docker"])
    assert result[0]["item"] == "Docker"
    assert result[0]["priority"] == "high"


def test_no_missing_items_generates_general_suggestion():
    result = generate_rule_based_suggestions()
    assert result[0]["type"] == "general"


def test_llm_failure_uses_free_fallback():
    def broken_provider(**kwargs):
        raise RuntimeError("provider unavailable")

    result = generate_suggestions(missing_keywords=["REST API"], llm_provider=broken_provider)
    assert result[0]["item"] == "REST API"


def test_swipe_scores():
    history = {"1": "like", "2": "apply", "3": "skip"}
    assert get_swipe_preference("1", history) == 1.0
    assert get_swipe_preference("2", history) == 1.0
    assert get_swipe_preference("3", history) == 0.0
    assert get_swipe_preference("4", history) == 0.5


def test_rank_jobs_blends_semantic_and_swipe_scores():
    jobs = [
        {"job_id": "1", "semantic_similarity_score": 0.80},
        {"job_id": "2", "semantic_similarity_score": 0.90},
    ]
    with patch("recommendation.recommendation_engine.get_swipe_history", return_value={"1": "like", "2": "skip"}):
        ranked = rank_jobs("user-1", jobs)

    assert ranked[0]["job_id"] == "1"
    assert ranked[0]["recommendation_score"] == 0.86
    assert ranked[1]["recommendation_score"] == 0.63


def test_semantic_score_is_clamped():
    jobs = [{"job_id": "1", "semantic_similarity_score": 2.0}]
    with patch("recommendation.recommendation_engine.get_swipe_history", return_value={}):
        ranked = rank_jobs("user-1", jobs)
    assert ranked[0]["semantic_similarity_score"] == 1.0
