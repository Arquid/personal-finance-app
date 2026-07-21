import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders the title and message", () => {
    render(
      <ConfirmDialog
        title="Delete Pot"
        message='Delete the "Vacation" pot?'
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByText("Delete Pot")).toBeInTheDocument();
    expect(screen.getByText('Delete the "Vacation" pot?')).toBeInTheDocument();
  });

  it("exposes an alertdialog role for assistive technology", () => {
    render(<ConfirmDialog title="Delete Pot" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("defaults the confirm button label to 'Delete'", () => {
    render(<ConfirmDialog title="Delete Pot" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("uses a custom confirmLabel when provided", () => {
    render(
      <ConfirmDialog
        title="Archive Bill"
        message="Sure?"
        confirmLabel="Archive"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Delete Pot" message="Sure?" onConfirm={onConfirm} onCancel={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Delete Pot" message="Sure?" onConfirm={() => {}} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Escape is pressed", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Delete Pot" message="Sure?" onConfirm={() => {}} onCancel={onCancel} />);
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when the overlay is clicked but not when the dialog itself is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ConfirmDialog title="Delete Pot" message="Sure?" onConfirm={() => {}} onCancel={onCancel} />,
    );
    await user.click(screen.getByText("Sure?"));
    expect(onCancel).not.toHaveBeenCalled();

    await user.click(container.querySelector(".modal-overlay"));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
