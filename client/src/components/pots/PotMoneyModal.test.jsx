import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "../../test/renderWithProviders";
import PotMoneyModal from "./PotMoneyModal";

const pot = { id: 1, name: "Vacation", currentAmount: "750" };

describe("PotMoneyModal", () => {
  it("shows an 'Add money to' heading and Add button in deposit mode", () => {
    renderWithProviders(
      <PotMoneyModal pot={pot} mode="deposit" onSubmit={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Add money to Vacation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("shows a 'Withdraw from' heading and Withdraw button in withdraw mode", () => {
    renderWithProviders(
      <PotMoneyModal pot={pot} mode="withdraw" onSubmit={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Withdraw from Vacation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Withdraw" })).toBeInTheDocument();
  });

  it("shows the pot's current amount, formatted", () => {
    renderWithProviders(
      <PotMoneyModal pot={pot} mode="deposit" onSubmit={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Current: $750.00")).toBeInTheDocument();
  });

  it("shows a validation error when the amount is zero", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PotMoneyModal pot={pot} mode="deposit" onSubmit={() => {}} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Amount"), "0");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByText("Amount must be greater than 0")).toBeInTheDocument();
  });

  it("submits the entered amount as a number", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(
      <PotMoneyModal pot={pot} mode="deposit" onSubmit={onSubmit} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Amount"), "50");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(onSubmit).toHaveBeenCalledWith(50);
  });

  it("shows a server-side error message when the error prop is set", () => {
    renderWithProviders(
      <PotMoneyModal
        pot={pot}
        mode="withdraw"
        onSubmit={() => {}}
        onClose={() => {}}
        error="Insufficient balance"
      />,
    );
    expect(screen.getByText("Insufficient balance")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <PotMoneyModal pot={pot} mode="deposit" onSubmit={() => {}} onClose={onClose} />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});