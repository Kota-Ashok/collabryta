from fastapi.testclient import TestClient
from app.core.config import settings

def test_create_task(client: TestClient):
    # First login
    login_data = {
        "username": "test@example.com",
        "password": "password123",
    }
    response = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        f"{settings.API_V1_STR}/tasks/",
        headers=headers,
        json={"title": "Test Task", "description": "Test Description", "status": "todo", "priority": "high"},
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == "Test Task"
    assert content["owner_id"] is not None

def test_read_tasks(client: TestClient):
    # First login
    login_data = {
        "username": "test@example.com",
        "password": "password123",
    }
    response = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"{settings.API_V1_STR}/tasks/", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)
    assert len(content) > 0
