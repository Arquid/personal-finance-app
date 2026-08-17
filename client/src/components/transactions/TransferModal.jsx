import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useModal from "../../hooks/useModal";
import useCurrency from "../../hooks/useCurrency";

const schema = z
  .object({
    fromAccountId: z.coerce.number().int().positive("Source account is required"),
    toAccountId: z.coerce.number().int().positive("Destination account is required"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Choose two different accounts",
    path: ["toAccountId"],
  });

function TransferModal({ accounts, onSubmit, onClose, error, isSubmitting }) {
  const { formatCurrency } = useCurrency();
  const { containerRef, headingId } = useModal(onClose);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fromAccountId: accounts[0]?.id ?? "",
      toAccountId: accounts[1]?.id ?? accounts[0]?.id ?? "",
      amount: "",
    },
  });

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
        <h3 id={headingId}>Transfer Between Accounts</h3>
        <form onSubmit={handleSubmit((data) => onSubmit(data))}>
          <label>
            From
            <select {...register("fromAccountId")}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatCurrency(a.balance)})
                </option>
              ))}
            </select>
            {errors.fromAccountId && (
              <span className="field-error">{errors.fromAccountId.message}</span>
            )}
          </label>

          <label>
            To
            <select {...register("toAccountId")}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatCurrency(a.balance)})
                </option>
              ))}
            </select>
            {errors.toAccountId && (
              <span className="field-error">{errors.toAccountId.message}</span>
            )}
          </label>

          <label>
            Amount
            <input type="number" step="0.01" {...register("amount")} />
            {errors.amount && <span className="field-error">{errors.amount.message}</span>}
          </label>

          {error && <span className="field-error">{error}</span>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Transferring..." : "Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransferModal;