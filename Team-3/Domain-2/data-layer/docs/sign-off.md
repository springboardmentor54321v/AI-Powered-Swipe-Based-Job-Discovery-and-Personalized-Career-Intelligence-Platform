# Data-layer sign-off record

Complete this record during the production release; blank fields intentionally
mean the release is not yet verified.

| Gate | Evidence | Owner | Status |
|---|---|---|---|
| Backup created and restore drill passed | dump timestamp / restore log | Operations | pending |
| 001/002 dry run on restored clone | command output | DBA | pending |
| 003 concurrent indexes rehearsed | duration / no invalid indexes | DBA | pending |
| Counter load test passed | worker count / p95 / integrity output | Platform | pending |
| Aggregate refresh passed | row counts / runtime | Analytics | pending |
| Production seed baseline verified | expected job/user counts | Release owner | pending |
| Redis failure behavior tested | cache-off request result | Platform | pending |
| Maintenance owner acknowledged | ticket/link | Mentor | pending |

Do not mark this complete until `sql/production_verify.sql` and all zero-row
integrity queries have been run against the intended production database.
