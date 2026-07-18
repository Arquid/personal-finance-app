import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useModal from "../../hooks/useModal";
import { formatCurrency } from "../../utils/format";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

function PotMoneyModal({ pot, mode, onSubmit, onClose, error }) {
  const { containerRef, headingId } = useModal(onClose);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: "" },
  });

  const isWithdraw = mode === "withdraw";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={headingId}>
          {isWithdraw ? "Withdraw from" : "Add money to"} {pot.name}
        </h3>
        <p className="pot-money-current">Current: {formatCurrency(Number(pot.currentAmount))}</p>
        <form onSubmit={handleSubmit((data) => onSubmit(data.amount))}>
          <label>
            Amount
            <input type="number" step="0.01" autoFocus {...register("amount")} />
            {errors.amount && <span className="field-error">{errors.amount.message}</span>}
          </label>
          {error && <span className="field-error">{error}</span>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">{isWithdraw ? "Withdraw" : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PotMoneyModal;