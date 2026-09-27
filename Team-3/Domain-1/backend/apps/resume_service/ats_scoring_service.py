"""
SwipeX ATS Scoring Service (Milestone 3 — Day 4)

Integration layer between Domain-1 resume data and Intern 4's (Domain-3)
completed blended ATS scoring engine.

Workflow:
  1. Retrieves the candidate's parsed resume text and skills from Domain-1 DB.
  2. Resolves job data (description, skills, keywords) via Intern 3's
     downstream Job Service or the cleaned_jobs.csv dataset.
  3. Delegates to Intern 4's calculate_blended_ats() without modifying
     any Domain-3 source code.

Follows strict domain boundaries — only imports, never modifies Domain-3.
"""

import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

from django.conf import settings

logger = logging.getLogger("resume_service.ats_scoring")

# ── Domain-3 path setup ──
DOMAIN_3_PATH = Path(settings.BASE_DIR).parent.parent / "Domain-3" / "Milestone3work"
if str(DOMAIN_3_PATH) not in sys.path and DOMAIN_3_PATH.exists():
    sys.path.insert(0, str(DOMAIN_3_PATH))


def _resolve_job_from_csv(job_id: str) -> Optional[Dict[str, Any]]:
    """
    Attempt to look up the job from Intern 3's cleaned_jobs.csv dataset.
    Returns a dict with description, skills, and keywords if found.
    """
    csv_path = DOMAIN_3_PATH.parent / "data" / "cleaned_jobs.csv"
    if not csv_path.exists():
        logger.debug(f"cleaned_jobs.csv not found at {csv_path}")
        return None

    try:
        import pandas as pd
        jobs_df = pd.read_csv(csv_path)
        job_row = jobs_df[jobs_df["jobId"] == int(job_id)]
        if job_row.empty:
            return None

        row = job_row.iloc[0]
        # Parse tagsAndSkills (comma-separated)
        tags_skills_raw = str(row.get("tagsAndSkills", ""))
        skills_list = [s.strip() for s in tags_skills_raw.split(",") if s.strip()]

        # Job description text
        job_desc = str(row.get("jobDescription", ""))

        # Title for response
        title = str(row.get("title", ""))

        return {
            "job_id": str(row.get("jobId", job_id)),
            "title": title,
            "description": job_desc,
            "skills": skills_list,
            "keywords": skills_list,  # CSV uses tagsAndSkills for both
        }
    except Exception as e:
        logger.warning(f"Failed to resolve job {job_id} from CSV: {e}")
        return None


def _resolve_job_from_service(job_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch job data from Intern 3's downstream Job Service.
    Uses the same JOB_SERVICE_URL the gateway proxies already use.
    """
    job_service_url = getattr(
        settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"
    ).rstrip("/")

    try:
        url = f"{job_service_url}/api/v1/jobs/{job_id}"
        req = Request(url, method="GET")
        req.add_header("Accept", "application/json")

        with urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))

        # Normalize the response shape
        skills = data.get("skills", []) or data.get("tagsAndSkills", [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",") if s.strip()]

        description = data.get("jobDescription", "") or data.get("description", "")
        title = data.get("title", "")
        keywords = data.get("keywords", skills)  # Fallback to skills

        return {
            "job_id": str(job_id),
            "title": title,
            "description": str(description),
            "skills": skills if isinstance(skills, list) else [],
            "keywords": keywords if isinstance(keywords, list) else [],
        }
    except (HTTPError, URLError, ValueError, OSError) as e:
        logger.warning(f"Failed to fetch job {job_id} from Job Service: {e}")
        return None


def resolve_job_data(job_id: str) -> Dict[str, Any]:
    """
    Resolve job data by checking Intern 3's CSV dataset first,
    then falling back to the live Job Service.

    Raises:
        ValueError: If job cannot be found in any source.
    """
    # Try CSV first (faster, no network)
    job_data = _resolve_job_from_csv(job_id)
    if job_data:
        logger.debug(f"Job {job_id} resolved from CSV dataset")
        return job_data

    # Fall back to live Job Service
    job_data = _resolve_job_from_service(job_id)
    if job_data:
        logger.debug(f"Job {job_id} resolved from Job Service")
        return job_data

    raise ValueError(f"Job with ID '{job_id}' not found in dataset or Job Service.")


def compute_ats_score(
    resume_text: str,
    resume_skills: List[str],
    job_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Compute the blended ATS score using Intern 4's scoring engine.

    Args:
        resume_text: Parsed text content from the resume.
        resume_skills: List of skill names extracted from the resume.
        job_data: Dict with keys: description, skills, keywords.

    Returns:
        Dict with scoring results from calculate_blended_ats().

    Raises:
        RuntimeError: If Domain-3 scoring modules cannot be imported.
    """
    # Ensure Domain-3 and its scoring folder are in sys.path
    if str(DOMAIN_3_PATH) not in sys.path and DOMAIN_3_PATH.exists():
        sys.path.insert(0, str(DOMAIN_3_PATH))
        
    scoring_path = DOMAIN_3_PATH / "scoring"
    if str(scoring_path) not in sys.path and scoring_path.exists():
        sys.path.insert(0, str(scoring_path))

    try:
        from scoring.blended_ats import calculate_blended_ats
    except ImportError as e:
        logger.error(f"Failed to import Intern 4 blended_ats: {e}")
        raise RuntimeError(
            f"Downstream ATS scoring module unavailable: {e}"
        )

    # Normalize resume skills to lowercase for matching
    normalized_resume_skills = [s.lower().strip() for s in resume_skills if s.strip()]

    # Extract job data fields
    required_skills = [s.lower().strip() for s in job_data.get("skills", []) if s.strip()]
    required_keywords = [s.lower().strip() for s in job_data.get("keywords", []) if s.strip()]
    job_description = job_data.get("description", "")

    # Fallback: if job description is empty, build from title + skills
    if not job_description.strip():
        title = job_data.get("title", "Job")
        job_description = f"{title}. Required skills: {', '.join(required_skills)}."

    result = calculate_blended_ats(
        resume_text=resume_text,
        resume_skills=normalized_resume_skills,
        required_skills=required_skills,
        required_keywords=required_keywords,
        job_description=job_description,
    )

    return result
