"""Day 5 personalized job recommendation engine.

The engine combines:

    70% semantic similarity
    30% swipe preference

Gateway action mapping:

    apply/right/like  -> 100
    left/dislike      -> 0
    unknown action    -> 50
"""

from typing import Any, Dict, Iterable, List


SEMANTIC_WEIGHT = 0.70
SWIPE_WEIGHT = 0.30


def action_to_swipe_score(action: Any) -> float:
    """Convert a Gateway action into a preference score from 0 to 100."""

    if not isinstance(action, str):
        return 50.0

    normalized_action = action.strip().casefold()

    if normalized_action in {
        "apply",
        "right",
        "like",
    }:
        return 100.0

    if normalized_action in {
        "left",
        "dislike",
        "reject",
    }:
        return 0.0

    return 50.0


def clamp_score(value: Any) -> float:
    """Keep a score between 0 and 100."""

    try:
        score = float(value)
    except (TypeError, ValueError):
        score = 0.0

    return max(0.0, min(100.0, score))


def add_swipe_scores_from_history(
    jobs: Iterable[Dict[str, Any]],
    swipe_history: Iterable[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Add swipe scores to jobs using Gateway swipe-history records.

    Example swipe-history record:

        {
            "job_id": 1,
            "action": "apply"
        }

    If no history exists for a job, the default score is 50.
    """

    history_by_job_id = {}

    for record in swipe_history:
        if not isinstance(record, dict):
            continue

        if "job_id" not in record:
            continue

        job_id = str(record["job_id"])
        action = record.get("action")

        history_by_job_id[job_id] = (
            action_to_swipe_score(action)
        )

    jobs_with_scores = []

    for job in jobs:
        if "job_id" not in job:
            raise ValueError(
                "Every job must contain job_id"
            )

        updated_job = dict(job)
        job_id = str(job["job_id"])

        updated_job["swipe_score"] = (
            history_by_job_id.get(job_id, 50.0)
        )

        jobs_with_scores.append(updated_job)

    return jobs_with_scores


def rank_recommendations(
    jobs: Iterable[Dict[str, Any]],
    semantic_weight: float = SEMANTIC_WEIGHT,
    swipe_weight: float = SWIPE_WEIGHT,
) -> List[Dict[str, Any]]:
    """Rank jobs using semantic and swipe scores.

    Formula:

        recommendation_score =
            semantic_score * 0.70
            + swipe_score * 0.30
    """

    if semantic_weight < 0:
        raise ValueError(
            "semantic_weight cannot be negative"
        )

    if swipe_weight < 0:
        raise ValueError(
            "swipe_weight cannot be negative"
        )

    if abs(
        (semantic_weight + swipe_weight) - 1.0
    ) > 0.000001:
        raise ValueError(
            "Recommendation weights must add up to 1.0"
        )

    ranked_jobs = []

    for job in jobs:
        if "job_id" not in job:
            raise ValueError(
                "Every job must contain job_id"
            )

        semantic_score = clamp_score(
            job.get("semantic_score", 0.0)
        )

        swipe_score = clamp_score(
            job.get("swipe_score", 0.0)
        )

        recommendation_score = (
            semantic_score * semantic_weight
            + swipe_score * swipe_weight
        )

        ranked_job = dict(job)

        ranked_job["semantic_score"] = round(
            semantic_score,
            2,
        )

        ranked_job["swipe_score"] = round(
            swipe_score,
            2,
        )

        ranked_job["recommendation_score"] = round(
            recommendation_score,
            2,
        )

        ranked_jobs.append(ranked_job)

    ranked_jobs.sort(
        key=lambda item: item["recommendation_score"],
        reverse=True,
    )

    return ranked_jobs


def main():
    """Run a local recommendation test."""

    jobs = [
        {
            "job_id": 1,
            "title": "Backend Developer",
            "semantic_score": 83.48,
        },
        {
            "job_id": 2,
            "title": "Machine Learning Engineer",
            "semantic_score": 91.0,
        },
        {
            "job_id": 3,
            "title": "Python Developer",
            "semantic_score": 76.0,
        },
    ]

    # Example response from the Gateway API.
    swipe_history = [
        {
            "job_id": 1,
            "action": "apply",
        },
        {
            "job_id": 2,
            "action": "left",
        },
    ]

    jobs_with_swipe_scores = (
        add_swipe_scores_from_history(
            jobs,
            swipe_history,
        )
    )

    ranked_jobs = rank_recommendations(
        jobs_with_swipe_scores
    )

    print("Ranked recommendations:")

    for job in ranked_jobs:
        print(job)


if __name__ == "__main__":
    main()
