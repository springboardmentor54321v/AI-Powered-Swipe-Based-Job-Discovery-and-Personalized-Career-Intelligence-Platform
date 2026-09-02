import logging
import json
import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger("gateway.proxy")

def forward_to_downstream(request, target_base_url: str, subpath: str, service_name: str = "Downstream Service", timeout: int = 20) -> Response:
    """
    Forward client requests from Django API Gateway to downstream microservices.
    Preserves:
      - HTTP Method
      - Query parameters (e.g. location, remote, salary_min, job_id, resume_id, etc.)
      - Request body & Multipart files (PDF resumes, form data)
      - Authorization headers (Bearer <token>)
    Injects trusted downstream context:
      - X-User-Id
      - X-User-Role
      - X-User-Email
    Handles:
      - Connection failures (returns 503 Service Unavailable)
      - Gateway timeouts (returns 504 Gateway Timeout)
      - Downstream responses (preserves downstream HTTP status codes & JSON payload)
    """
    if not target_base_url:
        logger.error(f"Gateway configuration error: {service_name} URL is not configured.")
        return Response(
            {
                "error": f"{service_name} not configured",
                "detail": f"The service URL for {service_name} is missing from environment settings.",
                "status_code": status.HTTP_503_SERVICE_UNAVAILABLE,
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    target_url = f"{target_base_url.rstrip('/')}/{subpath.lstrip('/')}"
    logger.info(f"Gateway forwarding {request.method} {request.get_full_path()} -> {target_url}")

    # Build forwarded headers (strip host, content-length, and untrusted client identity headers)
    untrusted_headers = {"host", "content-length", "x-user-id", "x-user-role", "x-user-email"}
    forwarded_headers = {}
    for key, value in request.headers.items():
        if key.lower() not in untrusted_headers:
            forwarded_headers[key] = value

    # Inject trusted user identity ONLY from validated JWT authentication
    if getattr(request, "user", None) and request.user.is_authenticated:
        forwarded_headers["X-User-Id"] = str(request.user.id)
        forwarded_headers["X-User-Email"] = getattr(request.user, "email", "")
        role_name = getattr(request.user.role, "name", "job_seeker") if getattr(request.user, "role", None) else "job_seeker"
        forwarded_headers["X-User-Role"] = role_name.lower()

    # Handle multipart file uploads (e.g. PDF resumes) vs JSON payloads
    files_to_forward = None
    data_to_forward = None

    if getattr(request, "FILES", None) and len(request.FILES) > 0:
        files_to_forward = {}
        for file_key, uploaded_file in request.FILES.items():
            uploaded_file.seek(0)
            files_to_forward[file_key] = (
                uploaded_file.name,
                uploaded_file.read(),
                uploaded_file.content_type or "application/pdf"
            )
        # Form fields
        data_to_forward = request.POST.dict() if hasattr(request, "POST") else None
        # Remove Content-Type header so requests library generates correct boundary header
        forwarded_headers.pop("Content-Type", None)
        forwarded_headers.pop("content-type", None)
    else:
        try:
            data_to_forward = request.body if request.body else None
        except Exception:
            if hasattr(request, "data") and request.data:
                data_to_forward = json.dumps(request.data)
                forwarded_headers["Content-Type"] = "application/json"

    try:
        resp = requests.request(
            method=request.method,
            url=target_url,
            params=request.query_params,
            data=data_to_forward,
            files=files_to_forward,
            headers=forwarded_headers,
            timeout=timeout,
        )

        try:
            content = resp.json()
        except ValueError:
            content = {"detail": resp.text}

        return Response(content, status=resp.status_code)

    except requests.exceptions.ConnectionError as e:
        logger.warning(f"Gateway failed to reach {service_name} at {target_url}: {e}")
        return Response(
            {
                "error": f"{service_name} Unavailable",
                "service": service_name,
                "detail": f"Could not connect to downstream {service_name} at {target_base_url}.",
                "status_code": status.HTTP_503_SERVICE_UNAVAILABLE,
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    except requests.exceptions.Timeout as e:
        logger.warning(f"Gateway request to {service_name} timed out after {timeout}s: {e}")
        return Response(
            {
                "error": f"{service_name} Gateway Timeout",
                "service": service_name,
                "detail": f"Downstream {service_name} did not respond within {timeout} seconds.",
                "status_code": status.HTTP_504_GATEWAY_TIMEOUT,
            },
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )

    except requests.exceptions.RequestException as e:
        logger.error(f"Gateway downstream communication error with {service_name}: {e}")
        return Response(
            {
                "error": f"{service_name} Communication Error",
                "service": service_name,
                "detail": "Failed to exchange data with downstream service.",
                "status_code": status.HTTP_502_BAD_GATEWAY,
            },
            status=status.HTTP_502_BAD_GATEWAY
        )
