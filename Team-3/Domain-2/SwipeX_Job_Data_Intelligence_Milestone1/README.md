# SwipeX Job & Data Intelligence

Milestone 1 module for job/company data, job discovery, and swipe tracking. It is intentionally independent so Intern 1 can register it behind the API Gateway at `/api/v1`.

## Delivered scope

- Normalized `Company`, `Job`, and `Swipe` schema; one swipe per user/job, updated on a repeated action.
- Synthetic seed set for first-run API testing, plus an importer for the collected cleaned job dataset.
- Contract-compatible job list/detail, filtering, swipe-create, and swipe-history APIs.
- Redis-backed job-feed cache with automatic local-memory fallback for development.
- PostgreSQL/Redis Docker Compose setup, tests, and OpenAPI documentation at `/docs`.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
pytest
```

Or start the development stack with `docker compose -f docker-compose.dev.yml up --build`.

Run the real-dataset smoke test after importing data:

```powershell
python scripts/smoke_test.py
```

## Import the collected job dataset

Your collected `cleaned_jobs.csv` can be imported with:

```powershell
python scripts/import_cleaned_jobs.py "C:\Users\harik\OneDrive\Documents\cleaned_jobs.csv" --replace
```

For a large file, resume in batches without duplicating earlier rows, for example: `--skip 20000 --limit 20000`.

The supplied dataset contains 97,358 job records and 18,483 companies. It includes title, company, skills, experience, salary, location, and description. It does **not** contain employment type, remote status, or company category, so the importer records those fields as `Not specified in source data` (and does not infer them).

## API contract

| Endpoint | Purpose |
| --- | --- |
| `GET /api/v1/jobs` | List jobs. Supports `type`, `location`, `remote`, `salary_min`, `salary_max`, `skills`, and `company_type`. |
| `GET /api/v1/jobs/{job_id}` | Get full job detail. |
| `POST /api/v1/swipes` | Save/update a left or right swipe. Gateway must forward JWT subject as `X-User-Id`. |
| `GET /api/v1/swipes/history` | Return the authenticated user's swipe history. |

Example swipe request:

```http
POST /api/v1/swipes
X-User-Id: 42
Content-Type: application/json

{"job_id": 1, "direction": "right"}
```

`right` means save/apply intent; the application workflow can be added in a later module without changing the swipe event record.
