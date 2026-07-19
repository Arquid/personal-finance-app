import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "../../test/renderWithProviders";
import PotCard from "./PotCard";

const basePot = {
  id: 1,
  name: "Vacation",
  currentAmount: "750",
  targetAmount: "2000",
  color: "#0984e3",
};

describe("PotCard", () => {
  it("renders the pot name and formatted amounts", () => {
    renderWithProviders(<PotCard pot={basePot} onEdit={() => {}} onDelete={() => {}} onDeposit={() => {}} onWithdraw={() => {}} />);
    expect(screen.getByText("Vacation")).toBeInTheDocument();
    expect(screen.getByText("$750.00")).toBeInTheDocument();
    expect(screen.getByText("of $2,000.00")).toBeInTheDocument();
  });

  it("calculates the progress percentage from currentAmount / targetAmount", () => {
    renderWithProviders(<PotCard pot={basePot} onEdit={() => {}} onDelete={() => {}} onDeposit={() => {}} onWithdraw={() => {}} />);
    expect(screen.getByText("38%")).toBeInTheDocument(); // 750 / 2000 = 37.5 -> rounds to 38
  });

  it("caps the progress percentage at 100% even if the pot is over-funded", () => {
    const overfunded = { ...basePot, currentAmount: "2500", targetAmount: "2000" };
    renderWithProviders(<PotCard pot={overfunded} onEdit={() => {}} onDelete={() => {}} onDeposit={() => {}} onWithdraw={() => {}} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("calls onDeposit with the pot when 'Add Money' is clicked", async () => {
    const onDeposit = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<PotCard pot={basePot} onEdit={() => {}} onDelete={() => {}} onDeposit={onDeposit} onWithdraw={() => {}} />);
    await user.click(screen.getByText("+ Add Money"));
    expect(onDeposit).toHaveBeenCalledWith(basePot);
  });

  it("calls onWithdraw with the pot when 'Withdraw' is clicked", async () => {
    const onWithdraw = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<PotCard pot={basePot} onEdit={() => {}} onDelete={() => {}} onDeposit={() => {}} onWithdraw={onWithdraw} />);
    await user.click(screen.getByText("- Withdraw"));
    expect(onWithdraw).toHaveBeenCalledWith(basePot);
  });

  it("calls onDelete with the pot when 'Delete' is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<PotCard pot={basePot} onEdit={() => {}} onDelete={onDelete} onDeposit={() => {}} onWithdraw={() => {}} />);
    await user.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(basePot);
  });
});
