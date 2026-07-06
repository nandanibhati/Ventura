import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../api/catalog";
import { applyTheme } from "../lib/themePresets";

/** Applies the admin-configured theme (Settings > Theme) to the document root on load
 * and whenever it changes — no visual change if the admin has never customized it. */
export default function ThemeProvider({ children }) {
  const { data } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    applyTheme(data?.themeColors);
  }, [data]);

  return children;
}
