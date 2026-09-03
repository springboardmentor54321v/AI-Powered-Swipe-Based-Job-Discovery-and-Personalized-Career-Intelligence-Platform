# SwipeX — Milestone 1 Frontend Integration & UX Documentation

> **Role**: Intern 4 — Frontend & User Experience  
> **Domain**: `Team-3/Domain-4/`  
> **Milestone**: 1 (Days 1 to 7)

---

## 1. Executive Summary

Domain-4 delivers a production-grade, highly responsive, Pixel / Material-inspired frontend for the SwipeX platform. The application implements complete user flows including authentication, swipe-based job discovery, live filter querying, dynamic career dashboards, resume parsing upload, heuristic ATS compatibility scoring, and smart job recommendations.

The frontend is architected to seamlessly interface with the real backend microservices (Auth, Job/Swipe, Resume/ATS) while maintaining robust local development fallbacks.

---

## 2. Frontend Architecture & Directory Structure

```text
Team-3/Domain-4/
├── docs/
│   ├── FRONTEND_DATA_PLAN.md               # API contracts & schema mapping
│   └── MILESTONE_1_FRONTEND_NOTES.md       # Milestone 1 completion documentation
├── public/
│   └── favicon.svg                         # Platform branding icon
├── src/
│   ├── assets/                             # Static visual assets
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx                  # Reusable button with loading & variants
│   │   │   ├── Chip.jsx                    # Filter and metadata chip component
│   │   │   ├── Input.jsx                   # Form input with validation states
│   │   │   └── Modal.jsx                   # Accessible dialog overlay
│   │   ├── FilterBar.jsx                   # Job discovery multi-parameter filter
│   │   ├── JobCard.jsx                     # Touch/pointer swipe card with formatting
│   │   └── Navbar.jsx                      # Navigation header with responsive drawer
│   ├── data/
│   │   └── mockJobs.js                     # Local fallback fixtures
│   ├── layouts/
│   │   └── AppLayout.jsx                   # Root application shell and navigation
│   ├── pages/
│   │   ├── DashboardPage.jsx               # Saved/applied jobs, ATS score & recs
│   │   ├── LoginPage.jsx                   # Email/Password & Google OAuth sign in
│   │   ├── ProfilePage.jsx                 # User identity, role & active resume
│   │   ├── RegisterPage.jsx                # Role-based user onboarding
│   │   ├── ResumeUploadPage.jsx            # Resume upload & parsed skills viewer
│   │   └── SwipeDiscoveryPage.jsx          # Live swipe deck & filter engine
│   ├── services/
│   │   ├── api.js                          # Base client with JWT & 401 refresh
│   │   ├── auth.js                         # Central authentication service
│   │   ├── jobs.js                         # Job & swipe service gateway
│   │   ├── mockAuthService.js              # Dev auth mock adapter
│   │   ├── mockJobService.js               # Dev job & swipe mock adapter
│   │   ├── realAuthService.js              # Live Auth API adapter
│   │   ├── realJobService.js               # Live Job & Swipe API adapter
│   │   ├── recommendations.js              # Career recommendations client
│   │   └── resume.js                       # Resume upload & ATS scoring client
│   ├── App.jsx                             # Client-side router configuration
│   ├── index.css                           # Tailwind CSS & design tokens
│   └── main.jsx                            # React 18 application root
├── .env.example                            # Configurable environment template
├── index.html                              # HTML5 entrypoint
├── package.json                            # Scripts & dependencies
├── tailwind.config.js                      # Custom Pixel/Material theme configuration
└── vite.config.js                          # Vite build toolchain
```

---

## 3. Application Routes

| Route | Page Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage` | Platform overview, interactive swipe demo sandbox, 3-step workflow, multi-role showcase, and architecture preview. |
| `/login` | `LoginPage` | User sign in with form validation and Google OAuth integration point. |
| `/register` | `RegisterPage` | Role selection (`Job Seeker`, `Recruiter`, `Admin`) and user registration. |
| `/discover` | `SwipeDiscoveryPage` | Interactive job cards with swipe-left (skip) and swipe-right (save/apply). |
| `/dashboard` | `DashboardPage` | Saved/applied swipe tracking, live ATS compatibility score, and job recommendations. |
| `/resume` | `ResumeUploadPage` | Drag-and-drop resume upload (PDF/DOCX), validation, and parsed skill keywords. |
| `/profile` | `ProfilePage` | Active session details, role permissions, active resume metadata, and sign out. |

---

## 4. API Integration Contracts (SRS Frozen Interface)

### 4.1 Authentication Service (Intern 1)
- `POST /api/v1/auth/register` — `{ name, email, password, role }` ➔ `201 { user_id }`
- `POST /api/v1/auth/login` — `{ email, password }` ➔ `200 { access_token, refresh_token, role }`
- `GET /api/v1/auth/oauth/google` — OAuth2 login flow.
- `POST /api/v1/auth/refresh` — `{ refresh_token }` ➔ `200 { access_token }`
- `GET /api/v1/auth/me` — Bearer token authentication ➔ `200 { user_id, name, role }`

### 4.2 Job & Swipe Service (Intern 2)
- `GET /api/v1/jobs?type=&location=&remote=&salary_min=&salary_max=&skills=` ➔ `200 [ { job_id, title, company, type, location, salary_range: { min, max }, skills: [], posted_at } ]`
- `GET /api/v1/jobs/{job_id}` ➔ `200 job detail`
- `POST /api/v1/swipes` — `{ job_id, direction }` with `X-User-Id` header ➔ `201 { swipe_id }`
- `GET /api/v1/swipes/history` with `X-User-Id` header ➔ `200 [ { job_id, direction, swiped_at, job_title, company } ]`

### 4.3 Resume & Career Intelligence Service (Intern 3 Stub)
- `POST /api/v1/resume/upload` (multipart/form-data) ➔ `201 { resume_id, parsed_skills: [] }`
- `GET /api/v1/resume/{resume_id}/ats-score?job_id={id}` ➔ `200 { match_score, missing_keywords: [], generated_by: "heuristic-v0" }`
- `GET /api/v1/recommendations?user_id={id}&resume_id={id}` ➔ `200 [ { job_id, title, match_percentage, generated_by: "heuristic-v0" } ]`

---

## 5. Milestone 1 Demo Rehearsal Walkthrough Flow

Follow this sequence for the official team & mentor demo:

1. **Start Screen**: Open `http://localhost:5173/`. The app redirects to `/discover`.
2. **Onboarding**: Navigate to `/register`. Select **Job Seeker**, enter credentials (`Jane Doe`, `jane@example.com`, `pass123`), and submit.
3. **Authentication**: Form redirects to `/login`. Sign in to establish active JWT session.
4. **Job Discovery**:
   - Browse live stacked job cards with company, location, formatted salary, remote badge, and required skills.
   - Use the `FilterBar` to filter by keywords, company type (MNC/Startup), or workplace mode.
   - Swipe left on a card (visual red `Skip` badge).
   - Swipe right on another card (visual green `Apply / Save` badge).
5. **Career Dashboard**:
   - Navigate to `/dashboard`.
   - View the **Saved jobs** and **Applied jobs** tabs showing the recorded swipes.
6. **Resume Parsing & ATS Scoring**:
   - Navigate to `/resume`.
   - Drag and drop or browse to select a sample resume (`Resume_Sample.pdf`).
   - Click **Upload resume**. Observe upload spinner transition to success with extracted skill chips.
7. **Score Inspection**:
   - Return to `/dashboard`.
   - Observe the **ATS compatibility** card showing numeric score (e.g. `82.5%`), missing skill keywords, and `heuristic-v0` badge.
   - View the **Recommended jobs** card showing ranked match percentages.
8. **Profile**:
   - Click user avatar in navbar or visit `/profile` to view session identity and active document status.

---

## 6. How to Run Locally

```powershell
# Navigate to Domain-4 directory
cd Team-3\Domain-4

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev

# Run production build
npm run build
```

---

## 7. Known Integration Blockers (Owned by Other Domains)

1. **Domain-3 Query Contract**:
   - `Domain-3/resume_service.py` expects parameter `resume_id` on `/api/v1/recommendations`, while the SRS contract specifies `user_id`.
   - **Resolution in Domain-4**: Frontend passes both parameters so it operates seamlessly regardless of which contract the backend enforces.
