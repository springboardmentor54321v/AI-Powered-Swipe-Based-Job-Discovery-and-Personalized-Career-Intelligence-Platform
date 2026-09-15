from fastapi import FastAPI
import pandas as pd
from SwipeHistory import get_swipe_history


app = FastAPI()

DEBUG = False  # set True only when troubleshooting

jobs_df = pd.read_excel("data/indian-job-market-dataset-2025-with-company-type.xlsx")
jobs_df = jobs_df.dropna(subset=["tagsAndSkills", "minimumExperience", "maximumExperience"])
jobs_df["jobId"] = jobs_df["jobId"].astype(str).str.strip()


def get_job_skills(job_id: str):
    """Look up the skill list for a given job_id from the main dataset."""
    match = jobs_df[jobs_df["jobId"] == job_id]
    if match.empty:
        return []
    skills_str = match.iloc[0]["tagsAndSkills"]
    return [s.strip().lower() for s in str(skills_str).split(",")]


def calculate_skills_score(user_skills, job_skills):
    """
    Substring matching: catches 'python' matching 'Python Developer',
    not just exact-word matches. This is a bonus improvement beyond
    the SRS's literal requirement.
    """
    user_skills_lower = [s.strip().lower() for s in user_skills]
    job_skills_lower = [s.strip().lower() for s in job_skills]

    matched_count = 0
    for user_skill in user_skills_lower:
        for job_skill in job_skills_lower:
            if user_skill in job_skill or job_skill in user_skill:
                matched_count += 1
                break

    return (matched_count / len(job_skills_lower)) * 100 if job_skills_lower else 0


def calculate_experience_score(user_experience, min_exp, max_exp):
    """
    Graduated scoring instead of a hard 0/100 cutoff, so someone
    just outside the range still gets partial credit.
    """
    if min_exp <= user_experience <= max_exp:
        return 100
    elif user_experience < min_exp:
        gap = min_exp - user_experience
        return max(0, 100 - (gap * 20))
    else:
        gap = user_experience - max_exp
        return max(0, 100 - (gap * 10))


def calculate_swipe_score(job_row, swipes):
    if not swipes:
        return 50, []

    current_skills = set(str(job_row["tagsAndSkills"]).lower().split(","))
    current_skills = {s.strip() for s in current_skills}

    score = 50
    liked_boost = 0
    skipped_penalty = 0

    for swipe in swipes:
        swiped_job_id = str(swipe.get("job_id", "")).strip()
        direction = swipe.get("direction", "")  # CHANGED: "action" -> "direction"

        past_skills = set(get_job_skills(swiped_job_id))
        if not past_skills:
            continue

        overlap = current_skills.intersection(past_skills)
        overlap_ratio = len(overlap) / len(current_skills) if current_skills else 0

        # CHANGED: "applied"/"saved" -> "right", "skipped" -> "left"
        if direction == "right" and overlap_ratio > 0.2:
            liked_boost += 15 * overlap_ratio
        elif direction == "left" and overlap_ratio > 0.2:
            skipped_penalty += 15 * overlap_ratio

    score += liked_boost
    score -= skipped_penalty

    reasons = []
    if liked_boost > skipped_penalty and liked_boost > 0:
        reasons.append("Similar to jobs you liked")
    elif skipped_penalty > liked_boost and skipped_penalty > 0:
        reasons.append("Similar to jobs you skipped")

    score = max(0, min(100, score))
    return round(score, 2), reasons

def calculate_match_score(user_skills, user_location, user_experience, job_row, swipes):
    job_skills = [s.strip().lower() for s in str(job_row["tagsAndSkills"]).split(",")]

    skills_score = calculate_skills_score(user_skills, job_skills)
    location_score = 100 if user_location.lower() in str(job_row["location"]).lower() else 0
    experience_score = calculate_experience_score(
        user_experience, job_row["minimumExperience"], job_row["maximumExperience"]
    )
    swipe_score, swipe_reasons = calculate_swipe_score(job_row, swipes)

    match_score = (0.4 * skills_score) + (0.2 * location_score) + (0.2 * experience_score) + (0.2 * swipe_score)

    reasons = []
    if skills_score > 50:
        reasons.append("Matches your skills")
    if location_score == 100:
        reasons.append("In your preferred location")
    reasons.extend(swipe_reasons)

    return round(match_score, 2), reasons


@app.get("/api/v1/recommendations")
async def get_recommendations(user_name: str, user_skills: str, user_location: str, user_experience: int):
    skills_list = [s.strip() for s in user_skills.split(",")]
    swipes = get_swipe_history(user_name)

    already_swiped_ids = {str(s.get("job", "")).strip() for s in swipes}

    results = []
    for _, job in jobs_df.head(500).iterrows():
        current_job_id = str(job["jobId"]).strip()
        if current_job_id in already_swiped_ids:
            continue  # don't show jobs the user already swiped on

        score, reasons = calculate_match_score(skills_list, user_location, user_experience, job, swipes)
        results.append({
            "job_id": job["jobId"],
            "title": job["title"],
            "company": job["companyName"],
            "match_score": score,
            "reason_tags": reasons
        })

    results = sorted(results, key=lambda x: x["match_score"], reverse=True)[:10]

    return {
        "recommendations": results,
        "generated_by": "heuristic-v0"
    }


