import React from "react";

export default function TransactionList({ transactions = [] }) {
  const fmt = (n) => Number(n ?? 0).toFixed(2);

  const rowClass = (t) => {
    switch (String(t).toLowerCase()) {
      case "deposit":
        return "table-success";
      case "withdraw":
        return "table-warning";
      default:
        return "";
    }
  };

  const badgeClass = (t) => {
    switch (String(t).toLowerCase()) {
      case "deposit":
        return "badge bg-success";
      case "withdraw":
        return "badge bg-warning text-dark";
      default:
        return "badge bg-secondary";
    }
  };

  const typeLabel = (t) => {
    const v = String(t).toLowerCase();
    if (v === "deposit") return "Depósito";
    if (v === "withdraw") return "Retiro";
    return t;
  };

  return (
    <table className="table table-sm table-hover">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Cuenta</th>
          <th>Tipo</th>
          <th>Valor</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id} className={rowClass(tx.type)}>
            <td>{tx.id}</td>
          
            <td>{tx.account?.number ?? tx.account_number ?? tx.account_id}</td>
            <td>
              <span className={badgeClass(tx.type)}>{typeLabel(tx.type)}</span>
            </td>
            <td>{fmt(tx.amount)}</td>
            <td>{tx.created_at ? new Date(tx.created_at).toLocaleString() : ""}</td>
          </tr>
        ))}

        {(!transactions || transactions.length === 0) && (
          <tr>
            <td colSpan={5} className="text-muted">
              Sin transacciones todavía.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}