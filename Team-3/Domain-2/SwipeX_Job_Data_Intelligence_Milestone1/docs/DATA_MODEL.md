# SwipeX Job & Swipe data model

```text
Company 1 ─── * Job 1 ─── * Swipe
                         * ─── 1 User (owned by the Identity service)
```

## Tables

| Table | Purpose | Key fields |
| --- | --- | --- |
| `companies` | MNC, startup, and newly-founded startup catalog | name, company_type, industry, headquarters, founded_year |
| `jobs` | Searchable job listings | source_job_id, title, description, employment_type, location, is_remote, salary range, skills, experience level, applicant count, posted_at |
| `swipes` | A user's latest preference for a job | user_id, job_id, direction, swiped_at |

`swipes` has a unique constraint on `(user_id, job_id)`. A later swipe updates the current preference instead of producing an ambiguous duplicate. The Identity service owns user records; this service stores only the gateway-provided user ID.

## Seed-data assumptions

The included records are deliberately synthetic for Milestone 1. They provide coverage for all agreed filters, company types, job types, skill matching, fresh postings, and varying applicant counts. They must not be presented as real vacancies.
