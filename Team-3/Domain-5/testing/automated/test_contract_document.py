from pathlib import Path


CONTRACT = Path(__file__).parents[2] / "contracts" / "api-contracts.md"


def test_frozen_contract_contains_every_milestone_one_endpoint():
    content = CONTRACT.read_text(encoding="utf-8")
    expected_endpoints = (
        "POST /api/v1/auth/register",
        "POST /api/v1/auth/login",
        "POST /api/v1/auth/refresh",
        "GET /api/v1/auth/me",
        "GET /api/v1/jobs",
        "GET /api/v1/jobs/{job_id}",
        "POST /api/v1/swipes",
        "GET /api/v1/swipes/history",
        "POST /api/v1/resume/upload",
        "GET /api/v1/resume/{resume_id}/ats-score",
        "GET /api/v1/recommendations",
    )
    for endpoint in expected_endpoints:
        assert endpoint in content
