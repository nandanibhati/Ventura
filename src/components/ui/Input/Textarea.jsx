import { forwardRef, useId } from "react";
import { cn } from "../../../lib/utils";

/**
 * Textarea — multiline text field, mirrors Input's label/error contract.
 *
 * Props:
 *  - maxLength: number — shows a live character counter when set
 */
const Textarea = forwardRef(function Textarea(
  { label, helperText, error, className, id, maxLength, value, ...props },
  ref
) {
  const autoId = useId();
  const textareaId = id || autoId;
  const count = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-[11px] font-medium tracking-wide uppercase text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        maxLength={maxLength}
        aria-invalid={!!error}
        rows={4}
        className={cn(
          "w-full resize-none rounded-[var(--radius-md)] border bg-[var(--surface)] p-3.5 text-sm outline-none transition-all duration-200",
          "border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70",
          "focus:border-gold-400 focus:shadow-[var(--shadow-gold-glow)]",
          error && "border-error-500 focus:border-error-500",
          className
        )}
        {...props}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-error-500">{error}</p>
        {!error && helperText && <p className="text-xs text-[var(--text-muted)]">{helperText}</p>}
        {maxLength && (
          <span className="text-xs text-[var(--text-muted)] ml-auto tabular-nums">
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

export default Textarea;
