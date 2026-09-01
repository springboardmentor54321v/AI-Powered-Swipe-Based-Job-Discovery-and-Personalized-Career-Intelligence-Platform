import os
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest


GATEWAY_URL = os.getenv("SWIPEX_GATEWAY_URL")
pytestmark = pytest.mark.integration


@pytest.fixture(scope="module")
def gateway_url():
    if not GATEWAY_URL:
        pytest.skip("Set SWIPEX_GATEWAY_URL after the gateway is running.")
    return GATEWAY_URL.rstrip("/")


def request_json(url, method="GET", payload=None):
    body = None if payload is None else payload.encode("utf-8")
    request = Request(url, data=body, method=method, headers={"Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=10) as response:
            return response.status, response.read().decode("utf-8")
    except HTTPError as error:
        return error.code, error.read().decode("utf-8")


def test_jobs_endpoint_is_available(gateway_url):
    status, body = request_json(f"{gateway_url}/api/v1/jobs")
    assert status == 200, body


def test_protected_profile_rejects_anonymous_request(gateway_url):
    status, _ = request_json(f"{gateway_url}/api/v1/auth/me")
    assert status in (401, 403)
