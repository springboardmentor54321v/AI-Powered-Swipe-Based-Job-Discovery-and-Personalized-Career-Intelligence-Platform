# 🎯 SwipeX — Job & Data Intelligence Service (Milestone 1 & 2)

> **Domain:** Job & Data Intelligence (Author: Shubham Ugale)  
> **Platform:** SwipeX — Swipe-Based Intelligent Job Discovery Platform  
> **Status:** Milestone 2 Completed, Fully Tested & Production-Ready  

---

## 📌 1. Module Overview & Responsibilities
This microservice serves as the **core data backbone** for the SwipeX platform:
1. **Relational Schemas:** Production schemas for `companies`, `jobs`, `swipes`, and `saved_jobs` with composite indexes.
2. **Comprehensive Seed Dataset:** **317 curated job postings** across **29 employers** (MNCs, Startups, and Newly Founded AI startups).
3. **Freshness & Competition Intelligence:** Rule-based computation (`app/core/intelligence.py`) for live applicant competition tags and posting freshness badges.
4. **Faceted Search & Discovery APIs:** Dedicated smart search API (`/jobs/search`), company profiles (`/companies`), and candidate bookmarks (`/saved-jobs`).
5. **Fast Caching Layer:** Redis cache with automatic in-memory fallback.
6. **Data Protection:** Automated database snapshot backup and restore utility (`db_backup_restore.py`).
7. **100% Test Coverage:** 30 passing automated unit tests in `pytest`.

---

## 🚀 2. REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/jobs` | Browse paginated job feed with multi-criteria filters |
| `GET` | `/api/v1/jobs/search` | **Smart Search:** Full-text keyword search across skills, titles, and descriptions |
| `GET` | `/api/v1/jobs/{job_id}` | Detailed job view with company info, freshness, and competition score |
| `POST` | `/api/v1/swipes` | Record swipe action (Right = Apply/Save, Left = Skip) |
| `GET` | `/api/v1/swipes/history` | User swipe history |
| `GET` | `/api/v1/swipes/summary` | User swipe metrics summary |
| `GET` | `/api/v1/companies` | List companies & startups (filter by `type`, `industry`, `newly_founded`) |
| `GET` | `/api/v1/companies/{id}` | Detailed company profile with all active jobs posted by the employer |
| `POST` | `/api/v1/saved-jobs` | Bookmark / Save a job with candidate notes |
| `GET` | `/api/v1/saved-jobs` | Retrieve user bookmarked jobs with card summaries |
| `DELETE` | `/api/v1/saved-jobs/{job_id}` | Remove job from bookmarked list |

---

## 🛠️ 3. Quick Start & Local Execution

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Service
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: **`http://localhost:8000/docs`**
- Alternative ReDoc: **`http://localhost:8000/redoc`**

### Run Automated Tests
```bash
python -m pytest -v
```
*(All 30 test cases pass with 100% success rate)*

### Database Backup & Restore Utility
```bash
# Create JSON snapshot backup
python -m app.scripts.db_backup_restore --backup

# Restore from snapshot
python -m app.scripts.db_backup_restore --restore backups/<backup_file>.json
```

---

## 🤝 4. Milestone 3 Handoff Notes (For Intern 4: AI Career Intelligence)
See full details in [`DATA_DICTIONARY.md`](./DATA_DICTIONARY.md).
- **Text Vectors:** Combine `Job.title` + `Job.skills` + `Job.description` for TF-IDF and transformer embeddings.
- **Preference Feedback:** Positive interactions (`Swipe.direction == 'right'`) and bookmarks (`saved_jobs`) provide implicit preference signals to train personalization algorithms in Milestone 3.
