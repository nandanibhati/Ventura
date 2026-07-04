import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Input — text field with label, helper/error text, and optional icons.
 *
 * Props:
 *  - label: string
 *  - helperText: string — shown when there's no error
 *  - error: string — shown instead of helperText, flips styles to error state
 *  - leftIcon / rightIcon: Lucide icon component
 *  - type: any native input type. "password" automatically gets a show/hide toggle
 *  - size: "sm" | "md" | "lg"
 */
const SIZES = {
  sm: "h-10 text-[13px]",
  md: "h-12 text-sm",
  lg: "h-[54px] text-[15px]",
};

const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    type = "text",
    size = "md",
    className,
    id,
    required,
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;
  const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-medium tracking-wide uppercase text-[var(--text-muted)]"
        >
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <div
        className={cn(
          "relative flex items-center rounded-[var(--radius-md)] border bg-[var(--surface)] transition-all duration-200",
          "border-[var(--border)] focus-within:border-gold-400 focus-within:shadow-[var(--shadow-gold-glow)]",
          error && "border-error-500 focus-within:border-error-500 focus-within:shadow-[0_0_0_3px_rgb(224_100_95_/_0.14)]"
        )}
      >
        {LeftIcon && (
          <LeftIcon className="ml-3.5 size-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
        )}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "w-full min-w-0 bg-transparent outline-none px-3.5",
            "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70",
            SIZES[size],
            LeftIcon && "pl-0",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="mr-3.5 shrink-0 text-[var(--text-muted)] hover:text-gold-500 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        {!isPassword && RightIcon && (
          <RightIcon className="mr-3.5 size-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
        )}
      </div>

      {error ? (
        <p id={`£{inputId}-error`} className="flex items-center gap-1.5 text-xs text-error-500">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : helperText ? (
        <p id={`£{inputId}-helper`} className="text-xs text-[var(--text-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
