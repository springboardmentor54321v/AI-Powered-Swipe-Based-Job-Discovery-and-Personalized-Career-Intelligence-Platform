# SwipeX Milestone 2 — Defect Log

| ID | Area | Finding | Severity / Priority | Owner | Status | Retest evidence |
| --- | --- | --- | --- | --- | --- | --- |
| M2-DEF-001 | Job search and company API | Search and Company APIs were missing from the downstream Job service. | High / P1 | Domain-2 Job/Data | Closed | 15 Sep: search, company list and company detail return 200 through the live gateway; pagination, freshness and competition values verified. |
| M2-DEF-002 | Matching integration | No independent Matching Engine image/Dockerfile was available. | High / P1 | Matching owner | Closed | 15 Sep: matching-engine container started; authenticated gateway request returned ranked live recommendations (200). |
| M2-DEF-003 | Frontend merge | Domain-4 App.jsx had unresolved merge markers. | High / P1 | Frontend | Resolved locally | Complete role-router selected; record build result. |
| M2-DEF-004 | Salary consistency | Cards used dollars despite annual INR API values; LPA filters sent incorrect numeric values. | Medium / P2 | Frontend | Resolved locally | ₹ display and INR numeric values added. |
| M2-DEF-005 | Local Docker | Docker Desktop Linux engine was unavailable after launch and WSL restart. | High / P1 | Local environment | Closed | 15 Sep: Docker Server 29.7.2 available; all seven local services started. |

Workflow: Open → In Progress → Fixed → Retest → Closed. Close a defect only after re-running the failed test.
