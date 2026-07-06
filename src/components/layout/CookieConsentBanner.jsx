import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cookie } from "lucide-react";
import { settingsApi } from "../../api/catalog";

const STORAGE_KEY = "veluntra-cookie-consent";

/** Standard cookie-consent bar — persists the choice in localStorage (not just the
 * session) so a visitor who accepts isn't asked again on their next visit. Controlled
 * by Settings > Store Settings > Feature flags > "Cookie Consent Banner". */
export default function CookieConsentBanner() {
  const { data } = useQuery({ queryKey: ["settings", "public"], queryFn: settingsApi.getPublic, staleTime: 5 * 60 * 1000 });
  const [dismissed, setDismissed] = useState(() => Boolean(localStorage.getItem(STORAGE_KEY)));

  if (data?.featureFlags?.cookieConsent === false || dismissed) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="flex items-center gap-2 text-center text-sm text-[var(--text-muted)] sm:text-left">
          <Cookie className="size-4 shrink-0 text-gold-500" />
          We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-[var(--radius-btn,999px)] bg-gold-400 px-6 py-2 text-sm font-medium text-white shadow-soft-sm transition-colors hover:bg-gold-500"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
