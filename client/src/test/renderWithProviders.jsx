import { render } from "@testing-library/react";
import CurrencyProvider from "../context/CurrencyProvider";

function renderWithProviders(ui) {
  return render(<CurrencyProvider>{ui}</CurrencyProvider>);
}

export default renderWithProviders;
