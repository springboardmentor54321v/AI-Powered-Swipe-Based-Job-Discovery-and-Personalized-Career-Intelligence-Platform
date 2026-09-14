# SwipeX Milestone 2 — Integration, E2E and Regression Checklist

Mark a check passed only with command or browser evidence. Use **Blocked** when an owner has not supplied the endpoint.

| ID | Check | Expected result | Status |
| --- | --- | --- | --- |
| M2-01 | Compose baseline | PostgreSQL/Redis healthy; gateway/frontend reachable | Ready |
| M2-02 | Job list + INR filter | Jobs return 200; salary_min=1000000 means ₹10 LPA | Ready |
| M2-03 | Job search | jobs/search?keyword=python returns 200/results | Blocked — endpoint confirmation required |
| M2-04 | Company directory | companies returns 200/filter/search results | Blocked — endpoint confirmation required |
| M2-05 | Swipe security | Anonymous 401/403; one job-seeker swipe/history is user-scoped | Ready |
| M2-06 | RBAC | Recruiter/Admin cannot use job-seeker swipes | Ready |
| M2-07 | Matching | Authenticated recommendation response is available | Blocked — matching service confirmation required |
| M2-08 | Frontend E2E | Login → filter/search → company → swipe → recommendation without error | Blocked until M2 APIs are live |
| M2-09 | Regression | M1 auth/jobs/resume and M2 flows stay green after fixes | Ready after M2 delivery |
| M2-10 | Quality | Contract tests and frontend production build pass | Ready |
