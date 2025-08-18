import pytest

def test_deposit_ok(client, make_account):
    acc = make_account(initial_balance=100)

    amount = 50.0
    resp = client.post("/api/transactions/deposit", json={"account_id": acc.id, "amount": amount})

    assert resp.status_code in (200, 201)
    data = resp.json()

    balance = data.get("balance") or data.get("new_balance")
    assert float(balance) == pytest.approx(150.0)

def test_withdraw_insufficient_funds(client, make_account):
    acc = make_account(initial_balance=10)

    amount = 9999.0
   
    resp = client.post("/api/transactions/withdraw", json={"account_id": acc.id, "amount": amount})

    assert resp.status_code in (400, 422)
    msg = (resp.json() or {}).get("detail") or ""
    assert "insuficiente" in msg.lower() or "saldo" in msg.lower()
