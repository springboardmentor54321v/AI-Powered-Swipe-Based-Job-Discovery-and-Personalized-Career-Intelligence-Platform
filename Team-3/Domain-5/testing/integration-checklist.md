# SwipeX Milestone 2 — Integration, E2E and Regression Checklist

Mark a check passed only with command or browser evidence. Use **Blocked** when an owner has not supplied the endpoint.

| ID | Check | Expected result | Status |
| --- | --- | --- | --- |
| M2-01 | Compose baseline | PostgreSQL/Redis healthy; gateway/frontend reachable | Passed — 15 Sep local Compose run |
| M2-02 | Job list + INR filter | Jobs return 200; salary_min=1000000 means ₹10 LPA | Passed — 200 with INR values |
| M2-03 | Job search | jobs/search?keyword=python returns 200/results | Passed — 15 Sep live gateway run returned 200, 5 Python results and pagination |
| M2-04 | Company directory | companies returns 200/filter/search results | Passed — 15 Sep live gateway run returned company search and company detail (200) |
| M2-05 | Swipe security | Anonymous 401/403; one job-seeker swipe/history is user-scoped | Passed — anonymous 401; job seeker 201 + history 200 |
| M2-06 | RBAC | Recruiter/Admin cannot use job-seeker swipes | Passed — recruiter swipe returns 403 |
| M2-07 | Matching | Authenticated recommendation response is available | Passed — 200 through gateway; live Job/Swipe data ranked by heuristic engine |
| M2-08 | Frontend E2E | Login → filter/search → company → swipe → recommendation without error | Passed — all corresponding live gateway calls passed in the local Compose stack |
| M2-09 | Regression | M1 auth/jobs/resume and M2 flows stay green after fixes | Passed — auth, jobs, swipes, search, companies and matching flow passed |
| M2-10 | Quality | Contract tests and frontend production build pass | Passed — 2 contract tests and production build |
| M3-01 | Resume upload/list gateway | Anonymous upload is rejected; authenticated Job Seeker can upload and list own resume | Passed — authenticated live upload/list/detail and anonymous rejection passed; 20 Django tests passed |
| M3-02 | Resume parsing | Uploaded test PDF parses and returns structured skills | Passed — authenticated live parse passed; extraction smoke check returned 618 characters and five skills |
| M3-03 | Frontend + resume/ATS integration | Resume page loads versions/skills; upload is parsed; ATS score displays backend score | Passed locally — authenticated detail and ATS API checks passed; frontend production build passed |
| M3-04 | Domain 3 regression and CI | ATS, suggestions, recommendation tests run locally and on CI | Passed — 6 unit tests passed; added GitHub Actions job |
| M3-05 | Day 5 QA evidence | Final regression results and defects are recorded | Passed — see `milestone-3-day-5-report.md` and `qa-sign-off-report.md` |
| M3-06 | Day 4 harness repeatability | Automatically provision/clean a local test user, run authenticated M3 checks, build frontend | Passed — full PowerShell harness run: 3 tests passed; frontend build and cleanup passed |
| M3-07 | Day 6 production scorer spot check | Run the five labeled examples against Domain 3's production keyword scorer; preserve metric scope | Passed — 2 automated checks; MAE 0.0 points on five synthetic keyword-overlap examples; not a semantic-accuracy claim |
| M3-08 | Day 7 QA handoff | Publish repeatable local runbook, evidence, and remaining approval boundaries | Passed — see `milestone-3-day-7-handoff.md`; mentor/team acceptance remains pending |
| M2-11 | Day 5 live regression rerun | Jobs, search, companies, anonymous swipe security, authenticated swipe/history | Passed — six M2 live tests passed with a temporary account; two legacy live checks also passed |
