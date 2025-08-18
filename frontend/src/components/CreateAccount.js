import React, { useState } from "react";
import { api } from "../api";

export default function CreateAccount({ clientId, clientUsername, onCreated }) {
  const [number, setNumber] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (initialBalance === "" || isNaN(Number(initialBalance))) {
      setError("El saldo inicial es obligatorio y debe ser un número.");
      return;
    }
    if (Number(initialBalance) < 0) {
      setError("El saldo inicial no puede ser negativo.");
      return;
    }

    try {
      const payload = {
        user_id: clientId,
        number,
        initial_balance: Number(initialBalance),
      };
      const { data } = await api.post("/accounts/", payload);
      onCreated && onCreated(data);
      setNumber("");
      setInitialBalance("");
    } catch (err) {
      console.error("CreateAccount error:", err);
      setError("Error al crear cuenta");
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <div className="row g-3 align-items-end">
        <div className="col-md-4">
          <label className="form-label">Usuario</label>
          <input className="form-control" value={clientUsername || ""} disabled />
        </div>
        <div className="col-md-4">
          <label className="form-label">Nombre de la cuenta</label>
          <input
            className="form-control"
            placeholder="0001, cuenta ahorro, etc."
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="initial_balance">Saldo inicial</label>
          <input
            id="initial_balance"
            className="form-control"
            type="number"
            step="0.01"
            min="0"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            required
          />
        </div>
        <div className="col-md-1">
          <button className="btn btn-primary w-100">Crear cuenta</button>
        </div>
      </div>
    </form>
  );
}
