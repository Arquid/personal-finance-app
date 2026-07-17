function Pagination({ page, totalPages, onPageChange }) {
  function handleKeyDown(e) {
    if (e.key === "ArrowLeft" && page > 1) {
      onPageChange(page - 1);
    } else if (e.key === "ArrowRight" && page < totalPages) {
      onPageChange(page + 1);
    }
  }

  return (
    <div
      className="pagination"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label="Pagination"
    >
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  );
}

export default Pagination;