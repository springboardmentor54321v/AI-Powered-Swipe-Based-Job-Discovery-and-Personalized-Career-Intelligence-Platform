# Milestone 3 Day 4 integration report

## Checks run

- Added a repeatable PowerShell integration harness at `scripts/test-m3-integration.ps1`; it checks gateway/frontend readiness, runs the M3 tests, and builds the frontend.
- Extended the authenticated test through ATS scoring and validates the backend score and skill-gap fields.

- Local gateway health: `GET http://localhost:8080/health` → **200**.
- Frontend route: `GET http://localhost:5173/resume` → **200**.
- Resume API gateway route: anonymous `POST /api/v1/resumes/upload` → **401/403**, as expected.
- ATS API gateway route: anonymous `POST /api/v1/ats/score` → **401/403**, as expected.
- Frontend production build (`npm run build` in `Team-3/Domain-4`) → **passed**.
- M3 live automated checks → **2 passed, 1 skipped**. The skipped test is authenticated upload → list → parse because `SWIPEX_M3_ACCESS_TOKEN` is not configured.
- Auth-service Docker image build → **passed** with Python 3.12, CPU-only PyTorch, parser/scoring dependencies, and mounted Domain-3 sources.
- Domain-3 ATS/recommendation tests → **6 passed**.
- Domain-1 M3 resume tests → **20 passed**; Django system check reported no issues.
- Semantic ATS model smoke check → **passed**, returning similarity `0.847` and semantic score `84.7`.
- Integrated PDF extraction/skill extraction → **passed**, returning 618 characters and five skills from the sample resume.
- Integrated Domain-1 → Domain-3 ATS adapter → **passed**, returning final score `86.8` and the expected missing Docker skill.
- `git diff --check` and Python compile checks → **passed**.

## Findings for Day 5 fixes

1. **M3-DEF-002, High/P1:** Resolved locally. The auth image builds, the Domain-3 scoring tests pass, the semantic model loaded, and the resume-service tests pass. The authenticated live upload/parse/ATS path still needs a configured disposable Job Seeker token.
2. **M3-DEF-003, Medium/P2:** Resolved locally. Owner-scoped version detail and parse-after-upload are implemented; owner and cross-user isolation are covered by the passing Django suite. Authenticated browser retest remains pending.
3. **M3-DEF-004, High/P1:** Resolved locally. The normalizer reads `final_ats_score`; the frontend production build passes. Authenticated browser retest remains pending.

Findings and owners are recorded in `defect-log.md` and `integration-checklist.md`.

## Completion status

At the Day 4 checkpoint, the authenticated flow was pending because no test token had been configured. The harness now retries service readiness, warms the local semantic model, and creates/cleans a temporary Job Seeker account automatically. Its complete run passed all three live checks and the frontend build; detailed regression evidence is recorded in `milestone-3-day-5-report.md`. No production deployment was performed.
