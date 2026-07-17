import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useModal from "../../hooks/useModal";

const schema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  accountId: z.coerce.number().int().positive("Account is required"),
  categoryId: z.string().optional(),
});

function TransactionFormModal({ accounts, categories, initialData, onSubmit, onClose }) {
  const modalRef = useModal(onClose);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      merchant: "",
      date: new Date().toISOString().slice(0, 10),
      accountId: accounts[0]?.id ?? "",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        type: Number(initialData.amount) < 0 ? "expense" : "income",
        amount: Math.abs(Number(initialData.amount)),
        description: initialData.description,
        merchant: initialData.merchant ?? "",
        date: initialData.date.slice(0, 10),
        accountId: initialData.accountId,
        categoryId: initialData.categoryId ? String(initialData.categoryId) : "",
      });
    }
  }, [initialData, reset]);

  function submitHandler(data) {
    const signedAmount = data.type === "expense" ? -Math.abs(data.amount) : Math.abs(data.amount);
    onSubmit({
      amount: signedAmount,
      description: data.description,
      merchant: data.merchant || null,
      date: data.date,
      accountId: Number(data.accountId),
      categoryId: data.categoryId ? Number(data.categoryId) : null,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <h3>{initialData ? "Edit Transaction" : "Add Transaction"}</h3>
        <form onSubmit={handleSubmit(submitHandler)}>
          <label>
            Type
            <select {...register("type")}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label>
            Amount
            <input type="number" step="0.01" {...register("amount")} />
            {errors.amount && <span className="field-error">{errors.amount.message}</span>}
          </label>

          <label>
            Description
            <input type="text" {...register("description")} />
            {errors.description && (
              <span className="field-error">{errors.description.message}</span>
            )}
          </label>

          <label>
            Merchant (optional)
            <input type="text" {...register("merchant")} />
          </label>

          <label>
            Date
            <input type="date" {...register("date")} />
            {errors.date && <span className="field-error">{errors.date.message}</span>}
          </label>

          <label>
            Account
            <select {...register("accountId")}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {errors.accountId && <span className="field-error">{errors.accountId.message}</span>}
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

export default TransactionFormModal;