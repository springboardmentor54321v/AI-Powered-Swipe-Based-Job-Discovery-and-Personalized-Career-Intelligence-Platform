# Data Dictionary

## `companies`

| Field | Meaning | Source / owner |
| --- | --- | --- |
| `source_company_id` | Stable identifier from the supplied source | Seed builder |
| `name` | Company name | Source workbook |
| `company_type` | `MNC`, `STARTUP`, or `NEWLY_FOUNDED` | Source workbook, normalized |
| `about`, `company_size`, `industry` | Profile content | Day 3 curated company enrichment |
| `review_count`, `aggregate_rating` | Source review metadata | Source workbook when present |

## `jobs`

| Field | Meaning | Source / owner |
| --- | --- | --- |
| `source_job_id` | Deduplicated source listing identifier | Seed builder |
| `title`, `description`, `location` | Searchable job attributes | Source workbook, cleaned |
| `skills` | Lowercase, distinct skill tokens | Parsed from `tagsAndSkills` |
| `minimum_salary`, `maximum_salary` | Annual range; null when undisclosed | Source workbook |
| `minimum_experience`, `maximum_experience` | Required experience in years | Source workbook |
| `posted_at` | Inferred timestamp only for unambiguous relative labels | Seed builder with declared reference time |
| `raw_job_uploaded` | Original date/upload label | Source workbook retained for audit |
| `applicant_count` | Number of current `APPLY` swipes | Swipe-service trigger |

## `saved_jobs` and `swipes`

`saved_jobs` stores a user's saved item once. `swipes` stores the current action for a user-job pair: `APPLY`, `SAVE`, or `SKIP`. The unique user-job key makes repeated frontend calls idempotent through upsert behavior in the API layer.

## Derived fields

| Derived field | Rule |
| --- | --- |
| Freshness | `JUST_POSTED` < 24 hours; `RECENT` < 3 days; `THIS_WEEK` < 7 days; otherwise `OLDER`; null timestamp yields `UNKNOWN`. |
| Competition | `LOW` 0-24 applicants; `MEDIUM` 25-99; `HIGH` 100+. |
