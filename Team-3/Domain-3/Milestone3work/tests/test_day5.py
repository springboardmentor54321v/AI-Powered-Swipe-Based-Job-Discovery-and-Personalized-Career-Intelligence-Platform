"""Focused tests for the implemented Day 5 suggestion and ranking modules."""

from pathlib import Path
import sys
from unittest.mock import patch


DAY5_AIML_DIR = Path(__file__).resolve().parents[1] / "day5_aiml"
if str(DAY5_AIML_DIR) not in sys.path:
    sys.path.insert(0, str(DAY5_AIML_DIR))

from recommendation_engine import UpgradedRecommendationEngine
from suggestions import ResumeSuggestionsModule


def test_suggestions_identify_missing_skills():
    result = ResumeSuggestionsModule().generate_suggestions(
        resume_skills=["Python", "FastAPI"],
        job_required_skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
        job_title="Backend Developer",
    )

    assert result["keyword_match_pct"] == 50.0
    assert result["missing_skills"] == ["PostgreSQL", "Docker"]
    assert result["generation_mode"] == "Rule-based/Template Fallback"


def test_recommendations_filter_disliked_and_boost_liked_jobs():
    engine = UpgradedRecommendationEngine()
    history = {"history": [
        {"job_id": 101, "direction": "right"},
        {"job_id": 102, "direction": "left"},
    ]}
    jobs = [
        {"job_id": 101, "job_title": "Python Developer", "required_skills": ["python"]},
        {"job_id": 102, "job_title": "Analyst", "required_skills": ["sql"]},
        {"job_id": 103, "job_title": "Engineer", "required_skills": ["python"]},
    ]

    with (
        patch("recommendation_engine.fetch_user_swipe_history", return_value=history),
        patch("recommendation_engine.fetch_all_jobs", return_value=jobs),
    ):
        results = engine.get_recommendations("test-user", "Python backend experience.")

    job_ids = [item["job_id"] for item in results]
    assert 102 not in job_ids
    liked = next(item for item in results if item["job_id"] == 101)
    unliked = next(item for item in results if item["job_id"] == 103)
    assert liked["swipe_boost"] == 0.2
    assert liked["final_match_percentage"] > unliked["final_match_percentage"]
