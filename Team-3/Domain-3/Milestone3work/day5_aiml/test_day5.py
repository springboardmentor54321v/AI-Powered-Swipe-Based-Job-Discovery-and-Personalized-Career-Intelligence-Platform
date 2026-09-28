import pytest
from suggestions import ResumeSuggestionsModule
from recommendation_engine import UpgradedRecommendationEngine

# -------------------------------------------------------------
# Unit Tests for Resume Suggestions Module (Day 5 Task 1)
# -------------------------------------------------------------

def test_generate_suggestions_missing_skills():
    """Test that missing skills and lower match percentages generate appropriate suggestions."""
    suggestions_engine = ResumeSuggestionsModule(use_llm=False)
    
    resume_skills = ["Python", "FastAPI"]
    job_required_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "ChromaDB"]
    
    result = suggestions_engine.generate_suggestions(
        resume_skills=resume_skills,
        job_required_skills=job_required_skills,
        job_title="Backend Developer"
    )
    
    assert result["keyword_match_pct"] == 40.0
    assert set(result["matched_skills"]) == {"Python", "FastAPI"}
    assert set(result["missing_skills"]) == {"PostgreSQL", "Docker", "ChromaDB"}
    assert len(result["suggestions"]) > 0
    assert result["generation_mode"] == "Rule-based/Template Fallback"

def test_generate_suggestions_full_match():
    """Test 100% skill match scenario."""
    suggestions_engine = ResumeSuggestionsModule(use_llm=False)
    
    resume_skills = ["Python", "FastAPI", "PostgreSQL", "Docker"]
    job_required_skills = ["Python", "FastAPI"]
    
    result = suggestions_engine.generate_suggestions(
        resume_skills=resume_skills,
        job_required_skills=job_required_skills,
        job_title="Python Developer"
    )
    
    assert result["keyword_match_pct"] == 100.0
    assert len(result["missing_skills"]) == 0


# -------------------------------------------------------------
# Unit Tests for Upgraded Recommendation Engine (Day 5 Task 2)
# -------------------------------------------------------------

def test_swipe_history_parsing():
    """Test parsing Intern 2's exact JSON response payload."""
    engine = UpgradedRecommendationEngine()
    
    mock_intern2_payload = {
        "user_id": "10",
        "history": [
            {"job_id": 101, "direction": "right"},
            {"job_id": 102, "direction": "left"}
        ]
    }
    
    parsed = engine._parse_swipe_history(mock_intern2_payload)
    assert 101 in parsed["liked"]
    assert 102 in parsed["disliked"]

def test_disliked_job_filtering():
    """Verify that jobs swiped LEFT (disliked) are completely filtered out of recommendations."""
    engine = UpgradedRecommendationEngine()
    
    resume_text = "Experienced Python developer with FastAPI and SQL skills."
    
    # User 10 swiped LEFT on job 102 (Data Analyst) in mock data
    recommendations = engine.get_recommendations(
        user_id="10",
        user_resume_text=resume_text,
        top_k=10
    )
    
    recommended_job_ids = [job["job_id"] for job in recommendations]
    
    # Job 102 must NOT be in the recommendations
    assert 102 not in recommended_job_ids

def test_liked_job_score_boosting():
    """Verify that jobs swiped RIGHT receive a score boost."""
    engine = UpgradedRecommendationEngine()
    
    resume_text = "Experienced Python developer with FastAPI skills."
    
    # User 10 swiped RIGHT on job 101 in mock data
    recommendations = engine.get_recommendations(
        user_id="10",
        user_resume_text=resume_text,
        top_k=10
    )
    
    job_101 = next((j for j in recommendations if j["job_id"] == 101), None)
    assert job_101 is not None
    assert job_101["swipe_boost"] == 0.20
    assert job_101["final_match_percentage"] > (job_101["semantic_similarity_score"] * 100)
