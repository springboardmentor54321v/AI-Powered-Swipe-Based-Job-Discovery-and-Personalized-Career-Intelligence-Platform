"""Run the Day 6 labeled examples through the production keyword ATS scorer."""

from __future__ import annotations

import importlib
import json
import sys
from pathlib import Path
from typing import Any


DOMAIN3_ROOT = Path(__file__).resolve().parents[4] / "Team-3" / "Domain-3" / "Milestone3work"
if str(DOMAIN3_ROOT) not in sys.path:
    sys.path.insert(0, str(DOMAIN3_ROOT))

calculate_keyword_ats = importlib.import_module(
    "scoring.keyword_ats"
).calculate_keyword_ats
AccuracySpotCheckRunner = importlib.import_module(
    "day6.accuracy_spot_check"
).AccuracySpotCheckRunner


def run_spot_check() -> dict[str, Any]:
    """Score the hand-labeled cases using the real production scorer."""

    benchmark = AccuracySpotCheckRunner().hand_labeled_dataset
    results = []
    total_error = 0.0

    for sample in benchmark:
        resume_skills = sample["resume_skills"]
        scorer_result = calculate_keyword_ats(
            resume_text=" ".join(resume_skills),
            resume_skills=resume_skills,
            required_skills=sample["job_required_skills"],
            required_keywords=[],
        )
        predicted = scorer_result["keyword_score"]
        expected = sample["human_expected_match_pct"]
        absolute_error = abs(predicted - expected)
        total_error += absolute_error
        results.append(
            {
                "sample_id": sample["sample_id"],
                "description": sample["description"],
                "human_expected_pct": expected,
                "production_keyword_score_pct": predicted,
                "absolute_error_pct": round(absolute_error, 2),
            }
        )

    mae = total_error / len(benchmark) if benchmark else 0.0
    return {
        "samples": len(results),
        "mean_absolute_error_pct": round(mae, 2),
        "sample_details": results,
        "scope_note": (
            "This small synthetic set checks keyword scoring against its stated overlap rubric; "
            "it does not measure semantic ranking quality or real-world hiring outcomes."
        ),
    }


if __name__ == "__main__":
    print(json.dumps(run_spot_check(), indent=2))
