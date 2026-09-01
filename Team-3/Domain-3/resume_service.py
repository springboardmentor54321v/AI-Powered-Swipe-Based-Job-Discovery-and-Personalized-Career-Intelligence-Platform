from fastapi import FastAPI, UploadFile, File
import pdfplumber
import uuid
import pandas as pd

app = FastAPI()

KNOWN_SKILLS = [
    "Python", "Django", "FastAPI", "React", "JavaScript", "SQL",
    "PostgreSQL", "Machine Learning", "Deep Learning", "NLP",
    "scikit-learn", "spaCy", "Pandas", "Docker", "AWS", "Git",
    "REST API", "HTML", "CSS", "MongoDB", "Excel"
]

# NEW: a simple in-memory "storage box" to remember resumes temporarily
resume_storage = {}

# Load your cleaned jobs dataset once, when the server starts
jobs_df = pd.read_csv("data/cleaned_jobs.csv")


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
        return {"error": "Resume not found. Please upload it first."}
    resume_skills = resume_storage[resume_id]

    # Step 2: Find the job in our dataset
    job_row = jobs_df[jobs_df["jobId"] == int(job_id)]
    if job_row.empty:
        return {"error": "Job not found."}

    # Step 3: Get the required skills for that job
    required_skills_str = job_row.iloc[0]["tagsAndSkills"]
    required_skills = [s.strip() for s in required_skills_str.split(",")]

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
async def get_recommendations(resume_id: str):
    if resume_id not in resume_storage:
        return {"error": "Resume not found. Please upload it first."}
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
                "match_percentage": match_percentage
            })

    recommendations = sorted(recommendations, key=lambda x: x["match_percentage"], reverse=True)[:5]

    return {
        "recommendations": recommendations,
        "generated_by": "heuristic-v0"
    }