function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SortableHeader({ label, field, sortBy, order, onSort }) {
  const isActive = sortBy === field;
  return (
    <th>
      <button className={`sort-button ${isActive ? "active" : ""}`} onClick={() => onSort(field)}>
        {label} {isActive ? (order === "asc" ? "▲" : "▼") : ""}
      </button>
    </th>
  );
}

function TransactionTable({ transactions, sortBy, order, onSort, onEdit, onDelete }) {
  return (
    <table className="transaction-table">
      <thead>
        <tr>
          <SortableHeader label="Date" field="date" sortBy={sortBy} order={order} onSort={onSort} />
          <SortableHeader
            label="Description"
            field="description"
            sortBy={sortBy}
            order={order}
            onSort={onSort}
          />
          <th>Category</th>
          <th>Account</th>
          <SortableHeader
            label="Amount"
            field="amount"
            sortBy={sortBy}
            order={order}
            onSort={onSort}
          />
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>{formatDate(t.date)}</td>
            <td>
              <div className="transaction-desc-cell">
                <span>{t.description}</span>
                {t.merchant && <span className="transaction-merchant">{t.merchant}</span>}
              </div>
            </td>
            <td>{t.category?.name ?? "Uncategorized"}</td>
            <td>{t.account?.name}</td>
            <td className={Number(t.amount) < 0 ? "expense" : "income"}>
              {formatCurrency(Number(t.amount))}
            </td>
            <td>
              <button onClick={() => onEdit(t)} aria-label={`Edit ${t.description}`}>
                Edit
              </button>
              <button onClick={() => onDelete(t)} aria-label={`Delete ${t.description}`}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TransactionTable;