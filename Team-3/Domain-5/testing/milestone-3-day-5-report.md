# Milestone 3 Day 5 — QA Regression Report

**Owner:** Intern 5 — Platform, Testing & Deployment  
**Scope:** Local regression, integration evidence, CI automation, and QA handoff. Production deployment is out of scope.

## Work completed

- Repaired the Domain 3 Day 5 test imports and replaced calls to unavailable module paths with tests against the maintained suggestion and recommendation modules.
- Made recommendation tests deterministic by mocking gateway data fetches.
- Added Domain 3 scoring and recommendation tests to the Team 3 GitHub Actions workflow.
- Updated the Intern 5 regression plan, defect log, integration checklist, and QA summary for Milestone 3.
- Hardened the Day 4 PowerShell harness with readiness retries and local ATS model warm-up; it provisions a local-only disposable user/token automatically, cleans resume files and unused skills, restores environment variables, and reports prerequisite or test failures clearly.
- Ran an authenticated M3 live flow using a unique disposable Job Seeker account. The test uploaded a generated PDF, listed the resume, fetched owner-scoped version details, parsed skills, and received an ATS score. The temporary account, resume file, and unreferenced test skills were deleted afterward.
- Ran the complete Day 4 PowerShell harness end to end: **3 live tests passed**, frontend production build passed, and automatic test-data cleanup completed.

## Results

| Check | Result |
| --- | --- |
| M2 live gateway regression | 6 passed, including authenticated swipe/history with a temporary account |
| Legacy live gateway contracts | 2 passed |
| M3 authenticated live contracts | 3 passed |
| Day 4 PowerShell integration harness | 3 passed; frontend build and automatic cleanup passed |
| Domain 1 M3 resume API suite | 20 passed |
| Domain 3 scoring/recommendation tests | 6 passed |
| Domain 5 static API contracts | 2 passed |
| Ruff automated-test lint | Passed |
| Auth-service image build and Compose config validation | Passed |
| PDF text/skill extraction smoke check | Passed: 618 characters, five skills |
| Semantic/blended ATS smoke checks | Passed: semantic score 84.7; integrated blended score 86.8 |
| Domain 4 production build | Passed |
| Python compile check and `git diff --check` | Passed |

## Disposition

M3-DEF-001 through M3-DEF-004 were retested locally and are recorded as fixed in `defect-log.md`. The local M2/M3 QA regression passed, including both authenticated live journeys. No Critical or High M3 defect remains open within the executed checks.

No production deployment, public release, or mentor/demo approval was performed. The result is a local QA sign-off only.
