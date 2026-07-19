import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useModal from "./useModal";

function TestModal({ onClose }) {
  const { containerRef, headingId } = useModal(onClose);
  return (
    <div ref={containerRef} role="dialog" aria-labelledby={headingId}>
      <h3 id={headingId}>Test Modal</h3>
      <input type="text" placeholder="First field" />
      <input type="text" placeholder="Disabled field" disabled />
      <button type="button">Cancel</button>
      <button type="submit">Submit</button>
    </div>
  );
}

describe("useModal", () => {
  it("focuses the first focusable element on mount", () => {
    render(<TestModal onClose={() => {}} />);
    expect(screen.getByPlaceholderText("First field")).toHaveFocus();
  });

  it("skips disabled elements when choosing the initial focus target", () => {
    render(<TestModal onClose={() => {}} />);
    expect(screen.getByPlaceholderText("Disabled field")).not.toHaveFocus();
  });

  it("sets aria-labelledby on the container to the heading's id", () => {
    render(<TestModal onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    const heading = screen.getByText("Test Modal");
    expect(dialog).toHaveAttribute("aria-labelledby", heading.id);
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<TestModal onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("wraps focus from the last focusable element back to the first on Tab", async () => {
    const user = userEvent.setup();
    render(<TestModal onClose={() => {}} />);
    screen.getByText("Submit").focus();
    await user.tab();
    expect(screen.getByPlaceholderText("First field")).toHaveFocus();
  });

  it("wraps focus from the first focusable element to the last on Shift+Tab", async () => {
    const user = userEvent.setup();
    render(<TestModal onClose={() => {}} />);
    screen.getByPlaceholderText("First field").focus();
    await user.tab({ shift: true });
    expect(screen.getByText("Submit")).toHaveFocus();
  });
});
