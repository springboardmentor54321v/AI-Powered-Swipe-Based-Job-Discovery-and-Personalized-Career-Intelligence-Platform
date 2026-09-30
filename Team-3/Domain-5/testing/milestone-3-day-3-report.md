# Milestone 3 Day 3 QA report

## Executed

- Added opt-in live checks for anonymous resume upload rejection and the authenticated upload → list → parse flow in `automated/test_m3_live_contracts.py`.
- Ran against the local gateway with `SWIPEX_M3_GATEWAY_URL=http://localhost:8080`.
- Result: **1 passed, 1 skipped**. Anonymous upload now receives the expected 401/403. Authenticated upload/list/parse skipped because no disposable Job Seeker token was configured.
- The first run exposed an Nginx 404 for `/api/v1/resumes/upload`. Added gateway routes for `/api/v1/resumes/`, `/api/v1/ats/`, and `/api/v1/suggestions/`, recreated the local gateway, and confirmed the anonymous route check passes.

## Open integration blocker

The Django extraction adapter resolves Intern 4's code under `/Domain-3/Milestone3work`, but the full Compose auth image is built from Domain 1 and does not mount that directory. Its requirements also do not install pdfplumber or spaCy. Coordinate with Interns 4 and 5 on making the extraction source and dependencies available to the auth service, then rerun the authenticated parse test.

## Evidence limits

No authenticated resume was uploaded, and parsing was not verified. Do not treat Day 3 API validation as complete until a disposable Job Seeker token is supplied and the upload/list/parse test passes. No production deployment was performed.

## Day 5 follow-up

The Day 3 integration blocker was resolved locally. Day 5 rebuilt the auth image, verified PDF and skill extraction, and passed the authenticated upload/list/detail/parse/ATS gateway test using a temporary account that was removed afterward. See `milestone-3-day-5-report.md` for the final regression results.
