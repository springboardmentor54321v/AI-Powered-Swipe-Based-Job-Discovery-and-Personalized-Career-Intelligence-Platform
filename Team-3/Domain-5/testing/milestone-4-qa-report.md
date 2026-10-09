# Milestone 4 — Domain 5 QA and Release Record

**Owner:** Intern 5 — Platform, Testing & Deployment  
**Status:** Local integration fixes are in progress; CI, staging, and production deployment have not been run for this working tree.

## Readiness matrix

| Area | Status | Evidence / remaining work |
| --- | --- | --- |
| M4 CI workflow | Implemented locally | `.github/workflows/milestone-4.yml`; must run in GitHub after commit. |
| Automated QA | Partial | Workflow includes Domain 2 service/seed-data tests, Domain 5 static contracts, Domain 3 M4 unit tests, and disposable PostgreSQL migration/integrity rehearsal. Domain 1 M4 endpoint tests and full cross-service E2E still need execution on an integrated environment. |
| Frontend build | Implemented in CI | Production build uses the deployment-specific Nginx config to proxy API and WebSocket paths. Record CI run. |
| Production images | Implemented locally | Workflow defines commit-SHA images for auth/ASGI, jobs, resume, matching, gateway, frontend, and migrations. GHCR publication and image digests have not been verified. |
| Deployment Compose | Implemented locally | Includes Postgres, password-protected Redis, ASGI auth API, job/resume/matching services, migration gate, gateway and frontend. Host TLS, backups, monitoring and secrets still require provider configuration. |
| M4 database migrations | Reconciled locally; rehearsal pending | Job IDs are integer, user IDs bigint, and job age uses `posted_at`. Migration script now requires an isolated restored copy. It has not yet been run against PostgreSQL. |
| Integrated M4 E2E | Pending | Exercise notification REST/WebSocket, application transitions/history, counters, competition and role-scoped analytics across services. |
| Performance/load | Harness added; staging run pending | `scripts/m4_smoke_check.py` gives health and concurrent p95 checks; add a workload-specific load test and run against staging. |
| Security | Partial | Production settings, secure proxy headers, CORS/CSRF allow-lists, throttling and security headers configured in code. Verify HTTPS ingress, rate limits, RBAC/ownership, cookies, secrets, and scanner results in staging. |
| Feature data gaps | Pending contract/data work | The lifecycle has no `hired` state and does not record job views. The API reports zero hires and zero views; resume versions are attached to applications for per-version apply/shortlist counts. Smart job-alert evaluation is not yet connected to persisted notification delivery; push delivery also needs provider configuration. |
| Staging | Not configured | Requires provider target, environment secrets, HTTPS URL, database backup, storage and monitoring/logging setup. |
| Production deployment | Not performed | Requires provider credentials, successful staging validation, resolution/acceptance of the feature data gaps, and mentor/team release approval per M4 SRS. |
| Demo and final sign-off | Pending | M4 schedule hands the Day 5 production release and QA sign-off to the mentor. |

## Executed evidence

| Date/time (local) | Commit SHA | Environment | Command / workflow URL | Result |
| --- | --- | --- | --- | --- |
| 2026-10-08 | Working tree based on `97c4ef1` | Local | `python -m pytest Team-3/Domain-5/testing/automated -m "not integration" -q` | 5 passed; 11 live integration tests deselected. |
| 2026-10-08 | Working tree based on `97c4ef1` | Local | `python -m unittest test_m4_suite.py -v` from `Team-3/Domain-3/Milestone4work` | 4 passed; AI alert latency sample 0.06 ms. |
| 2026-10-08 | Working tree based on `97c4ef1` | Local | `npm run build` from `Team-3/Domain-4` | Passed; Vite noted the main JS chunk is 550.10 kB (139.81 kB gzip). |
| 2026-10-08 | Working tree based on `97c4ef1` | Local | `docker compose -f Team-3/Domain-5/docker-compose.deploy.yml --profile staging config -q` | Passed using validation-only environment values; no service containers were started. |
| 2026-10-08 | Working tree based on `97c4ef1` | Local | Workflow YAML parse, Python compile, `git diff --check` | Passed. GitHub Actions, image publishing, and a live deployment have not run. |

## Go/no-go

**NO-GO for production release.** The schema mismatch is fixed in the working tree, but migration rehearsal, feature-complete data, staging validation, provider setup, and the mentor/team release decision remain pending. The deployment workflow and container configuration do not themselves count as a deployment.
