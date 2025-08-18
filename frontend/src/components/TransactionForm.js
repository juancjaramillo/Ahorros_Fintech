import React, { useState } from "react";
import { api } from "../api";

export default function TransactionForm({ type, accounts = [], onUpdated }) {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const endpoint =
        type === "deposit" ? "/transactions/deposit" : "/transactions/withdraw";

      await api.post(endpoint, {
        account_id: Number(accountId),
        amount: Number(amount),
      });

      if (onUpdated) onUpdated();
      setAmount("");
      setAccountId("");
    } catch (error) {
      console.error("Transaction error:", error);
      const serverDetail =
        error?.response?.data?.detail ||
        (Array.isArray(error?.response?.data)
          ? error.response.data[0]?.msg
          : null);

      setErr(serverDetail || "No fue posible completar la operación.");
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="mb-2">
        <label className="form-label" htmlFor="account_id">Cuenta</label>
        <select
          id="account_id"
          className="form-select"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          required
        >
          <option value="">Seleccione...</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.number} (saldo: {a.balance})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="form-label" htmlFor="amount">
          {type === "deposit" ? "Consignar" : "Retirar"}
        </label>
        <input
          id="amount"
          className="form-control"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {err && (
        <div className="alert alert-danger mt-2" role="alert">
          {err}
        </div>
      )}

      <button
        className={`btn ${type === "deposit" ? "btn-success" : "btn-warning"} mt-2`}
        type="submit"
      >
        {type === "deposit" ? "Consignar" : "Retirar"}
      </button>
    </form>
  );
}
