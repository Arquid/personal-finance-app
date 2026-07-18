import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useModal from "../../hooks/useModal";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  merchant: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDay: z.coerce
    .number()
    .int()
    .min(1, "Day must be between 1 and 31")
    .max(31, "Day must be between 1 and 31"),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
});

function RecurringBillFormModal({ categories, initialData, prefillData, onSubmit, onClose }) {
  const { containerRef, headingId } = useModal(onClose);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? prefillData?.name ?? "",
      merchant: initialData?.merchant ?? prefillData?.merchant ?? "",
      amount: initialData?.amount ?? prefillData?.amount ?? "",
      dueDay: initialData?.dueDay ?? prefillData?.dueDay ?? "",
      categoryId: initialData?.categoryId
        ? String(initialData.categoryId)
        : prefillData?.categoryId
          ? String(prefillData.categoryId)
          : "",
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        merchant: initialData.merchant ?? "",
        amount: Number(initialData.amount),
        dueDay: initialData.dueDay,
        categoryId: initialData.categoryId ? String(initialData.categoryId) : "",
        isActive: initialData.isActive,
      });
    }
  }, [initialData, reset]);

  function submitHandler(data) {
    onSubmit({
      name: data.name,
      merchant: data.merchant || null,
      amount: data.amount,
      dueDay: data.dueDay,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      isActive: data.isActive,
    });
  }

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
        <h3 id={headingId}>{initialData ? "Edit Recurring Bill" : "Add Recurring Bill"}</h3>
        <form onSubmit={handleSubmit(submitHandler)}>
          <label>
            Name
            <input type="text" {...register("name")} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>

          <label>
            Merchant (optional)
            <input type="text" {...register("merchant")} />
          </label>

          <label>
            Amount
            <input type="number" step="0.01" {...register("amount")} />
            {errors.amount && <span className="field-error">{errors.amount.message}</span>}
          </label>

          <label>
            Due Day (1-31)
            <input type="number" min="1" max="31" {...register("dueDay")} />
            {errors.dueDay && <span className="field-error">{errors.dueDay.message}</span>}
          </label>

          <label>
            Category (optional)
            <select {...register("categoryId")}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-label">
            <input type="checkbox" {...register("isActive")} />
            Active
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

export default RecurringBillFormModal;