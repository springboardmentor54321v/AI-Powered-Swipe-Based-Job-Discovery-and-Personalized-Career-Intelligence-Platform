# SwipeX — Matching Engine Module Sign-Off & Milestone 3 Handoff

**Owner:** Intern 4 — AI/ML Career Intelligence
**Module:** Matching Engine (Heuristic Recommendation Service)
**Date:** Day 7, Milestone 2

---

## 1. Module Summary

The Matching Engine is a **rule-based (heuristic) recommendation service** that ranks
jobs for each user in the swipe feed. It does **not** use a trained machine learning
model in Milestone 2 — scoring is calculated using a fixed weighted formula applied to
profile and swipe-history data.

**Endpoint delivered:** `GET /api/v1/recommendations?user_id=<id>`
Returns a ranked list of jobs, each with a `match_score` (0–100) and human-readable
`reason_tags`.

---

## 2. Scope Boundary — What This Module IS and IS NOT

| This module IS | This module IS NOT |
|---|---|
| A rule-based weighted scoring formula | A trained AI/ML model |
| Using structured signals: skills overlap, location match, experience fit, swipe history | Using NLP, embeddings, or resume text understanding |
| A placeholder ranking layer for Milestone 2 demo purposes | ATS-aware or resume-parsing driven |
| Deterministic and explainable (reason tags show *why* a job is scored) | Learning/adapting automatically over time (no model training loop yet) |

This boundary is intentional per the SRS (Section 1.3, 1.5) — the real NLP/ML-driven,
ATS-aware ranking model is explicitly scheduled for **Milestone 3**.

---

## 3. Scoring Methodology (As Implemented)

**Formula:**
```
match_score = (skills_score × 0.4)
            + (location_score × 0.2)
            + (experience_score × 0.2)
            + (swipe_history_score × 0.2)
```

| Factor | How it's calculated |
|---|---|
| Skills | Overlap between user skills and job-required skills |
| Location | Exact city match, or 1.0 if job is Remote |
| Experience | Penalizes under-qualification, tapers gently for over-qualification |
| Swipe history | 1.0 if user liked a similar/same job before, 0.0 if skipped, 0.5 if no signal |

**Reason tags** generated per job: "Matches your skills", "Near your location",
"Low competition", "Recently posted", "Good experience fit" (fallback: "General match").

**Bug fix applied (Day 6):** Jobs the user already swiped left (skip) on are now
excluded from future recommendations — verified with a regression test.

---

## 4. Test Coverage

20 unit tests covering skills/location/experience/swipe-history scoring, reason-tag
generation, full scoring integration, and the skipped-job exclusion bug fix.
All 20 tests passing (`pytest day6test_matching.py -v`).

---

## 5. Integration Status

- Reachable through the API Gateway (registered by Intern 2)
- Consumes live Job data (Intern 3) and Swipe history (Intern 2) once their services
  are pulled from GitHub — currently falls back to mock data if unavailable
- Frontend (Intern 1) consumes this endpoint to replace the static/chronological
  swipe queue with a personalized feed

---

## 6. Milestone 3 Roadmap — How This Evolves

The current heuristic engine is the **foundation**, not the final product. For
Milestone 3, this module should evolve into a real AI/ML-driven, ATS-aware
recommendation system:

1. **Replace fixed weights with a trained model**
   Use logged swipe interactions (likes/skips) as training data for a learning-to-rank
   or classification model instead of hand-set weights (0.4 / 0.2 / 0.2 / 0.2).

2. **Add resume/ATS-aware matching**
   Parse resume text (skills, experience, education) using NLP instead of relying only
   on structured profile fields, and score against job descriptions directly —
   consistent with the ATS heuristic stub mentioned in the Milestone 1 baseline.

3. **Add semantic skill matching**
   Move beyond exact string overlap (e.g., "JS" vs "JavaScript") using embeddings or a
   skill-taxonomy mapping, so related skills are recognized as matches.

4. **Personalization feedback loop**
   Continuously retrain or adjust scoring based on ongoing swipe behavior per user,
   rather than a static formula.

5. **Explainability carries forward**
   Keep the `reason_tags` concept — even a trained model should surface human-readable
   reasons, for user trust and product UX consistency.

---

## 7. Sign-Off

- [x] Final test with full team completed
- [x] Scope clearly documented — heuristic only, real AI/ML model scheduled for Milestone 3
- [x] Handover notes written for Milestone 3

**Module Owner:** Intern 4 — AI/ML Career Intelligence
**Status:** Ready for Milestone 2 demo and mentor review
