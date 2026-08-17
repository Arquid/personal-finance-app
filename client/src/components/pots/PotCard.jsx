import useCurrency from "../../hooks/useCurrency";
import { formatDate } from "../../utils/format";
import { getPotEstimate } from "../../utils/potEstimate";

function PotCard({ pot, onEdit, onDelete, onDeposit, onWithdraw }) {
  const { formatCurrency } = useCurrency();
  const current = Number(pot.currentAmount);
  const target = Number(pot.targetAmount);
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const estimate = getPotEstimate(pot);

  return (
    <div className="pot-card">
      <div className="pot-card-header">
        <div className="pot-card-title">
          <span className="pot-color-dot" style={{ background: pot.color }} />
          <h3>{pot.name}</h3>
        </div>
        <div className="pot-card-actions">
          <button onClick={() => onEdit(pot)}>Edit</button>
          <button onClick={() => onDelete(pot)}>Delete</button>
        </div>
      </div>

      <div className="pot-amounts">
        {formatCurrency(current)}
        <span className="pot-target"> of {formatCurrency(target)}</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%`, background: pot.color }} />
      </div>
      <span className="pot-percentage">{percentage}%</span>

      {estimate.status === "reached" && <p className="pot-estimate">Goal reached!</p>}
      {estimate.status === "estimated" && (
        <p className="pot-estimate">Estimated completion: {formatDate(estimate.date)}</p>
      )}

      <div className="pot-card-money-actions">
        <button onClick={() => onDeposit(pot)}>+ Add Money</button>
        <button onClick={() => onWithdraw(pot)}>- Withdraw</button>
      </div>
    </div>
  );
}

export default PotCard;