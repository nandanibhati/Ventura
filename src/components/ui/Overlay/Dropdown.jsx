import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../../lib/utils";

/**
 * Dropdown — click-triggered menu anchored to a trigger element.
 *
 * Usage:
 *   <Dropdown trigger={<IconButton icon={MoreVertical} aria-label="More" />}>
 *     <Dropdown.Item onClick={...}>Edit</Dropdown.Item>
 *     <Dropdown.Item onClick={...} destructive>Delete</Dropdown.Item>
 *   </Dropdown>
 *
 * Props:
 *  - align: "left" | "right" — menu alignment relative to the trigger
 */
export default function Dropdown({ trigger, children, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <span onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setOpen(false)}
            className={cn(
              "absolute z-50 mt-2 min-w-[200px] rounded-[var(--radius-md)] border border-[var(--border)]",
              "bg-[var(--surface)] shadow-soft-lg p-1.5",
              align === "right" ? "right-0" : "left-0",
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

Dropdown.Item = function DropdownItem({ children, icon: Icon, destructive, className, ...props }) {
  return (
    <button
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-left transition-colors",
        destructive ? "text-error-500 hover:bg-error-500/10" : "text-[var(--text-primary)] hover:bg-[var(--surface-inset)]",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
};

Dropdown.Separator = function DropdownSeparator() {
  return <div className="my-1.5 h-px bg-[var(--border)]" role="separator" />;
};
