/**
 * Admin-selectable font pairings (Settings > Theme). Every font referenced here is
 * preloaded once in index.html, so switching presets never triggers a new font fetch.
 */
export const FONT_PRESETS = {
  classic: { label: "Classic Serif", display: '"Cormorant Garamond", ui-serif, Georgia, serif', sans: '"Inter", "Jost", system-ui, sans-serif' },
  elegant: { label: "Elegant", display: '"Playfair Display", ui-serif, Georgia, serif', sans: '"Inter", system-ui, sans-serif' },
  modern: { label: "Modern", display: '"Poppins", system-ui, sans-serif', sans: '"Inter", system-ui, sans-serif' },
  minimal: { label: "Minimal", display: '"Inter", system-ui, sans-serif', sans: '"Inter", system-ui, sans-serif' },
};

export const DEFAULT_THEME = {
  primary: "#d8b36a",
  accent: "#c79a4c",
  surfaceLight: "#ffffff",
  surfaceDark: "#10101a",
  font: "classic",
};

/** Applies a resolved theme to the document root as CSS custom-property overrides. */
export function applyTheme(theme) {
  const t = { ...DEFAULT_THEME, ...theme };
  const root = document.documentElement.style;
  root.setProperty("--color-gold-400", t.primary);
  root.setProperty("--color-gold-500", t.accent);
  root.setProperty("--color-ink-0", t.surfaceLight);
  root.setProperty("--color-ink-900", t.surfaceDark);

  const preset = FONT_PRESETS[t.font] || FONT_PRESETS.classic;
  root.setProperty("--font-display", preset.display);
  root.setProperty("--font-sans", preset.sans);
}
