# 🎯 SwipeX — Job & Data Intelligence Service (Milestone 1)

> **Domain:** Job & Data Intelligence (Intern 2)  
> **Platform:** SwipeX — Swipe-Based Intelligent Job Discovery Platform  
> **Status:** Milestone 1 Completed & Verified  

---

## 📌 1. Module Overview & Responsibilities
This service is the **core data backbone** of SwipeX, responsible for:
1. **Data Modeling & Schema:** Structured relational schemas for `Company` (MNCs, Scale-up Startups, Early-stage AI startups), `Job` (with rich attributes, skills, compensation, and competition metrics), and `Swipe` (user interaction history).
2. **Realistic Seed Dataset:** 60+ curated job postings across top employers with realistic CTCs in INR (₹6 LPA – ₹45 LPA) and USD ($75k – $160k), real tech stack requirements, and freshness timestamps.
3. **High-Performance REST APIs:**
   - Multi-criteria job discovery feed (`GET /api/v1/jobs`)
   - Detailed job view (`GET /api/v1/jobs/{job_id}`)
   - Swipe interaction recording (`POST /api/v1/swipes`)
   - User swipe history (`GET /api/v1/swipes/history`)
   - Dashboard summary metrics (`GET /api/v1/swipes/summary`)
4. **Fast Feed Caching Layer:** Redis cache with an automatic in-memory fallback for sub-millisecond job card retrieval.
5. **Quality Assurance:** 100% passing automated unit test suite using `pytest`.

---

## 🚀 2. Frozen Interface Contracts (SRS Section 7.2 Compliant)

### A. List Jobs (Discovery Feed)
- **Endpoint:** `GET /api/v1/jobs`
- **Query Filters:**
  - `type`: `MNC` | `Startup` | `Newly Founded` | `Full-time` | `Internship`
  - `location`: e.g. `Bengaluru`, `Hyderabad`, `Pune`, `Remote`
  - `remote`: `true` | `false`
  - `salary_min` & `salary_max`: Integer threshold (e.g. `1200000`)
  - `skills`: Comma-separated list (e.g. `Python,React,Docker`)
  - `experience_level`: `Fresher` | `Entry-level` | `Mid-level` | `Senior`
  - `competition_level`: `Low` | `Medium` | `High`
  - `search`: Keyword query across title, description, and company name
- **Contract Response (200 OK):**
```json
[
  {
    "job_id": 1,
    "title": "Backend Software Engineer (FastAPI & Microservices)",
    "company": "Razorpay",
    "company_id": 6,
    "company_type": "Startup",
    "type": "Full-time",
    "workplace_type": "Hybrid",
    "location": "Bengaluru, India",
    "salary_range": "₹14 LPA - ₹24 LPA",
    "salary_min": 1400000,
    "salary_max": 2400000,
    "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
    "experience_level": "Mid-level",
    "competition_level": "Medium",
    "applicant_count": 34,
    "is_fresher_friendly": false,
    "posted_at": "2026-08-28T14:30:00"
  }
]
```

---

### B. Get Job Detail
- **Endpoint:** `GET /api/v1/jobs/{job_id}`
- **Contract Response (200 OK):**
```json
{
  "id": 1,
  "job_id": 1,
  "title": "Backend Software Engineer (FastAPI & Microservices)",
  "company": {
    "id": 6,
    "name": "Razorpay",
    "slug": "razorpay",
    "company_type": "Startup",
    "industry": "Fintech & Payments",
    "headquarters": "Bengaluru, Karnataka, India",
    "logo_url": "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
    "website": "https://razorpay.com/jobs",
    "description": "Razorpay is India's leading full-stack financial solutions company...",
    "employee_count_range": "1000-5000"
  },
  "description": "We are looking for a skilled Backend Engineer...",
  "responsibilities": "• Design modular REST APIs...\n• Implement distributed caching...",
  "requirements": "• 2+ years experience building Python web services...",
  "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
  "salary_range": "₹14 LPA - ₹24 LPA",
  "is_fresher_friendly": false,
  "competition_level": "Medium",
  "applicant_count": 34,
  "posted_at": "2026-08-28T14:30:00"
}
```

---

### C. Record Swipe Action
- **Endpoint:** `POST /api/v1/swipes`
- **Request Body:**
```json
{
  "job_id": 1,
  "direction": "right",
  "action_type": "apply",
  "user_id": "demo-user-1"
}
```
- **Contract Response (201 Created):**
```json
{
  "swipe_id": 1,
  "user_id": "demo-user-1",
  "job_id": 1,
  "direction": "right",
  "action_type": "apply",
  "swiped_at": "2026-08-31T21:30:00",
  "message": "Swipe recorded successfully"
}
```

---

### D. User Swipe History
- **Endpoint:** `GET /api/v1/swipes/history?user_id=demo-user-1&direction=right`
- **Contract Response (200 OK):**
```json
[
  {
    "job_id": 1,
    "direction": "right",
    "action_type": "apply",
    "swiped_at": "2026-08-31T21:30:00",
    "job": {
      "job_id": 1,
      "title": "Backend Software Engineer",
      "company": "Razorpay",
      "salary_range": "₹14 LPA - ₹24 LPA",
      "skills": ["Python", "FastAPI", "PostgreSQL"]
    }
  }
]
```

---

## 🛠️ 3. Quick Start & Execution

### Prerequisites
- Python 3.10+ installed
- *(Optional)* Docker / Redis

### Step 1: Install Dependencies
```bash
cd swipex_job_data_service
pip install -r requirements.txt
```

### Step 2: Run the Service
```bash
uvicorn app.main:app --reload --port 8000
```
> The application will automatically create `swipex_dev.db` and seed 60+ realistic jobs and companies on its first startup!

### Step 3: Access Interactive Swagger UI
Open your browser and navigate to:  
👉 **`http://localhost:8000/docs`**

---

## 🧪 4. Running Automated Tests
Run the complete Pytest test suite:
```bash
pytest -v
```

---

## 🤝 5. Milestone 2 Handoff Notes (For Intern 3 & Intern 1)

### For Intern 1 (Team Lead / API Gateway):
- Route `/api/v1/jobs` and `/api/v1/swipes` to this service running on port 8000.
- Pass the user identifier in the `X-User-Id` header or `Authorization: Bearer <jwt_token>` header.

### For Intern 3 (AI/ML Career Intelligence):
- **Seed Data Access:** Use `app.models.job.Job` table (`skills`, `description`, `title`, `experience_years_min`) as feature vectors for TF-IDF / sentence embeddings.
- **Swipe Behavior Signal:** Query `Swipe` records where `direction == 'right'` as positive interaction feedback signals to train collaborative filtering or preference weighting algorithms in Milestone 2.
