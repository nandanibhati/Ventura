import { forwardRef, useId } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Checkbox — custom styled, fully keyboard and screen-reader accessible
 * (wraps a visually-hidden native input, so forms + validation just work).
 *
 * Props:
 *  - checked, onChange: standard controlled props
 *  - label: string | ReactNode
 *  - description: optional secondary line under the label
 */
const Checkbox = forwardRef(function Checkbox(
  { checked, onChange, label, description, disabled, className, id, ...props },
  ref
) {
  const autoId = useId();
  const checkboxId = id || autoId;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="relative flex items-center justify-center mt-0.5">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer absolute size-4 opacity-0 cursor-pointer"
          {...props}
        />
        <motion.span
          initial={false}
          animate={{
            backgroundColor: checked ? "var(--color-gold-400)" : "transparent",
            borderColor: checked ? "var(--color-gold-400)" : "var(--border)",
          }}
          transition={{ duration: 0.15 }}
          className={cn(
            "flex items-center justify-center size-[18px] rounded-[6px] border",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--surface)]"
          )}
        >
          <motion.span
            initial={false}
            animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="size-3 text-ink-950" strokeWidth={3} aria-hidden="true" />
          </motion.span>
        </motion.span>
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
          {description && <span className="text-xs text-[var(--text-muted)]">{description}</span>}
        </span>
      )}
    </label>
  );
});

export default Checkbox;
