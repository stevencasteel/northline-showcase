import { useEffect, type RefObject } from "react";

export function useDialogFocusManagement(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const lockedScrollX = window.scrollX;
    const lockedScrollY =
      getComputedStyle(document.body).position === "fixed"
        ? -parseFloat(document.body.style.top || "0")
        : window.scrollY;
    if (!dialog) return;
    let initialFocusFrame = 0;
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = focusable();
      if (!controls.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (dialog.contains(event.target as Node)) return;
      (focusable()[0] ?? dialog).focus();
    };
    dialog.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    initialFocusFrame = requestAnimationFrame(() => {
      const target = focusable()[0] ?? dialog;
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
    });
    return () => {
      cancelAnimationFrame(initialFocusFrame);
      dialog.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      if (previous) {
        try {
          previous.focus({ preventScroll: true });
        } catch {
          previous.focus();
        }
      }
      const restoreScroll = () =>
        window.scrollTo({
          left: lockedScrollX,
          top: lockedScrollY,
          behavior: "auto",
        });
      restoreScroll();
      window.requestAnimationFrame(() => {
        restoreScroll();
        window.setTimeout(restoreScroll, 0);
      });
    };
  }, [onClose, ref]);
}
