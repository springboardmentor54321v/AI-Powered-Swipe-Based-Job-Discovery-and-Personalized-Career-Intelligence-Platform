# Query and Data Test Plan

## Automated checks included

Run:

```powershell
& <python> -m unittest discover -s tests -v
```

The included tests cover skill normalization, HTML cleanup, relative-date parsing, and deterministic duplicate handling.

## PostgreSQL checks after migration and import

1. Schema: verify all four tables and the `job_discovery_catalog` view exist.
2. Seed integrity: `jobs.source_job_id` is unique; every job has one company; salary and experience ranges have no inverted values.
3. Type coverage: the demo seed includes at least 30 active records for each company type.
4. Search: run title, skill, location, and company-name searches. Confirm `EXPLAIN (ANALYZE, BUFFERS)` uses a matching GIN, trigram, or B-tree index where selectivity warrants it.
5. Combined filters: company type + location + experience + salary + skills should return correct results within the SRS 500 ms dev target on the complete seed.
6. Freshness: insert jobs exactly at 24-hour, 3-day, and 7-day thresholds and verify the documented boundary labels.
7. Competition: insert 24, 25, 99, and 100 applies and verify Low, Medium, Medium, High respectively.
8. Swipe integrity: repeat the same user/job swipe through the API. Confirm the API upsert does not duplicate the row and applicant count remains correct.
9. Concurrency: in the shared environment, issue simultaneous apply and non-apply updates for the same job and reconcile `jobs.applicant_count` to `COUNT(*) FROM swipes WHERE action='APPLY'`.
10. Backup/restore: make a backup, restore it to an empty disposable database, then compare table row counts and the applicant-count reconciliation.

## Search query contract

The Job Service should query `job_discovery_catalog`, use `websearch_to_tsquery('simple', :keyword)` for full-text input, use `skills && :skills::text[]` for skills, and apply only supplied filters. Company-name fuzzy matching belongs in a joined query using `companies.name % :keyword`; do not concatenate untrusted filter values into SQL.
