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
