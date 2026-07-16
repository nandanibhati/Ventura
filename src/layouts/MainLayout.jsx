import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PerksStrip from "../components/layout/PerksStrip";
import Footer from "../components/layout/Footer";
import CookieConsentBanner from "../components/layout/CookieConsentBanner";
import PopupBanner from "../components/layout/PopupBanner";
import SuggestionBox from "../components/layout/SuggestionBox";
import ChatbotWidget from "../components/layout/ChatbotWidget";
import { settingsApi } from "../api/catalog";
import { applyTheme } from "../lib/themePresets";
import { resolveMediaUrl } from "../lib/api";

/** Wraps every customer-facing page (not Admin/Seller dashboards, which are separate
 * top-level routes outside this layout). Applies the admin-configured brand theme
 * (colors, fonts, button style) scoped to this subtree only, via a ref rather than
 * `document.documentElement` — so a merchant's storefront branding never bleeds into
 * their own Admin/Seller dashboard UI. */
function MainLayout() {
  const rootRef = useRef(null);
  const { data } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (rootRef.current) applyTheme(data?.themeColors, rootRef.current);
  }, [data]);

  // Use the store's own uploaded logo as the browser-tab icon instead of the generic
  // placeholder favicon.svg left over from the project template.
  useEffect(() => {
    if (!data?.logoUrl) return;
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "";
    link.href = resolveMediaUrl(data.logoUrl);
  }, [data?.logoUrl]);

  return (
    <div ref={rootRef} className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">

      <Navbar />
      <PerksStrip />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <CookieConsentBanner />
      <PopupBanner />
      <SuggestionBox />
      <ChatbotWidget />

    </div>
  );
}

export default MainLayout;