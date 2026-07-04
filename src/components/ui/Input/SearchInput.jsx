import { forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * SearchInput — pill-shaped search field with a clear button that
 * appears once there's a value.
 *
 * Props:
 *  - value, onChange: standard controlled input props
 *  - onClear: called when the clear button is pressed (also clears value)
 *  - placeholder: string
 */
const SearchInput = forwardRef(function SearchInput(
  { value, onChange, onClear, placeholder = "Search…", className, ...props },
  ref
) {
  const hasValue = Boolean(value);

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 h-11 px-4 rounded-full border bg-[var(--surface)]",
        "border-[var(--border)] transition-all duration-200",
        "focus-within:border-gold-400 focus-within:shadow-[var(--shadow-gold-glow)]",
        className
      )}
    >
      <Search className="size-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70"
        {...props}
      />
      <AnimatePresence>
        {hasValue && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            onClick={onClear}
            aria-label="Clear search"
            className="shrink-0 text-[var(--text-muted)] hover:text-gold-500 transition-colors"
          >
            <X className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SearchInput;
