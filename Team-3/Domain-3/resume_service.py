from pathlib import Path
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import uuid
import pandas as pd

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KNOWN_SKILLS = [
    "Python", "Django", "FastAPI", "React", "JavaScript", "SQL",
    "PostgreSQL", "Machine Learning", "Deep Learning", "NLP",
    "scikit-learn", "spaCy", "Pandas", "Docker", "AWS", "Git",
    "REST API", "HTML", "CSS", "MongoDB", "Excel"
]

# NEW: a simple in-memory "storage box" to remember resumes temporarily
resume_storage = {}

# Load your cleaned jobs dataset once, when the server starts
jobs_df = pd.read_csv(Path(__file__).parent / "data" / "cleaned_jobs.csv")


def required_skills_for_job(job_id: str) -> list[str]:
    """Use Intern 3's dataset first, then the live Job service for shared IDs."""
    job_row = jobs_df[jobs_df["jobId"] == int(job_id)]
    if not job_row.empty:
        return [skill.strip() for skill in job_row.iloc[0]["tagsAndSkills"].split(",") if skill.strip()]

    job_service_url = os.getenv("JOB_SERVICE_URL", "http://job-service:8000").rstrip("/")
    try:
        with urlopen(f"{job_service_url}/api/v1/jobs/{job_id}", timeout=5) as response:
            job = json.loads(response.read().decode("utf-8"))
        skills = job.get("skills", [])
        if isinstance(skills, list) and skills:
            return [str(skill).strip() for skill in skills if str(skill).strip()]
    except (HTTPError, URLError, ValueError, OSError):
        pass
    raise HTTPException(status_code=404, detail="Job not found.")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "resume-ats"}


@app.post("/api/v1/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    text = ""
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    found_skills = [skill for skill in KNOWN_SKILLS if skill.lower() in text.lower()]

    resume_id = str(uuid.uuid4())

    # NEW: save this resume's skills into our storage box, using resume_id as the label
    resume_storage[resume_id] = found_skills

    return {
        "resume_id": resume_id,
        "parsed_skills": found_skills
    }
@app.get("/api/v1/resume/{resume_id}/ats-score")
async def get_ats_score(resume_id: str, job_id: str):
    # Step 1: Get this resume's skills from storage
    if resume_id not in resume_storage:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload it first.")
    resume_skills = resume_storage[resume_id]

    # Step 2: Resolve skills from the local dataset or the live Job service.
    required_skills = required_skills_for_job(job_id)

    # Step 4: Count how many required skills are found in the resume
    matched = [skill for skill in required_skills if skill.lower() in [r.lower() for r in resume_skills]]
    missing = [skill for skill in required_skills if skill not in matched]

    match_score = round((len(matched) / len(required_skills)) * 100, 2) if required_skills else 0

    return {
        "match_score": match_score,
        "missing_keywords": missing,
        "generated_by": "heuristic-v0"
    }
@app.get("/api/v1/recommendations")
async def get_recommendations(resume_id: str | None = None, user_id: str | None = None):
    # In Milestone 1 recommendations are resume-skill based. user_id is accepted
    # for the frozen API contract; resume_id is required until user-resume storage exists.
    if not resume_id:
        # A user without an uploaded resume has no skills to compare in M1.
        # Return an empty successful result, not a client error.
        return {"recommendations": [], "generated_by": "heuristic-v0"}
    if resume_id not in resume_storage:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload it first.")
    resume_skills = [s.lower() for s in resume_storage[resume_id]]

    recommendations = []
    for _, job in jobs_df.iterrows():
        required_skills = [s.strip().lower() for s in job["tagsAndSkills"].split(",")]
        matched = [s for s in required_skills if s in resume_skills]
        if required_skills:
            match_percentage = round((len(matched) / len(required_skills)) * 100, 2)
        else:
            match_percentage = 0

        if match_percentage > 0:
            recommendations.append({
                "job_id": int(job["jobId"]),
                "title": job["title"],
                "match_percentage": match_percentage,
                "generated_by": "heuristic-v0",
            })

    recommendations = sorted(recommendations, key=lambda x: x["match_percentage"], reverse=True)[:5]

    return {
        "recommendations": recommendations,
        "generated_by": "heuristic-v0"
    }
