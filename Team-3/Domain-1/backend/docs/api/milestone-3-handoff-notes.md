# SwipeX Milestone 3 — API Contract Handoff Notes

> **Document Status**: Milestone 3 — Day 1 Contract Handoff  
> **Author**: Intern 2 (Backend & Identity Management, Domain-1)  
> **Recipients**: Intern 1 (Frontend), Intern 4 (AI/ML Career Intelligence)  
> **Date**: 22 September 2026  
> **Full Contract**: See `milestone-3-api-contract.yaml` in this directory

---

## Handoff to Intern 1 — Frontend & User Experience (Domain-4)

### What You Can Build Against

The following API endpoints are defined with stable contracts. Authentication uses the same JWT Bearer token mechanism from Milestone 2.

---

### 1. Resume Upload Page

**Endpoint**: `POST /api/v1/resumes/upload`

| Property | Value |
|:---|:---|
| Auth | `Authorization: Bearer <access_token>` |
| Role | `JOB_SEEKER` only |
| Content-Type | `multipart/form-data` |
| Required field | `file` (PDF or DOCX, max 5 MB) |
| Optional field | `label` (string — human-readable name for this version) |

**Success response** (201):
```json
{
  "resume_id": "a1b2c3d4-...",
  "version_id": "f9e8d7c6-...",
  "original_filename": "sai_resume_v2.pdf",
  "mime_type": "application/pdf",
  "file_size_bytes": 245760,
  "uploaded_at": "2026-09-22T10:30:00Z",
  "parsed_skills": ["Python", "Django", "REST API", "PostgreSQL"],
  "extraction_status": "completed"
}
```

**UI considerations**:
- Show a file upload zone accepting `.pdf` and `.docx` files
- Display `parsed_skills` after successful upload
- Handle `extraction_status: "pending"` — show a loading indicator and optionally poll the version detail endpoint
- Handle `400` errors: unsupported format, file too large, duplicate file

---

### 2. My Resumes List Page

**Endpoint**: `GET /api/v1/resumes/?page=1&page_size=10`

| Property | Value |
|:---|:---|
| Auth | Bearer JWT |
| Role | `JOB_SEEKER` only |
| Pagination | `page` (default: 1), `page_size` (default: 10, max: 50) |

**Success response** (200):
```json
{
  "count": 2,
  "results": [
    {
      "resume_id": "a1b2c3d4-...",
      "current_version_id": "f9e8d7c6-...",
      "original_filename": "sai_resume_v2.pdf",
      "version_count": 3,
      "created_at": "2026-09-20T08:00:00Z",
      "updated_at": "2026-09-22T10:30:00Z",
      "skills_summary": ["Python", "Django", "PostgreSQL"]
    }
  ]
}
```

**UI considerations**:
- Display a list/grid of the user's resumes with filename, version count, and top skills
- Each resume card links to a version detail view
- Only the authenticated user's own resumes appear (server-enforced)

---

### 3. Resume Version Detail Page

**Endpoint**: `GET /api/v1/resumes/{resume_id}/versions/{version_id}`

| Property | Value |
|:---|:---|
| Auth | Bearer JWT |
| Role | `JOB_SEEKER` only |
| Path params | `resume_id` (UUID), `version_id` (UUID) |

**Success response** (200):
```json
{
  "version_id": "f9e8d7c6-...",
  "resume_id": "a1b2c3d4-...",
  "original_filename": "sai_resume_v2.pdf",
  "mime_type": "application/pdf",
  "file_size_bytes": 245760,
  "sha256_hash": "e3b0c44...",
  "uploaded_at": "2026-09-22T10:30:00Z",
  "is_current": true,
  "extracted_skills": [
    {
      "skill_name": "Python",
      "normalized_name": "python",
      "source": "pdf_parser",
      "confidence": 95.5
    }
  ],
  "metadata": {
    "page_count": 2,
    "language": "en"
  }
}
```

**UI considerations**:
- Display file metadata (name, size, type, upload date)
- Show extracted skills as tags/chips with optional confidence indicators
- Highlight the current (active) version with a badge

---

### 4. ATS Score Page

**Endpoint**: `POST /api/v1/ats/score`

| Property | Value |
|:---|:---|
| Auth | Bearer JWT |
| Role | `JOB_SEEKER` only |
| Content-Type | `application/json` |
| Required fields | `resume_id` (UUID), `job_id` (string) |

**Success response** (200):
```json
{
  "resume_id": "a1b2c3d4-...",
  "job_id": "b2c3d4e5-...",
  "match_score": 78.5,
  "matched_skills": ["Python", "Django", "REST API"],
  "missing_skills": ["Kubernetes", "AWS"],
  "suggestions": [
    "Consider adding experience with Kubernetes to your resume."
  ],
  "generated_by": "semantic-v1",
  "scored_at": "2026-09-22T10:35:00Z"
}
```

**UI considerations**:
- Display `match_score` as a percentage gauge/progress bar
- Show `matched_skills` (green) and `missing_skills` (red) as tag lists
- Display `suggestions` as actionable tips
- Show `generated_by` badge to indicate scoring method

---

### 5. AI Suggestions Page

**Endpoint**: `POST /api/v1/suggestions/`

| Property | Value |
|:---|:---|
| Auth | Bearer JWT |
| Role | `JOB_SEEKER` only |
| Content-Type | `application/json` |
| Required field | `resume_id` (UUID) |
| Optional field | `job_id` (string — for job-targeted suggestions) |

**Success response** (200):
```json
{
  "resume_id": "a1b2c3d4-...",
  "job_id": null,
  "source": "rule_based",
  "suggestions": [
    {
      "category": "skills",
      "priority": "high",
      "title": "Add cloud computing skills",
      "detail": "Your resume does not mention any cloud platforms...",
      "related_skills": ["AWS", "Azure", "GCP"]
    }
  ],
  "generated_at": "2026-09-22T10:40:00Z"
}
```

**UI considerations**:
- Display `source` as a badge: "AI-Powered" vs "Rule-Based"
- Group suggestions by `category`
- Sort or highlight by `priority` (high → medium → low)
- Show `related_skills` as clickable tags
- **Important**: The AI/LLM may be unavailable — always handle `source: "rule_based"` as a valid response, not an error

---

### 6. Job Recommendations (Upgraded)

**Endpoint**: `GET /api/v1/recommendations/?resume_id={uuid}&limit=10&include_ats=true`

| Property | Value |
|:---|:---|
| Auth | Bearer JWT |
| Role | `JOB_SEEKER` only |
| Query params | `resume_id` (optional UUID), `limit` (default: 10), `include_ats` (default: false) |

**New M3 fields** (added alongside existing M2 fields):

| New Field | Type | Description |
|:---|:---|:---|
| `match_type` | enum | `"semantic"`, `"heuristic"`, or `"hybrid"` |
| `ats_score` | float \| null | ATS score (only if `include_ats=true`) |
| `semantic_similarity` | float \| null | Cosine similarity (0.0–1.0) |

**Backward compatibility**: All existing M2 fields (`match_score`, `match_percentage`, `reason_tags`, `generated_by`) are preserved.

---

### Common Error Format

All endpoints use the same error response format:
```json
{
  "error": "Error Category",
  "detail": "Human-readable message or {field: [errors]}",
  "status_code": 400
}
```

| Status | Meaning |
|:---|:---|
| `400` | Validation error |
| `401` | Missing/expired JWT token |
| `403` | Wrong role (not JOB_SEEKER) |
| `404` | Resource not found (or not owned by user) |
| `503` | Downstream service unavailable |

---

---

## Handoff to Intern 4 — AI/ML Career Intelligence (Domain-3)

### What You Need to Implement Against

The following API contracts define the interface between the API Gateway (Domain-1) and your services (Domain-3). The Gateway handles authentication, RBAC, and identity injection — your services receive pre-authenticated requests with trusted headers.

---

### 1. Resume Upload — Your Service Endpoint

**Gateway forwards to**: `${RESUME_SERVICE_URL}/api/v1/resumes/upload`

**What the Gateway sends you**:
- HTTP Method: `POST`
- Content-Type: `multipart/form-data`
- File field: `file` (PDF or DOCX)
- Optional field: `label` (string)
- Trusted headers: `X-User-Id`, `X-User-Role`, `X-User-Email`

**What you must return** (201):
```json
{
  "resume_id": "UUID",
  "version_id": "UUID",
  "original_filename": "string",
  "mime_type": "string",
  "file_size_bytes": integer,
  "uploaded_at": "ISO 8601 datetime",
  "parsed_skills": ["string"],
  "extraction_status": "completed | pending | failed"
}
```

**Your responsibilities**:
- Store the file (MinIO/local) → populate `file_object_key` in `resume_version` table
- Compute `sha256_hash` for deduplication
- Set `owner_user_id` from `X-User-Id` header
- Parse the file and extract skills → populate `resume_skill` table
- Return 400 if format unsupported or duplicate detected

**No algorithm assumptions**: The parsing/extraction method is entirely your choice (pdfplumber, spaCy NER, regex, etc.).

---

### 2. Resume List — Your Service Endpoint

**Gateway forwards to**: `${RESUME_SERVICE_URL}/api/v1/resumes/`

**What the Gateway sends you**:
- HTTP Method: `GET`
- Trusted header: `X-User-Id`
- Query params: `page`, `page_size`

**Your responsibility**: Filter resumes `WHERE owner_user_id = X-User-Id` and return paginated results.

---

### 3. Resume Version Detail — Your Service Endpoint

**Gateway forwards to**: `${RESUME_SERVICE_URL}/api/v1/resumes/{resume_id}/versions/{version_id}`

**What the Gateway sends you**:
- HTTP Method: `GET`
- Trusted header: `X-User-Id`

**Your responsibility**: Verify `owner_user_id` matches `X-User-Id`. Return 404 (not 403) if mismatch — this prevents user enumeration.

---

### 4. ATS Score — Your Service Endpoint

**Gateway forwards to**: `${RESUME_SERVICE_URL}/api/v1/ats/score`

**What the Gateway sends you**:
- HTTP Method: `POST`
- Content-Type: `application/json`
- Body: `{"resume_id": "UUID", "job_id": "string"}`
- Trusted header: `X-User-Id`

**What you must return** (200):
```json
{
  "resume_id": "UUID",
  "job_id": "string",
  "match_score": float (0-100),
  "matched_skills": ["string"],
  "missing_skills": ["string"],
  "suggestions": ["string"],
  "generated_by": "heuristic-v0 | heuristic-v1 | semantic-v1",
  "scored_at": "ISO 8601 datetime"
}
```

**Integration boundary**:
- The `resume_id` must be verified against `X-User-Id` for ownership
- The `job_id` is resolved against the `job` and `job_required_skill` tables
- The scoring algorithm (keyword overlap, semantic similarity, weighting) is **entirely your design**
- The API contract makes **no assumptions** about the scoring formula
- Set `generated_by` to identify your engine version

---

### 5. AI Suggestions — Your Service Endpoint

**Gateway forwards to**: `${RESUME_SERVICE_URL}/api/v1/suggestions/`

**What the Gateway sends you**:
- HTTP Method: `POST`
- Content-Type: `application/json`
- Body: `{"resume_id": "UUID", "job_id": "string | null"}`
- Trusted header: `X-User-Id`

**What you must return** (200):
```json
{
  "resume_id": "UUID",
  "job_id": "string | null",
  "source": "ai_generated | rule_based",
  "suggestions": [
    {
      "category": "skills | experience | formatting | keywords | education | summary | general",
      "priority": "high | medium | low",
      "title": "string",
      "detail": "string",
      "related_skills": ["string"] | null
    }
  ],
  "generated_at": "ISO 8601 datetime"
}
```

**Critical requirement — LLM fallback**:
- If an LLM is available → use it, set `source: "ai_generated"`
- If the LLM is unavailable, rate-limited, or errors → use rule-based fallback, set `source: "rule_based"`
- The API contract does NOT require a paid LLM. A free rule-based fallback MUST always work.
- **Never return a 503 because the LLM is down** — fall back silently

---

### 6. Recommendation Upgrade — Your Service Endpoint

**Gateway forwards to**: `${RESUME_SERVICE_URL}/api/v1/recommendations/`

**What the Gateway sends you**:
- HTTP Method: `GET`
- Query params: `resume_id`, `user_id`, `limit`, `include_ats`
- Trusted headers: `X-User-Id`, `X-User-Role`

**New fields to add to each recommendation** (M3 upgrade):

| Field | Type | Description |
|:---|:---|:---|
| `match_type` | `"semantic"` \| `"heuristic"` \| `"hybrid"` | How this job was matched |
| `ats_score` | float \| null | ATS score (only when `include_ats=true`) |
| `semantic_similarity` | float \| null | Cosine similarity (0.0–1.0) |

**Backward compatibility**: Keep returning `match_score`, `match_percentage`, `reason_tags`, and `generated_by` from M2. The new fields are **additions**, not replacements.

**Your M3 upgrade responsibilities**:
- Replace keyword overlap with semantic/embedding-based matching
- Incorporate resume content (from `resume_skill` table) into scoring
- Use swipe history for behavioral signals
- Replace fixed weights with learned/adaptive weights
- The `reason_tags` concept carries forward — even with a trained model

---

### Trusted Identity Headers (All Endpoints)

The Gateway strips any client-injected identity headers and injects these verified headers:

| Header | Value | Source |
|:---|:---|:---|
| `X-User-Id` | User's database ID (string) | Extracted from JWT `sub` claim |
| `X-User-Role` | User's role (e.g., `job_seeker`) | Extracted from JWT `role` claim |
| `X-User-Email` | User's email | Extracted from JWT `email` claim |

**You must trust these headers** — they are server-verified and cannot be spoofed by clients.

---

*Prepared by: Intern 2 — Backend & Identity Management*  
*Domain: Team-3/Domain-1*  
*Date: 22 September 2026*
