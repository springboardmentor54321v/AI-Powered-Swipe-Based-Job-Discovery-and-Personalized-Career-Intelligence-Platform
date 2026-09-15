"""
Mock Job/Swipe Microservice Runner (Intern 2 Service Simulation for Port 8001)

This standalone service runs on port 8001 to simulate Intern 2's Job & Swipe service.
It enables full end-to-end testing through the Django API Gateway (Port 8000).

Run with:
    python services/job_service_runner.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

PORT = 8001

COMPANIES = [
    {
        "id": 1,
        "name": "Tata Consultancy Services",
        "company_type": "MNC",
        "industry": "IT Services",
        "headquarters": "Mumbai",
        "founded_year": 1968,
        "website": "https://www.tcs.com",
        "active_jobs_count": 2,
    },
    {
        "id": 2,
        "name": "Razorpay",
        "company_type": "Startup",
        "industry": "FinTech",
        "headquarters": "Bengaluru",
        "founded_year": 2014,
        "website": "https://razorpay.com",
        "active_jobs_count": 2,
    },
    {
        "id": 3,
        "name": "Zepto",
        "company_type": "New Startup",
        "industry": "Quick Commerce",
        "headquarters": "Mumbai",
        "founded_year": 2021,
        "website": "https://zeptonow.com",
        "active_jobs_count": 1,
    },
    {
        "id": 4,
        "name": "Microsoft",
        "company_type": "MNC",
        "industry": "Technology",
        "headquarters": "Hyderabad",
        "founded_year": 1975,
        "website": "https://microsoft.com",
        "active_jobs_count": 1,
    },
    {
        "id": 5,
        "name": "Postman",
        "company_type": "Startup",
        "industry": "Developer Tools",
        "headquarters": "Bengaluru",
        "founded_year": 2014,
        "website": "https://postman.com",
        "active_jobs_count": 1,
    },
    {
        "id": 6,
        "name": "Sarvam AI",
        "company_type": "New Startup",
        "industry": "Artificial Intelligence",
        "headquarters": "Bengaluru",
        "founded_year": 2023,
        "website": "https://sarvam.ai",
        "active_jobs_count": 1,
    },
]

SAMPLE_JOBS = [
    {
        "id": 1,
        "job_id": 1,
        "title": "Software Engineer",
        "company": "Microsoft",
        "company_id": 4,
        "company_type": "MNC",
        "location": "Hyderabad",
        "remote": True,
        "is_remote": True,
        "salary_range": {"min": 1200000, "max": 2000000},
        "salary_min": 1200000,
        "salary_max": 2000000,
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "skills": ["c#", "azure", "react", "sql", "docker"],
        "description": "Create cloud-native services used by customers worldwide.",
        "industry": "Technology",
        "applicant_count": 102,
        "competition_level": "HIGH",
        "freshness": "JUST_POSTED",
        "posted_at": "2026-09-14T10:00:00Z",
        "posted_time": "2026-09-14T10:00:00Z",
    },
    {
        "id": 2,
        "job_id": 2,
        "title": "Frontend Developer",
        "company": "Postman",
        "company_id": 5,
        "company_type": "Startup",
        "location": "Bengaluru",
        "remote": True,
        "is_remote": True,
        "salary_range": {"min": 800000, "max": 1300000},
        "salary_min": 800000,
        "salary_max": 1300000,
        "job_type": "Full-time",
        "experience_level": "Fresher",
        "skills": ["javascript", "typescript", "react", "css", "rest api"],
        "description": "Build beautiful developer experiences for API teams.",
        "industry": "Developer Tools",
        "applicant_count": 29,
        "competition_level": "MEDIUM",
        "freshness": "RECENT",
        "posted_at": "2026-09-13T10:00:00Z",
        "posted_time": "2026-09-13T10:00:00Z",
    },
    {
        "id": 3,
        "job_id": 3,
        "title": "AI Research Intern",
        "company": "Sarvam AI",
        "company_id": 6,
        "company_type": "New Startup",
        "location": "Bengaluru",
        "remote": True,
        "is_remote": True,
        "salary_range": {"min": 300000, "max": 480000},
        "salary_min": 300000,
        "salary_max": 480000,
        "job_type": "Internship",
        "experience_level": "Fresher",
        "skills": ["python", "nlp", "pytorch", "transformers", "pandas"],
        "description": "Evaluate Indian-language language models and data pipelines.",
        "industry": "Artificial Intelligence",
        "applicant_count": 18,
        "competition_level": "LOW",
        "freshness": "JUST_POSTED",
        "posted_at": "2026-09-14T11:00:00Z",
        "posted_time": "2026-09-14T11:00:00Z",
    },
    {
        "id": 4,
        "job_id": 4,
        "title": "DevOps Engineer",
        "company": "Razorpay",
        "company_id": 2,
        "company_type": "Startup",
        "location": "Pune",
        "remote": True,
        "is_remote": True,
        "salary_range": {"min": 850000, "max": 1400000},
        "salary_min": 850000,
        "salary_max": 1400000,
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "skills": ["docker", "kubernetes", "aws", "linux", "github actions"],
        "description": "Maintain CI/CD systems and container infrastructure.",
        "industry": "FinTech",
        "applicant_count": 40,
        "competition_level": "MEDIUM",
        "freshness": "THIS_WEEK",
        "posted_at": "2026-09-11T10:00:00Z",
        "posted_time": "2026-09-11T10:00:00Z",
    },
    {
        "id": 101,
        "job_id": 101,
        "title": "Full Stack Python Developer",
        "company": "Tata Consultancy Services",
        "company_id": 1,
        "company_type": "MNC",
        "location": "Hyderabad",
        "remote": True,
        "is_remote": True,
        "salary_range": {"min": 800000, "max": 1400000},
        "salary_min": 800000,
        "salary_max": 1400000,
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "skills": ["python", "django", "react"],
        "description": "Develop full-stack web applications using Django REST Framework and React.",
        "industry": "IT Services",
        "applicant_count": 14,
        "competition_level": "LOW",
        "freshness": "JUST_POSTED",
        "posted_at": "2026-09-14T09:30:00Z",
        "posted_time": "2026-09-14T09:30:00Z",
    },
    {
        "id": 102,
        "job_id": 102,
        "title": "Backend Systems Engineer",
        "company": "Razorpay",
        "company_id": 2,
        "company_type": "Startup",
        "location": "Bengaluru",
        "remote": False,
        "is_remote": False,
        "salary_range": {"min": 1200000, "max": 2000000},
        "salary_min": 1200000,
        "salary_max": 2000000,
        "job_type": "Full-time",
        "experience_level": "Senior",
        "skills": ["python", "postgresql", "redis", "docker"],
        "description": "Scale high-throughput API gateway and microservice architecture.",
        "industry": "FinTech",
        "applicant_count": 65,
        "competition_level": "MEDIUM",
        "freshness": "RECENT",
        "posted_at": "2026-09-12T14:00:00Z",
        "posted_time": "2026-09-12T14:00:00Z",
    },
    {
        "id": 103,
        "job_id": 103,
        "title": "Junior Python Developer",
        "company": "Zepto",
        "company_id": 3,
        "company_type": "New Startup",
        "location": "Mumbai",
        "remote": False,
        "is_remote": False,
        "salary_range": {"min": 450000, "max": 700000},
        "salary_min": 450000,
        "salary_max": 700000,
        "job_type": "Full-time",
        "experience_level": "Fresher",
        "skills": ["python", "fastapi", "sql", "git", "rest api"],
        "description": "Build reliable APIs and automation workflows for quick commerce operations.",
        "industry": "Quick Commerce",
        "applicant_count": 48,
        "competition_level": "MEDIUM",
        "freshness": "OLDER",
        "posted_at": "2026-09-08T10:00:00Z",
        "posted_time": "2026-09-08T10:00:00Z",
    }
]

SWIPES_STORE = []


class JobServiceHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # GET /api/v1/jobs/search
        if path in ["/api/v1/jobs/search", "/api/v1/jobs/search/"]:
            results = list(SAMPLE_JOBS)

            # Keyword filter (in title or description)
            if "keyword" in query:
                kw = query["keyword"][0].lower()
                results = [
                    j for j in results
                    if kw in j["title"].lower() or kw in j.get("description", "").lower()
                ]

            # Location filter
            if "location" in query:
                loc = query["location"][0].lower()
                results = [j for j in results if loc in j["location"].lower()]

            # Job type filter (job_type or type)
            job_type_query = query.get("job_type", query.get("type", None))
            if job_type_query:
                jt = job_type_query[0].lower()
                results = [j for j in results if jt in j.get("job_type", "").lower()]

            # Remote filter (is_remote or remote)
            remote_query = query.get("is_remote", query.get("remote", None))
            if remote_query:
                is_rem = remote_query[0].lower() in ["true", "1"]
                results = [j for j in results if j.get("is_remote", j.get("remote", False)) == is_rem]

            # Salary min filter (annual salary)
            if "salary_min" in query:
                try:
                    s_min = int(query["salary_min"][0])
                    results = [j for j in results if j.get("salary_max", j.get("salary_min", 0)) >= s_min]
                except ValueError:
                    self._send_json({"error": "Bad Request", "detail": "salary_min must be an integer", "status_code": 400}, status_code=400)
                    return

            # Salary max filter
            if "salary_max" in query:
                try:
                    s_max = int(query["salary_max"][0])
                    results = [j for j in results if j.get("salary_min", 0) <= s_max]
                except ValueError:
                    self._send_json({"error": "Bad Request", "detail": "salary_max must be an integer", "status_code": 400}, status_code=400)
                    return

            # Experience level filter
            if "experience_level" in query:
                exp = query["experience_level"][0].lower()
                results = [j for j in results if exp in j.get("experience_level", "").lower()]

            # Skills filter (comma-separated or pipe-separated)
            if "skills" in query:
                req_skills = [s.strip().lower() for s in query["skills"][0].replace("|", ",").split(",") if s.strip()]
                filtered_by_skills = []
                for j in results:
                    job_skills = [s.lower() for s in j.get("skills", [])]
                    # match if any or all requested skill tokens match
                    if any(req in job_skills or any(req in js for js in job_skills) for req in req_skills):
                        filtered_by_skills.append(j)
                results = filtered_by_skills

            # Pagination
            try:
                page = int(query.get("page", ["1"])[0])
                page_size = min(int(query.get("page_size", ["20"])[0]), 100)
            except ValueError:
                self._send_json({"error": "Bad Request", "detail": "Invalid page or page_size", "status_code": 400}, status_code=400)
                return

            total_count = len(results)
            total_pages = max(1, (total_count + page_size - 1) // page_size) if total_count > 0 else 1
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            paged_jobs = results[start_idx:end_idx]

            self._send_json({
                "count": total_count,
                "pagination": {
                    "total_count": total_count,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1,
                },
                "results": paged_jobs,
            })
            return

        # GET /api/v1/jobs
        if path in ["/api/v1/jobs", "/api/v1/jobs/"]:
            results = list(SAMPLE_JOBS)

            # Filter by location substring
            if "location" in query:
                loc = query["location"][0].lower()
                results = [j for j in results if loc in j["location"].lower()]

            # Filter by remote
            if "remote" in query:
                is_remote = query["remote"][0].lower() == "true"
                results = [j for j in results if j.get("remote", j.get("is_remote", False)) == is_remote]

            self._send_json({"jobs": results, "count": len(results)})
            return

        # GET /api/v1/jobs/{job_id}
        if path.startswith("/api/v1/jobs/"):
            job_id = path.rstrip("/").split("/")[-1]
            for job in SAMPLE_JOBS:
                if str(job["id"]) == str(job_id) or str(job.get("job_id")) == str(job_id):
                    self._send_json(job)
                    return
            self._send_json({"detail": "Job not found"}, status_code=404)
            return

        # GET /api/v1/companies
        if path in ["/api/v1/companies", "/api/v1/companies/"]:
            results = list(COMPANIES)

            # Industry filter
            if "industry" in query:
                ind = query["industry"][0].lower()
                results = [c for c in results if ind in c.get("industry", "").lower()]

            # Company type filter
            if "company_type" in query:
                ct = query["company_type"][0].lower()
                results = [c for c in results if ct in c.get("company_type", "").lower()]

            # Search keyword (company name)
            if "search" in query:
                q = query["search"][0].lower()
                results = [c for c in results if q in c.get("name", "").lower()]

            # Pagination
            try:
                page = int(query.get("page", ["1"])[0])
                page_size = min(int(query.get("page_size", ["20"])[0]), 100)
            except ValueError:
                self._send_json({"error": "Bad Request", "detail": "Invalid page or page_size", "status_code": 400}, status_code=400)
                return

            total_count = len(results)
            total_pages = max(1, (total_count + page_size - 1) // page_size) if total_count > 0 else 1
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            paged_companies = results[start_idx:end_idx]

            self._send_json({
                "count": total_count,
                "pagination": {
                    "total_count": total_count,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1,
                },
                "results": paged_companies,
            })
            return

        # GET /api/v1/companies/{company_id}
        if path.startswith("/api/v1/companies/"):
            company_id = path.rstrip("/").split("/")[-1]
            for comp in COMPANIES:
                if str(comp["id"]) == str(company_id):
                    self._send_json(comp)
                    return
            self._send_json({"detail": f"Company {company_id} not found"}, status_code=404)
            return

        # GET /api/v1/swipes/history
        if path.startswith("/api/v1/swipes/history"):
            user_id = str(self.headers.get("X-User-Id", "anonymous"))
            user_swipes = [
                {
                    "job_id": s["job_id"],
                    "direction": s["direction"],
                    "swiped_at": s.get("swiped_at", "2026-09-15T09:00:00Z"),
                    "job_title": s.get("job_title", ""),
                    "company": s.get("company", ""),
                }
                for s in SWIPES_STORE
                if str(s.get("user_id")) == user_id
            ]
            self._send_json({
                "user_id": user_id,
                "history": user_swipes,
                "count": len(user_swipes)
            })
            return

        self._send_json({"detail": "Route not found in Job Service"}, status_code=404)


    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        # POST /api/v1/swipes
        if path in ["/api/v1/swipes", "/api/v1/swipes/"]:
            target_job_id = payload.get("job_id")
            if target_job_id is None:
                self._send_json({"detail": "job_id is required"}, status_code=400)
                return

            # Check if job exists in database
            job = next((j for j in SAMPLE_JOBS if str(j["id"]) == str(target_job_id) or str(j.get("job_id")) == str(target_job_id)), None)
            if not job:
                self._send_json({"detail": "Job not found"}, status_code=404)
                return

            user_id = str(self.headers.get("X-User-Id", "anonymous"))
            user_role = self.headers.get("X-User-Role", "anonymous")

            # Check if user already swiped on this job (upsert behavior)
            existing_swipe = next((s for s in SWIPES_STORE if str(s.get("user_id")) == user_id and str(s.get("job_id")) == str(job["id"])), None)
            if existing_swipe:
                existing_swipe["direction"] = payload.get("direction", "right")
                self._send_json({
                    "swipe_id": existing_swipe["swipe_id"],
                    "job_id": job["id"],
                    "direction": existing_swipe["direction"],
                    "status": "recorded"
                }, status_code=201)
                return

            swipe_id = len(SWIPES_STORE) + 1
            swipe_record = {
                "swipe_id": swipe_id,
                "user_id": user_id,
                "user_role": user_role,
                "job_id": job["id"],
                "direction": payload.get("direction", "right"),
                "status": "recorded",
                "job_title": job.get("title", ""),
                "company": job.get("company", ""),
                "swiped_at": "2026-09-15T09:00:00Z"
            }
            SWIPES_STORE.append(swipe_record)
            self._send_json({
                "swipe_id": swipe_id,
                "job_id": job["id"],
                "direction": swipe_record["direction"],
                "status": "recorded"
            }, status_code=201)
            return


        # POST /api/v1/jobs (Recruiter job creation)
        if path in ["/api/v1/jobs", "/api/v1/jobs/"]:
            title = payload.get("title")
            if not title:
                self._send_json({"detail": "title is required"}, status_code=400)
                return

            new_id = max((j["id"] for j in SAMPLE_JOBS), default=100) + 1
            s_min = payload.get("salary_min", payload.get("salary_range", {}).get("min", 500000))
            s_max = payload.get("salary_max", payload.get("salary_range", {}).get("max", 1000000))
            is_rem = payload.get("is_remote", payload.get("remote", False))
            user_id = self.headers.get("X-User-Id", "anonymous")

            created_job = {
                "id": new_id,
                "job_id": new_id,
                "title": title,
                "company": payload.get("company", "Independent Recruiter"),
                "company_id": payload.get("company_id", 1),
                "company_type": payload.get("company_type", "Startup"),
                "location": payload.get("location", "Remote"),
                "remote": is_rem,
                "is_remote": is_rem,
                "salary_range": {"min": s_min, "max": s_max},
                "salary_min": s_min,
                "salary_max": s_max,
                "job_type": payload.get("job_type", "Full-time"),
                "experience_level": payload.get("experience_level", "Mid-Level"),
                "skills": payload.get("skills", ["python"]),
                "description": payload.get("description", "Exciting career opportunity."),
                "industry": payload.get("industry", "Technology"),
                "applicant_count": 0,
                "competition_level": "LOW",
                "freshness": "JUST_POSTED",
                "posted_at": "2026-09-15T09:00:00Z",
                "posted_time": "2026-09-15T09:00:00Z",
                "created_by": user_id,
            }
            SAMPLE_JOBS.append(created_job)
            self._send_json(created_job, status_code=201)
            return

        self._send_json({"error": "Route not found in Job Service"}, status_code=404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        # PUT /api/v1/jobs/{job_id}
        if path.startswith("/api/v1/jobs/"):
            job_id_str = path.rstrip("/").split("/")[-1]
            job = next((j for j in SAMPLE_JOBS if str(j["id"]) == job_id_str or str(j.get("job_id")) == job_id_str), None)
            if not job:
                self._send_json({"detail": "Job not found"}, status_code=404)
                return

            if "title" in payload:
                job["title"] = payload["title"]
            if "company" in payload:
                job["company"] = payload["company"]
            if "location" in payload:
                job["location"] = payload["location"]
            if "is_remote" in payload or "remote" in payload:
                is_rem = payload.get("is_remote", payload.get("remote"))
                job["is_remote"] = is_rem
                job["remote"] = is_rem
            if "salary_min" in payload:
                job["salary_min"] = payload["salary_min"]
                job.setdefault("salary_range", {})["min"] = payload["salary_min"]
            if "salary_max" in payload:
                job["salary_max"] = payload["salary_max"]
                job.setdefault("salary_range", {})["max"] = payload["salary_max"]
            if "skills" in payload:
                job["skills"] = payload["skills"]
            if "description" in payload:
                job["description"] = payload["description"]
            if "job_type" in payload:
                job["job_type"] = payload["job_type"]
            if "experience_level" in payload:
                job["experience_level"] = payload["experience_level"]

            self._send_json(job, status_code=200)
            return

        self._send_json({"error": "Route not found in Job Service"}, status_code=404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # DELETE /api/v1/jobs/{job_id}
        if path.startswith("/api/v1/jobs/"):
            job_id_str = path.rstrip("/").split("/")[-1]
            job = next((j for j in SAMPLE_JOBS if str(j["id"]) == job_id_str or str(j.get("job_id")) == job_id_str), None)
            if not job:
                self._send_json({"detail": "Job not found"}, status_code=404)
                return

            SAMPLE_JOBS.remove(job)
            self._send_json({"status": "deleted", "job_id": int(job_id_str) if job_id_str.isdigit() else job_id_str, "detail": "Job successfully deleted"}, status_code=200)
            return

        self._send_json({"error": "Route not found in Job Service"}, status_code=404)



if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", PORT), JobServiceHandler)
    print(f"============================================================")
    print(f"  Intern 2 Mock Job & Swipe Service Running on Port {PORT}")
    print(f"  Listening at: http://127.0.0.1:{PORT}/api/v1/jobs")
    print(f"============================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Job Service.")
        server.server_close()
