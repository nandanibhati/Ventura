import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../api/catalog";
import { applyFavicon } from "../lib/themePresets";

/** Applies the admin-configured favicon (Settings > Theme & Design) — a browser-tab concern,
 * so unlike colors/fonts/card templates it's genuinely app-wide, not storefront-only. The rest
 * of the theme (colors, fonts, button style, card template) is applied by MainLayout instead,
 * scoped to the storefront subtree so it never bleeds into the Admin/Seller dashboards. */
export default function ThemeProvider({ children }) {
  const { data } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    applyFavicon(data?.themeColors?.faviconUrl);
  }, [data]);

  return children;
}
