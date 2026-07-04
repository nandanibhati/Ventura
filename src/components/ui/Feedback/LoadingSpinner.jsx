import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

const SIZES = { sm: "size-4", md: "size-6", lg: "size-9" };

/**
 * LoadingSpinner — indeterminate progress indicator.
 * Pass `label` for a visible caption; it's always announced to
 * screen readers via role="status".
 */
export default function LoadingSpinner({ size = "md", label, className }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2.5 text-gold-500", className)}>
      <Loader2 className={cn("animate-spin", SIZES[size])} aria-hidden="true" />
      {label && <span className="text-sm text-[var(--text-muted)]">{label}</span>}
      <span className="sr-only">{label || "Loading"}</span>
    </span>
  );
}
