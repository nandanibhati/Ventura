import { forwardRef, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

const SIZES = {
  sm: { track: "w-9 h-5", thumb: "size-3.5", travel: 16 },
  md: { track: "w-11 h-6", thumb: "size-[18px]", travel: 20 },
};

/**
 * ToggleSwitch — binary on/off control (e.g. dark mode, notifications).
 * Implemented as an accessible <button role="switch"> rather than a
 * checkbox, since it represents an immediate action, not a form value.
 */
const ToggleSwitch = forwardRef(function ToggleSwitch(
  { checked = false, onChange, label, disabled, size = "md", className, id, ...props },
  ref
) {
  const autoId = useId();
  const toggleId = id || autoId;
  const s = SIZES[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        ref={ref}
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative inline-flex items-center rounded-full transition-colors duration-200 shrink-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
          checked ? "bg-gold-400" : "bg-[var(--surface-inset)] border border-[var(--border)]",
          disabled && "opacity-50 cursor-not-allowed",
          s.track
        )}
        {...props}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn("rounded-full bg-white shadow-md ml-0.5", s.thumb)}
          style={{ x: checked ? s.travel : 0 }}
        />
      </button>
      {label && (
        <label htmlFor={toggleId} className="text-sm text-[var(--text-primary)] cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
});

export default ToggleSwitch;
