import { createContext } from "react";

export const CURRENCIES = {
  USD: { locale: "en-US", label: "US Dollar ($)" },
  EUR: { locale: "de-DE", label: "Euro (€)" },
  GBP: { locale: "en-GB", label: "British Pound (£)" },
};

export const STORAGE_KEY = "finance-app-currency";

export const CurrencyContext = createContext(null);
