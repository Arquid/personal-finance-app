import { useState, useCallback, useMemo } from "react";
import { CurrencyContext, CURRENCIES, STORAGE_KEY } from "./currencyContext";

function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && CURRENCIES[stored] ? stored : "USD";
  });

  const setCurrency = useCallback((code) => {
    if (!CURRENCIES[code]) return;
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const formatCurrency = useCallback(
    (value) => {
      const { locale } = CURRENCIES[currency];
      return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
    },
    [currency],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, formatCurrency, currencies: CURRENCIES }),
    [currency, setCurrency, formatCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export default CurrencyProvider;
