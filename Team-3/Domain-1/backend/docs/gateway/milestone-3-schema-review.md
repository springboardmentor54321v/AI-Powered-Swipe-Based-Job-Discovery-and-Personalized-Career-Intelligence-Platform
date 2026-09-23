# SwipeX Milestone 3 — Schema Review & API Compatibility with Intern 3 (Domain-2)

> **Document Status**: Milestone 3 — Day 1 Schema Alignment Review  
> **Reviewer**: Intern 2 (Backend & Identity Management, Domain-1)  
> **Target Counterpart**: Intern 3 (Job & Data Intelligence, Domain-2)  
> **Source Inspected**: `Domain-2/SwipeX_Job_Data_Intelligence_Milestone1/sql/` (M3 Day-1 schema)  
> **Date**: 22 September 2026

---

## 1. Executive Summary

A comprehensive inspection of Intern 3's Milestone-3 Day-1 schema has been conducted. The schema introduces 5 new tables supporting resume management, versioning, skill extraction, and job skill requirements. This review maps each schema field to the proposed API contract fields and identifies compatibility status.

**Overall assessment**: The schema is well-designed and fully compatible with the proposed M3 API contracts. Two minor ambiguities are flagged for team confirmation.

---

## 2. Entity Schema Review

### 2.1 Resume Table (`resume`)

**Source**: `Domain-2/SwipeX_Job_Data_Intelligence_Milestone1/sql/Resume.sql`

```sql
CREATE TABLE IF NOT EXISTS resume (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    current_version_id UUID REFERENCES resume_version(id),
    owner_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Field-to-API Mapping

| Schema Field | DB Type | Nullable | API Field | API Endpoint | Compatibility |
|:---|:---|:---|:---|:---|:---|
| `id` | UUID (PK) | No | `resume_id` | Upload response, List, Version detail | ✅ MATCH |
| `current_version_id` | UUID (FK) | Yes | `current_version_id` | List (ResumeSummary) | ✅ MATCH |
| `owner_user_id` | UUID | No | *(not exposed)* | *(injected via X-User-Id header)* | ✅ MATCH — Internal field, used for ownership filtering |
| `created_at` | TIMESTAMPTZ | No (default) | `created_at` | List (ResumeSummary) | ✅ MATCH |
| `updated_at` | TIMESTAMPTZ | No (default) | `updated_at` | List (ResumeSummary) | ✅ MATCH |

**Notes**:
- `owner_user_id` is intentionally NOT exposed in API responses. Ownership is enforced server-side via the `X-User-Id` header injected by the Gateway.
- `current_version_id` can be nullable (when no version has been uploaded yet or all versions are deleted). The API contract handles this by making it a required field in `ResumeSummary` — the assumption is that a resume always has at least one version after creation via upload.

---

### 2.2 ResumeVersion Table (`resume_version`)

**Source**: `Domain-2/SwipeX_Job_Data_Intelligence_Milestone1/sql/ResumeVersion.sql`

```sql
CREATE TABLE IF NOT EXISTS resume_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resume(id) ON DELETE CASCADE,
    file_object_key TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT,
    sha256_hash TEXT NOT NULL,
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB,
    CONSTRAINT uq_resume_version_resume_file UNIQUE (resume_id, file_object_key)
);
```

#### Field-to-API Mapping

| Schema Field | DB Type | Nullable | API Field | API Endpoint | Compatibility |
|:---|:---|:---|:---|:---|:---|
| `id` | UUID (PK) | No | `version_id` | Upload response, Version detail | ✅ MATCH |
| `resume_id` | UUID (FK) | No | `resume_id` | Version detail | ✅ MATCH |
| `file_object_key` | TEXT | No | *(not exposed)* | *(internal storage reference)* | ✅ MATCH — Internal implementation detail |
| `original_filename` | TEXT | No | `original_filename` | Upload response, List, Version detail | ✅ MATCH |
| `mime_type` | TEXT | Yes | `mime_type` | Upload response, Version detail | ✅ MATCH |
| `sha256_hash` | TEXT | No | `sha256_hash` | Version detail only | ✅ MATCH |
| `file_size_bytes` | BIGINT | Yes | `file_size_bytes` | Upload response, Version detail | ✅ MATCH |
| `uploaded_at` | TIMESTAMPTZ | No (default) | `uploaded_at` | Upload response, Version detail | ✅ MATCH |
| `metadata` | JSONB | Yes | `metadata` | Version detail (extensible object) | ✅ MATCH |

**Notes**:
- `file_object_key` is an **internal storage detail** (MinIO object key or local path). It is intentionally NOT exposed in the API contract to avoid leaking storage infrastructure.
- `sha256_hash` is exposed in the Version detail endpoint for transparency/integrity verification, but NOT in the upload response (it's computed server-side).
- The UNIQUE constraint `(resume_id, file_object_key)` supports duplicate detection — the API contract includes a `400` response for duplicate file uploads.

---

### 2.3 ResumeSkill Table (`resume_skill`)

**Source**: `Domain-2/SwipeX_Job_Data_Intelligence_Milestone1/sql/ResumeSkill.sql`

```sql
CREATE TABLE IF NOT EXISTS resume_skill (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_version_id UUID NOT NULL REFERENCES resume_version(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    normalized_name TEXT,
    extracted_at TIMESTAMPTZ DEFAULT now(),
    source TEXT,
    confidence NUMERIC(5,2)
);
```

#### Field-to-API Mapping

| Schema Field | DB Type | Nullable | API Field | API Endpoint | Compatibility |
|:---|:---|:---|:---|:---|:---|
| `id` | UUID (PK) | No | *(not exposed)* | *(internal PK)* | ✅ MATCH — Internal record ID |
| `resume_version_id` | UUID (FK) | No | *(implicit via endpoint path)* | Version detail | ✅ MATCH |
| `skill_name` | TEXT | No | `skill_name` | ExtractedSkill schema | ✅ MATCH |
| `normalized_name` | TEXT | Yes | `normalized_name` | ExtractedSkill schema | ✅ MATCH |
| `extracted_at` | TIMESTAMPTZ | No (default) | *(not exposed individually)* | *(internal timestamp)* | ✅ MATCH — Not needed in API; version's `uploaded_at` suffices |
| `source` | TEXT | Yes | `source` | ExtractedSkill schema | ✅ MATCH |
| `confidence` | NUMERIC(5,2) | Yes | `confidence` | ExtractedSkill schema (float, 0–100) | ✅ MATCH |

**Notes**:
- The `confidence` field in the schema is `NUMERIC(5,2)` allowing values like `95.50`. The API contract uses `float` with `minimum: 0, maximum: 100` — these are compatible.
- `extracted_at` is not exposed per-skill in the API. This is a deliberate simplification — the version's `uploaded_at` provides sufficient temporal context for clients.

---

### 2.4 Job Table (`job`) — M3 Schema

**Source**: `Domain-2/SwipeX_Job_Data_Intelligence_Milestone1/sql/Job.sql`

```sql
CREATE TABLE IF NOT EXISTS job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    posted_at TIMESTAMPTZ DEFAULT now(),
    company_id UUID NOT NULL
);
```

#### Compatibility with ATS Scoring Contract

| Schema Field | API Usage | Compatibility |
|:---|:---|:---|
| `id` (UUID) | `job_id` in ATSScoreRequest and RecommendedJob | ✅ MATCH — API accepts string to support both UUID (M3) and legacy integer IDs (M2) |
| `title` | `title` in RecommendedJob | ✅ MATCH |

**Note**: The M3 `job` table uses UUID PKs. The M2 mock job service uses integer IDs (e.g., `101`, `102`). The API contract defines `job_id` as `type: string` to accommodate both during migration. The M2 `001_schema.sql` `jobs` table is the full production schema; this `Job.sql` is a simplified M3 reference table.

---

### 2.5 JobRequiredSkill Table (`job_required_skill`)

**Source**: `Domain-2/SwipeX_Job_Data_Intelligence_Milestone1/sql/JobRequiredSkill.sql`

```sql
CREATE TABLE IF NOT EXISTS job_required_skill (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    normalized_name TEXT,
    skill_level TEXT,
    weight NUMERIC(5,2),
    source TEXT
);
```

#### Compatibility with ATS Scoring Contract

| Schema Field | API Usage | Compatibility |
|:---|:---|:---|
| `skill_name` | Used by ATS engine to compute `missing_skills[]` and `matched_skills[]` | ✅ MATCH |
| `normalized_name` | Used for semantic skill matching (M3 upgrade) | ✅ MATCH |
| `skill_level` | Could inform suggestion priority (not directly exposed in API) | ✅ MATCH — Internal to scoring engine |
| `weight` | Used by ATS scoring algorithm to weight skill importance | ✅ MATCH — Internal to scoring engine |
| `source` | Identifies skill extraction origin | ✅ MATCH — Internal metadata |

**Note**: The `weight` and `skill_level` fields are internal to the scoring engine (Intern 4's implementation). The API contract does not expose these — it only returns the computed `match_score`, `matched_skills`, and `missing_skills`. This is intentional: the scoring formula belongs to Domain-3/Intern 4, not the API contract.

---

## 3. Compatibility Summary Matrix

| Schema Entity | Schema Field | API Request/Response Field | Status |
|:---|:---|:---|:---|
| `resume` | `id` | `resume_id` | ✅ MATCH |
| `resume` | `current_version_id` | `current_version_id` | ✅ MATCH |
| `resume` | `owner_user_id` | *(X-User-Id header, not in response)* | ✅ MATCH (internal) |
| `resume` | `created_at` | `created_at` | ✅ MATCH |
| `resume` | `updated_at` | `updated_at` | ✅ MATCH |
| `resume_version` | `id` | `version_id` | ✅ MATCH |
| `resume_version` | `resume_id` | `resume_id` | ✅ MATCH |
| `resume_version` | `file_object_key` | *(not exposed — internal storage)* | ✅ MATCH (internal) |
| `resume_version` | `original_filename` | `original_filename` | ✅ MATCH |
| `resume_version` | `mime_type` | `mime_type` | ✅ MATCH |
| `resume_version` | `sha256_hash` | `sha256_hash` (version detail only) | ✅ MATCH |
| `resume_version` | `file_size_bytes` | `file_size_bytes` | ✅ MATCH |
| `resume_version` | `uploaded_at` | `uploaded_at` | ✅ MATCH |
| `resume_version` | `metadata` | `metadata` (extensible object) | ✅ MATCH |
| `resume_skill` | `skill_name` | `skill_name` | ✅ MATCH |
| `resume_skill` | `normalized_name` | `normalized_name` | ✅ MATCH |
| `resume_skill` | `source` | `source` | ✅ MATCH |
| `resume_skill` | `confidence` | `confidence` (float 0–100) | ✅ MATCH |
| `resume_skill` | `extracted_at` | *(not exposed per-skill)* | ✅ MATCH (intentional simplification) |
| `job` | `id` | `job_id` (string type for UUID/legacy compat) | ✅ MATCH |
| `job_required_skill` | `skill_name` | `missing_skills[]` / `matched_skills[]` | ✅ MATCH |
| `job_required_skill` | `weight` | *(internal to scoring engine)* | ✅ MATCH (internal) |

---

## 4. Identified Ambiguities

### 4.1 Resume Lifecycle — Can a Resume Exist Without a Version?

**Schema observation**: The `resume.current_version_id` is nullable (no `NOT NULL` constraint), suggesting a resume record can exist without an active version.

**API contract decision**: In the current API contract, a resume is always created via an upload (which creates both the resume record and its first version simultaneously). Therefore, `current_version_id` will always be populated in API responses.

**Risk**: LOW — The schema allows the edge case, but the API workflow prevents it.

**Action**: No change needed. If version deletion is added later, the API response should handle nullable `current_version_id`.

---

### 4.2 User Identity Cross-Reference

**Schema observation**: `resume.owner_user_id` is defined as `UUID NOT NULL` but does not have a foreign key reference to a specific user table in the M3 SQL files. The M2 `001_schema.sql` references `users(id)` in `saved_jobs` and `swipes` tables.

**API contract decision**: The Gateway injects `X-User-Id` from the validated JWT. The downstream Resume Service should use this header value as `owner_user_id`. The Domain-1 user table uses auto-incrementing integer PKs (not UUID), so the downstream service must handle the type mapping.

**Risk**: MEDIUM — Type mismatch between Domain-1 user PK (integer) and Domain-2 schema `owner_user_id` (UUID).

**Action**: Flag for team confirmation. **Possible resolutions**:
1. Domain-2 changes `owner_user_id` to `BIGINT` to match Domain-1's integer user IDs.
2. Domain-1 sends the user ID as a string in the header, and Domain-2 stores it as-is in a TEXT field.
3. A UUID adapter is introduced to map integer IDs to UUIDs.

> **Recommendation**: Option 2 (send as string, store as TEXT) is the safest for cross-domain compatibility without modifying either domain's schema.

---

## 5. Fields Intentionally NOT Exposed in API

| Schema Field | Reason for Non-Exposure |
|:---|:---|
| `resume.owner_user_id` | Security — user identity is derived from JWT, not client input |
| `resume_version.file_object_key` | Security — internal storage path (MinIO/local) should not be leaked |
| `resume_skill.id` | Implementation detail — internal record PK has no client value |
| `resume_skill.extracted_at` | Simplification — version's `uploaded_at` provides sufficient context |
| `job_required_skill.weight` | Scoring engine internal — algorithm belongs to Intern 4 |
| `job_required_skill.skill_level` | Scoring engine internal — not needed by API consumers |
| `job_required_skill.source` | Internal metadata — not needed by frontend or AI consumers |

---

*Prepared by: Intern 2 — Backend & Identity Management*  
*Domain: Team-3/Domain-1*  
*Date: 22 September 2026*
