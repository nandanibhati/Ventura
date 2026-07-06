// Deterministic fallback gradient for a product/section tile that has no uploaded image yet.
// Same hash-by-key approach used across every product-card renderer in the app — kept in one
// place so the palette (and the hashing behavior) can't quietly drift between pages.
// Two parallel palettes, same order/count, so a given key always maps to visually "the same"
// gradient whether the caller needs a Tailwind class pair or a raw inline-style CSS string.
const TAILWIND_GRADIENTS = [
  "from-neutral-700 to-neutral-950",
  "from-amber-600 to-neutral-900",
  "from-rose-600 to-neutral-900",
  "from-indigo-600 to-neutral-900",
  "from-emerald-600 to-neutral-900",
  "from-sky-600 to-neutral-900",
  "from-fuchsia-600 to-neutral-900",
  "from-teal-600 to-neutral-900",
];

const CSS_GRADIENTS = [
  "linear-gradient(160deg, #404040, #0a0a0a)",
  "linear-gradient(160deg, #d97706, #171717)",
  "linear-gradient(160deg, #e11d48, #171717)",
  "linear-gradient(160deg, #4f46e5, #171717)",
  "linear-gradient(160deg, #059669, #171717)",
  "linear-gradient(160deg, #0284c7, #171717)",
  "linear-gradient(160deg, #c026d3, #171717)",
  "linear-gradient(160deg, #0d9488, #171717)",
];

function hashKey(key) {
  return String(key || "")
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

/** Returns a Tailwind `from-x to-y` class pair for use with `bg-gradient-to-br`. */
export function gradientClassFor(key) {
  return TAILWIND_GRADIENTS[hashKey(key) % TAILWIND_GRADIENTS.length];
}

/** Returns a raw CSS `linear-gradient(...)` string for use in an inline `style` prop. */
export function gradientCssFor(key) {
  return CSS_GRADIENTS[hashKey(key) % CSS_GRADIENTS.length];
}
