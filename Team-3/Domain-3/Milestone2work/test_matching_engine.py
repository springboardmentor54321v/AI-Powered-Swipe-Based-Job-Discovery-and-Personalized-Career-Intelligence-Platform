"""
DAY 4 DELIVERABLE -- Unit Tests for the Matching Engine scoring logic.
Run with: pytest test_matching_engine.py -v
"""

from matching_engine import (
    calculate_skills_score,
    calculate_experience_score,
)


def test_exact_skill_match_scores_100():
    assert calculate_skills_score(["python", "sql", "excel"], ["python", "sql"]) == 100.0


def test_no_skill_overlap_scores_0():
    assert calculate_skills_score(["marketing", "sales"], ["python", "sql"]) == 0.0


def test_substring_match_still_counts():
    """Would FAIL with old exact-matching logic from Day 1-2."""
    assert calculate_skills_score(["python"], ["python developer"]) == 100.0


def test_partial_overlap_gives_partial_score():
    assert calculate_skills_score(["python", "excel"], ["python", "sql"]) == 50.0


def test_empty_job_skills_returns_0():
    assert calculate_skills_score(["python"], []) == 0.0


def test_experience_within_range_scores_100():
    assert calculate_experience_score(user_experience=4, min_exp=2, max_exp=5) == 100


def test_experience_slightly_below_min_gets_partial_credit():
    """Would FAIL with old binary 0/100 logic from Day 1-2."""
    score = calculate_experience_score(user_experience=2.5, min_exp=3, max_exp=5)
    assert 0 < score < 100


def test_experience_far_below_min_scores_very_low():
    score = calculate_experience_score(user_experience=0, min_exp=8, max_exp=10)
    assert score < 20


def test_experience_above_max_still_gets_some_credit():
    score_over = calculate_experience_score(user_experience=8, min_exp=2, max_exp=5)
    score_under = calculate_experience_score(user_experience=0, min_exp=2, max_exp=5)
    assert score_over > score_under


def test_experience_score_never_goes_negative():
    assert calculate_experience_score(user_experience=0, min_exp=20, max_exp=25) == 0