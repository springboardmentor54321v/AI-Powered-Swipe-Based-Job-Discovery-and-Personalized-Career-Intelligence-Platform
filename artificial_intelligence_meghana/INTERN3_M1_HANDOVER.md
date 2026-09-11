# Intern 3 — Milestone 1 Handover

## 1. Module
**AI/ML Career Intelligence** (SwipeX Project — Intern 3 Role)

---

## 2. Completed Features

All Intern 3 Milestone 1 (Days 1–7) features have been fully implemented, preserved, and verified:

- **AI/NLP Environment Setup (Day 1)**: Python environment configured with FastAPI, pandas, pdfplumber, spaCy, and scikit-learn.
- **Feature Planning (Day 1)**: Formulated feature roadmap (`FEATURE_PLAN.md`) establishing heuristic resume-to-job matching strategy.
- **Exploratory Data Analysis (Day 2)**: Analyzed 200 job records from `data/jobs.csv` and documented findings in `notebooks/eda.ipynb` and `EDA_REPORT.md`.
- **Resume Parsing (Day 3)**: Extracted plain text from candidate PDF resumes using `pdfplumber` (`src/parser.py`).
- **Skill Extraction (Day 3)**: Extracted technical skills deterministically using regex keyword matching against a controlled skill vocabulary (`src/skills.py`).
- **Resume Upload API (Day 3)**: Endpoint `POST /api/v1/resume/upload` to parse and store candidate skills in memory (`src/main.py`).
- **Heuristic ATS Scoring (Day 4)**: Calculated exact required skill overlap match percentage and identified missing required keywords (`src/ats.py`).
- **Heuristic Job Recommendations (Day 4)**: Ranked job postings from `jobs.csv` by match percentage in descending order (`src/recommender.py`).
- **Gateway & Dashboard Display Contract (Day 5)**: Documented Gateway routing specifications for Intern 1 and UI contracts for Intern 4 (`INTERN3_DISPLAY_CONTRACT.md`).
- **Milestone 2 AI/ML Roadmap (Day 5)**: Authored strategic migration plan to statistical ML and NLP (`M2_AI_ROADMAP.md`).
- **Rule-Based Testing & Verification (Day 6)**: Created comprehensive unit & API test suite covering all ATS and recommendation edge cases (`tests/test_day6.py`).

---

## 3. API Contracts

### 3.1 Resume Upload
- **Endpoint**: `POST /api/v1/resume/upload`
- **Headers**: `Content-Type: multipart/form-data`
- **Query Parameters**: `user_id` (optional `string`)
- **Request Body**: Form field `file` containing `.pdf` file.
- **Response Format (`201 Created`)**:
```json
{
  "resume_id": "c9b78e42-12a4-4f89-b1d6-847e099231f4",
  "parsed_skills": [
    "Docker",
    "Git",
    "Python",
    "SQL"
  ]
}
```

### 3.2 Rule-Based ATS Scoring
- **Endpoint**: `GET /api/v1/resume/{resume_id}/ats-score?job_id={id}`
- **Path Parameters**: `resume_id` (`string`, required)
- **Query Parameters**: `job_id` (`string`, required e.g. `J001`)
- **Response Format (`200 OK`)**:
```json
{
  "match_score": 75.0,
  "missing_keywords": [
    "FastAPI"
  ],
  "generated_by": "heuristic-v0"
}
```

### 3.3 Candidate Job Recommendations
- **Endpoint**: `GET /api/v1/recommendations?user_id={id}`
- **Query Parameters**: `user_id` (`string`, required), `resume_id` (optional `string`)
- **Response Format (`200 OK`)**:
```json
[
  {
    "job_id": "J001",
    "match_percentage": 100.0,
    "generated_by": "heuristic-v0"
  },
  {
    "job_id": "J004",
    "match_percentage": 75.0,
    "generated_by": "heuristic-v0"
  }
]
```

---

## 4. ATS Logic

The ATS scoring engine computes candidate suitability deterministically based on required skill overlap:

$$\text{Match Score} = \frac{\text{Matched Required Skills}}{\text{Total Job Required Skills}} \times 100$$

### Key Rules:
1. **Deduplication**: Required skills for the target job and candidate skills are deduplicated case-insensitively. Duplicate skill listings do not artificially inflate or deflate the match score.
2. **Missing Keywords**: Required job skills not present in candidate skills are returned in `missing_keywords`.
3. **Empty Requirements Edge Case**: If a job specifies no required skills, a `100.0%` score with empty missing keywords is returned.
4. **Contract Tag**: Every ATS response explicitly contains `"generated_by": "heuristic-v0"`.

---

## 5. Recommendation Logic

The recommendation engine ranks job postings from `data/jobs.csv` for candidate display:
1. Candidate skills are extracted from the candidate's active uploaded resume (associated via `resume_id` or `user_id`).
2. For every job in `jobs.csv`, required skills are parsed from the `Required Skills` field.
3. Match score is calculated using `calculate_ats_score`.
4. Jobs are sorted in **descending order of `match_percentage`**, with secondary ascending sort by `job_id` for deterministic output.
5. All recommendation items include `"generated_by": "heuristic-v0"`.

---

## 6. Testing

### Test Suites Created & Executed:
- `test_day2_day3.py`: Validates dataset integrity (`jobs.csv`), EDA report structure, PDF parsing (`pdfplumber`), skill extractor, upload endpoint, and route registration.
- `test_day4_day5.py`: Validates ATS unit calculation, ATS API endpoint, job recommendation engine, and error handling for invalid IDs.
- `tests/test_day6.py`: Comprehensive test suite verifying edge cases A through I for ATS scoring, edge cases A through G for recommendations, response contracts, and QA defect status.
- `run_all_tests.py`: Master test runner running all test suites.

### Results:
- **Total Tests Executed**: 49 tests.
- **Tests Passed**: 49 tests (100% pass rate).
- **Tests Failed**: 0 tests.

---

## 7. Milestone 1 Scope

> [!IMPORTANT]
> **Milestone 1 uses simple heuristic / rule-based logic only. No trained AI/ML model, deep learning, BERT, transformer, embedding vector space, vector database, or LLM was implemented or used.**

---

## 8. Milestone 2 Handover

Refer to `M2_AI_ROADMAP.md` for full details. High-level transition plan:
1. **Skill & Entity Extraction**: Replace regex keyword matching with a fine-tuned Transformer NER model or LLM entity extraction to capture contextual experience and unlisted skill synonyms.
2. **Semantic ATS Matcher**: Replace exact keyword matching with dense text embeddings (e.g. Sentence-Transformers `all-MiniLM-L6-v2`) and dual-encoder semantic similarity scoring.
3. **Personalized Ranking**: Train a Learning-to-Rank (L2R) or Two-Tower Neural Architecture incorporating user swipe signals.

---

## 9. Known Limitations

1. **Exact Vocabulary Matching**: Skill extraction relies on the controlled vocabulary of 39 skills. Unlisted skill synonyms (e.g., "Postgres" vs "SQL") require exact spelling matches in `heuristic-v0`.
2. **Keyword Match vs Semantic Context**: The heuristic ATS engine measures keyword presence without measuring depth of experience or seniority.
3. **In-Memory Resume Storage**: Uploaded resumes are stored in-memory (`RESUME_STORE`). Restarting the Python service resets uploaded resumes.
4. **QA Defect Log Availability**: Intern 5 defect log was not available for local verification in this workspace.

---

## 10. Integration Status

- **Gateway Integration**: Configured & documented in `INTERN3_DISPLAY_CONTRACT.md`. Upstream target `http://intern3-ai-service:8003`.
- **Frontend Dashboard Contract**: Contract frozen & documented in `INTERN3_DISPLAY_CONTRACT.md`.
- **Full-Team Test Status**: `PENDING TEAM INTEGRATION` (Standalone verification completed successfully; full-team end-to-end integration requires running Gateway, Job Service, User Service, and Frontend concurrently).
