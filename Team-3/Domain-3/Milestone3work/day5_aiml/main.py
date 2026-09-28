import json
from suggestions import ResumeSuggestionsModule
from recommendation_engine import UpgradedRecommendationEngine

def run_day5_demo():
    print("=" * 60)
    print("      SWIPEX MILESTONE 3 - DAY 5 DEMO (INTERN 4 AI/ML)")
    print("=" * 60)
    
    # Candidate Resume Profile
    user_id = "10"
    user_resume_skills = ["Python", "FastAPI", "PyTorch", "Git", "SQL"]
    user_resume_text = "Experienced Backend & AI developer skilled in Python, FastAPI, PyTorch, Git, and SQL databases."
    
    # -------------------------------------------------------------
    # TASK 1: Resume Optimization Suggestions Module
    # -------------------------------------------------------------
    print("\n--- [TASK 1] AI Resume Optimization Suggestions ---")
    suggestions_engine = ResumeSuggestionsModule(use_llm=False)
    
    target_job_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "ChromaDB"]
    suggestion_output = suggestions_engine.generate_suggestions(
        resume_skills=user_resume_skills,
        job_required_skills=target_job_skills,
        job_title="Senior Backend & AI Engineer"
    )
    
    print(json.dumps(suggestion_output, indent=2))
    
    # -------------------------------------------------------------
    # TASK 2: Upgraded Recommendation Engine (With Intern 2 API Data)
    # -------------------------------------------------------------
    print("\n--- [TASK 2] Upgraded Recommendation Engine (Semantic + Swipe History) ---")
    rec_engine = UpgradedRecommendationEngine()
    
    recommendations = rec_engine.get_recommendations(
        user_id=user_id,
        user_resume_text=user_resume_text,
        top_k=5
    )
    
    print(f"\nFinal Ranked Job Recommendations for User {user_id}:")
    print(json.dumps(recommendations, indent=2))
    print("=" * 60)
    print("SUCCESS: Day 5 Execution Complete! All deliverables ready for Intern 1 & Intern 2 handoff.")
    print("=" * 60)

if __name__ == "__main__":
    run_day5_demo()
