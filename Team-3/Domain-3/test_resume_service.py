from fastapi.testclient import TestClient
from resume_service import app

client = TestClient(app)

def test_upload_resume():
    with open("data/sample_resume.pdf", "rb") as f:  # use any real resume PDF you have
        response = client.post("/api/v1/resume/upload", files={"file": f})
    assert response.status_code == 200
    data = response.json()
    assert "resume_id" in data
    assert "parsed_skills" in data
    assert isinstance(data["parsed_skills"], list)

def test_ats_score_with_valid_resume():
    # First upload a resume to get a real resume_id
    with open("data/sample_resume.pdf", "rb") as f:
        upload_response = client.post("/api/v1/resume/upload", files={"file": f})
    resume_id = upload_response.json()["resume_id"]

    # Use a real job_id from your cleaned dataset
    response = client.get(f"/api/v1/resume/{resume_id}/ats-score?job_id=260925025955")
    assert response.status_code == 200
    data = response.json()
    assert "match_score" in data
    assert 0 <= data["match_score"] <= 100

def test_ats_score_with_invalid_resume_id():
    response = client.get("/api/v1/resume/fake-id-123/ats-score?job_id=260925025955")
    data = response.json()
    assert "error" in data

def test_recommendations():
    with open("data/sample_resume.pdf", "rb") as f:
        upload_response = client.post("/api/v1/resume/upload", files={"file": f})
    resume_id = upload_response.json()["resume_id"]

    response = client.get(f"/api/v1/recommendations?resume_id={resume_id}")
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) <= 5