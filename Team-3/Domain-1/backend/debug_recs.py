import sys
from pathlib import Path
import os
import django

# Setup django
sys.path.append(r"r:\new projects\resume-ats\Team-3\Domain-1\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.resume_service.recommendation_service import get_upgraded_recommendations

try:
    res = get_upgraded_recommendations(
        user_id="1",
        resume_text="Experienced Software Engineer with Python and Django.",
        top_k=5
    )
    print("SUCCESS:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
