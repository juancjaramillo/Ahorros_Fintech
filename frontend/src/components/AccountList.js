import React from "react";

export default function AccountList({ accounts = [] }) {
  return (
    <table className="table table-sm mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre de cuenta</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        {(accounts || []).map((a) => (
          <tr key={a.id}>
            <td>{a.id}</td>
            <td>{a.number}</td>
            <td>{Number(a.balance).toFixed(2)}</td>
          </tr>
        ))}
        {!accounts?.length && (
          <tr>
            <td colSpan={3} className="text-muted">Sin cuentas</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
