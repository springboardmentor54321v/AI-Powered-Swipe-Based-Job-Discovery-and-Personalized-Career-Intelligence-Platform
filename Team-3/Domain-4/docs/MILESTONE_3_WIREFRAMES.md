# SwipeX Milestone 3 — Frontend Wireframes & UI Specifications
**Document Status**: Day 1 Visual Specifications  
**Author**: Intern 1 — Frontend & User Experience (Domain-4)  
**Target Milestone**: Milestone 3 — AI Resume Analysis & Recommendations  
**Primary Reference**: `MILESTONE_3_FRONTEND_PLAN.md`  

---

## Overview

This document provides visual ASCII wireframes, design tokens, component specifications, and interaction states for the four core Milestone 3 frontend user experiences:
1. **Resume Upload & Version Management** (`/dashboard/job-seeker/resume`)
2. **ATS Score Dashboard** (`/dashboard/job-seeker/ats`)
3. **AI Suggestions Panel** (Integrated within ATS & Recommendations)
4. **AI Match % JobCard Integration** (`/dashboard/job-seeker/discover`)

All designs adhere to the **SwipeX Material-inspired dark aesthetic**:
- Primary Accent: Calm Violet `#9d7bf6`
- Surface Backgrounds: `#101116` / `#131316` / `#17181e`
- Success / Matched: `#34d399` (Emerald 400)
- Gap / Warning: `#fbbf24` (Amber 400)
- Critical / Pass: `#f87171` (Rose 400)

---

## 1. Resume Upload & Version Management Wireframe

### Route: `/dashboard/job-seeker/resume`
**Role**: `JOB_SEEKER` only

```
+---------------------------------------------------------------------------------------------------------+
| [RoleDashboardShell Header]   Candidate Portal > Resume Studio                         [User Profile v] |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [✨ ATS Intelligence Studio]                                                                           |
|  RESUME & CAPABILITY STUDIO                                                                             |
|  Upload new resume versions, manage past iterations, and inspect automated skill extraction.            |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  | ACTIVE RESUME VERSION                                                                             |  |
|  |                                                                                                   |  |
|  |  [📄 PDF]  sai_resume_v2.pdf                    [✓ Active Default]   [245.8 KB]  [Uploaded 2h ago] |  |
|  |            Version 2 • "Full Stack Lead 2026"                                                     |  |
|  |                                                                                                   |  |
|  |  Extracted Skills (8):                                                                            |  |
|  |  [Python] [Django] [React] [PostgreSQL] [REST APIs] [Docker] [Git] [Tailwind CSS]                 |  |
|  |                                                                                                   |  |
|  |  Actions: [Run ATS Diagnostics ->]   [Inspect Metadata]   [Re-parse Document]                     |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  | UPLOAD NEW RESUME VERSION                                                                         |  |
|  |                                                                                                   |  |
|  |  + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  |  |
|  |  :                                                                                             :  |  |
|  |  :                                         [ ☁️ ]                                              :  |  |
|  |  :                          Drag and drop your resume file here                                :  |  |
|  |  :                                          or                                                 :  |  |
|  |  :                                    [ Browse Files ]                                         :  |  |
|  |  :                                                                                             :  |  |
|  |  :                             Supports PDF or DOCX (Max 5MB)                                  :  |  |
|  |  :                         256-Bit Encrypted • Never shared publicly                           :  |  |
|  |  + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  |  |
|  |                                                                                                   |  |
|  |  Version Label (Optional):                                                                        |  |
|  |  [ e.g. Backend Engineering Resume v3                                                          ]  |  |
|  |                                                                                                   |  |
|  |  Selected File: backend_lead_final.pdf (312 KB)                                                   |  |
|  |                                                        [ Clear ]   [ Upload & Parse Document ]   |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  | VERSION HISTORY (2 Versions Stored)                                                               |  |
|  |                                                                                                   |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |  | [📄 PDF]  sai_resume_v2.pdf  •  v2  [CURRENT]                   Sep 22, 2026, 10:30 AM       |  |  |
|  |  | Label: "Full Stack Lead 2026"  •  Size: 245 KB  •  SHA: e3b0c442...                         |  |  |
|  |  | Skills: Python, Django, React, PostgreSQL (+4 more)                                         |  |  |
|  |  | Actions: [In Use for ATS]   [Inspect Skills]                                                |  |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |                                                                                                   |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |  | [📄 PDF]  sai_resume_v1.pdf  •  v1                             Sep 15, 2026, 04:15 PM       |  |  |
|  |  | Label: "Initial Draft"  •  Size: 210 KB  •  SHA: 7a8f9c11...                                 |  |  |
|  |  | Skills: Python, Flask, SQLite, JavaScript                                                   |  |  |
|  |  | Actions: [Switch to This Version]   [Inspect Skills]                                        |  |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |                                                                                                   |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

### Component States:
- **Idle / Empty State**: Dropzone dashed border, helper prompt with icon.
- **Dragging**: Border turns `primary` violet (`#9d7bf6`), background lights up with `primary/10`, slight scale feedback (`scale-[0.99]`).
- **File Selected**: File icon, filename, formatted size, Clear button appears.
- **Uploading / Parsing**: Dropzone locked, animated spinner (`Loader2`), button reads *"Extracting Skills..."*.
- **Upload Succeeded**: Success banner appears, new version prepends to Version History list, extracted skill chips populate dynamically.
- **Error State**: Inline alert banner at top of container with actionable message (e.g. *"File is too large (6.2MB). Max allowed size is 5MB"*).

---

## 2. ATS Score Dashboard Wireframe

### Route: `/dashboard/job-seeker/ats`
**Role**: `JOB_SEEKER` only

```
+---------------------------------------------------------------------------------------------------------+
| [RoleDashboardShell Header]   Candidate Portal > ATS Diagnostics                       [User Profile v] |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  HEADER: ATS RESUME DIAGNOSTICS                                                                         |
|  Evaluate your resume against specific enterprise job descriptions using keyword & semantic scoring.   |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  | BENCHMARK EVALUATION CONTEXT                                                                      |  |
|  |                                                                                                   |  |
|  |  Selected Resume:                                Target Job Requisition:                          |  |
|  |  [ sai_resume_v2.pdf (Version 2 - Current) v ]    [ Senior Python Developer - TechCorp India v ]   |  |
|  |                                                                                                   |  |
|  |                                                           [ Recompute ATS Score (semantic-v1) ]   |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  | SCORE SUMMARY & HEALTH CHECK                                                                      |  |
|  |                                                                                                   |  |
|  |   +----------------------------+   +-----------------------------------------------------------+  |  |
|  |   |     ATS COMPATIBILITY      |   |                     SCORING BREAKDOWN                     |  |  |
|  |   |                            |   |                                                           |  |  |
|  |   |          .--------.        |   |   Final Score: 78.5%  [Below 80% Interview Threshold]    |  |  |
|  |   |        /   78.5%    \      |   |   Engine: semantic-v1 (Blended Model)                     |  |  |
|  |   |       |  COMPATIBLE  |     |   |                                                           |  |  |
|  |   |        \   SCORE    /      |   |   • Keyword Overlap: 75.0% (Weight: 40%)                  |  |  |
|  |   |          '--------'        |   |   • Semantic Similarity: 80.8% (Weight: 60%)              |  |  |
|  |   |                            |   |                                                           |  |  |
|  |   |    [Amber: Moderate Fit]   |   |   Estimated Boost: Adding 2 critical keywords elevates    |  |  |
|  |   |                            |   |   compatibility above the 80% benchmark target.           |  |  |
|  |   +----------------------------+   +-----------------------------------------------------------+  |  |
|  |                                                                                                   |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                                                                         |
|  DIAGNOSTICS & GAP ANALYSIS                                                                             |
|                                                                                                         |
|  +------------------------------------------+   +---------------------------------------------------+  |
|  | [✓] VERIFIED MATCHED SKILLS (4)          |   | [!] MISSING REQUIRED SKILLS (2)                   |  |
|  | Skills found in both your resume & job:  |   | Required by job but not detected in your resume:  |  |
|  |                                          |   |                                                   |  |
|  |   [✓ Python]       [✓ Django]            |   |   [! Kubernetes]    [! AWS Cloud]                 |  |
|  |   [✓ REST APIs]    [✓ PostgreSQL]        |   |                                                   |  |
|  |                                          |   |   Tip: Include genuine experience in your bullets |  |
|  +------------------------------------------+   +---------------------------------------------------+  |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  | [🔍] MISSING KEYWORD FREQUENCIES                                                                  |  |
|  | Keywords present in the job posting that ATS filters scan for:                                    |  |
|  |                                                                                                   |  |
|  |   [+ CI/CD Pipelines]    [+ Microservices]    [+ PyTest]    [+ Containerization]                  |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                                                                         |
|  [ℹ️ Methodology Note: ATS compatibility is calculated by comparing verified skills and semantic       |
|  embeddings against target requisitions. Scores update dynamically when a new resume version is added.]|
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. AI Suggestions Panel Wireframe

### Embedded inside ATS Page & Accessible via Modal / Slide-over

```
+---------------------------------------------------------------------------------------------------------+
| AI RESUME OPTIMIZATION SUGGESTIONS                         Source: [ ✨ AI-Generated (semantic-v1) ]    |
| Tailored recommendations to maximize ATS pass-through and interviewer interest.                         |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
| Category Filter: [ All Suggestions (3) ]  [ Skills (1) ]  [ Experience (1) ]  [ Formatting (1) ]        |
|                                                                                                         |
| +-----------------------------------------------------------------------------------------------------+ |
| | [🔴 HIGH PRIORITY]  Category: Skills Gap                                                            | |
| | Add Cloud Infrastructure Experience                                                                 | |
| |                                                                                                     | |
| | Your resume highlights backend architecture with Python and Django, but lacks cloud deployment      | |
| | credentials. 78% of matching backend positions require demonstrable experience with AWS or GCP.     | |
| |                                                                                                     | |
| | Recommended Additions: [AWS EC2] [AWS Lambda] [Docker Compose]                                      | |
| +-----------------------------------------------------------------------------------------------------+ |
|                                                                                                         |
| +-----------------------------------------------------------------------------------------------------+ |
| | [🟡 MEDIUM PRIORITY]  Category: Experience                                                          | |
| | Quantify Engineering Impact in Work Experience                                                      | |
| |                                                                                                     | |
| | Your experience bullet points emphasize responsibilities rather than measured outcomes. Consider   | |
| | revising bullet points to include performance metrics (e.g. "Optimized DB queries by 40%").          | |
| +-----------------------------------------------------------------------------------------------------+ |
|                                                                                                         |
| +-----------------------------------------------------------------------------------------------------+ |
| | [⚪ LOW PRIORITY]  Category: Formatting & Keywords                                                  | |
| | Standardize Core Competencies Header                                                                | |
| |                                                                                                     | |
| | Renaming "Technical Toolkit" to standard "Technical Skills" improves automated keyword parsing     | |
| | accuracy across enterprise ATS parsers.                                                             | |
| +-----------------------------------------------------------------------------------------------------+ |
|                                                                                                         |
| [ Rule-Based Fallback Mode Note: When LLM is in standby, suggestions are generated by deterministic  |
| gap analysis without any external API calls. ]                                                        |
+---------------------------------------------------------------------------------------------------------+
```

---

## 4. AI Match % on Existing JobCard Wireframe

### Integrated within `src/components/JobCard.jsx`
Maintains Tinder gesture physics, horizontal drag tilt, stamps, and undo.

```
+-----------------------------------------------------------------------------------+
|  [STARTUP]  [Remote]  [Mid-Level]                           ✨ 88% Match [Semantic] |
|                                                                                   |
|  Senior Python / Django Developer                                                 |
|  [🏢 TechCorp India]  •  Enterprise Software                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | ✨ AI Match Insights                                                        |  |
|  | ✓ Matches Python & PostgreSQL   ✓ Desired Salary Fit   ✓ Remote Preference  |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  Location: Hyderabad / Remote                     Salary: ₹24L - ₹32L LPA         |
|  Applicants: 18 (Low Competition)                 Freshness: Posted 2 hours ago   |
|                                                                                   |
|  About the role:                                                                  |
|  Join our fast-growing platform engineering group building scalable microservices |
|  and high-throughput data processing pipelines...                                 |
|                                                                                   |
|  Required Skills:                                                                 |
|  [Python] [Django] [PostgreSQL] [Docker] [REST APIs]                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | [  X  Skip  ]                    [ ⤺ Undo ]                     [ ✓ Apply ]  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### Visual Priority Rules on JobCard:
1. **Title & Company**: High visual contrast (`text-white`, `text-xl sm:text-2xl font-extrabold`).
2. **AI Match Badge**:
   - Compact pill: `px-2.5 py-0.5 rounded-full text-xs font-bold`.
   - Subtle glowing pulse animation (`animate-pulse`).
   - Sits on the upper-right corner so it never collides with company type chips.
3. **No Gesture Obstruction**:
   - Badge uses `pointer-events-none` to allow mouse and touch events to fall through to the drag-capture layer.
4. **Stamp Compatibility**:
   - The green "APPLY" stamp (top-left) and red "PASS" stamp (top-right) display cleanly above the card surface with `z-30` elevation and `backdrop-blur`.

---

## 5. Token & Style Reference Summary

| Token Name | Hex / Class | Usage |
|:---|:---|:---|
| `surface-base` | `#101116` | Application body background |
| `surface-card` | `#17181e` | Card container background |
| `surface-elevated` | `#242429` | Pill tags, input boxes, dropdown containers |
| `primary` | `#9d7bf6` | Violet accent, active buttons, key indicators |
| `primary-container` | `#312154` | Violet tinted chip containers |
| `emerald-match` | `#34d399` | Matched skills, score ≥ 80%, Apply stamp |
| `amber-warning` | `#fbbf24` | Missing skills, score 60–79%, Medium priority |
| `rose-gap` | `#f87171` | Critical gaps, score < 60%, Pass stamp |
| `content-text` | `#e3e3e7` | Headings, titles, primary labels |
| `content-muted` | `#9697a0` | Subtitles, body copy, descriptions |
