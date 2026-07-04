import { ChevronRight, Home } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Breadcrumb — navigational trail.
 *
 * Props:
 *  - items: [{ label, href }] — the last item is rendered as the
 *    current page (not a link) automatically.
 *  - showHome: prepends a home icon link to "/"
 */
export default function Breadcrumb({ items = [], showHome = true, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      {showHome && (
        <>
          <a href="/" className="text-[var(--text-muted)] hover:text-gold-500 transition-colors" aria-label="Home">
            <Home className="size-3.5" />
          </a>
          {items.length > 0 && <ChevronRight className="size-3.5 text-[var(--text-muted)]/50" aria-hidden="true" />}
        </>
      )}
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-[var(--text-primary)] font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a href={item.href} className="text-[var(--text-muted)] hover:text-gold-500 transition-colors">
                {item.label}
              </a>
            )}
            {!isLast && <ChevronRight className="size-3.5 text-[var(--text-muted)]/50" aria-hidden="true" />}
          </span>
        );
      })}
    </nav>
  );
}
