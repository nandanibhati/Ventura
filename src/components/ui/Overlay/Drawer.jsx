import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";

const SIDE_CONFIG = {
  left: { edge: "left-0", from: { x: "-100%" }, radius: "rounded-r-[var(--radius-lg)]" },
  right: { edge: "right-0", from: { x: "100%" }, radius: "rounded-l-[var(--radius-lg)]" },
};

/**
 * Drawer — off-canvas panel for filters, cart preview, mobile nav, etc.
 *
 * Props:
 *  - open, onClose: as Modal
 *  - side: "left" | "right"
 *  - width: CSS width, e.g. "380px" (default) or "min(400px, 90vw)"
 */
export default function Drawer({ open, onClose, side = "right", width = "min(380px, 90vw)", title, children, footer }) {
  const cfg = SIDE_CONFIG[side];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKeyDown);
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
        <div className="fixed inset-0 z-[90]">
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
            role="dialog"
            aria-modal="true"
            aria-label={title || "Panel"}
            initial={cfg.from}
            animate={{ x: 0 }}
            exit={cfg.from}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ width }}
            className={cn(
              "absolute top-0 h-full bg-[var(--surface)] border-[var(--border)] shadow-soft-lg flex flex-col",
              side === "left" ? "border-r" : "border-l",
              cfg.edge,
              cfg.radius
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close panel"
                  className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-inset)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            {footer && <div className="border-t border-[var(--border)] p-5 px-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
