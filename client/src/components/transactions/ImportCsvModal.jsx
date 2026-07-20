import { useState } from "react";
import useModal from "../../hooks/useModal";

function ImportCsvModal({ accounts, onImport, onClose, isImporting, result, error }) {
  const { containerRef, headingId } = useModal(onClose);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [file, setFile] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!file || !accountId) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);
    onImport(formData);
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
        <h3 id={headingId}>Import Transactions from CSV</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Account
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files[0] ?? null)}
            />
          </label>
          <p className="csv-hint">
            Columns: date, description, merchant (optional), amount, category (optional)
          </p>

          {error && <span className="field-error">{error}</span>}

          {result && (
            <div className="csv-result">
              <p>
                Imported {result.imported} of {result.totalRows} row
                {result.totalRows === 1 ? "" : "s"}
                {result.skipped > 0 ? ` (${result.skipped} skipped)` : ""}.
              </p>
              {result.errors.length > 0 && (
                <ul className="csv-errors">
                  {result.errors.map((e) => (
                    <li key={e.row}>
                      Row {e.row}: {e.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Close
            </button>
            <button type="submit" disabled={!file || !accountId || isImporting}>
              {isImporting ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImportCsvModal;