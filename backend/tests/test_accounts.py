import pytest

def test_create_account_ok(client, make_user):
    user = make_user(username="client7")

    payload = {
        "user_id": user.id,
        "number": "0007",
        "initial_balance": 123.45,
    }

    resp = client.post("/api/accounts/", json=payload)
    assert resp.status_code in (200, 201)
    data = resp.json()

    assert data.get("number") == "0007"
    if "balance" in data:
        assert float(data["balance"]) == pytest.approx(123.45)
