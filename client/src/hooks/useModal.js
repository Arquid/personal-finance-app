import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useModal(onClose) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initialFocusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
    if (initialFocusable.length > 0) {
      initialFocusable[0].focus();
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const elements = container.querySelectorAll(FOCUSABLE_SELECTOR);
        if (elements.length === 0) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return containerRef;
}

export default useModal;
