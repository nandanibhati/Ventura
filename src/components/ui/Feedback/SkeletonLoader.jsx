import { cn } from "../../../lib/utils";

/**
 * SkeletonLoader — content placeholder shown while data loads.
 *
 * Props:
 *  - variant: "text" | "circle" | "rect" | "card"
 *  - width, height: CSS length (e.g. "60%", "24px")
 */
export default function SkeletonLoader({ variant = "text", width, height, className }) {
  const base = "animate-pulse bg-gradient-to-r from-[var(--surface-inset)] via-[var(--surface-muted)] to-[var(--surface-inset)]";

  if (variant === "card") {
    return (
      <div className={cn("rounded-[var(--radius-lg)] border border-[var(--border)] p-4 space-y-3", className)}>
        <div className={cn(base, "rounded-[var(--radius-md)] aspect-[4/5]")} />
        <div className={cn(base, "h-3 rounded-full w-2/3")} />
        <div className={cn(base, "h-3 rounded-full w-1/3")} />
      </div>
    );
  }

  const shapeClass = {
    text: "h-3.5 rounded-full",
    circle: "rounded-full aspect-square",
    rect: "rounded-[var(--radius-md)]",
  }[variant];

  return (
    <div
      className={cn(base, shapeClass, className)}
      style={{ width: width ?? (variant === "text" ? "100%" : undefined), height }}
      aria-hidden="true"
    />
  );
}
