"""
SwipeX AI Suggestions Service (Milestone 3 — Day 5)

Integration layer between Domain-1 Resume Service and Intern 4's (Domain-3)
completed ResumeSuggestionsModule.

Workflow:
  1. Receives resume skills and job data from the view layer.
  2. Delegates to Intern 4's ResumeSuggestionsModule.generate_suggestions()
     without modifying any Domain-3 source code.
  3. Returns structured suggestions with free rule-based fallback guaranteed.

Follows strict domain boundaries — imports and executes Intern 4's module
without modifying any Domain-3 source code.
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any, List

from django.conf import settings

logger = logging.getLogger("resume_service.suggestions")

# Resolve Domain-3 Milestone3work/day5_aiml directory
DOMAIN_3_PATH = Path(settings.BASE_DIR).parent.parent / "Domain-3" / "Milestone3work"
DAY5_AIML_PATH = DOMAIN_3_PATH / "day5_aiml"


def compute_suggestions(
    resume_skills: List[str],
    job_required_skills: List[str],
    job_title: str = "Target Position",
) -> Dict[str, Any]:
    """
    Generate AI resume optimization suggestions using Intern 4's module.

    Args:
        resume_skills: List of skill names extracted from the candidate's resume.
        job_required_skills: List of required skills for the target job.
        job_title: Title of the target job position.

    Returns:
        Dict with suggestion results from ResumeSuggestionsModule.

    Raises:
        RuntimeError: If Domain-3 suggestions module cannot be imported.
    """
    # Ensure Domain-3 day5_aiml is in sys.path
    if str(DAY5_AIML_PATH) not in sys.path and DAY5_AIML_PATH.exists():
        sys.path.insert(0, str(DAY5_AIML_PATH))

    try:
        from suggestions import ResumeSuggestionsModule
    except ImportError as e:
        logger.error(f"Failed to import Intern 4 ResumeSuggestionsModule: {e}")
        raise RuntimeError(
            f"Downstream AI suggestions module unavailable: {e}"
        )

    # Instantiate with free fallback (use_llm=False)
    # The module handles LLM availability internally;
    # rule-based fallback is always guaranteed.
    suggestions_engine = ResumeSuggestionsModule(use_llm=False)

    result = suggestions_engine.generate_suggestions(
        resume_skills=resume_skills,
        job_required_skills=job_required_skills,
        job_title=job_title,
    )

    logger.info(
        f"Suggestions generated: mode={result.get('generation_mode')}, "
        f"match={result.get('keyword_match_pct')}%, "
        f"suggestions_count={len(result.get('suggestions', []))}"
    )

    return result
