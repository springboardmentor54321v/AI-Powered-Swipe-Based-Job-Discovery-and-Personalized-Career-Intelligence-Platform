from django.test import Client


def test_user_registration():
    client = Client()

    response = client.post(
        "/api/v1/auth/register",
        {
            "name": "Test User",
            "email": "test@example.com",
            "password": "Test@123",
            "role": "Job Seeker",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert "user_id" in data
    assert data["user_id"] == 1

def test_user_registration_missing_email():
    client = Client()

    response = client.post(
        "/api/v1/auth/register",
        {
            "name": "Test User",
            "password": "Test@123",
            "role": "Job Seeker",
        },
    )

    assert response.status_code == 400

def test_register_get_not_allowed():
    client = Client()

    response = client.get("/api/v1/auth/register")

    assert response.status_code == 405

    data = response.json()

    assert data["error"] == "Method not allowed"

def test_registration_error_message():
    client = Client()

    response = client.post(
        "/api/v1/auth/register",
        {
            "name": "Test User",
            "password": "Test@123",
            "role": "Job Seeker",
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert data["error"] == "Email is required"

def test_user_registration_json():
    client = Client()

    response = client.post(
        "/api/v1/auth/register",
        data={
            "name": "Test User",
            "email": "json@example.com",
            "password": "Test@123",
            "role": "Job Seeker",
        },
        content_type="application/json",
    )

    assert response.status_code == 201

    data = response.json()

    assert data["user_id"] == 1