# Resume backend: schema and file storage

This is a drop-in reference implementation for the resume/ATS backend workstream. It deliberately separates resume metadata (SQLite) from file bytes (local disk or MinIO), so APIs never need to know which storage driver is active.

## Delivered

- `resumes`, `skills`, and `resume_skills` tables: candidate ownership, file metadata, a normalized skill catalog, and parser/manual skill associations.
- `jobs.required_skills` and `jobs.keywords`: JSON arrays of normalized matching terms for ATS scoring.
- Idempotent migrations and a deterministic seed backfill for three catalog jobs.
- `disk` driver for zero-infrastructure development and `minio` driver compatible with S3/MinIO.
- Upload/download endpoints plus a storage read/write/delete smoke test.

## Run locally

Requires Node 22.5+ (uses Node's built-in SQLite module) and npm. From this directory:

```powershell
Copy-Item .env.example .env
npm install
npm run migrate
npm run seed
npm run verify-storage
npm start
```

The default verifies local disk storage in `data/resumes`. Upload a resume with:

```powershell
curl.exe -F "candidateId=candidate-123" -F "file=@C:\path\to\resume.pdf" http://localhost:3000/resumes
```

Download it with `GET /resumes/{id}/download`. `GET /jobs` exposes skills/keywords as arrays, ready for an ATS scorer. Resume uploads are held in memory only while being validated and persisted; the API enforces a 10 MB maximum.

## Run against MinIO

Start MinIO and its bucket initializer, then set `STORAGE_DRIVER=minio` in `.env`:

```powershell
docker compose up -d
npm run verify-storage
```

MinIO’s console is at `http://localhost:9001` (development credentials in `.env.example`). In production, supply unique credentials and a managed object-storage endpoint; do not expose the development credentials.

## Schema portability

The migration uses JSON text to keep the supplied local SQLite setup dependency-light. On PostgreSQL, use `JSONB NOT NULL DEFAULT '[]'::jsonb` for the two job columns and add GIN indexes if candidate matching becomes a hot query.
