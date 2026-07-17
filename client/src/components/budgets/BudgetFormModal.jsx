import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useModal from "../../hooks/useModal";

const schema = z.object({
  categoryId: z.coerce.number().int().positive("Category is required"),
  limitAmount: z.coerce.number().positive("Limit must be greater than 0"),
  period: z.enum(["monthly", "weekly", "yearly"]),
});

function BudgetFormModal({ categories, initialData, onSubmit, onClose }) {
  const modalRef = useModal(onClose);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: initialData?.categoryId ?? categories[0]?.id ?? "",
      limitAmount: initialData?.limitAmount ?? "",
      period: initialData?.period ?? "monthly",
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <h3>{initialData ? "Edit Budget" : "Add Budget"}</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Category
            {initialData ? (
              <>
                <input type="text" value={initialData.category} disabled />
                <input type="hidden" {...register("categoryId")} />
              </>
            ) : (
              <select {...register("categoryId")}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            {errors.categoryId && (
              <span className="field-error">{errors.categoryId.message}</span>
            )}
          </label>

          <label>
            Limit Amount
            <input type="number" step="0.01" {...register("limitAmount")} />
            {errors.limitAmount && (
              <span className="field-error">{errors.limitAmount.message}</span>
            )}
          </label>

          <label>
            Period
            <select {...register("period")}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
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

export default BudgetFormModal;