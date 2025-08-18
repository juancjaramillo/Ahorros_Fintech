import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import AccountList from "./AccountList";
import TransactionList from "./TransactionList";

export default function ClientDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [txs, setTxs] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);

      const accPromise = api.get("/accounts/me").catch(async (e) => {
        const s = e?.response?.status;
        if (s === 404 || s === 405 || s === 422) {
          return api.get("/accounts/");
        }
        throw e;
      });

      const txPromise = api.get("/transactions/me").catch((e) => {
        if (e?.response?.status === 404) return { data: [] };
        throw e;
      });

      const [aRes, tRes] = await Promise.all([accPromise, txPromise]);
      setAccounts(Array.isArray(aRes?.data) ? aRes.data : []);
      setTxs(Array.isArray(tRes?.data) ? tRes.data : []);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "/";
      return;
    }
    fetchData();
  }, [fetchData]);

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
      {loading && <div className="text-muted">Cargando…</div>}

      <h5 className="mt-4">Mis cuentas</h5>
      <AccountList accounts={accounts} />

      <h5 className="mt-4">Mis transacciones</h5>
      <TransactionList transactions={txs} />
    </div>
  );
}
