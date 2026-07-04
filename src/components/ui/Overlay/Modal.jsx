import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Modal — centered dialog with backdrop.
 *
 * Props:
 *  - open: boolean
 *  - onClose: called on backdrop click, Escape key, or close button
 *  - title, description: optional header content
 *  - size: "sm" | "md" | "lg" | "xl"
 *  - footer: ReactNode — rendered in a bottom action bar
 */
export default function Modal({ open, onClose, title, description, size = "md", footer, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full rounded-[var(--radius-lg)] border border-[var(--border)]",
              "bg-[var(--surface)] shadow-soft-lg outline-none max-h-[85vh] flex flex-col",
              SIZES[size]
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 p-6 pb-4">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="shrink-0 rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-inset)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            <div className="px-6 pb-6 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] p-5 px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
