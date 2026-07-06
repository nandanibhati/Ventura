import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../../api/catalog";
import { DEFAULT_ANIMATION_CONFIG } from "./presets";

/**
 * Resolves the storefront-wide animation config (admin-controlled via Settings >
 * Animation & Design), merged over sane defaults so a never-configured install still
 * animates sensibly. Cached like any other slow-changing settings query.
 */
export function useAnimationSettings() {
  const { data } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => ({ ...DEFAULT_ANIMATION_CONFIG, ...(data?.animationConfig || {}) }), [data]);
}

/**
 * Merges the global animation settings with a product's own `animationOverride`
 * (from the admin/seller product form). `enabled: false` on the override turns
 * animation off for that one product; any other field left unset inherits global.
 */
export function useResolvedAnimation(override) {
  const global = useAnimationSettings();
  return useMemo(() => {
    if (!override) return global;
    if (override.enabled === false) return { ...global, hover: "none", idle: "none", glow: false };
    return { ...global, ...override };
  }, [global, override]);
}
