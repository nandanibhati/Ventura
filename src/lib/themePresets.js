/**
 * Admin-selectable font pairings (Settings > Theme & Design). Every font referenced here
 * is preloaded once in index.html, so switching presets never triggers a new font fetch.
 */
export const FONT_PRESETS = {
  classic: { label: "Classic Serif", display: '"Cormorant Garamond", ui-serif, Georgia, serif', sans: '"Inter", "Jost", system-ui, sans-serif' },
  elegant: { label: "Elegant", display: '"Playfair Display", ui-serif, Georgia, serif', sans: '"Inter", system-ui, sans-serif' },
  modern: { label: "Modern", display: '"Poppins", system-ui, sans-serif', sans: '"Inter", system-ui, sans-serif' },
  minimal: { label: "Minimal", display: '"Inter", system-ui, sans-serif', sans: '"Inter", system-ui, sans-serif' },
  bold: { label: "Bold", display: '"Montserrat", system-ui, sans-serif', sans: '"Inter", system-ui, sans-serif' },
  editorial: { label: "Editorial", display: '"Libre Baskerville", ui-serif, Georgia, serif', sans: '"Source Sans 3", system-ui, sans-serif' },
  geometric: { label: "Geometric", display: '"Space Grotesk", system-ui, sans-serif', sans: '"Inter", system-ui, sans-serif' },
  warm: { label: "Warm", display: '"Lora", ui-serif, Georgia, serif', sans: '"Nunito Sans", system-ui, sans-serif' },
  luxury: { label: "Luxury Serif", display: '"Cinzel", ui-serif, Georgia, serif', sans: '"Inter", system-ui, sans-serif' },
};

export const DEFAULT_THEME = {
  primary: "#d8b36a",
  accent: "#c79a4c",
  secondary: "#4b5563",
  surfaceLight: "#ffffff",
  surfaceDark: "#10101a",
  font: "classic",
  buttonStyle: "rounded",
  cardTemplate: "marketplace",
};

const BUTTON_RADIUS = {
  square: "4px",
  rounded: "14px",
  pill: "999px",
};

/**
 * Applies a resolved theme as CSS custom-property overrides on `target` (defaults to the
 * document root). Pass a specific storefront-only DOM node — as MainLayout does — so brand
 * customization only affects customer-facing pages, never the Admin/Seller dashboards (which
 * keep the site's own fixed look regardless of what a merchant sets here).
 */
export function applyTheme(theme, target) {
  const el = target || (typeof document !== "undefined" ? document.documentElement : null);
  if (!el) return;
  const t = { ...DEFAULT_THEME, ...theme };
  el.style.setProperty("--color-gold-400", t.primary);
  el.style.setProperty("--color-gold-500", t.accent);
  el.style.setProperty("--color-secondary", t.secondary);
  el.style.setProperty("--color-ink-0", t.surfaceLight);
  el.style.setProperty("--color-ink-900", t.surfaceDark);
  el.style.setProperty("--radius-btn", BUTTON_RADIUS[t.buttonStyle] || BUTTON_RADIUS.rounded);

  const preset = FONT_PRESETS[t.font] || FONT_PRESETS.classic;
  el.style.setProperty("--font-display", preset.display);
  el.style.setProperty("--font-sans", preset.sans);
}

/** Custom favicon (Settings > Theme & Design) — a browser-tab concern, so unlike applyTheme
 * this always targets the document head regardless of which part of the app is active. Falls
 * back to index.html's static /favicon.svg when unset, so this only ever swaps the icon. */
export function applyFavicon(url) {
  if (!url || typeof document === "undefined") return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}
