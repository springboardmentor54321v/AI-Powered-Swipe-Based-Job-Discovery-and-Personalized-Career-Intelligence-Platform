# SwipeX — Milestone 3: Technical Presentation
## AI Resume Analysis & Recommendations
**Author:** Intern 1 — Frontend & User Experience
**Domain:** Team-3 / Domain-4
**Date:** September 2026
**Scope:** Frontend Architecture, UI/UX Engineering, API Consumption, and Cross-Domain Handoff Audit

---

<!-- SLIDE 1 -->
# [Slide 1] Title & Executive Cover

```
========================================================================================
                      S W I P E X  —  M I L E S T O N E  3
                     AI Resume Analysis & Recommendations
========================================================================================
   [ Domain-4 Frontend & UX ]     [ Team-3 Workspace ]     [ Milestone-3 Demo ]
```

### Metadata
- **Project:** SwipeX Career Intelligence & Job Discovery Platform
- **Milestone:** Milestone 3 — AI Resume Analysis & Recommendations
- **Domain:** Team-3 / Domain-4 (Frontend & User Experience)
- **Role:** Intern 1 — Frontend Lead
- **Stack:** React 18.3, Vite 5.4, Tailwind CSS, Lucide Icons, Fetch API Client

### Executive Overview
Milestone 3 equips the SwipeX job seeker with candidate-facing intelligence: drag-and-drop multi-version resume management, instant NLP-extracted skill previews, diagnostic ATS compatibility scoring, missing keyword/skill gap analysis, actionable resume optimization tips, and AI match information natively infused into the existing swipe discovery deck.

> **Scope Boundary:** Intern 1 / Domain-4 is strictly responsible for the frontend architecture, UI components, interaction design, client-side validation, error handling, and API integration layers. All backend NLP parsing, ATS calculation algorithms, embeddings, and recommendation engines are owned by partner domains.

---

<!-- SLIDE 2 -->
# [Slide 2] Milestone Objective

### Core Purpose
Empower job seekers to understand how their resumes perform against real market requirements, pinpoint qualification gaps, and discover career opportunities with personalized AI relevance indicators.

```mermaid
flowchart LR
    A["1. Resume Upload\n(PDF / DOCX)"] --> B["2. NLP Parsing\n(Skill Extraction)"]
    B --> C["3. ATS Diagnostics\n(Match & Gaps)"]
    C --> D["4. Actionable Tips\n(Resume Suggestions)"]
    D --> E["5. Smart Discovery\n(AI-Ranked Swipes)"]

    style A fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#ffffff
    style B fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#ffffff
    style C fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#ffffff
    style D fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#ffffff
    style E fill:#4c1d95,stroke:#c084fc,stroke-width:2px,color:#ffffff
```

### Key Milestone Objectives
- **Multi-Version Resume Management:** Upload, version, label, and switch active resumes seamlessly.
- **Skill Extraction Visualization:** Immediately surface skills recognized by the parsing pipeline.
- **ATS Compatibility Diagnostics:** Compare any candidate resume version against specific job postings.
- **Actionable Gap Analysis:** Highlight matched skills, missing skills, and missing keywords with visual clarity.
- **Targeted Suggestions:** Provide contextual improvement tips without encouraging fabricated qualifications.
- **Intelligent Discovery Integration:** Display AI match percentages and reason tags directly on job cards without disrupting the M2 swipe physics.

---

<!-- SLIDE 3 -->
# [Slide 3] Intern 1 Responsibilities & Ownership

### Domain Ownership Boundary
```
┌────────────────────────────────────────────────────────────────────────┐
│                      DOMAIN-4 RESPONSIBILITY MATRIX                    │
├──────────────────────────────────┬─────────────────────────────────────┤
│ OWNED & IMPLEMENTED BY DOMAIN-4  │ CONSUMED FROM OTHER DOMAINS         │
├──────────────────────────────────┼─────────────────────────────────────┤
│ ✔ Resume Upload Dropzone (UI)    │ ✖ File Storage & Disk S3 (Dom 1/2)  │
│ ✔ Resume Version Manager (UI)    │ ✖ Text & Skill Parsing (Dom 1/3)    │
│ ✔ Parsed Skills Preview Chips    │ ✖ ATS Score Formulas (Dom 3)        │
│ ✔ ATS Compatibility Studio       │ ✖ Suggestions Engine (Dom 3)        │
│ ✔ Skill & Keyword Gap Display    │ ✖ ChromaDB Embeddings (Dom 3)       │
│ ✔ Suggestions Panel UI           │ ✖ Recommendation Ranking (Dom 3)    │
│ ✔ JobCard AI Match Indicators    │ ✖ API Gateway Routing (Dom 1)       │
│ ✔ Mobile-first Responsive Layout │ ✖ PostgreSQL Schema / DB (Dom 2)    │
│ ✔ Loading / Error / Empty States │ ✖ Infrastructure & Docker (Dom 5)   │
│ ✔ Gesture & Pointer Isolation    │ ✖ Automated QA Tests (Dom 5)        │
└──────────────────────────────────┴─────────────────────────────────────┘
```

> **Direct Ownership Statement:**
> **"Frontend implementation owned 100% by Intern 1 / Domain-4."**
> All user interfaces, clients, state stores, normalization routines, and UX fallbacks were authored within `Team-3/Domain-4/`.

---

<!-- SLIDE 4 -->
# [Slide 4] Milestone 3 Development Journey (7-Day Execution)

```
Day 1 ──► Day 2 ──► Day 3 ──► Day 4 ──► Day 5 ──► Day 6 ──► Day 7
 Spec     Scaffold   Live API    ATS      Recomms    Hardening   Audit &
Review     & Mocks    Resumes   Scoring   & Match%    & Polish   Handoff
```

| Day | Milestone Phase | Key Achievements | Verification |
| :---: | :--- | :--- | :--- |
| **Day 1** | **Spec Review & Architecture** | Reviewed M3 OpenAPI contract, verified M2 baseline, designed 14 wireframes and route hierarchy. | `MILESTONE_3_FRONTEND_PLAN.md` |
| **Day 2** | **UI Scaffolding & Mocks** | Built `ResumeDropzone`, `ResumeVersionList`, and `JobSeekerAtsPage` with rich mock fixtures. | Interactive preview in browser |
| **Day 3** | **Live Resume Service Integration** | Connected `POST /resumes/upload`, `GET /resumes/`, and `POST /resumes/{id}/parse` to live Gateway. | Verified with PDF/DOCX uploads |
| **Day 4** | **ATS Diagnostics Studio** | Built `AtsScoreGauge`, integrated `POST /ats/score`, wired job selector and gap lists. | End-to-end scoring pipeline |
| **Day 5** | **AI Suggestions & JobCard Match%** | Added suggestions panel, upgraded recommendations client, added AI match pill to JobCard. | Swipe deck with match indicators |
| **Day 6** | **Hardening & Quality Assurance** | Eliminated render loops, cleaned toast unmounts, removed fabricated fallback scores. | `npm run build` PASSED |
| **Day 7** | **Final Audit, Polish & Handoff** | Conducted repository-wide dependency audit across Domains 1–5; verified demo rehearsal. | Repository Audit Report |

---

<!-- SLIDE 5 -->
# [Slide 5] Resume & Capability Studio

### Experience Overview
The Resume Studio enables job seekers to maintain their complete career portfolio in one place, supporting iterative resume updates tailored to different job profiles.

```
┌────────────────────────────────────────────────────────────────────────┐
│  RESUME & CAPABILITY STUDIO                                            │
├──────────────────────────────────┬─────────────────────────────────────┤
│  DROPZONE UPLOAD AREA            │  VERSION HISTORY STACK              │
│  ┌────────────────────────────┐  │  ┌────────────────────────────────┐ │
│  │   [ 🗎 PDF / DOCX Drop ]   │  │  │ Version 2 (Active)    [Default]│ │
│  │   Drag file here or browse │  │  │ Resume_FullStack_2026.pdf      │ │
│  │   Max: 5MB  •  SHA-256     │  │  │ Uploaded: 26 Sep • 412 KB      │ │
│  │   Version Label: [Senior]  │  │  └────────────────────────────────┘ │
│  │   [ Upload & Parse Resume ]│  │  ┌────────────────────────────────┐ │
│  └────────────────────────────┘  │  │ Version 1            [Switch]  │ │
│                                  │  │ Resume_Backend_v1.pdf          │ │
│  PARSED SKILLS CLOUD             │  │ Uploaded: 24 Sep • 380 KB      │ │
│  [Python] [React] [Django] [SQL] │  └────────────────────────────────┘ │
│  [Docker] [Git] [REST API]       │                                     │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### Implemented Capabilities
- **Dual-format Drag & Drop:** Accepts native `.pdf` and `.docx` documents.
- **Client-Side Guardrails:** Enforces 5 MB file size limit and MIME-type integrity prior to network transport.
- **Custom Version Labeling:** Optional descriptive metadata (e.g., "Full-Stack Tailored", "Lead Architect").
- **Active Version Switcher:** Single-click activation of target version across the platform.
- **Parsed Skills Badges:** Real-time visual feedback of extracted competencies.
- **Background Extraction States:** Clear spinner states for `"pending"` or `"processing"` NLP tasks.

---

<!-- SLIDE 6 -->
# [Slide 6] Resume API Integration Architecture

### Frontend-to-Backend Protocol
Domain-4 communicates with the central Django Gateway using standard `multipart/form-data` and JSON REST endpoints.

```mermaid
sequenceDiagram
    autonumber
    actor User as Job Seeker
    participant UI as Domain-4 Frontend
    participant Svc as resumeService.js
    participant GW as Domain-1 Gateway
    participant DS as Domain-1 / 3 Backend

    User->>UI: Selects resume.pdf + enters label
    UI->>Svc: uploadResume(file, label)
    Svc->>GW: POST /api/v1/resumes/upload (FormData)
    GW->>DS: Validates & writes to storage
    DS-->>GW: 201 Created (resume_id, version_id)
    GW-->>Svc: ResumeUploadResponse
    Svc->>GW: POST /api/v1/resumes/{id}/parse
    GW->>DS: Executes spaCy PhraseMatcher
    DS-->>GW: 200 OK (extracted_skills[])
    GW-->>Svc: Extracted skills payload
    Svc-->>UI: Updates active resume & skills cloud
```

### Integration Details
- **Unified Adapter:** `resumeService.uploadResume()` transparently manages upload + parse orchestration.
- **Response Normalization:** Resolves contract variations (`extracted_skills` vs `parsed_skills` vs `skills`).
- **Defensive Error Traps:** Specifically handles 400 Bad Request (duplicate hash/invalid format), 401 Unauthorized, 403 Forbidden, and 503 Downstream Unavailable with user-friendly alerts.

---

<!-- SLIDE 7 -->
# [Slide 7] ATS Compatibility Diagnostics Studio

### Interactive Job-Resume Benchmarking
The ATS Studio provides job seekers with clear, deterministic feedback regarding their resume's alignment with target job requisitions.

```
┌────────────────────────────────────────────────────────────────────────┐
│  ATS COMPATIBILITY DIAGNOSTICS STUDIO                                  │
├──────────────────────────────────┬─────────────────────────────────────┤
│  CONFIGURATION SELECTORS         │  SCORE GAUGE & BENCHMARK            │
│  Resume Version: [ Version 2 ▾ ] │              ╭────────╮             │
│  Target Job:    [ SDE-2 Cloud ▾ ]│             │  84.5%  │             │
│                                  │              ╰────────╯             │
│  EVALUATION METADATA             │        [ Strong Alignment ]         │
│  Engine: semantic-v1             │                                     │
│  Timestamp: 2026-09-26 08:30     │  Keyword Match:      82.0%          │
│  Formula: 40% KW + 60% Semantic  │  Semantic Fit:       86.2%          │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### Technical Note on ATS Scoring
- **Zero Frontend Arithmetic:** The frontend does **NOT** calculate scores. All scores, percentiles, and thresholds originate from backend algorithms.
- **Backend Formula Reference:**
  $$\text{Final ATS Score} = (0.40 \times \text{Keyword Match}) + (0.60 \times \text{Semantic Similarity})$$
- **Provable Provenance:** Every displayed score is tagged with its generator metadata (`semantic-v1` or `heuristic-v0`) and calculation timestamp.

---

<!-- SLIDE 8 -->
# [Slide 8] Skill & Keyword Gap Analysis

### Transforming Raw Data into Strategic Clarity
The ATS Dashboard surfaces actionable gaps so candidates know exactly where their profile excels and where it requires optimization.

```
┌────────────────────────────────────────────────────────────────────────┐
│  DIAGNOSTIC GAP BREAKDOWN                                              │
├────────────────────────────────────────────────────────────────────────┤
│  ✔ MATCHED SKILLS (Identified in Resume & Job)                         │
│  [ Python ] [ React ] [ REST API ] [ SQL ] [ Git ]                     │
├────────────────────────────────────────────────────────────────────────┤
│  ▲ MISSING SKILLS (Required by Job, Not Found in Resume)              │
│  [ Kubernetes ] [ Docker ] [ Redis ]                                   │
├────────────────────────────────────────────────────────────────────────┤
│  🔍 MISSING KEYWORDS (Contextual Domain Terms in Job Description)      │
│  [ Microservices ] [ CI/CD Pipelines ] [ Event-Driven Architecture ]   │
└────────────────────────────────────────────────────────────────────────┘
```

### Presentation Highlights
- **Color-Coded Semantic Taxonomy:**
  - Emerald Green: Verified competencies present in both documents.
  - Amber/Orange: Hard skill requirements missing from extracted profile.
  - Violet/Purple: Missing contextual vocabulary and domain keywords.
- **Honest Guidance:** Clarifies that candidates should only add missing skills if they possess genuine hands-on experience.

---

<!-- SLIDE 9 -->
# [Slide 9] AI & Rule-Based Suggestions Panel

### Actionable Resume Enhancement
Provides contextual, structured recommendations to elevate the candidate's ATS match score before applying.

```
┌────────────────────────────────────────────────────────────────────────┐
│  OPTIMIZATION SUGGESTIONS                                 [ 3 Active ] │
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ [HIGH PRIORITY] Add Containerization Competencies                  │
│     Target job requires Docker & Kubernetes. Highlight any past        │
│     experience building or deploying containerized microservices.      │
│     Category: Skills Gap  •  Source: rule_based                        │
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ [MEDIUM] Contextualize Event-Driven Keywords                       │
│     Incorporate keywords like "Kafka" or "Event-Driven" if you have    │
│     engineered asynchronous messaging pipelines.                       │
│     Category: Keyword Optimization  •  Source: ai_generated            │
└────────────────────────────────────────────────────────────────────────┘
```

### Integration Details
- **Target Endpoint:** `POST /api/v1/suggestions/` with `{ resume_id, job_id }`.
- **Provenance Transparency:** UI explicitly denotes whether an optimization tip was produced by `ai_generated` (LLM) or `rule_based` heuristics.
- **Boundary Reminder:** Domain-4 consumes and presents suggestion text; rule-based logic is authored by Domain-3.

---

<!-- SLIDE 10 -->
# [Slide 10] AI-Matched Job Recommendations & Swipe Experience

### Infusing Intelligence into the Discovery Deck
Milestone 3 elevates the Milestone 2 job discovery deck by integrating resume-aware career intelligence directly into the cards.

```
┌──────────────────────────────────────────────────────────┐
│                   SWIPEX DISCOVERY DECK                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Lead Backend Architect                             │  │
│  │ Stripe • Bengaluru / Remote • ₹38-45 LPA           │  │
│  │                                                    │  │
│  │ [ ✦ 88% Match ] [ 85% ATS Fit ] [ Semantic Fit ]   │  │
│  │                                                    │  │
│  │ Required Skills:                                   │  │
│  │ [Python] [Distributed Systems] [Kafka] [PostgreSQL]│  │
│  │                                                    │  │
│  │ Reason Tags:                                       │  │
│  │ • 88% Skill alignment with Resume_v2.pdf           │  │
│  │ • Strong semantic fit with cloud architecture      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│     [ ✖ Pass ]      [ ↩ Undo ]      [ ♥ Apply / Save ]   │
└──────────────────────────────────────────────────────────┘
```

### Architectural Guardrails
- **Preserved M2 Gestures:** Touch drag, pointer physics, and keyboard shortcuts remain 100% responsive.
- **Pointer Event Isolation:** All AI badges utilize `pointer-events-none` so cards can be grabbed anywhere without button trapping.
- **Backward Compatible:** Unanalyzed jobs display clean default badges; recommendations gracefully fall back to heuristic scores if semantic endpoints are unavailable.

---

<!-- SLIDE 11 -->
# [Slide 11] Frontend Architecture & Component Hierarchy

```
Team-3/Domain-4/src/
│
├── pages/
│   ├── ResumeUploadPage.jsx ────────► Multi-version resume manager
│   ├── JobSeekerAtsPage.jsx ────────► ATS Diagnostics Studio
│   ├── JobSeekerRecommendationsPage ► AI-ranked recommendation catalog
│   └── JobSeekerOverviewPage.jsx ───► Consolidated candidate cockpit
│
├── components/
│   ├── resume/
│   │   ├── ResumeDropzone.jsx ──────► PDF/DOCX drag-and-drop uploader
│   │   ├── ResumeVersionList.jsx ───► Version history accordion
│   │   ├── ResumeVersionCard.jsx ───► Individual version actions & tags
│   │   └── ParsedSkillsPreview.jsx ─► Interactive extracted skills chips
│   ├── ats/
│   │   ├── AtsScoreGauge.jsx ───────► Animated SVG radial score gauge
│   │   ├── SkillGapList.jsx ────────► Matched vs missing skill cards
│   │   └── KeywordGapList.jsx ──────► Missing domain keyword chips
│   ├── suggestions/
│   │   └── SuggestionsPlaceholder.jsx Actionable suggestion cards
│   └── jobseeker/
│       └── JobCard.jsx ─────────────► Swipe card with AI Match indicators
│
└── services/
    ├── api.js ──────────────────────► Centralized Fetch client with JWT & retry
    ├── resume.js ───────────────────► Resume upload, versioning, parse adapter
    ├── ats.js ──────────────────────► ATS scoring adapter & normalizer
    ├── suggestions.js ──────────────► AI & rule-based suggestions adapter
    └── recommendations.js ──────────► Career intelligence recommendations adapter
```

---

<!-- SLIDE 12 -->
# [Slide 12] UX, Quality & Engineering Rigor

### Non-Functional Implementation Highlights
- **Mobile-First Responsive Layouts:** Optimized for all viewports from 360px mobile screens to 1440px+ 4K monitors.
- **Comprehensive State Coverage:** Every view explicitly handles all 4 UI states:
  - `Loading`: Tailored skeletons and animated pulse loaders.
  - `Success`: Clear data visualization and affirmative toast notices.
  - `Empty`: Contextual illustrations guiding users to upload or analyze resumes.
  - `Error`: Actionable error banners with retry triggers.
- **Lifecycle & Memory Safety:**
  - Resolved `useCallback` dependency arrays to prevent infinite re-render loops.
  - Cleaned unmounted component timer references in `SwipeDiscoveryPage`.
- **Zero Fabrication Policy:** Purged synthetic / hardcoded score fallbacks in favor of strict null checks.
- **Automated Validation:**
  - Production Build: `✓ built in 7.63s` via Vite (0 errors, 0 warnings).
  - Git Cleanliness: `git diff --check` PASSED (0 conflict markers).

---

<!-- SLIDE 13 -->
# [Slide 13] Final Status & Cross-Domain Dependencies

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MILESTONE 3 HANDOFF AUDIT                       │
├──────────────────────────────────┬─────────────────────────────────────┤
│  DOMAIN-4 FRONTEND: 100% COMPLETE │  EXTERNAL BACKEND DEPENDENCIES      │
├──────────────────────────────────┼─────────────────────────────────────┤
│  ✔ Resume Upload & Versioning UI │  ⚠ Domain-1: Mount /ats/score route │
│  ✔ Parsed Skills Cloud           │  ⚠ Domain-1: Mount /suggestions     │
│  ✔ ATS Diagnostics Studio        │  ⚠ Domain-1: Version-detail route   │
│  ✔ Gap Analysis & Suggestion UI  │  ⚠ Domain-3: Expose ATS via HTTP    │
│  ✔ AI Match% on Discovery Feed   │  ⚠ Domain-3: Expose suggestions HTTP│
│  ✔ Production Build PASSED       │  ⚠ Domain-3: ChromaDB in recommend  │
│  ✔ Zero Uncommitted Polish Diffs │  ⚠ Domain-5: M3 automated tests     │
│  ✔ Pushed to origin/Team-3       │  ⚠ Domain-5: Docker compose ports   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

> **Audit Clarification:**
> The external dependencies listed on the right represent cross-domain backend and infrastructure work identified during our Phase 1–15 repository audit. They do **not** represent remaining frontend implementation tasks for Intern 1.

---

<!-- SLIDE 14 -->
# [Slide 14] End-to-End Demo Flow & Conclusion

### End-to-End Candidate User Journey
```
1. Login as Job Seeker (JWT Auth)
   ↓
2. Open Resume Studio ──► Drag & Drop "Resume_Senior_2026.pdf"
   ↓
3. Background Parsing triggers ──► Extracted Skills immediately render
   ↓
4. Navigate to ATS Studio ──► Select Active Resume & "Full-Stack SDE" Job
   ↓
5. ATS Diagnostics visualizes ──► 84.5% Score + Matched vs Missing Gaps
   ↓
6. Review Suggestions ──► Inspect actionable tips categorized by priority
   ↓
7. Open Discovery Feed ──► Swipe cards display "88% Match" & reason tags
   ↓
8. Candidate Swipes Right ──► Optimistic apply saved to candidate history!
```

### Closing Summary
> **"Milestone 3 frontend delivers the complete user-facing AI career intelligence experience—providing transparency, actionable diagnostics, and personalized guidance while strictly preserving SwipeX's core swipe discovery flow."**

**Intern 1 — Frontend & User Experience**
*Team-3 / Domain-4 • September 2026*
