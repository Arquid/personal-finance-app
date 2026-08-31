import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useModal from "../../hooks/useModal";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["checking", "savings", "credit"], { error: "Type is required" }),
  balance: z.coerce.number(),
});

function AccountFormModal({ initialData, onSubmit, onClose }) {
  const { containerRef, headingId } = useModal(onClose);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      type: initialData?.type ?? "checking",
      balance: initialData?.balance ?? 0,
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
        <h3 id={headingId}>{initialData ? "Edit Account" : "Add Account"}</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Name
            <input type="text" {...register("name")} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>

          <label>
            Type
            <select {...register("type")}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit</option>
            </select>
            {errors.type && <span className="field-error">{errors.type.message}</span>}
          </label>

          <label>
            {initialData ? "Balance" : "Opening Balance"}
            <input type="number" step="0.01" {...register("balance")} />
            {errors.balance && <span className="field-error">{errors.balance.message}</span>}
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">{initialData ? "Save" : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountFormModal;
