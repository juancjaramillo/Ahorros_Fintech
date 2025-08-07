import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ClientLogin() {
  const [u, setU]     = useState({ username:'', password:'' });
  const [err, setErr] = useState('');
  const nav           = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setErr('');
    console.log('Intentando login client:', u);
    try {
      const { data } = await axios.post('/auth/login', u);
      console.log('Token recibido:', data.access_token);
      localStorage.setItem('token', data.access_token);
      nav('/client');
    } catch (error) {
      console.error('Error login client:', error.response || error);
      setErr(
        error.response?.status === 401
          ? 'Credenciales inválidas'
          : 'Servidor inaccesible'
      );
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth:350, margin:'2rem auto' }}>
      <h4>Cliente</h4>
      {err && <div className="alert alert-danger py-1">{err}</div>}
      <input
        className="form-control mb-2"
        placeholder="Usuario"
        value={u.username}
        onChange={e=>setU({...u, username:e.target.value})}
        required
      />
      <input
        type="password"
        className="form-control mb-2"
        placeholder="Password"
        value={u.password}
        onChange={e=>setU({...u, password:e.target.value})}
        required
      />
      <button type="submit" className="btn btn-success w-100">
        Ingresar
      </button>
    </form>
  );
}
