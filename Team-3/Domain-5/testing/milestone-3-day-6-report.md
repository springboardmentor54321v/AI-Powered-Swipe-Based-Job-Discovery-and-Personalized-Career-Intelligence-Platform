# Milestone 3 Day 6 — Validation and Accuracy Spot Check

**Owner:** Intern 5 — Platform, Testing & Deployment  
**Scope:** Offline regression of production scoring logic, spot-check evidence, and defect triage.

## Validation completed

- Added `automated/day6_accuracy_spot_check.py` to evaluate the Day 6 labeled examples using Domain 3's production `calculate_keyword_ats` implementation.
- Added two automated checks in `automated/test_m3_day6_accuracy.py`; these check all five benchmark samples, expected scores, and an MAE limit.
- Re-ran Domain 3 scoring, suggestions, and recommendations tests. Recommendation service calls are mocked by the QA tests, so this suite does not call external services.
- Retained the Day 4 integrated PDF/skill extraction and ATS gateway run as the extraction integration evidence.

## Labeled keyword-score results

| Sample | Human label | Production keyword score | Absolute error |
| --- | ---: | ---: | ---: |
| 1 | 100.0% | 100.0% | 0.0% |
| 2 | 20.0% | 20.0% | 0.0% |
| 3 | 75.0% | 75.0% | 0.0% |
| 4 | 0.0% | 0.0% | 0.0% |
| 5 | 75.0% | 75.0% | 0.0% |

**Observed MAE:** 0.0 percentage points across these five examples. This is a small, synthetic, keyword-overlap benchmark. Its labels follow the same overlap rubric, so the result verifies implementation consistency; it is not evidence of general semantic accuracy or job-outcome prediction.

## Results and limits

- Day 6 accuracy checks: **2 passed**.
- Domain 3 scoring/recommendation tests: **6 passed**.
- Domain 1 resume API tests: **20 passed**.
- Full authenticated M3 harness from Day 5/6: **3 passed**, with temporary data cleaned.
- No new Critical or High defect found in the executed local scope.
- External inference quality, live hiring outcomes, and broad unbiased benchmark performance were not measured.

## Day 7 handoff

The testable local M3 scope is ready for final QA handoff. See `milestone-3-day-7-handoff.md` for the runbook, CI coverage, remaining approvals, and release boundaries.
