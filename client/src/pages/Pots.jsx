import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPots, createPot, updatePot, deletePot, depositToPot, withdrawFromPot } from "../api/client";
import PotCard from "../components/pots/PotCard";
import PotFormModal from "../components/pots/PotFormModal";
import PotMoneyModal from "../components/pots/PotMoneyModal";
import "../stylesheets/Pots.css";

function Pots() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPot, setEditingPot] = useState(null);
  const [moneyModal, setMoneyModal] = useState(null);
  const [moneyError, setMoneyError] = useState("");

  const { data: pots, isLoading } = useQuery({ queryKey: ["pots"], queryFn: getPots });

  function invalidatePots() {
    queryClient.invalidateQueries({ queryKey: ["pots"] });
  }

  const createMutation = useMutation({
    mutationFn: createPot,
    onSuccess: () => {
      invalidatePots();
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: body }) => updatePot(id, body),
    onSuccess: () => {
      invalidatePots();
      setIsFormOpen(false);
      setEditingPot(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePot,
    onSuccess: invalidatePots,
  });

  const depositMutation = useMutation({
    mutationFn: ({ id, amount }) => depositToPot(id, amount),
    onSuccess: () => {
      invalidatePots();
      setMoneyModal(null);
    },
    onError: (error) => {
      setMoneyError(error.response?.data?.error ?? "Something went wrong.");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: ({ id, amount }) => withdrawFromPot(id, amount),
    onSuccess: () => {
      invalidatePots();
      setMoneyModal(null);
    },
    onError: (error) => {
      setMoneyError(error.response?.data?.error ?? "Something went wrong.");
    },
  });

  if (isLoading) return <p>Loading...</p>;

  function handleEdit(pot) {
    setEditingPot(pot);
    setIsFormOpen(true);
  }

  function handleDelete(pot) {
    if (window.confirm(`Delete the "${pot.name}" pot?`)) {
      deleteMutation.mutate(pot.id);
    }
  }

  function handleFormSubmit(formData) {
    if (editingPot) {
      updateMutation.mutate({ id: editingPot.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingPot(null);
  }

  function handleOpenMoneyModal(pot, mode) {
    setMoneyError("");
    setMoneyModal({ pot, mode });
  }

  function handleMoneySubmit(amount) {
    setMoneyError("");
    if (moneyModal.mode === "withdraw") {
      withdrawMutation.mutate({ id: moneyModal.pot.id, amount });
    } else {
      depositMutation.mutate({ id: moneyModal.pot.id, amount });
    }
  }

  return (
    <div className="pots-page">
      <div className="pots-header">
        <h2>Pots</h2>
        <button
          onClick={() => {
            setEditingPot(null);
            setIsFormOpen(true);
          }}
        >
          + Add Pot
        </button>
      </div>

      <div className="pots-grid">
        {(pots ?? []).map((pot) => (
          <PotCard
            key={pot.id}
            pot={pot}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeposit={(p) => handleOpenMoneyModal(p, "deposit")}
            onWithdraw={(p) => handleOpenMoneyModal(p, "withdraw")}
          />
        ))}
      </div>

      {isFormOpen && (
        <PotFormModal initialData={editingPot} onSubmit={handleFormSubmit} onClose={handleCloseForm} />
      )}

      {moneyModal && (
        <PotMoneyModal
          pot={moneyModal.pot}
          mode={moneyModal.mode}
          onSubmit={handleMoneySubmit}
          onClose={() => setMoneyModal(null)}
          error={moneyError}
        />
      )}
    </div>
  );
}

export default Pots;