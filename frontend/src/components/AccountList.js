import React from 'react';

export default function AccountList({ accounts }) {
  return (
    <table className="table">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Nombre de cuenta</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map(acc => (
          <tr key={acc.id}>
            <td>{acc.id}</td>
            <td>{acc.account_name}</td>
            <td>{acc.balance.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
