import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Chip — interactive tag, used for active filters or selectable options.
 *
 * Props:
 *  - selected: boolean — filled gold state
 *  - onClick: makes the whole chip clickable (e.g. filter toggle)
 *  - onRemove: shows a trailing X and calls this on click
 */
export default function Chip({ children, selected = false, onClick, onRemove, className, ...props }) {
  const isInteractive = Boolean(onClick);

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => (e.key === "Enter" || e.key === " ") && onClick(e) : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors duration-200",
        selected
          ? "bg-gold-400 border-gold-400 text-white"
          : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]",
        isInteractive && "cursor-pointer hover:border-gold-400",
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          aria-label="Remove"
          className={cn("rounded-full p-0.5 -mr-1", selected ? "hover:bg-ink-950/10" : "hover:bg-[var(--surface-inset)]")}
        >
          <X className="size-3" />
        </button>
      )}
    </motion.span>
  );
}
