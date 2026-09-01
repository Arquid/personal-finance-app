import useCurrency from "../../hooks/useCurrency";

const TYPE_LABELS = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit",
};

function AccountCard({ account, onEdit, onDelete }) {
  const { formatCurrency } = useCurrency();
  const balance = Number(account.balance);

  return (
    <div className="account-card">
      <div className="account-card-header">
        <div className="account-card-title">
          <h3>{account.name}</h3>
          <span className="account-type-badge">{TYPE_LABELS[account.type] ?? account.type}</span>
        </div>
        <div className="account-card-actions">
          <button onClick={() => onEdit(account)} aria-label={`Edit ${account.name}`}>
            Edit
          </button>
          <button onClick={() => onDelete(account)} aria-label={`Delete ${account.name}`}>
            Delete
          </button>
        </div>
      </div>

      <div className={`account-balance ${balance < 0 ? "negative" : "positive"}`}>
        {formatCurrency(balance)}
      </div>
    </div>
  );
}

export default AccountCard;
