import os
import tempfile

db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
db_file.close()
os.environ["DATABASE_URL"] = f"sqlite:///{db_file.name}"

from fastapi.testclient import TestClient
from app.main import app


def test_seeded_job_listing_and_filters():
    with TestClient(app) as client:
        response = client.get("/api/v1/jobs", params={"remote": "false", "skills": "python"})
        assert response.status_code == 200
        jobs = response.json()
        assert jobs
        assert all(not job["remote"] for job in jobs)
        assert all({"job_id", "skills", "salary_range"} <= job.keys() for job in jobs)


def test_job_detail_and_not_found():
    with TestClient(app) as client:
        assert client.get("/api/v1/jobs/1").status_code == 200
        assert client.get("/api/v1/jobs/99999").status_code == 404


def test_swipe_create_update_and_history_are_user_scoped():
    with TestClient(app) as client:
        headers = {"X-User-Id": "42"}
        created = client.post("/api/v1/swipes", json={"job_id": 1, "direction": "right"}, headers=headers)
        assert created.status_code == 201
        updated = client.post("/api/v1/swipes", json={"job_id": 1, "direction": "left"}, headers=headers)
        assert updated.status_code == 201
        assert updated.json()["swipe_id"] == created.json()["swipe_id"]
        history = client.get("/api/v1/swipes/history", headers=headers)
        assert history.status_code == 200
        assert history.json()[0]["direction"] == "left"
        assert client.get("/api/v1/swipes/history", headers={"X-User-Id": "99"}).json() == []


def test_swipe_requires_gateway_identity():
    with TestClient(app) as client:
        assert client.post("/api/v1/swipes", json={"job_id": 1, "direction": "right"}).status_code == 401
