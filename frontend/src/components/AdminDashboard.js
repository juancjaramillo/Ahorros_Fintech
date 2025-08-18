import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

import CreateClient from "./CreateClient";
import CreateAccount from "./CreateAccount";
import AccountList from "./AccountList";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClientUsername, setSelectedClientUsername] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [txs, setTxs] = useState([]);
  const [err, setErr] = useState("");
  const latestJobRef = useRef(0);
  const navigate = useNavigate();

  // proteger ruta si no hay token
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) navigate("/");
  }, [navigate]);

  // cargar clientes (solo role=client)
  const fetchClients = useCallback(async () => {
    try {
      const resp = await api.get("/users");
      const list = Array.isArray(resp.data) ? resp.data : [];
      setClients(list.filter((u) => u.role === "client"));
      setErr("");
    } catch (e) {
      console.error("fetchClients error:", e);
      setErr("No fue posible cargar la lista de clientes.");
      setClients([]);
    }
  }, []);

  // pide cuentas crudas (puede venir todo del backend)
  const fetchAccountsRaw = useCallback(async (userId) => {
    try {
      const resp = await api.get("/accounts", { params: { user_id: userId } });
      return Array.isArray(resp.data) ? resp.data : [];
    } catch (e) {
      console.error("fetchAccounts error:", e);
      setErr("No fue posible cargar las cuentas del cliente.");
      return [];
    }
  }, []);

  // pide transacciones para ids de cuentas
  const fetchTransactionsForAccountsRaw = useCallback(async (accountIds) => {
    try {
      if (!accountIds.length) return [];
      const reqs = accountIds.map((id) => api.get(`/transactions/by-account/${id}`));
      const results = await Promise.all(reqs);
      const flat = results.flatMap((r) => r.data || []);
      flat.sort((a, b) => {
        const at = a.timestamp || a.created_at || 0;
        const bt = b.timestamp || b.created_at || 0;
        const ad = at ? new Date(at).getTime() : 0;
        const bd = bt ? new Date(bt).getTime() : 0;
        return bd - ad || (b.id ?? 0) - (a.id ?? 0);
      });
      return flat;
    } catch (e) {
      console.error("fetchTransactionsForAccounts error:", e);
      setErr("No fue posible cargar las transacciones.");
      return [];
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // limpiar al cambiar de cliente
  useEffect(() => {
    setAccounts([]);
    setTxs([]);
  }, [selectedClientId]);

  // seleccionar cliente
  const handleSelectClient = useCallback(async (client) => {
    setSelectedClientId(client.id);
    setSelectedClientUsername(client.username);
    setAccounts([]);
    setTxs([]);
    const token = Date.now();
    latestJobRef.current = token;

    // 1) pedir cuentas
    const raw = await fetchAccountsRaw(client.id);

    // 2) filtro seguro por si el backend ignora user_id
    const list = raw.filter((a) => String(a.user_id) === String(client.id));

    if (latestJobRef.current !== token) return;
    setAccounts(list);

    // 3) pedir transacciones solo de esas cuentas
    const ids = list.map((a) => a.id);
    const txFlat = await fetchTransactionsForAccountsRaw(ids);
    if (latestJobRef.current !== token) return;
    setTxs(txFlat);
  }, [fetchAccountsRaw, fetchTransactionsForAccountsRaw]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  // refrescar panel del cliente actual (tras crear cuenta o hacer tx)
  const refreshClientData = useCallback(async () => {
    if (!selectedClientId) return;
    const token = Date.now();
    latestJobRef.current = token;

    const raw = await fetchAccountsRaw(selectedClientId);
    const list = raw.filter((a) => String(a.user_id) === String(selectedClientId));

    if (latestJobRef.current !== token) return;
    setAccounts(list);

    const ids = list.map((a) => a.id);
    const txFlat = await fetchTransactionsForAccountsRaw(ids);
    if (latestJobRef.current !== token) return;
    setTxs(txFlat);
  }, [selectedClientId, fetchAccountsRaw, fetchTransactionsForAccountsRaw]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Panel de Administración</h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>Salir</button>
      </div>

      {err && <div className="alert alert-warning">{err}</div>}

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Crear Cliente</h5>
          <CreateClient onCreated={fetchClients} />
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Clientes</h5>
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.username}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleSelectClient(c)}
                    >
                      Ver / Agregar Cuenta
                    </button>
                  </td>
                </tr>
              ))}
              {!clients.length && (
                <tr>
                  <td colSpan={3} className="text-muted">Sin clientes todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClientId && (
        <>
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Cuentas de {selectedClientUsername}</h5>
              <CreateAccount
                key={`create-${selectedClientId}`}
                clientId={selectedClientId}
                clientUsername={selectedClientUsername}
                onCreated={refreshClientData}
              />
              <AccountList key={`alist-${selectedClientId}`} accounts={accounts} />
            </div>
          </div>

          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Transacciones</h5>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <TransactionForm
                    key={`dep-${selectedClientId}`}
                    type="deposit"
                    accounts={accounts}
                    onUpdated={refreshClientData}
                  />
                </div>
                <div className="col-md-6">
                  <TransactionForm
                    key={`wd-${selectedClientId}`}
                    type="withdraw"
                    accounts={accounts}
                    onUpdated={refreshClientData}
                  />
                </div>
              </div>
              <TransactionList key={`txlist-${selectedClientId}`} transactions={txs} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
