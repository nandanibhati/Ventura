import { cn } from "../../../lib/utils";

const VARIANTS = {
  gold: "bg-gold-400/12 text-gold-600 dark:text-gold-300 border-gold-400/30",
  neutral: "bg-[var(--surface-inset)] text-[var(--text-muted)] border-[var(--border)]",
  success: "bg-success-500/12 text-success-600 dark:text-success-500 border-success-500/25",
  error: "bg-error-500/12 text-error-600 dark:text-error-500 border-error-500/25",
  warning: "bg-warning-500/12 text-warning-500 border-warning-500/25",
};

/**
 * Badge — small static status label (e.g. "New", "Sold out", "-20%").
 * Not interactive — see Chip for a removable/clickable variant.
 */
export default function Badge({ children, variant = "neutral", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wider",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
