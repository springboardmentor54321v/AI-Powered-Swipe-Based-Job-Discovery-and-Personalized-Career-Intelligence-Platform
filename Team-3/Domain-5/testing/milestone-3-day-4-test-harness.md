# Day 4 M3 integration test harness

The harness retries gateway and frontend readiness checks, warms the semantic model in a local auth service, runs the live M3 resume/ATS API checks, then builds the frontend. It uses generated synthetic PDF content. By default it creates a unique local Job Seeker account/token through the running `auth-service`, exercises upload, listing, version detail, parsing, and ATS scoring, then removes that account, uploaded files, and any newly created unreferenced skills—even when a test or build fails.

## Run

Start the local Compose stack and install the Domain 5 test requirements. From the repository root run:

```powershell
docker compose -f docker-compose.full.dev.yml up -d --build
python -m pip install -r Team-3/Domain-5/requirements-test.txt
pwsh -NoProfile -File Team-3/Domain-5/scripts/test-m3-integration.ps1
```

The script defaults to `http://localhost:8080`, `http://localhost:5173`, and local job ID `1`. Override `SWIPEX_M3_GATEWAY_URL`, `SWIPEX_M3_FRONTEND_URL`, or `SWIPEX_M3_TEST_JOB_ID` when your ports or data differ. Automatic account creation and model warm-up are restricted to localhost gateways. With a caller-supplied `SWIPEX_M3_ACCESS_TOKEN`, the script does not create or delete an account; use a disposable Job Seeker account because the synthetic uploaded resume remains under that account.

The harness restores its environment variables after the run. A successful run reports all three live tests as passed and builds the frontend. Record results in `integration-checklist.md` and defects in `defect-log.md`.
