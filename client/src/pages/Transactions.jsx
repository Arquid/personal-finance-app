import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAccounts,
  getCategories,
} from "../api/client";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionTable from "../components/transactions/TransactionTable";
import Pagination from "../components/transactions/Pagination";
import TransactionFormModal from "../components/transactions/TransactionFormModal";
import useCurrency from "../hooks/useCurrency";
import "../stylesheets/Transactions.css";

function Transactions() {
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [budgetAlert, setBudgetAlert] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions", { page, search, category, sortBy, order }],
    queryFn: () =>
      getTransactions({
        page,
        limit: 10,
        search,
        category: category || undefined,
        sortBy,
        order,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: accounts } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsFormOpen(false);
      setBudgetAlert(result.budgetAlert ?? null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: body }) => updateTransaction(id, body),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsFormOpen(false);
      setEditingTransaction(null);
      setBudgetAlert(result.budgetAlert ?? null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  function handleSort(field) {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
    setPage(1);
  }

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setCategory(value);
    setPage(1);
  }, []);

  function handleEdit(transaction) {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  }

  function handleDelete(transaction) {
    if (window.confirm(`Delete "${transaction.description}"?`)) {
      deleteMutation.mutate(transaction.id);
    }
  }

  function handleFormSubmit(formData) {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingTransaction(null);
  }

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load transactions.</p>;

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h2>Transactions</h2>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
        >
          + Add Transaction
        </button>
      </div>

      {budgetAlert && (
        <div className={`budget-alert-banner status-${budgetAlert.level}`}>
          <span>
            {budgetAlert.level === "over" ? "Over budget: " : "Budget warning: "}
            you've spent {formatCurrency(budgetAlert.spent)} of your{" "}
            {formatCurrency(budgetAlert.limitAmount)} {budgetAlert.category} budget (
            {budgetAlert.percentage}%).
          </span>
          <button onClick={() => setBudgetAlert(null)}>✕</button>
        </div>
      )}

      <TransactionFilters
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        categories={categories ?? []}
      />

      <TransactionTable
        transactions={data.data}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
      />

      {isFormOpen && (
        <TransactionFormModal
          accounts={accounts ?? []}
          categories={categories ?? []}
          initialData={editingTransaction}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default Transactions;