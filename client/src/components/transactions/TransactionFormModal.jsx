import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useModal from "../../hooks/useModal";
import { createCategory } from "../../api/client";

const schema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  accountId: z.coerce.number().int().positive("Account is required"),
  categoryId: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().min(1, "Color is required"),
});

const COLOR_OPTIONS = ["#0984e3", "#6c5ce7", "#d63031", "#e84393", "#00b894", "#fdcb6e", "#00cec9", "#e17055"];

function TransactionFormModal({ accounts, categories, initialData, onSubmit, onClose }) {
  const { containerRef, headingId } = useModal(onClose);
  const queryClient = useQueryClient();
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    control: categoryControl,
    reset: resetCategoryForm,
    formState: { errors: categoryErrors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", color: COLOR_OPTIONS[0] },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      // Update the cache directly instead of invalidating: invalidateQueries
      // only schedules a refetch, so the new option wouldn't exist in the
      // <select> yet at the moment setValue runs below, and the selection
      // would silently fail to stick.
      queryClient.setQueryData(["categories"], (old) =>
        old
          ? [...old, newCategory].sort((a, b) => a.name.localeCompare(b.name))
          : [newCategory],
      );
      setValue("categoryId", String(newCategory.id));
      setIsAddingCategory(false);
      resetCategoryForm();
      createCategoryMutation.reset();
    },
  });

  function getCategoryError() {
    if (!createCategoryMutation.isError) return null;
    const data = createCategoryMutation.error.response?.data;
    return typeof data?.error === "string" ? data.error : "Failed to add category.";
  }

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

  if (isAddingCategory) {
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
          <h3 id={headingId}>Add Category</h3>
          <form onSubmit={handleCategorySubmit((data) => createCategoryMutation.mutate(data))}>
            <label>
              Name
              <input type="text" {...registerCategory("name")} />
              {categoryErrors.name && (
                <span className="field-error">{categoryErrors.name.message}</span>
              )}
            </label>

            <label>
              Color
              <Controller
                name="color"
                control={categoryControl}
                render={({ field }) => (
                  <div className="color-picker" role="radiogroup" aria-label="Category color">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={field.value === c}
                        aria-label={c}
                        className={`color-swatch ${field.value === c ? "selected" : ""}`}
                        style={{ background: c }}
                        onClick={() => field.onChange(c)}
                      />
                    ))}
                  </div>
                )}
              />
            </label>

            {getCategoryError() && <span className="field-error">{getCategoryError()}</span>}

            <div className="modal-actions">
              <button type="button" onClick={() => setIsAddingCategory(false)}>
                Back
              </button>
              <button type="submit" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
        <h3 id={headingId}>{initialData ? "Edit Transaction" : "Add Transaction"}</h3>
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
            <div className="category-select-row">
              <select {...register("categoryId")}>
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setIsAddingCategory(true)}>
                + New
              </button>
            </div>
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