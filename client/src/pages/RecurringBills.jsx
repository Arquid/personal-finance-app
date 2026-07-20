import { useState} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecurringBills,
  detectRecurringBills,
  createRecurringBill,
  updateRecurringBill,
  deleteRecurringBill,
  getCategories,
} from "../api/client";
import RecurringBillsTable from "../components/recurringBills/RecurringBillsTable";
import RecurringBillFormModal from "../components/recurringBills/RecurringBillFormModal";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import "../stylesheets/RecurringBills.css";

function RecurringBills() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dueDay");
  const [order, setOrder] = useState("asc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [showDetected, setShowDetected] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const { data: bills, isLoading } = useQuery({
    queryKey: ["recurring-bills"],
    queryFn: getRecurringBills,
  });

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const {
    data: detected,
    refetch: refetchDetected,
    isFetching: isDetecting,
  } = useQuery({
    queryKey: ["detect-recurring-bills"],
    queryFn: detectRecurringBills,
    enabled: false,
  });

  function invalidateBills() {
    queryClient.invalidateQueries({ queryKey: ["recurring-bills"] });
  }

  const createMutation = useMutation({
    mutationFn: createRecurringBill,
    onSuccess: () => {
      invalidateBills();
      setIsFormOpen(false);
      setPrefillData(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: body }) => updateRecurringBill(id, body),
    onSuccess: () => {
      invalidateBills();
      setIsFormOpen(false);
      setEditingBill(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecurringBill,
    onSuccess: invalidateBills,
  });

  const filtered = (bills ?? [])
    .filter((bill) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return (
        bill.name.toLowerCase().includes(term) ||
        (bill.merchant && bill.merchant.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "amount") cmp = Number(a.amount) - Number(b.amount);
      else if (sortBy === "dueDay") cmp = a.dueDay - b.dueDay;
      return order === "asc" ? cmp : -cmp;
    });

  function handleSort(field) {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  }

  function handleEdit(bill) {
    setEditingBill(bill);
    setPrefillData(null);
    setIsFormOpen(true);
  }

  function handleDelete(bill) {
    setConfirmTarget(bill);
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(confirmTarget.id);
    setConfirmTarget(null);
  }

  function handleFormSubmit(formData) {
    if (editingBill) {
      updateMutation.mutate({ id: editingBill.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingBill(null);
    setPrefillData(null);
  }

  async function handleDetect() {
    setShowDetected(true);
    await refetchDetected();
  }

  function handleAddDetected(candidate) {
    setEditingBill(null);
    setPrefillData({
      name: candidate.suggestedName,
      merchant: candidate.merchant,
      amount: candidate.averageAmount,
      dueDay: candidate.suggestedDueDay,
      categoryId: candidate.categoryId ?? "",
    });
    setIsFormOpen(true);
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="recurring-bills-page">
      <div className="recurring-bills-header">
        <h2>Recurring Bills</h2>
        <div className="recurring-bills-header-actions">
          <button onClick={handleDetect} disabled={isDetecting}>
            {isDetecting ? "Scanning..." : "Detect New Bills"}
          </button>
          <button
            onClick={() => {
              setEditingBill(null);
              setPrefillData(null);
              setIsFormOpen(true);
            }}
          >
            + Add Bill
          </button>
        </div>
      </div>

      {showDetected && (
        <div className="detected-panel">
          <div className="detected-panel-header">
            <h3>Detected Recurring Payments</h3>
            <button className="detected-close" onClick={() => setShowDetected(false)}>
              ✕
            </button>
          </div>
          {detected && detected.length > 0 ? (
            <ul>
              {detected.map((c) => (
                <li key={c.merchant}>
                  <span>
                    {c.merchant} — avg{" "}
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                      c.averageAmount,
                    )}{" "}
                    ({c.occurrences}x)
                  </span>
                  <button onClick={() => handleAddDetected(c)}>Add as Recurring Bill</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No new recurring payment patterns detected.</p>
          )}
        </div>
      )}

      <input
        type="text"
        className="recurring-bills-search"
        placeholder="Search bills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search recurring bills"
      />

      <RecurringBillsTable
        bills={filtered}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isFormOpen && (
        <RecurringBillFormModal
          categories={categories ?? []}
          initialData={editingBill}
          prefillData={prefillData}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Delete Recurring Bill"
          message={`Delete the "${confirmTarget.name}" recurring bill?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

export default RecurringBills;