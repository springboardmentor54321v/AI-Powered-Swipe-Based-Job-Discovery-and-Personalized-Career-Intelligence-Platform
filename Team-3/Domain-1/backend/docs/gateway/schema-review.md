# SwipeX Milestone 2 — Schema Review & Alignment Notes with Intern 3 (Domain-2)

> **Document Status**: Milestone 2 — Day 1 Schema Alignment Review  
> **Reviewer**: Intern 2 (Backend & Identity Management, Domain-1)  
> **Target Counterpart**: Intern 3 (Job & Data Intelligence, Domain-2)  
> **Source Inspected**: `Domain-2/SwipeX_Job_Data_Intelligence_Milestone1/app/models.py` & `schemas.py`

---

## 1. Executive Summary

A comprehensive inspection of Intern 3's Job & Data Intelligence artifacts was conducted against the Milestone 2 requirements. 

Intern 3's Domain-2 models (`Company`, `Job`, and `Swipe`) and schemas provide the concrete baseline for the Milestone 2 OpenAPI contract. This review identifies existing fields, required API representations, relationship cardinalities, key assumptions, contract decisions made, and items requiring alignment for Day 2.

---

## 2. Entity Schema Review

### 2.1 Company Schema (`companies` table)

#### Model Definition in Domain-2:
```python
class Company(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    company_type: Mapped[str] = mapped_column(String(30), index=True)
    industry: Mapped[str] = mapped_column(String(100))
    headquarters: Mapped[str] = mapped_column(String(120))
    founded_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    website: Mapped[str | None] = mapped_column(String(240), nullable=True)
```

#### Field Analysis & Mapping:
| Field | DB Type | Nullable | Required in API | Notes & Decisions |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | No (PK) | Yes | Exposed in both company directory and embedded in job details |
| `name` | `VARCHAR(160)` | No | Yes | Company title (e.g. "Acme Cloud") |
| `company_type`| `VARCHAR(30)` | No | Yes | Tier/classification (e.g. "Startup", "Enterprise", "MNC") |
| `industry` | `VARCHAR(100)` | No | Yes | Industry vertical (e.g. "Software", "Finance") |
| `headquarters`| `VARCHAR(120)` | No | Yes | Primary office location |
| `founded_year`| `INTEGER` | Yes | Optional | Year founded (nullable for imported legacy dataset) |
| `website` | `VARCHAR(240)` | Yes | Optional | Company official website URL |
| `active_jobs_count` | Computed | N/A | Optional | **Needs confirmation from Intern 3**: Whether aggregate count is precalculated or joined on retrieval |

---

### 2.2 Job Schema (`jobs` table)

#### Model Definition in Domain-2:
```python
class Job(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    source_job_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    title: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str] = mapped_column(Text)
    employment_type: Mapped[str] = mapped_column(String(30), index=True)
    location: Mapped[str] = mapped_column(String(120), index=True)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    skills: Mapped[str] = mapped_column(Text)  # Pipe-delimited string
    experience_level: Mapped[str] = mapped_column(String(40), default="Fresher")
    applicant_count: Mapped[int] = mapped_column(Integer, default=0)
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
```

#### Field Analysis & Mapping:
| Field | DB Type | API Contract Mapping | Decision / Recommendation |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `job_id` | Mapped as `job_id` in API responses for consistency with Milestone 1 contract |
| `title` | `VARCHAR(160)` | `title` | Role title |
| `company_id` | `INTEGER FK` | `company_id` | Foreign key linking to `companies.id` |
| `company.name`| (Joined) | `company` | In `JobOut`, returned directly as company name string |
| `company.company_type` | (Joined) | `company_type` | Included in list/search responses |
| `description` | `TEXT` | `description` | Excluded from compact list view for performance; included in `GET /jobs/{id}` |
| `employment_type` | `VARCHAR(30)` | `type` / `job_type` | Supported as filter in `GET /jobs` and `GET /jobs/search` |
| `location` | `VARCHAR(120)` | `location` | Filterable via substring / ilike |
| `is_remote` | `BOOLEAN` | `remote` / `is_remote` | Boolean remote indicator |
| `salary_min`, `salary_max` | `INTEGER` | `salary_range: {min, max}` | Nested salary object in JSON responses |
| `skills` | `TEXT (pipe-delimited)` | `skills: list[str]` | Normalized from `"Python|Django|PostgreSQL"` to `["Python", "Django", "PostgreSQL"]` |
| `experience_level` | `VARCHAR(40)`| `experience_level` | Categorized band (`Fresher`, `Junior`, `Mid-Level`, `Senior`, `Lead`) |
| `applicant_count`| `INTEGER` | `applicant_count` | Metric counter for UI engagement |
| `posted_at` | `TIMESTAMP` | `posted_at` (ISO 8601) | Published timestamp |

---

### 2.3 Swipe Schema (`swipes` table)

#### Model Definition in Domain-2:
```python
class Swipe(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    direction: Mapped[str] = mapped_column(String(8), index=True)
    swiped_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
```

#### Milestone 2 Contract Decisions:
1. **Swipe Action Vocabulary**:
   - Milestone 1 used `direction: "right" | "left"`.
   - Milestone 2 SRS expands swipe actions to: `action: "apply" | "save" | "skip"`.
   - **Contract Decision**:
     The API contract supports both vocabularies for full backwards compatibility:
     - `"apply"` maps to positive swipe (`"right"`)
     - `"skip"` maps to negative swipe (`"left"`)
     - `"save"` allows bookmarking without active application
2. **User Isolation & Integrity**:
   - `UniqueConstraint("user_id", "job_id", name="uq_user_job_swipe")` ensures a candidate can only have one active interaction per job posting. Swiping a second time updates the existing record rather than creating a duplicate.
   - `user_id` is never supplied in the client request body; it is securely populated from the Gateway-verified `X-User-Id` header to prevent candidate impersonation.

---

## 3. Relationships & Data Flow

```text
 ┌────────────────┐          1 ─── *          ┌──────────────┐
 │   companies    │───────────────────────────│     jobs     │
 └────────────────┘                           └──────────────┘
                                                     │ 1
                                                     │
                                                     │ *
 ┌────────────────┐          1 ─── *          ┌──────────────┐
 │     users      │───────────────────────────│    swipes    │
 └────────────────┘                           └──────────────┘
```

1. **Company ── Job**: One-to-many relationship (`companies.id` 1 ── * `jobs.company_id`). Deleting a company cascades or restricts job deletion.
2. **Job ── Swipe**: One-to-many relationship (`jobs.id` 1 ── * `swipes.job_id`). Deleting a job cascades to its associated swipe records.
3. **User ── Swipe**: One-to-many relationship (`users.id` 1 ── * `swipes.user_id`). Users exist in Domain-1 PostgreSQL, while Swipes are recorded in Domain-2 PostgreSQL, bridged by the distributed user ID provided by the Gateway.

---

## 4. Key Assumptions & Contract Agreements

1. **Service Separation**:
   - Domain-1 owns Authentication (`apps.auth_service`), User identities (`users`, `roles`), and API Gateway routing (`gateway/`).
   - Domain-2 owns Job data, Search algorithms, Company directory, and Swipe recording tables.
2. **Identity Injection**:
   - The Gateway is solely responsible for verifying the candidate's JWT and asserting `role == "job_seeker"`.
   - Downstream services trust the `X-User-Id` header only because direct outside traffic is blocked or isolated behind the Gateway.
3. **Search Consistency**:
   - The `GET /api/v1/jobs/search` endpoint produces the same `JobListResponse` schema as `GET /api/v1/jobs`, ensuring frontend components can reuse identical card deck templates.

---

## 5. Alignment Confirmations with Intern 3 (Domain-2 Resolution)

Following inspection and integration with Intern 3's completed Domain-2 implementation (`app/main.py`, `app/models.py`, `app/schemas.py`, `app/seed.py`):

| Item | Contract Specification | Domain-2 Implementation | Gateway Resolution & Status |
| :--- | :--- | :--- | :--- |
| **Swipe Action Field** | Client requests `"action"` (`apply`, `save`, `skip`, `right`, `left`) | Pydantic validator strictly requires `direction in {"left", "right"}` | **Resolved**: Gateway translates `apply` $\to$ `"right"`, `save` $\to$ `"right"`, `skip` $\to$ `"left"`, `right` $\to$ `"right"`, `left` $\to$ `"left"` before forwarding. |
| **User Identity Injection** | Client identity headers stripped; trusted `X-User-Id` injected | `user_id_from_gateway` requires `X-User-Id` header (digits $\ge 1$) | **Resolved**: Gateway automatically injects authenticated user's ID as `X-User-Id` header from validated JWT token. |
| **Job Schema Output** | `JobOut` schema with `job_id`, `remote`, `salary_range` | `job_id`, `company`, `company_type`, `location`, `remote`, `salary_range: {min, max}`, `skills: list[str]` | **Resolved**: Domain-1 models and mock runner aligned with `JobOut` and `JobDetail` representations. |
| **Swipe History Schema** | Direct list of swipe interactions | Returns `list[SwipeHistoryItem]` with `job_id`, `direction`, `swiped_at`, `job_title`, `company` | **Resolved**: Domain-1 proxy transparently streams Domain-2 swipe history list. |
| **Search & Companies** | `GET /api/v1/jobs/search`, `GET /api/v1/companies`, `GET /api/v1/companies/{id}` | Modeled on `companies` and `jobs` tables with seed data | **Resolved**: Gateway proxies search and directory routes directly, backed by Domain-2 data schema. |

---

## 6. Summary & Sign-off

The API contract and Gateway routing layers in Domain-1 are now completely aligned with the live Domain-2 implementation. Payload translation, header injection, and schema compatibility are fully verified.

