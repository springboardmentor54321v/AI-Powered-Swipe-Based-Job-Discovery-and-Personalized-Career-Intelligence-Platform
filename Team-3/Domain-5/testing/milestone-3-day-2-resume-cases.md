# Milestone 3 Day 2: Resume upload and list test cases

These cases are automated by the Domain 1 Django suite in `Team-3/Domain-1/backend/tests/test_m3_resume.py`. The suite overrides `RESUME_STORAGE_PATH` to an isolated temporary directory, so tests exercise file writes without using MinIO, a shared developer upload directory, or real resume data.

| ID | Scenario | Expected result |
| --- | --- | --- |
| M3-RU-01 | Job Seeker uploads a valid PDF | `201`; resume/version IDs and metadata returned; file exists in temporary storage. |
| M3-RU-02 | Job Seeker uploads a valid DOCX | `201`; version metadata returned. |
| M3-RU-03 | Job Seeker uploads a second distinct version | `201`; same resume ID, incremented version, previous version inactive. |
| M3-RU-04 | Recruiter attempts upload | `403`; no resume is created. |
| M3-RU-05 | Anonymous user attempts upload | `401`; no resume is created. |
| M3-RU-06 | Missing, empty, unsupported, or oversized file | `400`; validation error returned. |
| M3-RU-07 | Same file is uploaded twice by one owner | Second upload is rejected as a duplicate. |
| M3-RL-01 | Job Seeker lists resumes with none uploaded | `200`; empty result. |
| M3-RL-02 | Job Seeker lists after upload | `200`; resume, versions, current version, and count are present. |
| M3-RL-03 | Two Job Seekers list their resumes | Each sees only their own resume and versions. |
| M3-RL-04 | Recruiter or anonymous user lists resumes | `403` for Recruiter; `401` for anonymous. |

## Run locally

From the repository root, with PostgreSQL available and Domain 1 Python dependencies installed:

```powershell
$env:DATABASE_NAME = "swipx"
$env:DATABASE_USER = "swipx"
$env:DATABASE_PASSWORD = "change-me-locally"
$env:DATABASE_HOST = "localhost"
$env:DATABASE_PORT = "5432"
$env:RESUME_STORAGE_PATH = "$env:TEMP\swipex-m3-test-resumes"
Push-Location Team-3/Domain-1/backend
python manage.py test tests.test_m3_resume --verbosity 2
Pop-Location
```

The test suite creates and removes its temporary storage directory. Use disposable local database credentials and data.
