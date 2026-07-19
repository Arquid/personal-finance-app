import { useContext } from "react";
import { CurrencyContext } from "../context/currencyContext";

function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}

export default useCurrency;
