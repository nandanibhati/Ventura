import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * StatCard — single metric with optional trend indicator, for
 * dashboards (admin panel, seller analytics, order summaries).
 *
 * Props:
 *  - label, value: e.g. "Revenue", "£128,400"
 *  - icon: Lucide icon component
 *  - trend: { direction: "up" | "down", value: "12.4%" }
 */
export default function StatCard({ label, value, icon: Icon, trend, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6",
        "shadow-soft-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
        {Icon && (
          <span className="grid size-8 place-items-center rounded-full bg-gold-400/12 text-gold-500">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-3xl font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              trend.direction === "up" ? "bg-success-500/12 text-success-600" : "bg-error-500/12 text-error-600"
            )}
          >
            {trend.direction === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
