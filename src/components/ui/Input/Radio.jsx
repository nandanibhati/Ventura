import { forwardRef, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

/**
 * Radio — single option in a radio group. Group selection/state is left
 * to the consumer (name + checked + onChange), matching native semantics.
 */
const Radio = forwardRef(function Radio(
  { checked, onChange, label, description, disabled, className, id, name, value, ...props },
  ref
) {
  const autoId = useId();
  const radioId = id || autoId;

  return (
    <label
      htmlFor={radioId}
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="relative flex items-center justify-center mt-0.5">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer absolute size-4 opacity-0 cursor-pointer"
          {...props}
        />
        <span
          className={cn(
            "flex items-center justify-center size-[18px] rounded-full border transition-colors duration-150",
            checked ? "border-gold-400" : "border-[var(--border)]",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--surface)]"
          )}
        >
          <motion.span
            initial={false}
            animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="size-[9px] rounded-full bg-gold-400"
          />
        </span>
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

export default Radio;
