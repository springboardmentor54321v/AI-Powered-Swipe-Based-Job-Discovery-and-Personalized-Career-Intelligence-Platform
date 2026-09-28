import os
import requests
from typing import Dict, List, Any

# Intern 2 API Base URL (Change IP to Intern 2's actual Wi-Fi IP e.g. http://192.168.10.105:8001)
INTERN2_BASE_URL = os.getenv("INTERN2_BASE_URL", "http://127.0.0.1:8001")

def fetch_user_swipe_history(user_id: str = "10") -> Dict[str, Any]:
    """
    Fetches real swipe history from Intern 2's API Gateway.
    Falls back to Intern 2's sample schema if connection fails.
    """
    url = f"{INTERN2_BASE_URL}/api/v1/swipes/history"
    headers = {"X-User-Id": user_id, "Accept": "application/json"}
    
    try:
        response = requests.get(url, headers=headers, timeout=3)
        if response.status_code == 200:
            print(f"[Intern2 Client] Successfully fetched swipe history from API Gateway for user {user_id}")
            return response.json()
        else:
            print(f"[Intern2 Client Warning] API returned status {response.status_code}. Using fallback mock.")
    except Exception as e:
        print(f"[Intern2 Client Warning] Gateway unreachable ({e}). Using local fallback.")

    # Fallback mock matching Intern 2's exact verified response schema
    return {
        "user_id": user_id,
        "history": [
            {
                "job_id": 101,
                "direction": "right",
                "swiped_at": "2026-09-15T09:00:00Z",
                "job_title": "Software Engineer",
                "company": "Tech Corp"
            },
            {
                "job_id": 102,
                "direction": "left",
                "swiped_at": "2026-09-15T09:05:00Z",
                "job_title": "Data Analyst",
                "company": "Data Inc"
            }
        ],
        "count": 2
    }

def fetch_all_jobs() -> List[Dict[str, Any]]:
    """
    Fetches available jobs from Intern 2's API Gateway.
    Falls back to mock job database if connection fails.
    """
    url = f"{INTERN2_BASE_URL}/api/v1/jobs"
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass

    # Default mock jobs for local testing
    return [
        {
            "job_id": 101,
            "job_title": "Software Engineer",
            "company": "Tech Corp",
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "description": "Looking for backend Python developer with FastAPI experience."
        },
        {
            "job_id": 102,
            "job_title": "Data Analyst",
            "company": "Data Inc",
            "required_skills": ["SQL", "Excel", "Tableau", "Python"],
            "description": "Data analyst needed for business intelligence reporting."
        },
        {
            "job_id": 103,
            "job_title": "AI/ML Engineer",
            "company": "AI Innovations",
            "required_skills": ["Python", "PyTorch", "spaCy", "Sentence-Transformers", "ChromaDB"],
            "description": "AI engineer to build NLP models and vector search recommendation engines."
        }
    ]
