from pathlib import Path


CONTRACT = Path(__file__).parents[2] / "contracts" / "milestone-4-api-contracts.md"


def test_m4_contract_covers_required_feature_areas_and_roles():
    content = CONTRACT.read_text(encoding="utf-8")
    required = (
        "/api/v1/notifications",
        "/api/v1/alert-preferences",
        "/api/v1/applications",
        "/api/v1/recruiter/applications/",
        "competition_level",
        "early_applicant",
        "/api/v1/analytics/job-seeker",
        "/api/v1/analytics/recruiter",
        "/api/v1/analytics/admin",
        "401",
        "403",
        "429",
        "not claims that the endpoints already exist",
    )
    for item in required:
        assert item in content
