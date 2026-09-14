# SwipeX Milestone 2 API Contract

Status: **test baseline**. Intern 5 owns the tests for this document; service owners must confirm response shapes before final QA sign-off.

## Public discovery APIs

| Endpoint | Required behaviour |
| --- | --- |
| GET /api/v1/jobs | Returns 200 and a JSON list (or a paginated object containing a list). Supports location, salary_min, salary_max, skills, company_type, remote, and job-type filters. |
| GET /api/v1/jobs/{job_id} | Returns one job with title, company, location, salary range and skills; unknown ID returns 404. |
| GET /api/v1/jobs/search | Returns 200 search results for keyword and optional M2 filters. |
| GET /api/v1/companies | Returns 200 company results; supports search, industry, and company_type when implemented. |

## Protected user APIs

| Endpoint | Required behaviour |
| --- | --- |
| POST /api/v1/swipes | Job Seeker bearer token required. Creates or updates one user/job action and returns 201. |
| GET /api/v1/swipes/history | Job Seeker bearer token required. Returns only the current user history. |
| GET /api/v1/recommendations | Job Seeker bearer token required. Returns M2 matching/recommendation output. |

## Security rules

- A missing or invalid token on protected APIs returns 401 or 403.
- Recruiter and Admin credentials cannot perform job-seeker swipe actions.
- The gateway, not the browser, is the only trusted source of X-User identity headers.
- Salary values are annual INR integers. UI formatting uses ₹ and the en-IN locale.

## Deferred contract rule

If an M2 endpoint has not been delivered yet, its live test must fail or be recorded as **Blocked**. It must never be marked passed merely because it was not tested.
