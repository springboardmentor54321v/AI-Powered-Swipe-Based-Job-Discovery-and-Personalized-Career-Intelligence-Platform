"""
SwipeX - Matching Engine Unit Tests
Owner: Intern 4 - AI/ML Career Intelligence
Day 6: Additional tests for scoring/reason-tag logic + bug-fix verification.

Run:
    pytest test_matching_engine.py -v
"""

import pytest
from day6matching_engine import (
    Job,
    UserProfile,
    SwipeAction,
    score_skills,
    score_location,
    score_experience,
    score_swipe_history,
    build_reason_tags,
    calculate_match_score,
    rank_jobs_for_user,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def sample_user():
    return UserProfile(
        user_id="U1",
        skills=["Python", "SQL", "Django"],
        location="Hyderabad",
        experience_years=1,
    )


@pytest.fixture
def sample_job_perfect_match():
    return Job(job_id="J100", title="Backend Dev", company="Acme",
               location="Hyderabad", skills=["Python", "SQL"],
               experience_required=1, competition_level="Low", posted_days_ago=1)


@pytest.fixture
def sample_job_no_match():
    return Job(job_id="J101", title="3D Artist", company="StudioX",
               location="Mumbai", skills=["Blender", "Maya"],
               experience_required=5, competition_level="High", posted_days_ago=30)


# ---------------------------------------------------------------------------
# Skills scoring tests
# ---------------------------------------------------------------------------

def test_skills_full_overlap(sample_user, sample_job_perfect_match):
    assert score_skills(sample_user, sample_job_perfect_match) == 1.0


def test_skills_no_overlap(sample_user, sample_job_no_match):
    assert score_skills(sample_user, sample_job_no_match) == 0.0


def test_skills_case_insensitive(sample_user):
    job = Job(job_id="J102", title="Dev", company="X", location="Hyderabad",
              skills=["python", "sql"], experience_required=1,
              competition_level="Low", posted_days_ago=1)
    assert score_skills(sample_user, job) == 1.0


def test_skills_empty_job_skills(sample_user):
    job = Job(job_id="J103", title="Dev", company="X", location="Hyderabad",
              skills=[], experience_required=1, competition_level="Low", posted_days_ago=1)
    assert score_skills(sample_user, job) == 0.0


# ---------------------------------------------------------------------------
# Location scoring tests
# ---------------------------------------------------------------------------

def test_location_exact_match(sample_user, sample_job_perfect_match):
    assert score_location(sample_user, sample_job_perfect_match) == 1.0


def test_location_mismatch(sample_user, sample_job_no_match):
    assert score_location(sample_user, sample_job_no_match) == 0.0


def test_location_remote_always_matches(sample_user):
    job = Job(job_id="J104", title="Dev", company="X", location="Remote",
              skills=["Python"], experience_required=1, competition_level="Low", posted_days_ago=1)
    assert score_location(sample_user, job) == 1.0


# ---------------------------------------------------------------------------
# Experience scoring tests
# ---------------------------------------------------------------------------

def test_experience_exact_fit(sample_user, sample_job_perfect_match):
    assert score_experience(sample_user, sample_job_perfect_match) == 1.0


def test_experience_underqualified(sample_user):
    job = Job(job_id="J105", title="Senior Dev", company="X", location="Hyderabad",
              skills=["Python"], experience_required=4, competition_level="Low", posted_days_ago=1)
    score = score_experience(sample_user, job)
    assert 0.0 <= score < 1.0


def test_experience_overqualified_still_reasonable(sample_user):
    job = Job(job_id="J106", title="Junior Dev", company="X", location="Hyderabad",
              skills=["Python"], experience_required=0, competition_level="Low", posted_days_ago=1)
    score = score_experience(sample_user, job)
    assert score >= 0.3  # over-qualified shouldn't be zeroed out


# ---------------------------------------------------------------------------
# Swipe-history scoring tests
# ---------------------------------------------------------------------------

def test_swipe_history_liked_job_scores_high(sample_job_perfect_match):
    history = {"J100": SwipeAction.LIKE}
    assert score_swipe_history(sample_job_perfect_match, history) == 1.0


def test_swipe_history_skipped_job_scores_zero(sample_job_perfect_match):
    history = {"J100": SwipeAction.SKIP}
    assert score_swipe_history(sample_job_perfect_match, history) == 0.0


def test_swipe_history_no_signal_is_neutral(sample_job_perfect_match):
    history = {}
    assert score_swipe_history(sample_job_perfect_match, history) == 0.5


# ---------------------------------------------------------------------------
# Reason tag tests
# ---------------------------------------------------------------------------

def test_reason_tags_skills_match(sample_user, sample_job_perfect_match):
    tags = build_reason_tags(sample_user, sample_job_perfect_match,
                              s_skills=0.8, s_location=1.0, s_experience=1.0)
    assert "Matches your skills" in tags


def test_reason_tags_low_competition(sample_user, sample_job_perfect_match):
    tags = build_reason_tags(sample_user, sample_job_perfect_match,
                              s_skills=0.0, s_location=0.0, s_experience=0.0)
    assert "Low competition" in tags


def test_reason_tags_fallback_when_nothing_matches(sample_user, sample_job_no_match):
    tags = build_reason_tags(sample_user, sample_job_no_match,
                              s_skills=0.0, s_location=0.0, s_experience=0.0)
    assert "General match" in tags


# ---------------------------------------------------------------------------
# Full scoring integration tests
# ---------------------------------------------------------------------------

def test_calculate_match_score_perfect_job_scores_high(sample_user, sample_job_perfect_match):
    result = calculate_match_score(sample_user, sample_job_perfect_match, history={})
    assert result.match_score > 50
    assert result.job_id == "J100"


def test_calculate_match_score_bad_job_scores_low(sample_user, sample_job_no_match):
    result = calculate_match_score(sample_user, sample_job_no_match, history={})
    assert result.match_score < 30


# ---------------------------------------------------------------------------
# Bug-fix regression test (Day 6)
# QA reported: jobs the user already SKIPPED were still appearing in the
# recommendation feed. Verifying the fix here.
# ---------------------------------------------------------------------------

def test_skipped_jobs_are_excluded_from_recommendations():
    results = rank_jobs_for_user("U1")
    result_ids = [r.job_id for r in results]
    assert "J003" not in result_ids  # J003 was skipped in mock history


def test_recommendations_are_sorted_descending_by_score():
    results = rank_jobs_for_user("U1")
    scores = [r.match_score for r in results]
    assert scores == sorted(scores, reverse=True)
