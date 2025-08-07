// TransactionForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TransactionForm({ type, accounts = [], onUpdated }) {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount]       = useState("");
  const [err, setErr]             = useState("");

  /* token solo se lee 1×  */
  const token = localStorage.getItem("token");
  const cfg   = { headers: { Authorization: `Bearer ${token}` } };

  /* cuando llega la lista de cuentas → pre-selecciona la primera */
  useEffect(() => {
    if (accounts.length) setAccountId(accounts[0].id);
  }, [accounts]);

  const submit = async e => {
    e.preventDefault();
    setErr("");
    try {
      await axios.post(
        `/accounts/${type}`,
        { account_id: Number(accountId), amount: Number(amount) },
        cfg
      );
      setAmount("");
      onUpdated();               // avisa al padre que recargue todo
    } catch (error) {
      const detail = error.response?.data?.detail;
      setErr(detail || "Error en transacción");
    }
  };

  return (
    <form onSubmit={submit} className="border rounded p-3 bg-light">
      {err && <div className="alert alert-danger py-1">{err}</div>}

      <div className="mb-2">
        <label className="form-label">Cuenta</label>
        <select
          className="form-select"
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          required
        >
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.id} – {acc.account_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="form-label">
          {type === "deposit" ? "Consignar" : "Retirar"}
        </label>
        <input
          type="number"
          min="1"
          step="0.01"
          className="form-control"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>

      <button
        className={`btn btn-${type === "deposit" ? "success" : "warning"} w-100`}
      >
        {type === "deposit" ? "Consignar" : "Retirar"}
      </button>
    </form>
  );
}
