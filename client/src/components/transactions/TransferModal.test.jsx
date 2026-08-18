import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "../../test/renderWithProviders";
import TransferModal from "./TransferModal";

const accounts = [
  { id: 1, name: "Checking", balance: "1000" },
  { id: 2, name: "Savings", balance: "500" },
];

describe("TransferModal", () => {
  it("renders account options with formatted balances", () => {
    renderWithProviders(
      <TransferModal accounts={accounts} onSubmit={() => {}} onClose={() => {}} error={null} isSubmitting={false} />,
    );
    expect(screen.getAllByText("Checking ($1,000.00)")).toHaveLength(2);
    expect(screen.getAllByText("Savings ($500.00)")).toHaveLength(2);
  });

  it("defaults From/To to the first two different accounts", () => {
    renderWithProviders(
      <TransferModal accounts={accounts} onSubmit={() => {}} onClose={() => {}} error={null} isSubmitting={false} />,
    );
    expect(screen.getByLabelText("From")).toHaveValue("1");
    expect(screen.getByLabelText("To")).toHaveValue("2");
  });

  it("shows a validation error when the amount is not positive", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TransferModal accounts={accounts} onSubmit={() => {}} onClose={() => {}} error={null} isSubmitting={false} />,
    );
    await user.type(screen.getByLabelText("Amount"), "0");
    await user.click(screen.getByText("Transfer"));
    expect(await screen.findByText("Amount must be greater than 0")).toBeInTheDocument();
  });

  it("shows a validation error when the same account is chosen for both sides", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TransferModal accounts={accounts} onSubmit={() => {}} onClose={() => {}} error={null} isSubmitting={false} />,
    );
    await user.selectOptions(screen.getByLabelText("To"), "1");
    await user.type(screen.getByLabelText("Amount"), "50");
    await user.click(screen.getByText("Transfer"));
    expect(await screen.findByText("Choose two different accounts")).toBeInTheDocument();
  });

  it("submits the form with the entered values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(
      <TransferModal accounts={accounts} onSubmit={onSubmit} onClose={() => {}} error={null} isSubmitting={false} />,
    );
    await user.type(screen.getByLabelText("Amount"), "200");
    await user.click(screen.getByText("Transfer"));
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual({ fromAccountId: 1, toAccountId: 2, amount: 200 });
  });

  it("shows the server error passed in via the error prop", () => {
    renderWithProviders(
      <TransferModal
        accounts={accounts}
        onSubmit={() => {}}
        onClose={() => {}}
        error="Cannot transfer more than the account balance"
        isSubmitting={false}
      />,
    );
    expect(screen.getByText("Cannot transfer more than the account balance")).toBeInTheDocument();
  });

  it("disables the submit button and shows 'Transferring...' while isSubmitting", () => {
    renderWithProviders(
      <TransferModal accounts={accounts} onSubmit={() => {}} onClose={() => {}} error={null} isSubmitting={true} />,
    );
    expect(screen.getByText("Transferring...")).toBeDisabled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <TransferModal accounts={accounts} onSubmit={() => {}} onClose={onClose} error={null} isSubmitting={false} />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});