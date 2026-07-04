import { useId, useState, cloneElement, isValidElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../../lib/utils";

const POSITIONS = {
  top: { wrapper: "bottom-full left-1/2 -translate-x-1/2 mb-2", offset: { y: 4 } },
  bottom: { wrapper: "top-full left-1/2 -translate-x-1/2 mt-2", offset: { y: -4 } },
  left: { wrapper: "right-full top-1/2 -translate-y-1/2 mr-2", offset: { x: 4 } },
  right: { wrapper: "left-full top-1/2 -translate-y-1/2 ml-2", offset: { x: -4 } },
};

/**
 * Tooltip — lightweight contextual hint shown on hover/focus.
 * Wraps its child (which must accept a ref-friendly single element,
 * e.g. an IconButton) and positions the bubble around it.
 *
 * Props:
 *  - content: string | ReactNode
 *  - position: "top" | "bottom" | "left" | "right"
 */
export default function Tooltip({ content, position = "top", children, delay = 150 }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const cfg = POSITIONS[position];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {isValidElement(children) ? cloneElement(children, { "aria-describedby": id }) : children}
      <AnimatePresence>
        {open && content && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, ...cfg.offset }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...cfg.offset }}
            transition={{ duration: 0.12, delay: delay / 1000 }}
            className={cn(
              "absolute z-50 whitespace-nowrap rounded-[8px] bg-ink-950 px-2.5 py-1.5 text-[11.5px] font-medium text-ink-50 shadow-soft-md pointer-events-none",
              "dark:bg-ink-50 dark:text-ink-950",
              cfg.wrapper
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
