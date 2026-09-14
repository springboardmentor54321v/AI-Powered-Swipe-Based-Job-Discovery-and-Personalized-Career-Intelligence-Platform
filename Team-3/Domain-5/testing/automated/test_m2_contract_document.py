from pathlib import Path


CONTRACT = Path(__file__).parents[2] / "contracts" / "milestone-2-api-contracts.md"


def test_milestone_two_contract_covers_new_discovery_and_matching_apis():
    content = CONTRACT.read_text(encoding="utf-8")
    required = (
        "GET /api/v1/jobs/search",
        "GET /api/v1/companies",
        "POST /api/v1/swipes",
        "GET /api/v1/swipes/history",
        "GET /api/v1/recommendations",
        "Salary values are annual INR integers",
    )
    for item in required:
        assert item in content
