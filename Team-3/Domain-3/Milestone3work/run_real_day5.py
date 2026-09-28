"""Run Day 5 against real local ATS/job data and Intern 2's live Swipe API.

Run from the project root:
    python run_real_day5.py --user-id USER_ID --ats-file ats_result.json --jobs-file real_jobs.json

Expected ats_result.json fields:
    {"missing_skills": [...], "missing_keywords": [...], "resume_text": "..."}

Expected real_jobs.json:
    [{"job_id": "...", "title": "...", "semantic_similarity_score": 0.82}]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List

from recommendation.recommendation_engine import rank_jobs
from recommendation.resume_suggestions import generate_suggestions


def load_json(path: str) -> Any:
    with Path(path).open("r", encoding="utf-8") as file:
        return json.load(file)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run real Day 5 suggestions and recommendations")
    parser.add_argument("--user-id", required=True, help="The same user ID used by Intern 2")
    parser.add_argument("--ats-file", required=True, help="JSON output from your real ATS pipeline")
    parser.add_argument("--jobs-file", required=True, help="JSON list of real jobs with semantic scores")
    args = parser.parse_args()

    ats: Dict[str, Any] = load_json(args.ats_file)
    jobs: List[Dict[str, Any]] = load_json(args.jobs_file)
    if not isinstance(jobs, list):
        raise ValueError("jobs-file must contain a JSON list")

    suggestions = generate_suggestions(
        missing_skills=ats.get("missing_skills", []),
        missing_keywords=ats.get("missing_keywords", []),
        resume_text=ats.get("resume_text", ""),
    )
    ranked_jobs = rank_jobs(args.user_id, jobs)

    print("=== REAL RESUME SUGGESTIONS ===")
    print(json.dumps(suggestions, indent=2, ensure_ascii=False))
    print("\n=== REAL JOB RECOMMENDATIONS ===")
    print(json.dumps(ranked_jobs, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
