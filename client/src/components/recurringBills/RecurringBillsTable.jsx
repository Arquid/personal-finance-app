import useCurrency from "../../hooks/useCurrency";

const STATUS_LABELS = {
  paid: "Paid",
  due: "Due",
  overdue: "Overdue",
};

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

function RecurringBillsTable({ bills, sortBy, order, onSort, onEdit, onDelete }) {
  const { formatCurrency } = useCurrency();
  return (
    <table className="recurring-bills-table">
      <thead>
        <tr>
          <SortableHeader label="Name" field="name" sortBy={sortBy} order={order} onSort={onSort} />
          <th>Category</th>
          <SortableHeader label="Due Day" field="dueDay" sortBy={sortBy} order={order} onSort={onSort} />
          <SortableHeader label="Amount" field="amount" sortBy={sortBy} order={order} onSort={onSort} />
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((bill) => (
          <tr key={bill.id}>
            <td>
              <div className="bill-name-cell">
                <span>{bill.name}</span>
                {bill.merchant && <span className="bill-merchant">{bill.merchant}</span>}
              </div>
            </td>
            <td>{bill.category?.name ?? "Uncategorized"}</td>
            <td>Day {bill.dueDay}</td>
            <td>{formatCurrency(Number(bill.amount))}</td>
            <td>
              <span className={`status-badge status-${bill.status}`}>{STATUS_LABELS[bill.status]}</span>
            </td>
            <td>
              <button onClick={() => onEdit(bill)} aria-label={`Edit ${bill.name}`}>
                Edit
              </button>
              <button onClick={() => onDelete(bill)} aria-label={`Delete ${bill.name}`}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RecurringBillsTable;