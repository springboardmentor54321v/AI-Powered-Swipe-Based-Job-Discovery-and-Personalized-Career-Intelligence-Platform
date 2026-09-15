# SwipeX Milestone 2 — Defect Log

| ID | Area | Finding | Severity / Priority | Owner | Status | Retest evidence |
| --- | --- | --- | --- | --- | --- | --- |
| M2-DEF-001 | Job search and company API | The authenticated gateway route is wired and live, but the downstream Job service has no search/company implementation: jobs/search returns 422 and companies returns 404. | High / P1 | Intern 2 | Open | 15 Sep local Compose test through gateway; route/security wiring verified. |
| M2-DEF-002 | Matching integration | No independent Matching Engine image/Dockerfile is available. Compose template is ready but cannot start it yet. | High / P1 | Matching owner | Blocked | Start matching-engine profile and run recommendation tests. |
| M2-DEF-003 | Frontend merge | Domain-4 App.jsx had unresolved merge markers. | High / P1 | Frontend | Resolved locally | Complete role-router selected; record build result. |
| M2-DEF-004 | Salary consistency | Cards used dollars despite annual INR API values; LPA filters sent incorrect numeric values. | Medium / P2 | Frontend | Resolved locally | ₹ display and INR numeric values added. |
| M2-DEF-005 | Local Docker | Docker Desktop Linux engine was unavailable after launch and WSL restart. | High / P1 | Local environment | Closed | 15 Sep: Docker Server 29.7.2 available; all seven local services started. |

Workflow: Open → In Progress → Fixed → Retest → Closed. Close a defect only after re-running the failed test.
