import React from 'react';

// Devuelve etiqueta y clases de Bootstrap
const prettyType = (type) => {
  if (type === 'deposit')  return { label: 'Depósito', color: 'success' };
  if (type === 'withdraw') return { label: 'Retiro',    color: 'danger'  };
  return { label: type,    color: 'secondary' };
};

export default function TransactionList({ transactions }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th><th>Cuenta</th><th>Tipo</th>
          <th>Valor</th><th>Fecha</th>
        </tr>
      </thead>

      <tbody>
        {transactions.map((tx) => {
          const { label, color } = prettyType(tx.type);
          const rowCls = `table-${color}`;          // pinta toda la fila
          return (
            <tr key={tx.id} className={rowCls}>
              <td>{tx.id}</td>
              <td>{tx.account_id}</td>
              <td>
                <span className={`badge bg-${color}`}>{label}</span>
              </td>
              <td>{tx.amount.toFixed(2)}</td>
              <td>{new Date(tx.timestamp).toLocaleString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
