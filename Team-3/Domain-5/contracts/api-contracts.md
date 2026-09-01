# SwipeX Milestone 1 API contract

Contract status: **frozen baseline for local integration**. Changes require agreement from all consuming interns and an accompanying test update.

| Owner | Endpoint | Success response |
| --- | --- | --- |
| Intern 1 | POST /api/v1/auth/register | `201 { user_id }` |
| Intern 1 | POST /api/v1/auth/login | `200 { access_token, refresh_token, role }` |
| Intern 1 | GET /api/v1/auth/oauth/google | `200 { access_token, role }` |
| Intern 1 | POST /api/v1/auth/refresh | `200 { access_token }` |
| Intern 1 | GET /api/v1/auth/me | `200 { user_id, name, role }` |
| Intern 2 | GET /api/v1/jobs | `200 [ { job_id, title, company, type, location, salary_range, skills, posted_at } ]` |
| Intern 2 | GET /api/v1/jobs/{job_id} | `200 job detail` |
| Intern 2 | POST /api/v1/swipes | `201 { swipe_id }` |
| Intern 2 | GET /api/v1/swipes/history | `200 [ { job_id, direction, swiped_at } ]` |
| Intern 3 | POST /api/v1/resume/upload | `201 { resume_id, parsed_skills }` |
| Intern 3 | GET /api/v1/resume/{resume_id}/ats-score | `200 { match_score, missing_keywords, generated_by: "heuristic-v0" }` |
| Intern 3 | GET /api/v1/recommendations | `200 [ { job_id, match_percentage, generated_by: "heuristic-v0" } ]` |

All protected endpoints require `Authorization: Bearer <access_token>`. Valid roles are `Job Seeker`, `Recruiter`, and `Admin`. Job search supports `type`, `location`, `remote`, `salary_min`, `salary_max`, and `skills` query parameters. Swipe direction is exactly `left` or `right`.
