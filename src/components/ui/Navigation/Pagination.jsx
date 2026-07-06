import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";

function getPageNumbers(current, total) {
  const nums = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return nums;
}

/**
 * Pagination — numbered page control with smart ellipsis collapsing.
 *
 * Props:
 *  - page: current page (1-indexed)
 *  - totalPages: number
 *  - onChange: (page: number) => void
 */
export default function Pagination({ page, totalPages, onChange, className }) {
  if (totalPages <= 1) return null;
  const numbers = getPageNumbers(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className={cn(
          "grid size-10 place-items-center rounded-[var(--radius-sm)] border border-[var(--border)]",
          "text-[var(--text-muted)] transition-colors hover:border-gold-400 hover:text-gold-500",
          "disabled:opacity-35 disabled:pointer-events-none"
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      {numbers.map((n, i) =>
        n === "…" ? (
          <span key={`dots-${i}`} className="px-1 text-[var(--text-muted)]">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            aria-current={page === n ? "page" : undefined}
            className={cn(
              "min-w-10 h-10 px-2 rounded-[var(--radius-sm)] text-sm transition-colors",
              page === n
                ? "bg-gold-400 text-white font-medium"
                : "border border-[var(--border)] text-[var(--text-muted)] hover:border-gold-400 hover:text-gold-500"
            )}
          >
            {n}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
        className={cn(
          "grid size-10 place-items-center rounded-[var(--radius-sm)] border border-[var(--border)]",
          "text-[var(--text-muted)] transition-colors hover:border-gold-400 hover:text-gold-500",
          "disabled:opacity-35 disabled:pointer-events-none"
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
