"""Run a real-data smoke test against the Job & Swipe Service database."""
import os
import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app


def main() -> None:
    with TestClient(app) as client:
        assert client.get("/health").json()["status"] == "ok"
        jobs = client.get("/api/v1/jobs", params={"location": "Kolkata"})
        assert jobs.status_code == 200 and jobs.json(), "Expected at least one Kolkata job"
        job = jobs.json()[0]
        assert client.get(f"/api/v1/jobs/{job['job_id']}").status_code == 200

        headers = {"X-User-Id": "999001"}
        swipe = client.post("/api/v1/swipes", json={"job_id": job["job_id"], "direction": "right"}, headers=headers)
        assert swipe.status_code == 201
        history = client.get("/api/v1/swipes/history", headers=headers)
        assert history.status_code == 200 and history.json()[0]["job_id"] == job["job_id"]
    print("Real-data smoke test passed.")


if __name__ == "__main__":
    if not os.getenv("DATABASE_URL"):
        print("Using the default local SQLite database.")
    main()
