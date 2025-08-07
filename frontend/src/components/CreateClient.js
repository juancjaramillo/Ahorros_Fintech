import React, { useState } from 'react';
import axios from 'axios';

export default function CreateClient({ onCreated }) {
  const [u, setU] = useState({
    username: '',
    password: '',
    role: 'client'
  });
  const [err, setErr] = useState('');

  const token = localStorage.getItem('token');
  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  const submit = async e => {
    e.preventDefault();
    setErr('');
    try {
      await axios.post('/users/', u, cfg);
      setU({ username: '', password: '', role: 'client' });
      onCreated();
    } catch (error) {
      const det = error.response?.data?.detail;
      const msg = Array.isArray(det)
        ? det.map(d => d.msg || d).join(', ')
        : det || 'Error al crear cliente';
      setErr(msg);
    }
  };

  return (
    <form onSubmit={submit} className="row g-2 align-items-end">
      {err && <div className="alert alert-danger w-100">{err}</div>}

      <div className="col-md-4">
        <label className="form-label">Usuario</label>
        <input
          className="form-control"
          placeholder="nuevoUsuario"
          value={u.username}
          onChange={e => setU({ ...u, username: e.target.value })}
          required
        />
      </div>

      <div className="col-md-4">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Password123"
          value={u.password}
          onChange={e => setU({ ...u, password: e.target.value })}
          required
        />
      </div>

      <div className="col-md-auto">
        <button className="btn btn-primary">Crear Cliente</button>
      </div>
    </form>
  );
}
