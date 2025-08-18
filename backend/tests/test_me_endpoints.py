import pytest

def login_token(client, username: str, password: str) -> dict[str, str]:
    r = client.post("/api/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_accounts_me_and_transactions_me_flow(client, db_session, make_user, make_account):
    # Creamos admin y cliente
    make_user("admin_me", "admin123", "admin")
    user = make_user("user_me", "User123", "client")

    # Cuenta del cliente
    acc = make_account(user_id=user.id, number="ME-001", initial_balance=0.0)

    # Logins
    h_admin = login_token(client, "admin_me", "admin123")
    h_user  = login_token(client, "user_me", "User123")

    # Depositar como admin en la cuenta del cliente
    r = client.post("/api/accounts/deposit", json={"account_id": acc.id, "amount": 100}, headers=h_admin)
    assert r.status_code == 200, r.text

    # Ver /accounts/me
    r = client.get("/api/accounts/me", headers=h_user)
    assert r.status_code == 200, r.text
    accounts = r.json()
    assert any(a["id"] == acc.id for a in accounts)

    # Ver /transactions/me
    r = client.get("/api/transactions/me", headers=h_user)
    assert r.status_code == 200, r.text
    txs = r.json()
    assert len(txs) == 1
    assert txs[0]["type"] == "deposit"
    assert txs[0]["amount"] == 100
