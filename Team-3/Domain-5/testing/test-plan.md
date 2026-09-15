# SwipeX Milestone 2 — Intern 5 Test Plan

## Purpose

Validate the M2 local platform: Job, Search, Company, Swipe, Matching/Recommendations, gateway permissions, frontend flow, and regression. Production packaging and deployment are excluded.

## Coverage

| Level | Intern 5 work | Evidence |
| --- | --- | --- |
| Contract | Maintain M2 endpoint/security expectations | milestone-2-api-contracts.md |
| API automation | Job/filter/search/company/swipe smoke tests | test_m2_live_contracts.py |
| Integration | Run services together through Docker Compose | integration-checklist.md |
| E2E | Login → filter/search → company → swipe → recommendation | browser/API evidence |
| RBAC | Anonymous, job seeker, recruiter, admin access rules | HTTP status evidence |
| Regression | Re-run M1/M2 flows after fixes | quality report |

## Entry criteria

1. Docker Desktop is running.
2. Gateway, frontend, PostgreSQL, Redis, Job/Swipe/Company and Matching services are available locally.
3. M2 API response shapes are confirmed by service owners.
4. A disposable job-seeker token is available for protected tests.

## Exit criteria

- Contract tests and frontend production build pass.
- Every required live test passes, or has a defect record and approved exception.
- No Critical or High defect remains open.
- Regression, RBAC and E2E evidence is attached.
- QA report records that no production deployment happened.

## Commands

    python -m pytest testing\\automated -m "not integration"
    $env:SWIPEX_M2_GATEWAY_URL = "http://localhost:8080"
    python -m pytest testing\\automated\\test_m2_live_contracts.py -m integration
    $env:SWIPEX_M2_ACCESS_TOKEN = "<temporary-job-seeker-token>"
    python -m pytest testing\\automated\\test_m2_live_contracts.py -m integration
