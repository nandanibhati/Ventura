import { PackageSearch } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * EmptyState — "nothing here yet" placeholder (empty cart, no search
 * results, no orders). Pass an `action` (e.g. a PrimaryButton) to give
 * the user a next step.
 */
export default function EmptyState({
  icon: Icon = PackageSearch,
  title = "Nothing here yet",
  description,
  action,
  className,
}) {
  return (
    <div className={cn("flex flex-col items-center text-center py-16 px-6", className)}>
      <span className="flex items-center justify-center size-16 rounded-full bg-[var(--surface-inset)] mb-5">
        <Icon className="size-7 text-[var(--text-muted)]" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-[var(--text-muted)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
