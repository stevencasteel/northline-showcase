import { createPortal } from "react-dom";
import { useRef, type ReactNode } from "react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useDialogFocus } from "../hooks/useDialogFocus";

type DialogModalProps = {
  children: ReactNode;
  backdropClassName: string;
  dialogClassName: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  closing?: boolean;
  onClose: () => void;
  onDialogAnimationEnd?: (event: React.AnimationEvent<HTMLElement>) => void;
};

export function DialogModal({
  children,
  backdropClassName,
  dialogClassName,
  ariaLabel,
  ariaLabelledBy,
  closing = false,
  onClose,
  onDialogAnimationEnd,
}: DialogModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  useBodyScrollLock(true);
  useDialogFocus(dialogRef, onClose);

  return createPortal(
    <div
      className={`${backdropClassName}${closing ? " is-closing" : ""}`}
      role="presentation"
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className={`${dialogClassName}${closing ? " is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        ref={dialogRef}
        onAnimationEnd={onDialogAnimationEnd}
      >
        {children}
      </section>
    </div>,
    document.body,
  );
}
