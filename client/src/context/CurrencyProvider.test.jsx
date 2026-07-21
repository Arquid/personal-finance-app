import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrencyProvider from "./CurrencyProvider";
import useCurrency from "../hooks/useCurrency";
import { STORAGE_KEY } from "./currencyContext";

function TestConsumer() {
  const { currency, setCurrency, formatCurrency } = useCurrency();
  return (
    <div>
      <span data-testid="currency">{currency}</span>
      <span data-testid="formatted">{formatCurrency(1234.5)}</span>
      <button onClick={() => setCurrency("EUR")}>Switch to EUR</button>
      <button onClick={() => setCurrency("not-a-currency")}>Switch to invalid</button>
    </div>
  );
}

describe("CurrencyProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to USD when nothing is stored", () => {
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId("currency")).toHaveTextContent("USD");
    expect(screen.getByTestId("formatted")).toHaveTextContent("$1,234.50");
  });

  it("switches currency and reformats amounts app-wide", async () => {
    const user = userEvent.setup();
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    await user.click(screen.getByText("Switch to EUR"));
    expect(screen.getByTestId("currency")).toHaveTextContent("EUR");
    expect(screen.getByTestId("formatted")).toHaveTextContent("1.234,50 €");
  });

  it("persists the selected currency to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    await user.click(screen.getByText("Switch to EUR"));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("EUR");
  });

  it("restores the previously selected currency from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "GBP");
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId("currency")).toHaveTextContent("GBP");
  });

  it("ignores an unknown stored currency code and falls back to USD", () => {
    localStorage.setItem(STORAGE_KEY, "not-a-real-code");
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId("currency")).toHaveTextContent("USD");
  });

  it("ignores a setCurrency call with an unknown currency code", async () => {
    const user = userEvent.setup();
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    await user.click(screen.getByText("Switch to invalid"));
    expect(screen.getByTestId("currency")).toHaveTextContent("USD");
  });

  it("throws when useCurrency is used outside a CurrencyProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useCurrency must be used within a CurrencyProvider",
    );
    consoleError.mockRestore();
  });
});
