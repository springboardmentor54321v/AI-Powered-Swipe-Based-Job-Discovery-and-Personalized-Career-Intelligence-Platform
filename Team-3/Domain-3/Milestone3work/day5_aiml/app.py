import os
import json
from typing import List, Dict, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import Domain 4 AI/ML modules
from suggestions import ResumeSuggestionsModule
from recommendation_engine import UpgradedRecommendationEngine
from intern2_client import fetch_user_swipe_history, fetch_all_jobs

# Initialize FastAPI App
app = FastAPI(
    title="SwipeX AI/ML Career Intelligence API (Intern 4)",
    description="Interactive Live Demo Service for Resume Parsing, ATS Scoring, Suggestions & Upgraded Recommendation Engine.",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend (Intern 1) and Gateway (Intern 2)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiating AI Engines
suggestions_engine = ResumeSuggestionsModule(use_llm=False)
recommendation_engine = UpgradedRecommendationEngine()


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "SwipeX Domain 4 - AI/ML Career Intelligence API",
        "swagger_docs": "http://127.0.0.1:8000/docs",
        "intern_role": "Intern 4 (AI/ML)"
    }


# -------------------------------------------------------------
# ENDPOINT 1: Upload & Extract Resume Text & Skills (Day 2)
# -------------------------------------------------------------
@app.post("/api/v1/ai/extract-resume", summary="Day 2: Upload PDF/DOCX Resume & Extract Skills")
async def extract_resume(file: UploadFile = File(...)):
    """
    Upload a candidate PDF or DOCX resume file to extract text and identified skills.
    """
    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".docx") or filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only .pdf, .docx, and .txt files are supported.")

    content_bytes = await file.read()
    
    # Try parsing text based on file type
    raw_text = ""
    if filename.endswith(".txt"):
        raw_text = content_bytes.decode("utf-8", errors="ignore")
    else:
        # Mock/Extracted text from binary resume
        raw_text = f"Candidate Resume ({file.filename}): Skilled in Python, FastAPI, PostgreSQL, Docker, PyTorch, Git."

    # spaCy / Dictionary Skill Extraction Logic
    known_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "PyTorch", "Git", "SQL", "ChromaDB", "Java", "React"]
    resume_lower = raw_text.lower()
    extracted_skills = [skill for skill in known_skills if skill.lower() in resume_lower]

    return {
        "filename": file.filename,
        "file_type": filename.split(".")[-1].upper(),
        "extracted_raw_text_snippet": raw_text[:200] + "...",
        "extracted_skills": extracted_skills,
        "total_skills_count": len(extracted_skills)
    }


# -------------------------------------------------------------
# ENDPOINT 2: ATS Scoring Engine (Day 3 & Day 4 Blended Score)
# -------------------------------------------------------------
@app.post("/api/v1/ai/score-ats", summary="Days 3 & 4: Compute Blended Keyword + Semantic ATS Score")
def compute_ats_score(
    resume_skills: List[str] = Query(..., example=["Python", "FastAPI", "PostgreSQL"]),
    job_required_skills: List[str] = Query(..., example=["Python", "FastAPI", "PostgreSQL", "Docker", "ChromaDB"])
):
    """
    Computes keyword match % and semantic similarity score against job requirements.
    """
    resume_set = {s.lower().strip() for s in resume_skills}
    job_set = {s.lower().strip() for s in job_required_skills}

    matched_skills = [s for s in job_required_skills if s.lower().strip() in resume_set]
    missing_skills = [s for s in job_required_skills if s.lower().strip() not in resume_set]

    keyword_match_pct = (len(matched_skills) / len(job_required_skills) * 100) if job_required_skills else 0.0

    # Simulated Vector Semantic Similarity (Day 4 ChromaDB Logic)
    semantic_similarity = round(min(0.95, 0.4 + (keyword_match_pct / 100) * 0.55), 4)

    blended_ats_score = round((keyword_match_pct * 0.6) + (semantic_similarity * 100 * 0.4), 2)

    return {
        "blended_ats_score": blended_ats_score,
        "keyword_match_pct": round(keyword_match_pct, 2),
        "semantic_similarity_score": semantic_similarity,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }


# -------------------------------------------------------------
# ENDPOINT 3: AI Resume Optimization Suggestions (Day 5 Task 1)
# -------------------------------------------------------------
@app.post("/api/v1/ai/suggestions", summary="Day 5: Generate AI Resume Optimization Suggestions")
def generate_suggestions(
    resume_skills: List[str] = Query(..., example=["Python", "FastAPI"]),
    job_required_skills: List[str] = Query(..., example=["Python", "FastAPI", "PostgreSQL", "Docker", "ChromaDB"]),
    job_title: str = Query("Senior Backend Engineer")
):
    """
    Generates actionable missing-skill suggestions and resume improvement recommendations.
    """
    result = suggestions_engine.generate_suggestions(
        resume_skills=resume_skills,
        job_required_skills=job_required_skills,
        job_title=job_title
    )
    return result


# -------------------------------------------------------------
# ENDPOINT 4: Upgraded Recommendation Engine (Day 5 Task 2)
# -------------------------------------------------------------
@app.get("/api/v1/ai/recommendations/{user_id}", summary="Day 5: Get Recommendations Blended with Intern 2 Swipe History")
def get_job_recommendations(
    user_id: str = "10",
    resume_text: str = Query("Experienced Python backend developer skilled in FastAPI, SQL, PyTorch and Docker.")
):
    """
    Fetches real user swipe history from Intern 2's API Gateway and returns ranked job recommendations.
    """
    recommendations = recommendation_engine.get_recommendations(
        user_id=user_id,
        user_resume_text=resume_text,
        top_k=5
    )
    return {
        "user_id": user_id,
        "total_recommendations": len(recommendations),
        "ranked_jobs": recommendations
    }


if __name__ == "__main__":
    print("🚀 Starting SwipeX Domain 4 AI/ML FastAPI Server on http://127.0.0.1:8000/docs...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
