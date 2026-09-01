# Job & Data Intelligence: Milestone 2 handover

## Available data

The Job Service exposes title, description, normalized skills, location, salary range, experience level, posting time, and applicant count. The Swipe Service records one current preference per user/job: `right` for save/apply interest and `left` for skip. The Milestone 1 local database contains 97,358 records imported from the supplied cleaned dataset.

## Recommendation input

Use `GET /api/v1/jobs` as the candidate corpus and `GET /api/v1/swipes/history` (through the gateway, with the user identity) as an explicit preference signal. Begin with skill/keyword overlap and weigh recent right swipes more strongly. Do not infer an application from a right swipe; application tracking remains a separate future workflow.

## Contract assumptions for integration

- The API Gateway authenticates requests and forwards the trusted JWT subject in `X-User-Id`.
- The service base path is `/api/v1`; no breaking contract changes are required for the frontend.
- The imported source dataset does not provide remote status, employment type, company category, applicant count, or a reliable posting timestamp. These fields are retained as not specified/default values and must be enriched before production or modelling that relies on them.
- Redis is optional for local execution but enabled automatically in the Compose stack.
