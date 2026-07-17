function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function BudgetCard({ budget, onEdit, onDelete }) {
  const barWidth = Math.min(100, budget.percentage);

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <div className="budget-card-title">
          <span className="budget-color-dot" style={{ background: budget.color }} />
          <h3>{budget.category}</h3>
        </div>
        <div className="budget-card-actions">
          <button onClick={() => onEdit(budget)}>Edit</button>
          <button onClick={() => onDelete(budget)}>Delete</button>
        </div>
      </div>

      <div className="budget-amounts">
        {formatCurrency(budget.actual)}
        <span className="budget-limit"> of {formatCurrency(budget.limitAmount)}</span>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill status-${budget.status}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {budget.status === "over" && (
        <p className="budget-alert-text">You've gone over this budget's limit.</p>
      )}
      {budget.status === "warning" && (
        <p className="budget-alert-text warning">You're close to your budget limit.</p>
      )}

      {budget.latestTransactions.length > 0 && (
        <div className="budget-latest">
          <h4>Latest Transactions</h4>
          <ul>
            {budget.latestTransactions.map((t) => (
              <li key={t.id}>
                <span>{t.description}</span>
                <span className={Number(t.amount) < 0 ? "expense" : "income"}>
                  {formatCurrency(Number(t.amount))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BudgetCard;