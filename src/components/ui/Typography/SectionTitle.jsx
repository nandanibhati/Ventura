import { cn } from "../../../lib/utils";

/**
 * SectionTitle — consistent heading block used to open a page section
 * (an eyebrow label, a serif heading, and an optional description),
 * with a slot for a trailing action (e.g. "View all").
 *
 * Props:
 *  - eyebrow: small uppercase label above the heading
 *  - as: heading tag, defaults to "h2"
 *  - align: "left" | "center"
 *  - action: ReactNode rendered at the right (hidden when align="center")
 */
export default function SectionTitle({
  eyebrow,
  title,
  description,
  as: Tag = "h2",
  align = "left",
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-6 mb-8",
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div className={align === "center" ? "max-w-xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-gold-500 mb-3">
            {eyebrow}
          </p>
        )}
        <Tag
          className="text-3xl sm:text-4xl font-medium text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </Tag>
        {description && (
          <p className="mt-3 text-[15px] text-[var(--text-muted)] leading-relaxed">{description}</p>
        )}
      </div>
      {action && align !== "center" && <div className="shrink-0">{action}</div>}
    </div>
  );
}
