import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBudgets,
  getBudgetVsActual,
  getLatestByCategory,
  getCategories,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/client";
import BudgetCard from "../components/budgets/BudgetCard";
import BudgetFormModal from "../components/budgets/BudgetFormModal";
import "../stylesheets/Budgets.css";

function Budgets() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const { data: budgets, isLoading } = useQuery({ queryKey: ["budgets"], queryFn: getBudgets });
  const { data: budgetVsActual } = useQuery({
    queryKey: ["budget-vs-actual"],
    queryFn: getBudgetVsActual,
  });
  const { data: latestByCategory } = useQuery({
    queryKey: ["latest-by-category"],
    queryFn: getLatestByCategory,
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["budgets"] });
    queryClient.invalidateQueries({ queryKey: ["budget-vs-actual"] });
    queryClient.invalidateQueries({ queryKey: ["latest-by-category"] });
  }

  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      invalidateAll();
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: body }) => updateBudget(id, body),
    onSuccess: () => {
      invalidateAll();
      setIsFormOpen(false);
      setEditingBudget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: invalidateAll,
  });

  if (isLoading) return <p>Loading...</p>;

  const merged = (budgets ?? []).map((b) => {
    const actualData = (budgetVsActual ?? []).find((a) => a.categoryId === b.categoryId) ?? {};
    const latest = (latestByCategory ?? []).find((l) => l.categoryId === b.categoryId);
    return {
      id: b.id,
      categoryId: b.categoryId,
      category: b.category.name,
      color: b.category.color,
      limitAmount: Number(b.limitAmount),
      period: b.period,
      actual: actualData.actual ?? 0,
      percentage: actualData.percentage ?? 0,
      status: actualData.status ?? "ok",
      latestTransactions: latest?.transactions ?? [],
    };
  });

  const availableCategories = (categories ?? []).filter(
    (c) => !(budgets ?? []).some((b) => b.categoryId === c.id),
  );

  function handleEdit(budget) {
    setEditingBudget(budget);
    setIsFormOpen(true);
  }

  function handleDelete(budget) {
    if (window.confirm(`Delete the "${budget.category}" budget?`)) {
      deleteMutation.mutate(budget.id);
    }
  }

  function handleFormSubmit(formData) {
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingBudget(null);
  }

  return (
    <div className="budgets-page">
      <div className="budgets-header">
        <h2>Budgets</h2>
        <button
          onClick={() => {
            setEditingBudget(null);
            setIsFormOpen(true);
          }}
        >
          + Add Budget
        </button>
      </div>

      <div className="budgets-grid">
        {merged.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      {isFormOpen && (
        <BudgetFormModal
          categories={availableCategories}
          initialData={editingBudget}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default Budgets;