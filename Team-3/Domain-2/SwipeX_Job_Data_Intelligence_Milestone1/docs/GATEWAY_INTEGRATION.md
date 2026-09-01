# API Gateway integration - Job & Swipe Service

## Route registration

Register the Job & Swipe Service at the gateway as shown below. The service runs on port `8002` in the local Compose setup.

| Public route | Upstream route | Authentication |
| --- | --- | --- |
| `GET /api/v1/jobs` | `GET job-swipe-service:8000/api/v1/jobs` | Optional/public, based on team policy |
| `GET /api/v1/jobs/{job_id}` | `GET job-swipe-service:8000/api/v1/jobs/{job_id}` | Optional/public, based on team policy |
| `POST /api/v1/swipes` | `POST job-swipe-service:8000/api/v1/swipes` | Required |
| `GET /api/v1/swipes/history` | `GET job-swipe-service:8000/api/v1/swipes/history` | Required |

## Identity contract

1. The gateway validates the JWT. The Job & Swipe Service never parses or trusts a browser-supplied user ID.
2. For protected swipe requests, the gateway forwards the numeric authenticated user ID in `X-User-Id`.
3. Requests without a valid forwarded identity receive `401 Unauthorized`.
4. The frontend sends `Authorization: Bearer <access_token>` to the gateway only; it must not set `X-User-Id` itself.

## Gateway acceptance checks

- A job seeker can list and filter jobs through the gateway.
- A job seeker can save a right or left swipe and retrieve only their own history.
- A request without a valid JWT cannot create a swipe or read swipe history.
- A request for a missing job returns `404` unchanged from the Job Service.

These are ready for Intern 1 to execute once the real gateway is available.
