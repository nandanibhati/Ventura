import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Select — native <select> restyled to match the design system.
 * Kept native (rather than a custom listbox) for full accessibility
 * and mobile keyboard support out of the box.
 *
 * Props:
 *  - label, helperText, error: same contract as Input
 *  - options: [{ value, label }] — or pass <option> children directly
 */
const Select = forwardRef(function Select(
  { label, helperText, error, options, children, className, id, placeholder, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-medium tracking-wide uppercase text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative rounded-[var(--radius-md)] border bg-[var(--surface)] transition-all duration-200",
          "border-[var(--border)] focus-within:border-gold-400 focus-within:shadow-[var(--shadow-gold-glow)]",
          error && "border-error-500"
        )}
      >
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={cn(
            "w-full h-12 appearance-none bg-transparent outline-none pl-3.5 pr-10 text-sm",
            "text-[var(--text-primary)] cursor-pointer",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )) : children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-gold-500" aria-hidden="true" />
      </div>
      {error ? (
        <p className="text-xs text-error-500">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
