# SwipeX Milestone 3 — Intern 5 QA Summary

**QA owner:** Intern 5 — Platform, Testing & Deployment
**Environment:** Local Docker Compose and test databases
**Production deployment:** None

## Day 5 regression completed

- M2 live gateway regression: **6 passed**, including authenticated swipe/history with a temporary Job Seeker account.
- Legacy live gateway contracts: **2 passed**.
- M3 live gateway contract flow: **3 passed** using a temporary Job Seeker. Upload, list, version detail, parse, and ATS scoring all passed. Anonymous upload and ATS requests were rejected as expected.
- Day 4 PowerShell harness: **passed end to end** with automatic temporary-account provisioning, all three M3 live tests, frontend build, cleanup, and environment restoration.
- Temporary M2/M3 accounts, synthetic resume file, test swipe, and unreferenced test skills were removed after the runs.
- Domain 1 M3 resume API suite: **20 passed**; Django system check reported no issues.
- Domain 3 scoring and recommendation tests: **6 passed**.
- Domain 5 static contracts: **2 passed**.
- Day 6 production keyword-score spot check: **2 passed**; five synthetic samples produced 0.0-point MAE against labels defined by the same keyword-overlap rubric. This checks implementation consistency, not semantic or hiring accuracy.
- Ruff CI lint command: **passed**.
- Auth-service image build, PDF/skill extraction smoke check, semantic model load, and Domain 1 to Domain 3 ATS adapter check: **passed**.
- Domain 4 production build: **passed**.
- Compose config validation, Python compilation, and `git diff --check`: **passed**.

## Defect and regression status

M3-DEF-001 through M3-DEF-004 are fixed locally and their relevant route, Django, integration, or frontend checks passed. The evidence and retest results are in `defect-log.md`, `integration-checklist.md`, and `milestone-3-day-5-report.md`.

The authenticated M2 swipe/history and M3 resume journeys both passed with generated disposable accounts. No Critical or High M3 defect remains open in the tested local scope.

## Sign-off

**Local Milestone 3 QA regression: passed.** This is a local technical QA result; mentor/demo acceptance, code-freeze approval, and production release are separate decisions and are not claimed here.

## Day 7 handoff

The repeatable local commands, test evidence, CI scope, and remaining approval boundary are documented in `milestone-3-day-7-handoff.md`. No remote CI run, code-freeze approval, or production deployment is claimed.
