import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ToastContext } from "./useToast";

const VARIANTS = {
  success: { icon: CheckCircle2, color: "text-success-500" },
  error: { icon: XCircle, color: "text-error-500" },
  warning: { icon: AlertTriangle, color: "text-warning-500" },
  info: { icon: Info, color: "text-gold-500" },
};

/**
 * ToastProvider — wrap your app once near the root:
 *   <ToastProvider><App /></ToastProvider>
 *
 * Then anywhere in the tree:
 *   const { toast } = useToast();
 *   toast({ title: "Saved", description: "Your changes are live.", variant: "success" });
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = 4000, action }) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, title, description, variant, action }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(360px,calc(100vw-2.5rem))]"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} {...t} onClose={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ title, description, variant, action, onClose }) {
  const { icon: Icon, color } = VARIANTS[variant] ?? VARIANTS.info;

  return (
    <motion.div
      role="status"
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]",
        "shadow-soft-lg p-4"
      )}
    >
      <Icon className={cn("size-5 shrink-0 mt-0.5", color)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>}
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
        {action && (
          <button
            onClick={() => {
              action.onClick?.();
              onClose();
            }}
            className="mt-1.5 text-xs font-semibold text-gold-600 hover:underline dark:text-gold-400"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}
