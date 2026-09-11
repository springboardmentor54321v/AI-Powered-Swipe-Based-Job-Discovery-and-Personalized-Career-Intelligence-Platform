# SwipeX Intern 4 — Gateway & Routing Contract (Milestone 2)

This document specifies the Gateway routing configuration and API contracts for Intern 4's **Matching Engine & Career Intelligence Service** (`intern3-ai-service`).

---

## 1. Upstream Service Architecture

- **Service Name**: `intern3-ai-service` / `intern4-matching-service`
- **Default Upstream Port**: `8000` (or `8003`)
- **Base URL**: `http://127.0.0.1:8000` (Local) / `http://intern3-ai-service:8003` (Containerized)

---

## 2. Registered Gateway Routes

Intern 1's API Gateway proxies the following endpoints to the Matching Engine backend:

### 2.1 GET Candidate Job Recommendations
- **Client Route**: `GET /api/v1/recommendations`
- **Gateway Proxy Target**: `http://127.0.0.1:8000/api/v1/recommendations`
- **Query Parameters**:
  - `user_id` (`string`, required) — Candidate user ID
  - `resume_id` (`string`, optional) — Specific resume ID (defaults to latest uploaded resume)
- **Response (`200 OK`)**:
```json
[
  {
    "job_id": "J001",
    "job_title": "Python Developer",
    "company": "Tech Corp",
    "location": "Bangalore",
    "match_score": 85,
    "match_percentage": 85.0,
    "reasons": [
      "Matches your skills",
      "Remote job",
      "Low competition"
    ],
    "generated_by": "heuristic-v0"
  }
]
```

### 2.2 POST Record User Swipe
- **Client Route**: `POST /api/v1/swipes`
- **Gateway Proxy Target**: `http://127.0.0.1:8000/api/v1/swipes`
- **Request Body (`application/json`)**:
```json
{
  "user_id": "U001",
  "job_id": "J001",
  "action": "RIGHT"
}
```
- **Allowed Actions**: `RIGHT`, `LEFT`, `LIKE`, `DISLIKE`, `APPLY`, `SAVE`, `SKIP`
- **Response (`201 Created`)**:
```json
{
  "status": "recorded",
  "user_id": "U001",
  "job_id": "J001",
  "action": "RIGHT",
  "total_swipes": 1
}
```

### 2.3 POST Update User Preference Profile
- **Client Route**: `POST /api/v1/user/profile`
- **Gateway Proxy Target**: `http://127.0.0.1:8000/api/v1/user/profile`
- **Request Body (`application/json`)**:
```json
{
  "user_id": "U001",
  "location": "Bangalore",
  "experience_years": 2.0,
  "remote_preference": true,
  "preferred_job_type": "Full-time"
}
```
- **Response (`200 OK`)**:
```json
{
  "status": "profile_updated",
  "user_id": "U001",
  "profile": {
    "location": "Bangalore",
    "experience_years": 2.0,
    "remote_preference": true,
    "preferred_job_type": "Full-time"
  }
}
```

---

## 3. End-to-End Flow Validation

```
[ Client / Dashboard ]
       │
       ▼
 [ API Gateway ]  (Proxies GET /api/v1/recommendations?user_id=U001)
       │
       ▼
[ Matching Engine ] (src/main.py -> src/recommender.py)
       │
       ├── Reads candidate skills from RESUME_STORE / USER_RESUME_MAP
       ├── Reads user preferences from USER_PROFILE_STORE
       ├── Reads swipe history from SWIPE_STORE
       ├── Computes 6-factor heuristic score for all jobs in data/jobs.csv
       └── Sorts jobs descending by match_score & returns JSON list
       │
       ▼
[ Client Response ]
```

---

## 4. Verification

The full gateway routing path is verified via automated joint integration tests in `tests/test_day5_gateway.py`.
