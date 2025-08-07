// frontend/src/components/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import CreateClient     from './CreateClient';
import CreateAccount    from './CreateAccount';
import AccountList      from './AccountList';
import TransactionForm  from './TransactionForm';
import TransactionList  from './TransactionList';

export default function AdminDashboard() {
  const [clients, setClients]           = useState([]);
  const [selectedClient, setSelected]   = useState(null);
  const [accounts, setAccounts]         = useState([]);
  const [txs, setTxs]                   = useState([]);

  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const cfg      = { headers: { Authorization: `Bearer ${token}` } };

  // 1) Listar solo los usuarios con role==='client'
  const fetchClients = async () => {
    const resp = await axios.get('/users/', cfg);
    setClients(resp.data.filter(u => u.role === 'client'));
  };

  // 2) Al elegir un cliente, traigo sus cuentas
  const fetchAccounts = async userId => {
    const resp = await axios.get(`/accounts/?user_id=${userId}`, cfg);
    setAccounts(resp.data);
  };

  // 3) Para el admin, trae **todas** las transacciones
  const fetchTransactions = async () => {
    const resp = await axios.get('/transactions/all', cfg);
    setTxs(resp.data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSelectClient = client => {
    setSelected(client);
    fetchAccounts(client.id);
    fetchTransactions();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Panel de Administración</h3>
        <button
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >Salir</button>
      </div>

      {/* CREAR CLIENTE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Crear Cliente</h5>
          <CreateClient onCreated={fetchClients}/>
        </div>
      </div>

      {/* LISTA DE CLIENTES */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Clientes</h5>
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>ID</th><th>Usuario</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.username}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleSelectClient(c)}
                    >Ver / Agregar Cuenta</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUENTAS y TRANSACCIONES del CLIENTE SELECCIONADO */}
      {selectedClient && (
        <>
          {/* CUENTAS */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                Cuentas de {selectedClient.username}
              </h5>
              <CreateAccount
                clientId={selectedClient.id}
                onCreated={() => fetchAccounts(selectedClient.id)}
              />
              <AccountList accounts={accounts}/>
            </div>
          </div>

          {/* TRANSACCIONES */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Transacciones</h5>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <TransactionForm
                    type="deposit"
                    accounts={accounts}
                    onUpdated={() => {
                      fetchAccounts(selectedClient.id);
                      fetchTransactions();
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <TransactionForm
                    type="withdraw"
                    accounts={accounts}
                    onUpdated={() => {
                      fetchAccounts(selectedClient.id);
                      fetchTransactions();
                    }}
                  />
                </div>
              </div>
              <TransactionList
                transactions={txs.filter(tx =>
                  accounts.some(a => a.id === tx.account_id)
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
