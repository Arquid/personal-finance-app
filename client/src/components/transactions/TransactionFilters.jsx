import { useState, useEffect } from "react";

function TransactionFilters({ search, onSearchChange, category, onCategoryChange, categories }) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timeout);
  }, [localSearch, onSearchChange]);

  return (
    <div className="transaction-filters">
      <input
        type="text"
        placeholder="Search transactions..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        aria-label="Search transactions"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TransactionFilters;