import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="d-flex flex-column align-items-center pt-5">
      <h2 className="mb-4">Bienvenido al Sistema de Ahorros</h2>
      <div className="d-flex gap-4">
        <Link to="/client-login" className="btn btn-success btn-lg px-5">
          Soy Cliente
        </Link>
        <Link to="/admin-login" className="btn btn-primary btn-lg px-5">
          Soy Administrador
        </Link>
      </div>
    </div>
  );
}
