import pytest
from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_get_jobs_unfiltered(client: TestClient):
    response = client.get("/api/v1/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert isinstance(jobs, list)
    assert len(jobs) > 0
    # Check SRS 7.2 interface contract fields
    first_job = jobs[0]
    assert "job_id" in first_job
    assert "title" in first_job
    assert "company" in first_job
    assert "type" in first_job
    assert "location" in first_job
    assert "salary_range" in first_job
    assert "skills" in first_job
    assert "posted_at" in first_job
    assert isinstance(first_job["skills"], list)


def test_get_jobs_filter_by_company_type(client: TestClient):
    # Test MNC filter
    response_mnc = client.get("/api/v1/jobs?type=MNC")
    assert response_mnc.status_code == 200
    jobs_mnc = response_mnc.json()
    assert len(jobs_mnc) > 0
    for j in jobs_mnc:
        assert j["company_type"] == "MNC"

    # Test Newly Founded filter
    response_startup = client.get("/api/v1/jobs?type=Newly Founded")
    assert response_startup.status_code == 200
    jobs_startup = response_startup.json()
    assert len(jobs_startup) > 0
    for j in jobs_startup:
        assert j["company_type"] == "Newly Founded"


def test_get_jobs_filter_by_remote(client: TestClient):
    response = client.get("/api/v1/jobs?remote=true")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) > 0
    for j in jobs:
        assert j["workplace_type"] == "Remote"


def test_get_jobs_filter_by_skills(client: TestClient):
    response = client.get("/api/v1/jobs?skills=Python")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) > 0
    for j in jobs:
        skills_lower = [s.lower() for s in j["skills"]]
        assert any("python" in s for s in skills_lower)


def test_get_jobs_filter_by_salary(client: TestClient):
    min_sal = 1500000
    response = client.get(f"/api/v1/jobs?salary_min={min_sal}")
    assert response.status_code == 200
    jobs = response.json()
    for j in jobs:
        if j["salary_max"]:
            assert j["salary_max"] >= min_sal


def test_get_job_detail_success(client: TestClient):
    # Fetch job list first
    list_res = client.get("/api/v1/jobs")
    job_id = list_res.json()[0]["job_id"]

    response = client.get(f"/api/v1/jobs/{job_id}")
    assert response.status_code == 200
    job_detail = response.json()
    assert job_detail["id"] == job_id
    assert "description" in job_detail
    assert "company" in job_detail
    assert "name" in job_detail["company"]
    assert "industry" in job_detail["company"]


def test_get_job_detail_not_found(client: TestClient):
    response = client.get("/api/v1/jobs/999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
