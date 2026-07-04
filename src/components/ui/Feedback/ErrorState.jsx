import { AlertOctagon, RotateCcw } from "lucide-react";
import { cn } from "../../../lib/utils";
import SecondaryButton from "../Button/SecondaryButton";

/**
 * ErrorState — shown when a request/page fails. Distinct from EmptyState
 * so the two convey clearly different meanings (nothing to show vs.
 * something went wrong).
 *
 * Props:
 *  - onRetry: shows a "Try again" button when provided
 */
export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this page. Please try again.",
  onRetry,
  className,
}) {
  return (
    <div className={cn("flex flex-col items-center text-center py-16 px-6", className)}>
      <span className="flex items-center justify-center size-16 rounded-full bg-error-500/10 mb-5">
        <AlertOctagon className="size-7 text-error-500" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <p className="mt-2 text-sm text-[var(--text-muted)] max-w-sm">{description}</p>
      {onRetry && (
        <div className="mt-6">
          <SecondaryButton leftIcon={RotateCcw} onClick={onRetry}>
            Try again
          </SecondaryButton>
        </div>
      )}
    </div>
  );
}
