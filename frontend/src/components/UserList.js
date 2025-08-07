import React from 'react';

export default function UserList({ users, onViewAccounts, onCreateAccount }) {
  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th>ID</th><th>Usuario</th><th>Rol</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.username}</td>
            <td className="text-capitalize">{u.role}</td>
            <td>
              <button 
                className="btn btn-sm btn-info me-2"
                onClick={() => onViewAccounts(u)}
              >
                Ver Cuentas
              </button>
              <button 
                className="btn btn-sm btn-success"
                onClick={() => onCreateAccount(u)}
              >
                Crear Cuenta
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
