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

SAMPLE_JOBS = [
    {
        "id": "101",
        "title": "Full Stack Python Developer",
        "company": "Tech Corp",
        "location": "Hyderabad",
        "remote": True,
        "salary_min": 800000,
        "salary_max": 1400000,
        "skills": ["Python", "Django", "React"],
        "description": "Develop full-stack web applications using Django REST Framework and React."
    },
    {
        "id": "102",
        "title": "Backend Systems Engineer",
        "company": "SwipeX Labs",
        "location": "Bangalore",
        "remote": False,
        "salary_min": 1200000,
        "salary_max": 2000000,
        "skills": ["Python", "PostgreSQL", "Redis", "Docker"],
        "description": "Scale high-throughput API gateway and microservice architecture."
    },
    {
        "id": "103",
        "title": "Frontend Engineer (React)",
        "company": "Innovate Ltd",
        "location": "Hyderabad",
        "remote": True,
        "salary_min": 700000,
        "salary_max": 1200000,
        "skills": ["JavaScript", "TypeScript", "React", "CSS"],
        "description": "Build interactive swipe cards and career intelligence dashboards."
    }
]

SWIPES_STORE = []

class JobServiceHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # GET /api/v1/jobs
        if path in ["/api/v1/jobs", "/api/v1/jobs/"]:
            results = SAMPLE_JOBS
            # Filter by location
            if "location" in query:
                loc = query["location"][0].lower()
                results = [j for j in results if loc in j["location"].lower()]
            # Filter by remote
            if "remote" in query:
                is_remote = query["remote"][0].lower() == "true"
                results = [j for j in results if j["remote"] == is_remote]

            self._send_json({"jobs": results, "count": len(results)})
            return

        # GET /api/v1/jobs/{job_id}
        if path.startswith("/api/v1/jobs/"):
            job_id = path.split("/")[-1]
            for job in SAMPLE_JOBS:
                if job["id"] == job_id:
                    self._send_json(job)
                    return
            self._send_json({"error": f"Job {job_id} not found"}, status_code=404)
            return

        # GET /api/v1/swipes/history
        if path.startswith("/api/v1/swipes/history"):
            user_id = self.headers.get("X-User-Id", "anonymous")
            self._send_json({
                "user_id": user_id,
                "history": SWIPES_STORE,
                "count": len(SWIPES_STORE)
            })
            return

        self._send_json({"error": "Route not found in Job Service"}, status_code=404)

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
            user_id = self.headers.get("X-User-Id", "anonymous")
            user_role = self.headers.get("X-User-Role", "anonymous")
            swipe_record = {
                "user_id": user_id,
                "user_role": user_role,
                "job_id": payload.get("job_id", "101"),
                "direction": payload.get("direction", "right"),
                "status": "recorded"
            }
            SWIPES_STORE.append(swipe_record)
            self._send_json(swipe_record, status_code=201)
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
