import useModal from "../../hooks/useModal";

function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  const { containerRef, headingId } = useModal(onCancel);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        ref={containerRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={headingId}>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;