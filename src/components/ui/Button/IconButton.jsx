import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

const SIZES = {
  sm: "size-8 [&_svg]:size-3.5",
  md: "size-10 [&_svg]:size-4",
  lg: "size-12 [&_svg]:size-5",
};

const VARIANTS = {
  ghost: "bg-transparent border border-transparent hover:bg-[var(--surface-inset)] hover:border-[var(--border)]",
  outline: "bg-transparent border border-[var(--border)] hover:border-gold-400",
  solid: "bg-[var(--surface-inset)] border border-[var(--border)] hover:border-gold-400",
};

/**
 * IconButton — circular, icon-only control (wishlist, close, edit, etc).
 * Always requires an `aria-label` since it has no visible text.
 *
 * Props:
 *  - icon: Lucide icon component (required)
 *  - variant: "ghost" | "outline" | "solid"
 *  - active: boolean — highlights in gold, e.g. a toggled wishlist heart
 */
const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    size = "md",
    variant = "ghost",
    active = false,
    disabled = false,
    className,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={props.role === "switch" || props["aria-pressed"] !== undefined ? props["aria-pressed"] : undefined}
      whileHover={!disabled ? { scale: 1.08 } : undefined}
      whileTap={!disabled ? { scale: 0.94 } : undefined}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors duration-300",
        "text-[var(--text-primary)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        VARIANTS[variant],
        active && "!border-gold-400 !text-gold-500 bg-gold-400/10",
        SIZES[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" />}
    </motion.button>
  );
});

export default IconButton;
