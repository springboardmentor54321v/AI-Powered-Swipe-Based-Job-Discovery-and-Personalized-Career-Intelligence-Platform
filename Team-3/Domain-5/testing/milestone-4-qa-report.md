# Milestone 4 — Domain 5 QA and Release Record

**Owner:** Intern 5 — Platform, Testing & Deployment  
**Report state:** Baseline scaffold; update with dated run evidence before sign-off.

## Release readiness

| Area | Status | Evidence / remaining work |
| --- | --- | --- |
| Deterministic API contract/accuracy CI | Implemented | Automated Domain 5 checks run in `.github/workflows/milestone-4.yml`. Record CI run URL and commit here. |
| Frontend production build | Implemented in CI | Domain 4 `npm ci` + `npm run build`; record CI result. |
| Docker image build/publish | Implemented for main/manual workflow | Commit-SHA images are pushed to GHCR; verify package visibility and record image digests. |
| Deployment workflow | Scaffolded, gated | Requires `staging`/`production` GitHub Environments, `SWIPEX_DEPLOY_HOOK`, `SWIPEX_HEALTH_URL`, and provider-side rollback behavior. No cloud environment credentials are checked in. |
| Production Compose profile | Implemented, host configuration required | Secret-required images and services; configure HTTPS ingress, S3 endpoint, backups, secrets and monitoring in the selected provider. |
| M4 functional E2E | Pending feature integration | Notifications, tracking, analytics, competition APIs/UI and their schema are assigned to Domains 1–4 and are not yet present in this checkout. Add live tests when contracts exist. |
| Load/performance | Harness available, run pending | Run `scripts/m4_smoke_check.py` in staging and attach the output; add a workload-specific load test and acceptance thresholds before production. |
| Security/RBAC | Partial baseline only | Existing M1–M3 auth contracts remain covered. Run M4 role/ownership, rate-limit, HTTPS/CORS and header checks on the integrated staging deployment. |
| Production release | Not performed | Requires provider account, configured protected environment, approved code freeze, backup/restore and live smoke test. |

## Run evidence

| Date/time (local) | Commit SHA | Environment | Command / workflow URL | Result |
| --- | --- | --- | --- | --- |
| Pending | Pending | Pending | Pending | Do not report pass until executed. |

## Go/no-go

**Current recommendation: NO-GO for production.** The deployment and QA scaffolding is ready for provider configuration, but the repository does not include Milestone 4 feature implementation, a cloud target, deployment secrets, or staging/production evidence. Reassess when all required rows above have evidence and M4 feature journeys pass.
