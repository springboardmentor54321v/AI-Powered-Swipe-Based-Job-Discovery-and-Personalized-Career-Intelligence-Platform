import sys
from pathlib import Path
import os
import django

# Setup django
sys.path.append(r"r:\new projects\resume-ats\Team-3\Domain-1\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.resume_service.ats_scoring_service import compute_ats_score

try:
    res = compute_ats_score(
        resume_text="Experienced Software Engineer with Python and Django.",
        resume_skills=["Python", "Django", "SQL"],
        job_data={
            "title": "Backend Engineer",
            "skills": ["Python", "Django", "Docker"],
            "keywords": ["API", "Backend"],
            "description": "Looking for a Backend Engineer with Python and Django."
        }
    )
    print("SUCCESS:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
