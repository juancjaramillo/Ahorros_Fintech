import React, { useState } from 'react';
import axios from 'axios';

export default function CreateAccount({
  clientId,
  clientUsername,
  onCreated
}) {
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState('');
  const [err, setErr] = useState('');

  const token = localStorage.getItem('token');
  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  const submit = async e => {
    e.preventDefault();
    setErr('');
    try {
      await axios.post(
        '/accounts/',
        {
          account_name: accountName,
          balance: parseFloat(balance),
          user_id: clientId
        },
        cfg
      );
      setAccountName('');
      setBalance('');
      onCreated();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error al crear cuenta');
    }
  };

  return (
    <form className="mb-4 p-3 border rounded bg-light" onSubmit={submit}>
      <h5>Crear nueva cuenta</h5>
      {err && <div className="alert alert-danger py-1">{err}</div>}
      <div className="row g-2">
        <div className="col-md-3">
          <label className="form-label">Usuario (solo lectura)</label>
          <input
            type="text"
            className="form-control"
            value={clientUsername}
            disabled
          />
        </div>
        <div className="col-md-5">
          <label className="form-label">Nombre de la cuenta</label>
          <input
            className="form-control"
            placeholder="Ej: Ahorros Junio"
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Saldo inicial</label>
          <input
            type="number"
            className="form-control"
            placeholder="0.00"
            value={balance}
            onChange={e => setBalance(e.target.value)}
            required
          />
        </div>
        <div className="col-md-auto align-self-end">
          <button className="btn btn-primary">Crear cuenta</button>
        </div>
      </div>
    </form>
  );
}
