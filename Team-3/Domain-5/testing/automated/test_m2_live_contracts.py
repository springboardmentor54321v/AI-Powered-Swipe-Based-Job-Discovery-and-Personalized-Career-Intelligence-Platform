import json
import os
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest


pytestmark = pytest.mark.integration
GATEWAY_URL = os.getenv("SWIPEX_M2_GATEWAY_URL")
ACCESS_TOKEN = os.getenv("SWIPEX_M2_ACCESS_TOKEN")


@pytest.fixture(scope="module")
def gateway_url():
    if not GATEWAY_URL:
        pytest.skip("Set SWIPEX_M2_GATEWAY_URL after the M2 gateway is running.")
    return GATEWAY_URL.rstrip("/")


def request_json(url, method="GET", payload=None, token=None):
    headers = {"Accept": "application/json"}
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = "Bearer " + token
    request = Request(url, data=body, method=method, headers=headers)
    try:
        with urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        raw = error.read().decode("utf-8")
        try:
            return error.code, json.loads(raw)
        except json.JSONDecodeError:
            return error.code, raw


def results(payload):
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("items", "results", "data", "jobs", "companies"):
            if isinstance(payload.get(key), list):
                return payload[key]
    return None


def test_m2_job_listing_and_inr_filter(gateway_url):
    status, payload = request_json(gateway_url + "/api/v1/jobs?location=Hyderabad&salary_min=1000000")
    assert status == 200, payload
    assert isinstance(results(payload), list), payload


def test_m2_unknown_job_returns_not_found(gateway_url):
    status, payload = request_json(gateway_url + "/api/v1/jobs/999999999")
    assert status == 404, payload


def test_m2_search_endpoint(gateway_url):
    status, payload = request_json(gateway_url + "/api/v1/jobs/search?keyword=python")
    assert status == 200, payload
    assert isinstance(results(payload), list), payload


def test_m2_company_directory(gateway_url):
    status, payload = request_json(gateway_url + "/api/v1/companies?search=tech")
    assert status == 200, payload
    assert isinstance(results(payload), list), payload


def test_m2_swipes_reject_anonymous_user(gateway_url):
    status, _ = request_json(
        gateway_url + "/api/v1/swipes",
        method="POST",
        payload={"job_id": 1, "action": "save"},
    )
    assert status in (401, 403)


@pytest.mark.skipif(not ACCESS_TOKEN, reason="Set SWIPEX_M2_ACCESS_TOKEN for authenticated M2 tests.")
def test_m2_authenticated_swiping_and_history(gateway_url):
    status, payload = request_json(
        gateway_url + "/api/v1/swipes",
        method="POST",
        payload={"job_id": 1, "action": "save"},
        token=ACCESS_TOKEN,
    )
    assert status == 201, payload
    status, history = request_json(gateway_url + "/api/v1/swipes/history", token=ACCESS_TOKEN)
    assert status == 200, history
    assert isinstance(results(history), list), history
