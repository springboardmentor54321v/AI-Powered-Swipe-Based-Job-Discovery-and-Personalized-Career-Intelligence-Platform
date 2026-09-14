# SwipeX Milestone 2 — Defect Log

| ID | Area | Finding | Severity / Priority | Owner | Status | Retest evidence |
| --- | --- | --- | --- | --- | --- | --- |
| M2-DEF-001 | Integration readiness | M2 jobs/search and companies endpoints are not available in the checked workspace. | High / P1 | Intern 2 | Blocked | Run M2 live tests after delivery. |
| M2-DEF-002 | Matching integration | No independent Matching Engine image/Dockerfile is available. Compose template is ready but cannot start it yet. | High / P1 | Matching owner | Blocked | Start matching-engine profile and run recommendation tests. |
| M2-DEF-003 | Frontend merge | Domain-4 App.jsx had unresolved merge markers. | High / P1 | Frontend | Resolved locally | Complete role-router selected; record build result. |
| M2-DEF-004 | Salary consistency | Cards used dollars despite annual INR API values; LPA filters sent incorrect numeric values. | Medium / P2 | Frontend | Resolved locally | ₹ display and INR numeric values added. |

Workflow: Open → In Progress → Fixed → Retest → Closed. Close a defect only after re-running the failed test.
