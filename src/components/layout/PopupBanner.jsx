import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { settingsApi } from "../../api/catalog";
import Modal from "../ui/Overlay/Modal";

const SESSION_KEY = "veluntra-popup-shown";

/** Promotional popup (Settings > Store Settings > "Promotional popup"). Shows once per
 * browser session — dismissing it (or clicking its CTA) won't show it again until the
 * next session, so returning visitors aren't nagged on every page load. */
export default function PopupBanner() {
  const { data } = useQuery({ queryKey: ["settings", "public"], queryFn: settingsApi.getPublic, staleTime: 5 * 60 * 1000 });
  const [open, setOpen] = useState(false);
  const popup = data?.popupBanner;

  useEffect(() => {
    if (!popup?.enabled) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setOpen(true);
  }, [popup]);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  if (!popup?.enabled) return null;

  return (
    <Modal open={open} onClose={close} title={popup.title || undefined} size="sm">
      <div className="flex flex-col gap-4">
        {popup.imageUrl && <img src={popup.imageUrl} alt="" className="w-full rounded-[var(--radius-md)] object-cover" />}
        {popup.body && <p className="text-sm text-[var(--text-muted)]">{popup.body}</p>}
        {popup.ctaText && popup.ctaLink && (
          <Link
            to={popup.ctaLink}
            onClick={close}
            className="inline-flex w-full items-center justify-center rounded-[var(--radius-btn,999px)] bg-gradient-to-r from-gold-400 via-gold-100 to-gold-400 px-6 py-3 text-sm font-medium text-ink-950 shadow-soft-sm transition-shadow hover:shadow-soft-md"
          >
            {popup.ctaText}
          </Link>
        )}
      </div>
    </Modal>
  );
}
