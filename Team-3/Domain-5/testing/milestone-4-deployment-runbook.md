# Milestone 4 — Domain 5 Deployment and QA Runbook

**Owner:** Intern 5 — Platform, Testing & Deployment  
**Scope:** Build/release automation, deployment configuration, smoke/performance/security checks, rollback readiness and QA evidence.

## Current repo boundary

This repository currently contains M1–M3 auth, job and resume services plus the frontend and gateway. The Milestone 4 SRS assigns notifications, application tracking, analytics, competition indicators and their schema/API work to Interns 1–4. The production stack below uses the service images built from the current Domain 1–4 folders; it does not claim those M4 endpoints exist. Do not mark full M4 E2E complete until those features land and their contracts are added to the test suite.

No cloud account, target URL, registry publication, production secret values, or release authorization is present in the repository. The workflow can build images on `main`; a deployment occurs only after a maintainer manually dispatches the workflow and configures the selected GitHub Environment.

## Pipeline

`.github/workflows/milestone-4.yml` runs deterministic Domain 5 contract/accuracy checks, builds the production frontend, validates local and deployment Compose configuration, then builds and publishes immutable commit-tagged images to GHCR on `main` or manual dispatch. Pull requests run QA only. Manual deployment requires a GitHub Environment named `staging` or `production` with:

- Secret `SWIPEX_DEPLOY_HOOK`: provider deployment hook that deploys the requested image tag and retains/rolls back to the prior healthy revision on failed health checks.
- Variable `SWIPEX_HEALTH_URL`: HTTPS health URL for the public gateway.
- Configure required reviewers on `production` in GitHub Environment protection rules before enabling production dispatch.

The deploy workflow fails before triggering a release if either value is missing. Store application secrets in the hosting platform's secret manager; never add them to GitHub variables, `.env.example`, workflow files, or compose files.

## Host and secret configuration

For a single Docker host, use `docker-compose.deploy.yml` with the `staging` or `production` profile. Put this file and a host-managed env file in the same deployment directory, preserving the relative read-only mount to the repository `gateway/nginx.conf` or replacing it with a managed gateway config. Set all required values in that host's protected secret store:

`COMPOSE_PROJECT_NAME`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `ALLOWED_HOSTS`, `JWT_SECRET_KEY`, `CORS_ALLOWED_ORIGINS`, `AUTH_SERVICE_IMAGE`, `JOB_SERVICE_IMAGE`, `RESUME_SERVICE_IMAGE`, `FRONTEND_IMAGE`, `S3_ENDPOINT_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_BUCKET`.

Image variables must point to immutable tags such as `ghcr.io/org/swipex-auth:<commit-sha>`, never `latest`. Point the public HTTPS reverse proxy at the loopback-bound gateway and frontend ports. Terminate TLS at the hosting provider or a managed reverse proxy, allow only the intended frontend origin, and expose neither PostgreSQL nor Redis publicly. Enable provider backups for PostgreSQL and object storage; test restoration before release. Redis is rebuildable cache/pub-sub state; persistence here supports local service restart only.

The development object store is MinIO, and the deployment Compose file expects an S3-compatible endpoint. Provision that endpoint and its bucket in the host/free-tier provider, or add a MinIO service only for staging. ChromaDB is not wired in the current service source/Compose topology; add it when the Domain 3 production integration requires it. Do not claim these external components are deployed until their endpoint and health checks are configured.

## Local preflight

From repository root (PowerShell):

```powershell
python -m pip install -r requirements-test.txt
python -m pytest AI-Powered-Swipe-Based-Job-Discovery-and-Personalized-Career-Intelligence-Platform/Team-3/Domain-5/testing/automated -m "not integration" -q
Push-Location AI-Powered-Swipe-Based-Job-Discovery-and-Personalized-Career-Intelligence-Platform/Team-3/Domain-4
npm ci
npm run build
Pop-Location
docker compose -f docker-compose.dev.yml config -q
docker compose -f docker-compose.full.dev.yml config -q
```

After starting the full local stack, run anonymous live contracts and the smoke/performance check:

```powershell
$env:SWIPEX_GATEWAY_URL = 'http://localhost:8080'
python -m pytest AI-Powered-Swipe-Based-Job-Discovery-and-Personalized-Career-Intelligence-Platform/Team-3/Domain-5/testing/automated -m integration -q
python AI-Powered-Swipe-Based-Job-Discovery-and-Personalized-Career-Intelligence-Platform/Team-3/Domain-5/scripts/m4_smoke_check.py --base-url $env:SWIPEX_GATEWAY_URL
```

`m4_smoke_check.py` verifies a configurable health route and measures p95 latency across concurrent requests. It warns about missing baseline security headers; it does not replace a full endpoint security scan. Run it against a disposable/staging environment, not against a service where repeated health checks cause side effects.

## Release procedure

1. Confirm all Domain 1–4 M4 feature work is merged and code freeze is approved by the team.
2. Confirm workflow QA and image jobs succeeded for the exact commit SHA; record image digests.
3. Confirm the selected environment has protected secrets, TLS, restricted CORS, backups, monitoring/log retention and provider rollback configured.
4. Apply database migrations as a separately reviewed, backward-compatible release step; verify backup restore in staging first.
5. Deploy to staging via workflow dispatch. Run M1–M3 live regressions and add M4 notification, application, competition and role-specific analytics journeys once their APIs are available.
6. Run smoke, latency/concurrency, authorization/RBAC, rate-limit, security-header, migration and rollback checks. Record exact command, commit SHA, environment and results.
7. Obtain production environment approval, dispatch the same immutable image SHA to production, then run smoke checks and review error/latency monitoring.
8. If health or smoke checks fail, invoke the provider's previous-revision rollback and confirm health before closing the incident.

## Evidence and release status

Record results in `testing/milestone-4-qa-report.md`. Distinguish static CI, local integration, staging and production evidence. A successful build or a green smoke endpoint alone is not production sign-off. Production release requires the real provider, credentials, code-complete M4 features, team approval and live validation.
