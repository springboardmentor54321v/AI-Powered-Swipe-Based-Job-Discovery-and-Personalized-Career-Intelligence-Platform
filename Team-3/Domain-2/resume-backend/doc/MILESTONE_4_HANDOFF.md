# Milestone 4 handoff

## Stable integration contract

- Upload: `POST /resumes` accepts `candidateId` and `file`, and returns the resume id, storage key, and default version id.
- Default version: `GET /resumes/:id/default-version`; change it with `PUT /resumes/:id/default-version/:versionId`.
- ATS match: `GET /resumes/:id/jobs/:jobId/match` returns `requiredCount`, `matchedCount`, `matchedSkills`, and percentage `score`.
- Storage keys are internal. Consumers should use `GET /resumes/:id/download` for file bytes.

## Analytics needs

Use `resume_versions.created_at`, `status`, and the match result per job to measure parser success, scoring coverage, and skill gaps. Store score events separately if historical reports are required; the match endpoint calculates the current score only.

## Notification needs

Notify a candidate when a version becomes `READY` or `FAILED`, and when a new relevant job exceeds a product-defined score threshold. Use the resume/version ids as event references, not filenames or storage keys.

## Operations

Run `npm run validate-data` before release. Use `npm run backup` before migrations or integration tests. Backup files include all resume and skill metadata, but not object-storage bytes; maintain the MinIO bucket backup separately.
