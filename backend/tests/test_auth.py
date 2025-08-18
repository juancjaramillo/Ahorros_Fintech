import pytest

@pytest.mark.parametrize("username,password,expect_ok", [
    ("admin", "admin123", True),
    ("admin", "bad", False),
])
def test_admin_login(client, db_session, make_user, username, password, expect_ok):
   
    make_user(username="admin", is_admin=True, plain_password="admin123")

 
    resp = client.post("/api/admin/login", json={"username": username, "password": password})
    if expect_ok:
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data.get("token_type", "bearer").lower() == "bearer"
    else:
        assert resp.status_code in (400, 401)
