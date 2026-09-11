# Milestone 3 Handoff Document — SwipeX Matching Engine & Career Intelligence

This document is the engineering handoff guide for the engineer who will implement the **Milestone 3 AI/ML Recommendation Engine**.

---

## 1. Current Milestone 2 Architecture Overview

The Milestone 2 Matching Engine is located in `intern3-ai-service/`:

```
intern3-ai-service/
├── src/
│   ├── main.py           # FastAPI application & endpoint routes
│   ├── recommender.py    # Heuristic scoring engine & preference learning
│   ├── ats.py            # Rule-based skill overlap scoring
│   ├── parser.py         # PDF resume text extraction (pdfplumber)
│   └── skills.py         # Deterministic skill keyword extractor
├── data/
│   └── jobs.csv          # Job postings dataset (200 records)
├── tests/
│   ├── test_day5_gateway.py    # Gateway integration test suite (10 tests)
│   ├── test_day6_intern4.py    # Scoring & QA edge cases test suite (16 tests)
│   └── test_intern4_m2.py      # Days 1–4 core feature test suite (14 tests)
├── INTERN4_GATEWAY_CONTRACT.md # Gateway proxy specifications
├── MILESTONE_2_SCOPE.md        # M2 heuristic scope boundaries
└── MILESTONE_3_AI_ML_ROADMAP.md # Strategic M3 roadmap
```

---

## 2. Recommendation Endpoints & Contracts

### 2.1 GET `/api/v1/recommendations`
- **Purpose**: Returns personalized job recommendations sorted by `match_score` descending.
- **Query Params**: `user_id` (`string`, required), `resume_id` (`string`, optional).
- **Response Format (`200 OK`)**:
```json
[
  {
    "job_id": "J001",
    "job_title": "Python Developer",
    "company": "Tech Corp",
    "location": "Bangalore",
    "match_score": 87,
    "match_percentage": 87.0,
    "reasons": [
      "Matches your skills",
      "Matches your preferred location",
      "Remote job",
      "Based on your swipe history"
    ],
    "generated_by": "heuristic-v0"
  }
]
```

### 2.2 POST `/api/v1/swipes`
- **Purpose**: Records candidate swipe actions for real-time preference learning.
- **Request Payload**: `{"user_id": "U001", "job_id": "J001", "action": "RIGHT"}`
- **Supported Actions**: `RIGHT`, `LEFT`, `LIKE`, `DISLIKE`, `APPLY`, `SAVE`, `SKIP`.

### 2.3 POST `/api/v1/user/profile`
- **Purpose**: Updates candidate preference settings.
- **Request Payload**: `{"user_id": "U001", "location": "Bangalore", "experience_years": 2.0, "remote_preference": true, "preferred_job_type": "Full-time"}`

---

## 3. Current Heuristic Scoring Formula

The match score for job $J$ and user $U$ is calculated in `src/recommender.py`:

$$\text{Match Score} = \min\left(100, \max\left(0, \text{round}(S_{\text{skills}} + S_{\text{location}} + S_{\text{experience}} + S_{\text{job\_type}} + S_{\text{freshness}} + S_{\text{swipe\_adj}})\right)\right)$$

### Factor Breakdown:
1. **Skill Match ($S_{\text{skills}}$, Max 45 pts)**: $\frac{|\text{Candidate Skills} \cap \text{Job Skills}|}{|\text{Job Skills}|} \times 45$
2. **Location Match ($S_{\text{location}}$, Max 20 pts)**: $+20$ for exact city match or preferred remote, $+15$ for remote job.
3. **Experience Match ($S_{\text{experience}}$, Max 15 pts)**: $+15$ for exact experience range fit (`0-1`, `1-3`, `2-4`), $+8$ for partial.
4. **Job Type ($S_{\text{job\_type}}$, Max 10 pts)**: $+10$ for exact preferred job type match.
5. **Freshness & Competition ($S_{\text{freshness}}$, Max 10 pts)**: $+5$ for top 25% recency, $+5$ for startup company type.
6. **Swipe Preference Adjustment ($S_{\text{swipe\_adj}}$, $-15 \le S_{\text{swipe\_adj}} \le +15$)**: Cumulative score shifts derived from swipe history.

---

## 4. Reason Tag Generation Rules

Reason tags are appended to recommendations **only if the corresponding factor contributes positive points**:
- `"Matches your skills"`: Matched $\ge 2$ required skills or skill match ratio $\ge 50\%$.
- `"Matches your preferred location"`: Candidate city matches job city.
- `"Remote job"`: Job is tagged remote or location is `"Remote"`.
- `"Low competition"`: `Company Type == "Startup"`.
- `"Recently posted"`: Job index within first 25% of dataset.
- `"Matches your experience"`: Candidate experience falls within required range.
- `"Based on your swipe history"`: Swipe adjustment $S_{\text{swipe\_adj}} \ge +3.0$.

---

## 5. Gateway Routing

- Gateway Route: `GET /api/v1/recommendations` -> forwarded to `http://intern3-ai-service:8003/api/v1/recommendations`.
- Gateway Contract details documented in `INTERN4_GATEWAY_CONTRACT.md`.

---

## 6. Backward Compatibility Requirements for Milestone 3

When replacing or augmenting the heuristic scorer with an AI/ML model in Milestone 3:

1. **Keep existing endpoints unchanged**: `GET /api/v1/recommendations`, `POST /api/v1/swipes`, `POST /api/v1/user/profile`.
2. **Preserve JSON Response Keys**: Ensure `job_id`, `job_title`, `company`, `location`, `match_score`, `match_percentage`, `reasons`, and `generated_by` are always returned.
3. **Update Tag**: Change `generated_by` from `"heuristic-v0"` to `"ml-v1-lightgbm"` (or similar).
4. **Fallback Mechanism**: Maintain `src/recommender.py` heuristic function as a fallback if the ML model service is unavailable or encounters sparse feature vectors.

---

## 7. Recommended Milestone 3 ML Integration Strategy

```
                          ┌────────────────────────┐
                          │  GET /recommendations  │
                          └───────────┬────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │  Extract Candidate Features   │
                      │  (Resume + Profile + Swipes)  │
                      └───────────────┬───────────────┘
                                      │
                       Is ML Model Available & Warm?
                                   ╱     ╲
                            YES  ╱         ╲  NO
                               ╱             ╲
                              ▼               ▼
                   ┌──────────────────┐  ┌──────────────────┐
                   │  LightGBM / L2R  │  │  Heuristic Scorer │
                   │  Model Inference │  │  (recommender.py)│
                   └────────┬─────────┘  └────────┬─────────┘
                            │                     │
                            └──────────┬──────────┘
                                       │
                                       ▼
                           ┌───────────────────────┐
                           │   SHAP Reason Tags    │
                           │   & Formatted Payload │
                           └───────────────────────┘
```

1. **Feature Vectorization**: Combine ATS skill overlap ratio, location distance, candidate experience years delta, and historical swipe preference counts into a `pandas` DataFrame.
2. **Model Inference**: Pass feature vector batch into a trained `LightGBM` Ranker model to predict candidate-job relevance scores.
3. **Reason Generation**: Use SHAP values from the decision tree model to isolate top 3 contributing positive features and map them to human-readable reason tags.
