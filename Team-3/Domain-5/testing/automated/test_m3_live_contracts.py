"""Opt-in live contract checks for the Milestone 3 resume API."""

import json
import os
import uuid
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest


pytestmark = pytest.mark.integration
GATEWAY_URL = os.getenv("SWIPEX_M3_GATEWAY_URL")
ACCESS_TOKEN = os.getenv("SWIPEX_M3_ACCESS_TOKEN")
TEST_JOB_ID = os.getenv("SWIPEX_M3_TEST_JOB_ID", "1")


@pytest.fixture(scope="module")
def gateway_url():
    if not GATEWAY_URL:
        pytest.skip("Set SWIPEX_M3_GATEWAY_URL after the M3 gateway is running.")
    return GATEWAY_URL.rstrip("/")


def request_json(url, method="GET", token=None, body=None, content_type="application/json"):
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    if body is not None:
        headers["Content-Type"] = content_type
    request = Request(url, data=body, method=method, headers=headers)
    try:
        with urlopen(request, timeout=20) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw) if raw else {}
    except HTTPError as error:
        raw = error.read().decode("utf-8")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = raw
        return error.code, payload


def make_text_pdf(marker):
    """Build a tiny valid PDF with extractable text and unique content per run."""
    text = f"Python Django PostgreSQL Docker SwipeX-{marker}"
    stream = f"BT /F1 12 Tf 72 720 Td ({text}) Tj ET".encode("ascii")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(obj + b"\nendobj\n")
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode("ascii"))
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("ascii")
    )
    return bytes(pdf)


def multipart_file(filename, content):
    boundary = "SwipeXBoundary" + uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        "Content-Type: application/pdf\r\n\r\n"
    ).encode("ascii") + content + f"\r\n--{boundary}--\r\n".encode("ascii")
    return body, f"multipart/form-data; boundary={boundary}"


def test_m3_resume_upload_rejects_anonymous_user(gateway_url):
    body, content_type = multipart_file("anonymous.pdf", make_text_pdf("anonymous"))
    status, payload = request_json(
        gateway_url + "/api/v1/resumes/upload",
        method="POST",
        body=body,
        content_type=content_type,
    )
    assert status in (401, 403), payload


def test_m3_ats_score_rejects_anonymous_user(gateway_url):
    status, payload = request_json(
        gateway_url + "/api/v1/ats/score",
        method="POST",
        body=json.dumps({"resume_id": str(uuid.uuid4()), "job_id": "1"}).encode("utf-8"),
    )
    assert status in (401, 403), payload


@pytest.mark.skipif(not ACCESS_TOKEN, reason="Set SWIPEX_M3_ACCESS_TOKEN to a disposable Job Seeker token.")
def test_m3_upload_list_and_parse_resume(gateway_url):
    marker = uuid.uuid4().hex[:12]
    body, content_type = multipart_file(f"swipex-test-{marker}.pdf", make_text_pdf(marker))
    status, uploaded = request_json(
        gateway_url + "/api/v1/resumes/upload",
        method="POST",
        token=ACCESS_TOKEN,
        body=body,
        content_type=content_type,
    )
    assert status == 201, uploaded
    assert uploaded.get("resume_id"), uploaded
    assert uploaded.get("version_id"), uploaded

    status, listing = request_json(gateway_url + "/api/v1/resumes/", token=ACCESS_TOKEN)
    assert status == 200, listing
    assert any(row.get("resume_id") == uploaded["resume_id"] for row in listing.get("results", [])), listing

    status, detail = request_json(
        gateway_url + f"/api/v1/resumes/{uploaded['resume_id']}/versions/{uploaded['version_id']}",
        token=ACCESS_TOKEN,
    )
    assert status == 200, detail
    assert detail.get("version_id") == uploaded["version_id"], detail

    status, parsed = request_json(
        gateway_url + f"/api/v1/resumes/{uploaded['resume_id']}/parse",
        method="POST",
        token=ACCESS_TOKEN,
        body=b"{}",
    )
    assert status == 200, parsed
    assert parsed.get("parsed_status") == "PARSED", parsed
    assert isinstance(parsed.get("extracted_skills"), list), parsed

    status, detail = request_json(
        gateway_url + f"/api/v1/resumes/{uploaded['resume_id']}/versions/{uploaded['version_id']}",
        token=ACCESS_TOKEN,
    )
    assert status == 200, detail
    assert isinstance(detail.get("extracted_skills"), list), detail

    status, score = request_json(
        gateway_url + "/api/v1/ats/score",
        method="POST",
        token=ACCESS_TOKEN,
        body=json.dumps({"resume_id": uploaded["resume_id"], "job_id": TEST_JOB_ID}).encode("utf-8"),
    )
    assert status == 200, score
    assert isinstance(score.get("final_ats_score"), (int, float)), score
    assert isinstance(score.get("missing_skills"), list), score
    assert isinstance(score.get("missing_keywords"), list), score
