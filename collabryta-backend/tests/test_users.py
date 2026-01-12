from fastapi.testclient import TestClient
from app.core.config import settings

def test_create_user(client: TestClient):
    response = client.post(
        f"{settings.API_V1_STR}/users/",
        json={"email": "test@example.com", "password": "password123", "name": "Test User"},
    )
    assert response.status_code == 200
    content = response.json()
    assert content["email"] == "test@example.com"
    assert "id" in content

def test_login_user(client: TestClient):
    login_data = {
        "username": "test@example.com",
        "password": "password123",
    }
    response = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"
