import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useModal from "../../hooks/useModal";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetAmount: z.coerce.number().positive("Target amount must be greater than 0"),
  color: z.string().min(1, "Color is required"),
});

const COLOR_OPTIONS = ["#0984e3", "#6c5ce7", "#d63031", "#e84393", "#00b894", "#fdcb6e", "#00cec9", "#e17055"];

function PotFormModal({ initialData, onSubmit, onClose }) {
  const modalRef = useModal(onClose);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      targetAmount: initialData?.targetAmount ?? "",
      color: initialData?.color ?? COLOR_OPTIONS[0],
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <h3>{initialData ? "Edit Pot" : "Add Pot"}</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Name
            <input type="text" {...register("name")} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>

          <label>
            Target Amount
            <input type="number" step="0.01" {...register("targetAmount")} />
            {errors.targetAmount && (
              <span className="field-error">{errors.targetAmount.message}</span>
            )}
          </label>

          <label>
            Color
            <select {...register("color")}>
              {COLOR_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
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

export default PotFormModal;