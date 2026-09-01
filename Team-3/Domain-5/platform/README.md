# Platform handoff (Intern 5)

## Start the shared dependencies

1. Install Docker Desktop and start it.
2. Copy `.env.example` to `.env` and change `POSTGRES_PASSWORD`.
3. Run `docker compose -f docker-compose.dev.yml up -d postgres redis`.
4. Check readiness with `docker compose -f docker-compose.dev.yml ps`.

PostgreSQL is available at `localhost:5432`; Redis is available at `localhost:6379`.

## Connect the application services

When Interns 1–3 have service folders, copy `docker-compose.override.example.yml` to
`docker-compose.override.yml`, point each `build` path at the appropriate folder, and run:

```powershell
docker compose -f docker-compose.dev.yml --profile services up --build
```

The service hostnames inside Compose are fixed: `auth-service`, `job-service`, and
`resume-service`. Each service receives `DATABASE_URL` and `REDIS_URL`. No production
settings, cloud resources, or deployment configuration are included.

## Local quality gate

Run `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`. It validates the frozen
API contract, runs available Python tests, and lints/builds the React app when present.

Run live API contract checks only after the gateway is running:

```powershell
$env:SWIPEX_GATEWAY_URL = 'http://localhost:8000'
& .venv\Scripts\python.exe -m pytest testing\automated -m integration
```
