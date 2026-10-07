"""Small authenticated/anonymous production smoke check for the public gateway."""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def request(url: str, token: str | None, timeout: float) -> tuple[int, float, dict[str, str]]:
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = Request(url, headers=headers)
    started = time.perf_counter()
    try:
        with urlopen(req, timeout=timeout) as response:
            response.read(65536)
            return response.status, (time.perf_counter() - started) * 1000, dict(response.headers.items())
    except HTTPError as error:
        error.read(65536)
        return error.code, (time.perf_counter() - started) * 1000, dict(error.headers.items())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=os.getenv("SWIPEX_GATEWAY_URL", "http://localhost:8080"))
    parser.add_argument("--health-path", default=os.getenv("SWIPEX_HEALTH_PATH", "/health/"))
    parser.add_argument("--concurrency", type=int, default=10)
    parser.add_argument("--requests", type=int, default=30)
    parser.add_argument("--timeout", type=float, default=10)
    parser.add_argument("--max-p95-ms", type=float, default=1500)
    parser.add_argument("--token", default=os.getenv("SWIPEX_SMOKE_TOKEN"))
    parser.add_argument("--require-auth", action="store_true", help="Require SWIPEX_SMOKE_TOKEN and use it on the health endpoint")
    args = parser.parse_args()
    if args.concurrency < 1 or args.requests < 1:
        parser.error("--concurrency and --requests must be positive")
    if args.require_auth and not args.token:
        parser.error("--require-auth requires SWIPEX_SMOKE_TOKEN")

    url = args.base_url.rstrip("/") + "/" + args.health_path.lstrip("/")
    try:
        status, latency, headers = request(url, args.token, args.timeout)
    except (URLError, TimeoutError) as exc:
        print(f"FAIL health request {url}: {exc}", file=sys.stderr)
        return 1
    print(json.dumps({"check": "health", "url": url, "status": status, "latency_ms": round(latency, 1)}))
    if status < 200 or status >= 300:
        return 1
    normalized_headers = {key.lower(): value for key, value in headers.items()}
    missing_headers = [key for key in ("x-content-type-options", "x-frame-options", "referrer-policy") if key not in normalized_headers]
    if missing_headers:
        print(f"WARN missing recommended security headers: {', '.join(missing_headers)}")

    latencies: list[float] = []
    statuses: list[int] = []
    try:
        with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
            futures = [pool.submit(request, url, args.token, args.timeout) for _ in range(args.requests)]
            for future in as_completed(futures):
                code, elapsed, _ = future.result()
                statuses.append(code)
                latencies.append(elapsed)
    except (URLError, TimeoutError) as exc:
        print(f"FAIL concurrent health requests: {exc}", file=sys.stderr)
        return 1
    latencies.sort()
    p95 = latencies[min(len(latencies) - 1, int(0.95 * len(latencies)))]
    failures = sum(code < 200 or code >= 300 for code in statuses)
    print(json.dumps({"check": "concurrency", "requests": len(statuses), "concurrency": args.concurrency,
                      "failures": failures, "p95_ms": round(p95, 1), "max_p95_ms": args.max_p95_ms}))
    return int(failures > 0 or p95 > args.max_p95_ms)


if __name__ == "__main__":
    raise SystemExit(main())
