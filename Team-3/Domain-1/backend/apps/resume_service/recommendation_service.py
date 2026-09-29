"""
SwipeX Upgraded Recommendation Service (Milestone 3 — Day 5)

Integration layer between Domain-1 API Gateway and Intern 4's (Domain-3)
completed UpgradedRecommendationEngine.

Workflow:
  1. Receives user_id and resume_text from the view layer.
  2. Sets INTERN2_BASE_URL so Intern 4's intern2_client can reach
     our Job Service runner for swipe history and job data.
  3. Delegates to Intern 4's UpgradedRecommendationEngine.get_recommendations()
     without modifying any Domain-3 source code.
  4. Returns ranked job recommendations blending semantic similarity
     with swipe-history heuristic.

Follows strict domain boundaries — imports and executes Intern 4's module
without modifying any Domain-3 source code.
"""

import os
import sys
import logging
from pathlib import Path
from typing import Dict, Any, List

from django.conf import settings

logger = logging.getLogger("resume_service.recommendations")

# Resolve Domain-3 Milestone3work/day5_aiml directory
DOMAIN_3_PATH = Path(settings.BASE_DIR).parent.parent / "Domain-3" / "Milestone3work"
DAY5_AIML_PATH = DOMAIN_3_PATH / "day5_aiml"


def get_upgraded_recommendations(
    user_id: str,
    resume_text: str,
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Get upgraded AI-powered job recommendations using Intern 4's engine.

    Args:
        user_id: Authenticated user's ID (from JWT).
        resume_text: Parsed resume text content.
        top_k: Maximum number of recommendations to return.

    Returns:
        List of recommendation dicts from UpgradedRecommendationEngine.

    Raises:
        RuntimeError: If Domain-3 recommendation engine cannot be imported.
    """
    # Ensure Domain-3 day5_aiml is in sys.path
    if str(DAY5_AIML_PATH) not in sys.path and DAY5_AIML_PATH.exists():
        sys.path.insert(0, str(DAY5_AIML_PATH))

    # Set INTERN2_BASE_URL so Intern 4's intern2_client.py can reach
    # our Job Service runner (port 8001) for swipe history and job data.
    job_service_url = getattr(
        settings, "JOB_SERVICE_URL", "http://127.0.0.1:8001"
    )
    os.environ.setdefault("INTERN2_BASE_URL", job_service_url)

    try:
        from recommendation_engine import UpgradedRecommendationEngine
    except ImportError as e:
        logger.error(f"Failed to import Intern 4 UpgradedRecommendationEngine: {e}")
        raise RuntimeError(
            f"Downstream recommendation engine unavailable: {e}"
        )

    engine = UpgradedRecommendationEngine()

    recommendations = engine.get_recommendations(
        user_id=str(user_id),
        user_resume_text=resume_text,
        top_k=top_k,
    )

    logger.info(
        f"Recommendations generated: user={user_id}, "
        f"count={len(recommendations)}, top_k={top_k}"
    )

    return recommendations
