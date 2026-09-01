# SwipeX - Test Cases

## TC-001: User Registration

### Module
Authentication

### API
POST /api/v1/auth/register

### Objective
Verify that a user can successfully register with valid
name, email, password, and role.

### Test Data

- Name: Test User
- Email: test@example.com
- Password: Test@123
- Role: Job Seeker

### Steps

1. Send a POST request to `/api/v1/auth/register`.
2. Provide valid name, email, password, and role.
3. Submit the request.
4. Verify the HTTP response status.
5. Verify the response contains `user_id`.

### Expected Result

HTTP Status: 201 Created

Response contains:

- user_id

### Actual Result
Not tested yet.

### Status
Not Run

## TC-002: User Login

### Module
Authentication

### API
POST /api/v1/auth/login

### Objective
Verify that a registered user can successfully log in
using valid credentials.

### Test Data

- Email: test@example.com
- Password: Test@123

### Steps

1. Send a POST request to `/api/v1/auth/login`.
2. Provide valid email and password.
3. Submit the request.
4. Verify the HTTP response status.
5. Verify that access and refresh tokens are returned.
6. Verify that the user's role is returned.

### Expected Result

HTTP Status: 200 OK

Response contains:

- access_token
- refresh_token
- role

### Actual Result
Not tested yet.

### Status
Not Run

## TC-003: Role-Based Access Control

### Module
Authentication / RBAC

### Objective
Verify that users can access only the resources permitted
for their assigned role.

### Test Data

- User Role: Job Seeker
- Protected Resource: Recruiter-only endpoint

### Steps

1. Register/login as a Job Seeker.
2. Obtain the access token.
3. Send the access token with a request to a recruiter-only resource.
4. Verify the authorization response.

### Expected Result

The Job Seeker must not be allowed to access
recruiter-only functionality.

### Actual Result
Not tested yet.

### Status
Not Run

## TC-004: Login with Invalid Credentials

### Module
Authentication

### API
POST /api/v1/auth/login

### Objective
Verify that login is rejected when invalid credentials
are provided.

### Test Data

- Email: test@example.com
- Password: WrongPassword@123

### Steps

1. Send a POST request to `/api/v1/auth/login`.
2. Provide a registered user's email.
3. Provide an incorrect password.
4. Submit the request.
5. Verify that authentication is rejected.

### Expected Result

The login request must be rejected and
authentication tokens must not be issued.

### Actual Result
Not tested yet.

### Status
Not Run

## TC-005: Google OAuth2 Login

### Module
Authentication / OAuth2

### API
GET /api/v1/auth/oauth/google

### Objective
Verify that a user can authenticate using Google OAuth2.

### Test Data

- Valid Google account

### Steps

1. Send a request to `/api/v1/auth/oauth/google`.
2. Complete Google authentication.
3. Verify the authentication response.
4. Verify that an access token is issued.
5. Verify that the user's role is available.

### Expected Result

HTTP Status: 200 OK

Response contains:

- access_token
- role

### Actual Result
Not tested yet.

### Status
Not Run

## TC-006: Registration with Duplicate Email

### Module
Authentication

### API
POST /api/v1/auth/register

### Objective
Verify that the system handles registration attempts
using an email address that is already registered.

### Test Data

- Name: Another User
- Email: test@example.com
- Password: Test@123
- Role: Job Seeker

### Preconditions

- `test@example.com` is already registered.

### Steps

1. Send a POST request to `/api/v1/auth/register`.
2. Provide the already registered email.
3. Submit the request.
4. Verify that a second account is not created.
5. Verify the response indicates that registration was not successful.

### Expected Result

The system must reject the duplicate registration
and must not create another user account.

### Actual Result
Not tested yet.

### Status
Not Run

## TC-007: Access Protected Resource Without Authentication

### Module
Authentication / RBAC

### Objective
Verify that a user without valid authentication
cannot access a protected resource.

### Test Data

- Access Token: None

### Steps

1. Select a protected API/resource.
2. Send a request without an access token.
3. Verify the authorization response.

### Expected Result

The system must reject the request because
the user is not authenticated.

### Actual Result
Not tested yet.

### Status
Not Run

## TC-008: Refresh Access Token

### Module
Authentication

### API
POST /api/v1/auth/refresh

### Objective
Verify that a valid refresh token can be used to obtain
a new access token.

### Test Data

- Valid refresh_token

### Steps

1. Obtain a valid refresh token through successful authentication.
2. Send a POST request to `/api/v1/auth/refresh`.
3. Provide the refresh token.
4. Verify the HTTP response status.
5. Verify that a new access token is returned.

### Expected Result

HTTP Status: 200 OK

Response contains:

- access_token

### Actual Result
Not tested yet.

### Status
Not Run

## TC-009: Get Current User Profile

### Module
Authentication

### API
GET /api/v1/auth/me

### Objective
Verify that an authenticated user can retrieve
their own user information.

### Test Data

- Valid access_token

### Steps

1. Login with a valid user account.
2. Obtain the access token.
3. Send a GET request to `/api/v1/auth/me`.
4. Include the access token in the Authorization header.
5. Verify the HTTP response status.
6. Verify that the user's information is returned.

### Expected Result

HTTP Status: 200 OK

Response contains:

- user_id
- name
- role

### Actual Result
Not tested yet.

### Status
Not Run

## TC-010: Get Job Listings

### Module
Job & Swipe Service

### API
GET /api/v1/jobs

### Objective
Verify that job listings can be retrieved successfully.

### Test Data

- type: Optional
- location: Optional
- remote: Optional
- salary_min: Optional
- salary_max: Optional
- skills: Optional

### Steps

1. Send a GET request to `/api/v1/jobs`.
2. Optionally provide supported filter parameters.
3. Submit the request.
4. Verify the HTTP response status.
5. Verify that job listing data is returned.

### Expected Result

HTTP Status: 200 OK

Response contains job listing information including:

- job_id
- title
- company
- type
- location
- salary_range
- skills
- posted_at

### Actual Result
Not tested yet.

### Status
Not Run

## TC-011: Get Job Details

### Module
Job & Swipe Service

### API
GET /api/v1/jobs/{job_id}

### Objective
Verify that the details of a specific job can be retrieved
using its job ID.

### Test Data

- job_id: Valid existing job ID

### Steps

1. Select a valid job ID.
2. Send a GET request to `/api/v1/jobs/{job_id}`.
3. Verify the HTTP response status.
4. Verify that the job details are returned.

### Expected Result

HTTP Status: 200 OK

Response contains the details of the requested job.

### Actual Result
Not tested yet.

### Status
Not Run

## TC-012: Record Swipe Action

### Module
Job & Swipe Service

### API
POST /api/v1/swipes

### Objective
Verify that a user can record a swipe action
for a job.

### Test Data

- job_id: Valid existing job ID
- direction: Valid swipe direction

### Steps

1. Login as a valid user.
2. Obtain a valid access token.
3. Select an existing job.
4. Send a POST request to `/api/v1/swipes`.
5. Provide the job ID and swipe direction.
6. Verify the HTTP response status.
7. Verify that a swipe ID is returned.

### Expected Result

HTTP Status: 201 Created

Response contains:

- swipe_id

### Actual Result
Not tested yet.

### Status
Not Run

## TC-013: Get Swipe History

### Module
Job & Swipe Service

### API
GET /api/v1/swipes/history

### Objective
Verify that an authenticated user can retrieve their
previous swipe actions.

### Test Data

- Valid access_token
- Existing swipe records

### Steps

1. Login as a valid user.
2. Obtain a valid access token.
3. Send a GET request to `/api/v1/swipes/history`.
4. Include the access token in the Authorization header.
5. Verify the HTTP response status.
6. Verify that the swipe history is returned.

### Expected Result

HTTP Status: 200 OK

Response contains swipe history information including:

- job_id
- direction
- swiped_at

### Actual Result
Not tested yet.

### Status
Not Run

## TC-014: Resume Upload

### Module
Resume & Career Intelligence Service

### API
POST /api/v1/resume/upload

### Objective
Verify that a user can upload a resume and that the system
returns the resume ID and parsed skills.

### Test Data

- Valid resume file

### Steps

1. Select a valid resume file.
2. Send a multipart POST request to `/api/v1/resume/upload`.
3. Upload the resume file.
4. Verify the HTTP response status.
5. Verify that a resume ID is returned.
6. Verify that parsed skills are returned.

### Expected Result

HTTP Status: 201 Created

Response contains:

- resume_id
- parsed_skills[]

### Actual Result
Not tested yet.

### Status
Not Run


## TC-015: Resume ATS Score

### Module
Resume & Career Intelligence Service

### API
GET /api/v1/resume/{resume_id}/ats-score?job_id={id}

### Objective
Verify that the system generates an ATS match score
between an uploaded resume and a job.

### Test Data

- Valid resume_id
- Valid job_id

### Steps

1. Upload a valid resume.
2. Obtain the resume_id.
3. Select a valid job ID.
4. Send a GET request to the ATS score endpoint.
5. Verify the HTTP response status.
6. Verify that the match score is returned.
7. Verify that missing keywords are returned.
8. Verify that the response identifies the heuristic generator.

### Expected Result

HTTP Status: 200 OK

Response contains:

- match_score
- missing_keywords[]
- generated_by: "heuristic-v0"

### Actual Result
Not tested yet.

### Status
Not Run


## TC-016: Job Recommendations

### Module
Resume & Career Intelligence Service

### API
GET /api/v1/recommendations?user_id={id}

### Objective
Verify that the system returns job recommendations
for a user.

### Test Data

- Valid user_id

### Steps

1. Login as a valid user.
2. Obtain the user's ID.
3. Send a GET request to `/api/v1/recommendations?user_id={id}`.
4. Verify the HTTP response status.
5. Verify that recommended jobs are returned.
6. Verify that match percentages are provided.
7. Verify that the heuristic generator is identified.

### Expected Result

HTTP Status: 200 OK

Response contains:

- job_id
- match_percentage
- generated_by: "heuristic-v0"

### Actual Result
Not tested yet.

### Status
Not Run