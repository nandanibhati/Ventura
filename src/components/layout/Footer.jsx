import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { TrendingUp, Handshake, ThumbsUp, Flag, Star, ShieldCheck } from "lucide-react";
import { settingsApi } from "../../api/catalog";

/* Dense, marketplace-style footer (Flipkart/Argos-inspired) — matches the rest of the
   storefront's dark chrome + sans-serif type instead of a standalone luxury-boutique style. */

const socials = [
  {
    label: "Instagram",
    platform: "instagram",
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
      </>
    ),
  },
  {
    label: "X",
    platform: "twitter",
    path: <path d="M3 3l8.1 10.4L3.4 21h2.5l6.3-6.2L17 21h4l-8.5-10.9L20.3 3h-2.5l-5.6 5.6L7 3H3z" fill="currentColor" />,
  },
  {
    label: "Pinterest",
    platform: "pinterest",
    path: (
      <path
        d="M12 2.5a9.5 9.5 0 0 0-3.6 18.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.5-.2 1 .5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.8 0-2.5-1.8-4.3-4.4-4.3a4.6 4.6 0 0 0-4.8 4.6c0 .9.4 1.9.8 2.4l-.3 1.2c-.1.4-.3.5-.6.3-1.2-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.7-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.2 6.3-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.9-.8 1.9-1.2 2.6A9.5 9.5 0 1 0 12 2.5z"
        fill="currentColor"
      />
    ),
  },
  {
    label: "YouTube",
    platform: "youtube",
    path: (
      <>
        <rect x="2" y="5.5" width="20" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10.2 9.3l4.6 2.7-4.6 2.7V9.3z" fill="currentColor" />
      </>
    ),
  },
];

const LINK_COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Contact us", href: "#contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track order", href: "/orders" },
      { label: "Returns & refunds", href: "/returns" },
      { label: "Shipping info", href: "#shipping" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Policy",
    links: [
      { label: "Privacy policy", href: "#privacy" },
      { label: "Terms of use", href: "#terms" },
      { label: "Cookie policy", href: "#cookies" },
    ],
  },
];

// Business-development / trust links — mailto (with a distinct subject per link, so incoming
// applications land in the inbox pre-sorted) until dedicated application pages exist. Google/
// Trustpilot need the store's real review-page URLs filled in once available (never fabricate
// a business's external profile links).
const EXPLORE_LINKS = [
  { label: "Apply For Wholesale", icon: TrendingUp, subject: "Wholesale Application" },
  { label: "Apply for Dropshipping", icon: Handshake, href: "/dropshipping" },
  { label: "Register as an Affiliate / Influencer", icon: ThumbsUp, subject: "Affiliate / Influencer Enquiry" },
  { label: "Report an Issue", icon: Flag, subject: "Issue Report" },
  { label: "Review Us on Google", icon: Star, href: null },
  { label: "Review Us on Trustpilot", icon: ShieldCheck, href: null },
];

const payments = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "G Pay"];

export default function Footer() {
  const { data: storeSettings } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60 * 1000,
  });
  const storeName = storeSettings?.storeName || "Veluntra";

  return (
    <footer className="bg-neutral-950 text-neutral-300" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.1fr_repeat(4,1fr)_1.1fr]">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <span className="text-lg font-bold uppercase tracking-wide text-white">{storeName}</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
              Quality tech and everyday essentials, delivered fast — with easy returns and secure payments on every order.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {socials.map((s) => {
                const href = storeSettings?.socialLinks?.[s.platform] || "#";
                return (
                  <a
                    key={s.label}
                    href={href}
                    aria-label={s.label}
                    target={href !== "#" ? "_blank" : undefined}
                    rel={href !== "#" ? "noopener noreferrer" : undefined}
                    className="flex size-8 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-colors hover:border-white/30 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">{s.path}</svg>
                  </a>
                );
              })}
            </div>
          </div>

          {LINK_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">{col.title}</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-neutral-400 transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Explore">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Explore</h3>
            <ul className="mt-3 flex flex-col gap-2.5">
              {EXPLORE_LINKS.map((link) => {
                if (link.href?.startsWith("/")) {
                  return (
                    <li key={link.label}>
                      <Link to={link.href} className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white">
                        <link.icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                        {link.label}
                      </Link>
                    </li>
                  );
                }
                const href =
                  link.href !== undefined
                    ? link.href || "#"
                    : storeSettings?.contactEmail
                    ? `mailto:${storeSettings.contactEmail}?subject=${encodeURIComponent(link.subject)}`
                    : "#";
                return (
                  <li key={link.label}>
                    <a href={href} className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white">
                      <link.icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Get in touch</h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-neutral-400">
              {storeSettings?.contactAddress && <li>{storeSettings.contactAddress}</li>}
              {storeSettings?.contactPhone && <li>{storeSettings.contactPhone}</li>}
              {storeSettings?.contactEmail && (
                <li>
                  <a href={`mailto:${storeSettings.contactEmail}`} className="hover:text-white">
                    {storeSettings.contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <hr className="my-8 border-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-neutral-500">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payment methods">
            {payments.map((p) => (
              <span
                key={p}
                className="rounded-sm border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
