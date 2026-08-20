import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  API_BASE_URL,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
  transferBetweenAccounts,
  getAccounts,
  getCategories,
} from "../api/client";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionTable from "../components/transactions/TransactionTable";
import Pagination from "../components/transactions/Pagination";
import TransactionFormModal from "../components/transactions/TransactionFormModal";
import ImportCsvModal from "../components/transactions/ImportCsvModal";
import TransferModal from "../components/transactions/TransferModal";
import ConfirmDialog from "../components/shared/ConfirmDialog";
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
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

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

  const importMutation = useMutation({
    mutationFn: importTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const transferMutation = useMutation({
    mutationFn: transferBetweenAccounts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setIsTransferOpen(false);
      transferMutation.reset();
    },
  });

  function getTransferError() {
    if (!transferMutation.isError) return null;
    const data = transferMutation.error.response?.data;
    return typeof data?.error === "string" ? data.error : "Transfer failed.";
  }

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
    setConfirmTarget(transaction);
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(confirmTarget.id);
    setConfirmTarget(null);
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

  function getImportResult() {
    if (importMutation.data) return importMutation.data;
    if (importMutation.isError) {
      const data = importMutation.error.response?.data;
      if (data && Array.isArray(data.errors)) return data;
    }
    return null;
  }

  function getImportError() {
    if (importMutation.isError) {
      const data = importMutation.error.response?.data;
      if (data && !Array.isArray(data.errors)) {
        return data.error ?? "Import failed.";
      }
    }
    return null;
  }

  function handleCloseImport() {
    setIsImportOpen(false);
    importMutation.reset();
  }

  function getExportUrl() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("sortBy", sortBy);
    params.set("order", order);
    return `${API_BASE_URL}/transactions/export?${params.toString()}`;
  }

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load transactions.</p>;

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h2>Transactions</h2>
        <div className="transactions-header-actions">
          <a href={getExportUrl()} download="transactions.csv">
            Export CSV
          </a>
          <button onClick={() => setIsImportOpen(true)}>Import CSV</button>
          <button onClick={() => setIsTransferOpen(true)}>Transfer</button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
          >
            + Add Transaction
          </button>
        </div>
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

      {isImportOpen && (
        <ImportCsvModal
          accounts={accounts ?? []}
          onImport={(formData) => importMutation.mutate(formData)}
          onClose={handleCloseImport}
          isImporting={importMutation.isPending}
          result={getImportResult()}
          error={getImportError()}
        />
      )}

      {isTransferOpen && (
        <TransferModal
          accounts={accounts ?? []}
          onSubmit={(data) => transferMutation.mutate(data)}
          onClose={() => {
            setIsTransferOpen(false);
            transferMutation.reset();
          }}
          error={getTransferError()}
          isSubmitting={transferMutation.isPending}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Delete Transaction"
          message={`Delete "${confirmTarget.description}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

export default Transactions;