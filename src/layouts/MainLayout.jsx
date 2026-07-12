import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CookieConsentBanner from "../components/layout/CookieConsentBanner";
import PopupBanner from "../components/layout/PopupBanner";
import SuggestionBox from "../components/layout/SuggestionBox";
import ChatbotWidget from "../components/layout/ChatbotWidget";
import { settingsApi } from "../api/catalog";
import { applyTheme } from "../lib/themePresets";

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

  return (
    <div ref={rootRef} className="min-h-screen flex flex-col bg-gray-50">

      <Navbar />

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