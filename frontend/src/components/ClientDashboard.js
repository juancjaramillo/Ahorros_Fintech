// ClientDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../api"; 
import AccountList from "./AccountList";
import TransactionList from "./TransactionList";

export default function ClientDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [txs, setTxs]           = useState([]);
  const [err, setErr]           = useState("");

  /* 1⃣  Memoriza cfg para que ESLint no se queje */
  const cfg = useMemo(() => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  /* 2⃣  Función que baja ambos recursos */
  const fetchData = useCallback(async () => {
    try {
      const [aRes, tRes] = await Promise.all([
        api.get("/accounts/",      cfg),
        api.get("/transactions/me", cfg)
      ]);
      setAccounts(aRes.data);
      setTxs(tRes.data);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los datos.");
    }
  }, [cfg]);

  /* 3⃣  Carga inicial */
  useEffect(() => { fetchData(); }, [fetchData]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location = "/";
  };

  return (
    <div className="container py-4">
      <button className="btn btn-outline-danger mb-3" onClick={logout}>
        Salir
      </button>

      <h3>Panel del Cliente</h3>

      {err && <div className="alert alert-warning">{err}</div>}

      <h5 className="mt-4">Mis cuentas</h5>
      <AccountList accounts={accounts} />

      <h5 className="mt-4">Mis transacciones</h5>
      <TransactionList transactions={txs} />
    </div>
  );
}
