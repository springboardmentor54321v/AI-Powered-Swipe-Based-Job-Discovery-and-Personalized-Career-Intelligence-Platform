# SwipeX — Resume/ATS/Recommendation Service — Milestone 1 Scope Note

**Owner:** Intern 3 — AI/ML Career Intelligence
**Milestone:** Milestone 1 (Days 1–7)
**Status:** Heuristic stub only — no trained model

## Summary

The ATS-scoring and job-recommendation features shipped in Milestone 1 are
**rule-based**, not powered by a trained AI/ML model. They exist to unblock
frontend (Intern 4) and QA (Intern 5) integration ahead of real NLP/embedding
model development in Milestone 2, per the SwipeX SRS (Section 7.3).

Every response from these endpoints includes `"generated_by": "heuristic-v0"`
so downstream consumers can clearly distinguish stub output from a future
trained-model output.

## How the current logic works

### Resume parsing (`POST /api/v1/resume/upload`)
- Extracts raw text from the uploaded PDF (pdfplumber / PyPDF2).
- Matches text against a fixed skill keyword list to produce `parsed_skills[]`.
- No semantic understanding — matching is exact/substring keyword matching only.

### ATS scoring (`GET /api/v1/resume/{resume_id}/ats-score`)
- Compares `parsed_skills[]` from the resume against the target job's required
  skills list.
- `match_score` = percentage of job-required skills found in the resume.
- `missing_keywords[]` = job-required skills not found in the resume.
- No weighting by skill importance, seniority, or context — every skill counts equally.

### Recommendations (`GET /api/v1/recommendations?user_id={id}`)
- For a given user's most recent resume, compares skill overlap against all
  jobs in the dataset.
- Returns jobs ranked by overlap percentage as `match_percentage`.
- No use of swipe history, semantic similarity, or collaborative filtering yet.

## Known limitations

- Keyword overlap only — synonyms, related skills, and phrasing differences
  (e.g. "JS" vs "JavaScript") are not recognized unless explicitly listed.
- No weighting of skill importance or years of experience.
- No use of embeddings or semantic similarity.
- No learning from user swipe behavior (right/left swipes don't yet influence
  recommendations).
- Synthetic/seed job and resume data — real-world resume formatting variance
  has not been tested at scale.

## Why this is intentional

Per the SRS Golden Rule and Milestone 1 scope, deep NLP/ML work was explicitly
deferred to Milestone 2 so all five service domains could integrate end-to-end
on Day 4–5 without waiting on model training. This stub gives Intern 1 (gateway
routing), Intern 4 (UI), and Intern 5 (test coverage) a stable, working contract
to build and test against.

See `M2_HANDOVER.md` for the planned upgrade path.
