import React, { useState } from 'react';
import { api } from "../api"; 
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [u, setU]     = useState({ username:'', password:'' });
  const [err, setErr] = useState('');
  const nav           = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setErr('');
    console.log('Intentando login admin:', u);
    try {
      const { data } = await api.post('/auth/login', u);
      console.log('Token recibido:', data.access_token);
      localStorage.setItem('token', data.access_token);
      nav('/admin');
    } catch (error) {
      console.error('Error login admin:', error.response || error);
      setErr(
        error.response?.status === 401
          ? 'Credenciales inválidas'
          : 'Servidor inaccesible'
      );
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth:350, margin:'2rem auto' }}>
      <h4>Administrador</h4>
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
      <button type="submit" className="btn btn-primary w-100">
        Ingresar
      </button>
    </form>
  );
}
