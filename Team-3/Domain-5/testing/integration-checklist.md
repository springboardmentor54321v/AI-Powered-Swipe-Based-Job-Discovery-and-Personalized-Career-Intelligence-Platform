# Milestone 1 integration checklist

Run this checklist only with the real services available through the gateway. Record the result in the defect log; do not mark an unexecuted check as passed.

| Check | Expected result | Status |
| --- | --- | --- |
| Compose dependencies | PostgreSQL and Redis are healthy | Pending service run |
| Authentication | Register, login, refresh, and `/me` honour the contract | Pending Intern 1 |
| RBAC | Anonymous requests are rejected; role-restricted actions return 403 | Pending Intern 1 |
| Job discovery | Listings, details, and every documented filter work | Pending Intern 2 |
| Swipe flow | Right/left actions persist and appear only in the actor's history | Pending Intern 2 |
| Resume upload | A supported file returns an ID and extracted skills | Pending Intern 3 |
| ATS/recommendations | Responses use `heuristic-v0` and match the frozen shapes | Pending Intern 3 |
| Frontend journey | Login → job swipe → dashboard → resume/ATS view has no console/API error | Pending Intern 4 |
| Regression | Contract and applicable module tests pass after fixes | Pending integrated build |

## Required evidence

- `docker compose -f docker-compose.dev.yml ps` output showing healthy dependencies.
- Output from `scripts/verify.ps1`.
- Output from `pytest testing/automated -m integration` with `SWIPEX_GATEWAY_URL` set.
- A completed defect-log entry for every failed check and a retest result for each fix.
