import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

const SIZES = {
  sm: "h-9 px-4 text-[13px] gap-1.5 [&_svg]:size-3.5",
  md: "h-11 px-6 text-sm gap-2 [&_svg]:size-4",
  lg: "h-[52px] px-8 text-[15px] gap-2.5 [&_svg]:size-[18px]",
};

/**
 * OutlineButton — transparent, bordered. Best for tertiary actions
 * sitting on top of imagery or colored surfaces.
 */
const OutlineButton = forwardRef(function OutlineButton(
  {
    children,
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className,
    href,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      ref={ref}
      href={href}
      aria-disabled={isDisabled}
      aria-busy={loading || undefined}
      disabled={!href ? isDisabled : undefined}
      whileHover={!isDisabled ? { y: -1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium",
        "bg-transparent text-[var(--text-primary)]",
        "border border-[var(--border)]",
        "transition-colors duration-300",
        "hover:border-gold-400 hover:text-gold-600 dark:hover:text-gold-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        LeftIcon && <LeftIcon aria-hidden="true" />
      )}
      <span>{children}</span>
      {!loading && RightIcon && <RightIcon aria-hidden="true" />}
    </Tag>
  );
});

export default OutlineButton;
