# Team 3 Milestone 3 QA Regression Plan

> This document records M3 regression scope. Milestone 4 platform/release checks are defined in [`milestone-4-deployment-runbook.md`](milestone-4-deployment-runbook.md) and their release evidence belongs in [`milestone-4-qa-report.md`](milestone-4-qa-report.md).

**QA owner:** Intern 5 — Platform, Testing & Deployment

## Purpose

Validate the Milestone 3 resume, parsing, ATS, suggestions, and recommendation work while rerunning the Milestone 2 gateway regression checks. The QA scope is local development and CI; it does not include a production deployment.

## Coverage and evidence

| Level | Coverage | Evidence |
| --- | --- | --- |
| Contract | Frozen M1/M2 API contracts | `automated/test_contract_document.py`, `automated/test_m2_contract_document.py` |
| Domain 1 unit/API | Resume upload, format validation, versioning, ownership, role access, version details | `Team-3/Domain-1/backend/tests/test_m3_resume.py` |
| Domain 3 unit | Keyword scoring, suggestions, recommendation ranking | `Team-3/Domain-3/Milestone3work/tests/test_keyword_ats.py`, `test_day5.py` |
| M2 live regression | Jobs, search, companies, anonymous swipe security, optional authenticated history | `automated/test_m2_live_contracts.py` |
| M3 live contracts | Anonymous upload/ATS rejection; optional authenticated upload/list/detail/parse/ATS | `automated/test_m3_live_contracts.py` |
| Integrated services | Compose image, PDF extraction, skill extraction, semantic and blended ATS adapter | `docker-compose.full.dev.yml` and Day 5 report |
| Day 6 accuracy spot check | Five synthetic labeled keyword-overlap examples scored by the Domain 3 production keyword scorer | `automated/day6_accuracy_spot_check.py`, `automated/test_m3_day6_accuracy.py`, `milestone-3-day-6-report.md` |
| Frontend | Resume page production bundle | `Team-3/Domain-4` `npm run build` |
| CI | Django, contracts, Domain 3 unit tests, frontend build | `.github/workflows/milestone-2-ci.yml` |

## Local regression commands

From the repository root:

```powershell
python -m pytest Team-3/Domain-5/testing/automated -m "not integration"
python -m pytest Team-3/Domain-3/Milestone3work/tests/test_keyword_ats.py Team-3/Domain-3/Milestone3work/tests/test_day5.py -q
python Team-3/Domain-5/testing/automated/day6_accuracy_spot_check.py
```

For live checks, start the local Compose stack, then set the gateway URL:

```powershell
$env:SWIPEX_M2_GATEWAY_URL = 'http://localhost:8080'
$env:SWIPEX_GATEWAY_URL = 'http://localhost:8080'
$env:SWIPEX_M3_GATEWAY_URL = 'http://localhost:8080'
python -m pytest Team-3/Domain-5/testing/automated -m integration -q
```

The authenticated M2 and M3 tests require their respective disposable tokens:
`SWIPEX_M2_ACCESS_TOKEN` and `SWIPEX_M3_ACCESS_TOKEN`. The M3 journey creates a resume record; use a disposable Job Seeker account and synthetic resume. If an authenticated test is skipped, report it as pending rather than a full E2E pass.

## Exit criteria

- CI unit, contract, lint, and frontend-build jobs pass.
- Local M2/M3 anonymous gateway checks pass; authenticated E2E either passes with a disposable token or remains explicitly pending.
- No unresolved Critical or High defects remain in the tested local scope.
- Regression evidence and any limitations are recorded in `milestone-3-day-5-report.md` and `integration-checklist.md`.
- Day 6 spot-check results are recorded in `milestone-3-day-6-report.md`; its five synthetic examples measure consistency with a keyword-overlap rubric, not general semantic or hiring accuracy.
- Day 7 handoff and remaining approval boundaries are recorded in `milestone-3-day-7-handoff.md`.
- QA status does not imply mentor approval, code-freeze approval, or production release.
