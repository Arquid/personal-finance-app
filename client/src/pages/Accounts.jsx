import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccounts, createAccount, updateAccount, deleteAccount } from "../api/client";
import AccountCard from "../components/accounts/AccountCard";
import AccountFormModal from "../components/accounts/AccountFormModal";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import "../stylesheets/Accounts.css";

function Accounts() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const { data: accounts, isLoading } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });

  function invalidateAccounts() {
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  }

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      invalidateAccounts();
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: body }) => updateAccount(id, body),
    onSuccess: () => {
      invalidateAccounts();
      setIsFormOpen(false);
      setEditingAccount(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: invalidateAccounts,
  });

  if (isLoading) return <p>Loading...</p>;

  function handleEdit(account) {
    setEditingAccount(account);
    setIsFormOpen(true);
  }

  function handleDelete(account) {
    setConfirmTarget(account);
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(confirmTarget.id);
    setConfirmTarget(null);
  }

  function handleFormSubmit(formData) {
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingAccount(null);
  }

  return (
    <div className="accounts-page">
      <div className="accounts-header">
        <h2>Accounts</h2>
        <button
          onClick={() => {
            setEditingAccount(null);
            setIsFormOpen(true);
          }}
        >
          + Add Account
        </button>
      </div>

      {(accounts ?? []).length > 0 ? (
        <div className="accounts-grid">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p>No accounts yet. Add one to get started.</p>
      )}

      {isFormOpen && (
        <AccountFormModal
          initialData={editingAccount}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Delete Account"
          message={`Delete "${confirmTarget.name}"? This will also permanently delete all transactions on this account.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

export default Accounts;
