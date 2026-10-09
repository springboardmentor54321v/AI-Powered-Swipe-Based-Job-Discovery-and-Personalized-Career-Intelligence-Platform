# Milestone 4 — Domain 5 Deployment and QA Runbook

**Owner:** Intern 5 — Platform, Testing & Deployment  
**Scope:** Build/release automation, deployment configuration, smoke/performance/security checks, rollback readiness and QA evidence.

## Current repo boundary

The current branch contains M4 frontend, backend, data-layer and AI work across Domains 1–4. Domain 5 provides CI, image packaging, deployment configuration and QA gates. Cross-domain identifiers and application lifecycle have been aligned in the local working tree. Full M4 E2E is not complete until it passes against an integrated staging stack.

No cloud account, target URL, registry publication, production secret values, or release authorization is present in the repository. The workflow can build images on `main`; a deployment occurs only after a maintainer manually dispatches the workflow and configures the selected GitHub Environment.

## Pipeline

`.github/workflows/milestone-4.yml` runs Domain 5 contracts, Django configuration checks, Domain 3 M4 unit checks, the frontend build and deployment Compose validation. On pushes to `Team-3` or manual dispatch it builds immutable commit-tagged images for auth/ASGI, jobs, resume, matching, gateway, frontend and schema migrations and publishes them to GHCR. Pull requests run quality checks only. Manual deployment requires a GitHub Environment named `staging` or `production` with:

- Secret `SWIPEX_DEPLOY_HOOK`: provider deployment hook that deploys the requested image tag and retains/rolls back to the prior healthy revision on failed health checks.
- Variable `SWIPEX_HEALTH_URL`: HTTPS health URL for the public gateway.
- Configure required reviewers on `production` in GitHub Environment protection rules before enabling production dispatch.

The deploy workflow fails before triggering a release if either value is missing. Store application secrets in the hosting platform's secret manager; never add them to GitHub variables, `.env.example`, workflow files, or compose files.

## Host and secret configuration

For a single Docker host, use `docker-compose.deploy.yml` with the `staging` or `production` profile. Put this file and a host-managed env file in the same deployment directory, preserving the relative read-only mount to the repository `gateway/nginx.conf` or replacing it with a managed gateway config. Set all required values in that host's protected secret store:

`COMPOSE_PROJECT_NAME`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `SECRET_KEY`, `JWT_SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `AUTH_SERVICE_IMAGE`, `JOB_SERVICE_IMAGE`, `RESUME_SERVICE_IMAGE`, `MATCHING_SERVICE_IMAGE`, `GATEWAY_IMAGE`, `FRONTEND_IMAGE`, and `MIGRATIONS_IMAGE`. SMTP settings are optional until email delivery is configured.

Image variables must point to immutable tags such as `ghcr.io/org/swipex-auth:<commit-sha>`, never `latest`. Point the public HTTPS reverse proxy at the loopback-bound gateway and frontend ports. Terminate TLS at the hosting provider or a managed reverse proxy, allow only the intended frontend origin, and expose neither PostgreSQL nor Redis publicly. Enable provider backups for PostgreSQL and object storage; test restoration before release. Redis is rebuildable cache/pub-sub state; persistence here supports local service restart only.

The current Domain 1 resume API stores files on disk, so the deployment profile persists them in a Docker volume. For a multi-instance production deployment, move resume files to managed object storage before scaling out. ChromaDB currently uses a local persistent path in the Domain 3 code; it needs a persistent volume or managed vector store if that feature is enabled in production. Configure host monitoring and log retention; the repository does not provision a monitoring vendor account.

## Migration and application schema

The M4 migrations now use service identifiers: integer `jobs.id`, bigint `users.id`, and `jobs.posted_at`. Applications and audit events are installed after auth and jobs are healthy; the gateway waits for migration success. Rehearse on an isolated restored database with `data-layer/scripts/dry-run.ps1 -IsolatedRestoredCopy` before production. The M4 lifecycle has no `hired` status, and per-resume-version views/applies are not recorded; those metrics remain unavailable until their contract and data model are extended.

## Local preflight

From repository root (PowerShell):

```powershell
python -m pip install -r Team-3/Domain-5/requirements-test.txt
python -m pip install -r Team-3/Domain-2/SwipeX_Job_Data_Intelligence_Milestone1/requirements-dev.txt
python -m pytest Team-3/Domain-5/testing/automated -m "not integration" -q
Push-Location Team-3/Domain-2/SwipeX_Job_Data_Intelligence_Milestone1
python -m pytest tests -q
Pop-Location
Push-Location Team-3/Domain-4
npm ci
npm run build
Pop-Location
docker compose -f Team-3/Domain-5/docker-compose.dev.yml config -q
docker compose -f docker-compose.full.dev.yml config -q
```

After starting the full local stack, run anonymous live contracts and the smoke/performance check:

```powershell
$env:SWIPEX_GATEWAY_URL = 'http://localhost:8080'
python -m pytest Team-3/Domain-5/testing/automated -m integration -q
python Team-3/Domain-5/scripts/m4_smoke_check.py --base-url $env:SWIPEX_GATEWAY_URL
```

`m4_smoke_check.py` verifies a configurable health route and measures p95 latency across concurrent requests. It warns about missing baseline security headers; it does not replace a full endpoint security scan. Run it against a disposable/staging environment, not against a service where repeated health checks cause side effects.

## Release procedure

1. Confirm all Domain 1–4 M4 feature work is merged, the API contract and database schema are agreed, and code freeze is approved by the team/mentor.
2. Confirm workflow QA and image jobs succeeded for the exact commit SHA; record image digests.
3. Confirm the selected environment has protected secrets, TLS, restricted CORS, backups, monitoring/log retention and provider rollback configured.
4. Apply reviewed, backward-compatible database migrations only after the isolated staging rehearsal and backup restore pass.
5. Deploy to staging via workflow dispatch. Run M1–M3 live regressions and add M4 notification, application, competition and role-specific analytics journeys once their APIs are available.
6. Run smoke, latency/concurrency, authorization/RBAC, rate-limit, security-header, migration and rollback checks. Record exact command, commit SHA, environment and results.
7. Obtain the mentor/team production release sign-off required by the M4 SRS handoff, dispatch the same immutable image SHA to production, then run smoke checks and review error/latency monitoring.
8. If health or smoke checks fail, invoke the provider's previous-revision rollback and confirm health before closing the incident.

## Evidence and release status

Record results in `testing/milestone-4-qa-report.md`. Distinguish static CI, local integration, staging and production evidence. A successful build or a green smoke endpoint alone is not production sign-off. Production release requires the real provider and credentials, completion of remaining feature gaps, successful staging validation, and the mentor/team release sign-off specified in the M4 SRS.
