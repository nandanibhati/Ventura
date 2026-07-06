/**
 * Named design presets an admin can pick in Settings > Animation & Design.
 * Each is a full `Settings.animationConfig` value bundle — picking one is a single
 * PATCH to /settings/admin, and every product/category card on the storefront
 * picks it up automatically via useAnimationSettings().
 */
export const ANIMATION_PRESETS = {
  apple: { speed: "slow", duration: 0.6, intensity: "subtle", hover: "zoom", idle: "none", shadow: "soft", glow: false, borderRadius: "rounded", cardStyle: "flat", delay: 0.06, loop: true },
  nike: { speed: "fast", duration: 0.35, intensity: "strong", hover: "lift", idle: "pulse", shadow: "strong", glow: true, borderRadius: "sharp", cardStyle: "bordered", delay: 0.04, loop: true },
  samsung: { speed: "normal", duration: 0.45, intensity: "normal", hover: "glow", idle: "float", shadow: "medium", glow: true, borderRadius: "soft", cardStyle: "elevated", delay: 0.05, loop: true },
  luxury: { speed: "slow", duration: 0.7, intensity: "subtle", hover: "lift", idle: "none", shadow: "soft", glow: false, borderRadius: "sharp", cardStyle: "bordered", delay: 0.08, loop: true },
  minimal: { speed: "normal", duration: 0.4, intensity: "subtle", hover: "lift", idle: "none", shadow: "none", glow: false, borderRadius: "soft", cardStyle: "flat", delay: 0.03, loop: false },
  gaming: { speed: "fast", duration: 0.3, intensity: "strong", hover: "tilt", idle: "pulse", shadow: "strong", glow: true, borderRadius: "sharp", cardStyle: "bordered", delay: 0.02, loop: true },
  glass: { speed: "normal", duration: 0.5, intensity: "normal", hover: "lift", idle: "float", shadow: "soft", glow: true, borderRadius: "rounded", cardStyle: "glass", delay: 0.05, loop: true },
  neon: { speed: "fast", duration: 0.4, intensity: "strong", hover: "glow", idle: "pulse", shadow: "strong", glow: true, borderRadius: "rounded", cardStyle: "bordered", delay: 0.03, loop: true },
  modern: { speed: "normal", duration: 0.5, intensity: "normal", hover: "lift", idle: "float", shadow: "medium", glow: true, borderRadius: "rounded", cardStyle: "elevated", delay: 0.05, loop: true },
  corporate: { speed: "normal", duration: 0.4, intensity: "subtle", hover: "lift", idle: "none", shadow: "soft", glow: false, borderRadius: "soft", cardStyle: "flat", delay: 0.04, loop: false },
};

export const DEFAULT_ANIMATION_CONFIG = { preset: "modern", ...ANIMATION_PRESETS.modern };

export const SPEED_MULTIPLIER = { slow: 1.5, normal: 1, fast: 0.6 };
export const INTENSITY_SCALE = { subtle: 0.5, normal: 1, strong: 1.7 };

export const SHADOW_CLASS = {
  none: "shadow-none",
  soft: "shadow-md",
  medium: "shadow-lg",
  strong: "shadow-2xl",
};

export const RADIUS_CLASS = {
  sharp: "rounded-none",
  soft: "rounded-lg",
  rounded: "rounded-2xl",
  pill: "rounded-[2rem]",
};

export const CARD_STYLE_CLASS = {
  flat: "bg-[var(--surface)] border border-transparent",
  elevated: "bg-[var(--surface)] border border-[var(--border)]",
  glass: "bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20",
  bordered: "bg-[var(--surface)] border-2 border-gold-400/40",
};
