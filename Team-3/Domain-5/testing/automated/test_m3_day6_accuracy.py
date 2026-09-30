"""Day 6 QA checks against the actual Domain 3 keyword ATS scorer."""

from day6_accuracy_spot_check import run_spot_check


def test_accuracy_spot_check_uses_all_labeled_cases():
    result = run_spot_check()

    assert result["samples"] == 5
    assert [item["sample_id"] for item in result["sample_details"]] == [1, 2, 3, 4, 5]


def test_keyword_scorer_matches_labeled_overlap_rubric():
    result = run_spot_check()

    assert result["mean_absolute_error_pct"] <= 1.0
    assert [item["production_keyword_score_pct"] for item in result["sample_details"]] == [
        100.0,
        20.0,
        75.0,
        0.0,
        75.0,
    ]
