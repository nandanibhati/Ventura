import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * Usage: cn("px-4 py-2", isActive && "bg-gold-400", className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Generates a stable id for aria-* wiring when one isn't provided. */
let idCounter = 0;
export function useId(prefix = "Veluntra") {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
