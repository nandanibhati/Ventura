import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../../api/catalog";

/* ─────────────────────────────────────────────────────────
   Veluntra — Premium Footer
   Deep-ink gradient field, champagne accents, ghost wordmark
   ───────────────────────────────────────────────────────── */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Jost:wght@300;400;500&display=swap');

.vf-root {
  --ink-0: #08080d;
  --ink-1: #10101a;
  --ink-2: #191926;
  --line: rgba(216, 179, 106, 0.22);
  --gold-0: #d8b36a;
  --gold-1: #f4e6c3;
  --ivory: #ece9e0;
  --muted: #8f8d99;
  --grad-gold: linear-gradient(96deg, var(--gold-0) 0%, var(--gold-1) 55%, var(--gold-0) 100%);

  position: relative;
  overflow: hidden;
  background:
    radial-gradient(1100px 480px at 82% -10%, rgba(216,179,106,0.10), transparent 60%),
    radial-gradient(900px 420px at 8% 110%, rgba(93,82,140,0.16), transparent 62%),
    linear-gradient(178deg, var(--ink-1) 0%, var(--ink-0) 78%);
  color: var(--ivory);
  font-family: 'Jost', system-ui, sans-serif;
  font-weight: 300;
  letter-spacing: 0.01em;
}

.vf-hairline {
  height: 1px;
  border: 0;
  margin: 0;
  background: linear-gradient(90deg, transparent, var(--line) 18%, rgba(244,230,195,0.5) 50%, var(--line) 82%, transparent);
}

.vf-shell {
  position: relative;
  z-index: 2;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 56px);
}

/* ── Top band: brand + newsletter ─────────────────────── */
.vf-top {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: clamp(32px, 5vw, 96px);
  padding: clamp(48px, 6vw, 80px) 0 clamp(36px, 5vw, 60px);
  align-items: end;
}

.vf-brand {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
  font-size: clamp(34px, 3.6vw, 48px);
  letter-spacing: 0.30em;
  text-indent: 0.30em;
  margin: 0 0 14px;
  background: var(--grad-gold);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.vf-tagline {
  margin: 0;
  max-width: 42ch;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
}

.vf-news-label {
  display: block;
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold-0);
  margin-bottom: 16px;
}

.vf-news-form {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid var(--line);
  transition: border-color 0.35s ease;
}
.vf-news-form:focus-within { border-color: var(--gold-0); }

.vf-news-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--ivory);
  font: 300 15px 'Jost', system-ui, sans-serif;
  letter-spacing: 0.04em;
  padding: 14px 4px;
}
.vf-news-input::placeholder { color: var(--muted); }

.vf-news-btn {
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 14px 4px 14px 18px;
  font: 400 12px 'Jost', system-ui, sans-serif;
  letter-spacing: 0.30em;
  text-transform: uppercase;
  background-image: var(--grad-gold);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  white-space: nowrap;
  transition: opacity 0.3s ease, letter-spacing 0.3s ease;
}
.vf-news-btn:hover { letter-spacing: 0.36em; }
.vf-news-btn:focus-visible,
.vf-root a:focus-visible,
.vf-root button:focus-visible,
.vf-root select:focus-visible {
  outline: 1px solid var(--gold-0);
  outline-offset: 4px;
  border-radius: 2px;
}

.vf-news-note { margin: 12px 0 0; font-size: 12.5px; color: var(--muted); }
.vf-news-done { margin: 12px 0 0; font-size: 13px; color: var(--gold-1); letter-spacing: 0.06em; }

/* ── Link columns ─────────────────────────────────────── */
.vf-mid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.2fr);
  gap: clamp(28px, 4vw, 72px);
  padding: clamp(40px, 5vw, 64px) 0;
}

.vf-col-title {
  margin: 0 0 22px;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold-0);
}

.vf-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 13px; }

.vf-link {
  position: relative;
  color: var(--ivory);
  text-decoration: none;
  font-size: 15px;
  opacity: 0.82;
  transition: opacity 0.3s ease;
}
.vf-link::after {
  content: "";
  position: absolute;
  left: 0; bottom: -3px;
  width: 100%; height: 1px;
  background: var(--grad-gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.vf-link:hover { opacity: 1; }
.vf-link:hover::after { transform: scaleX(1); }

/* Atelier / contact block */
.vf-atelier p { margin: 0 0 10px; color: var(--muted); font-size: 14.5px; line-height: 1.75; }
.vf-atelier a { color: var(--ivory); text-decoration: none; opacity: 0.85; }
.vf-atelier a:hover { opacity: 1; }

.vf-social { display: flex; gap: 10px; margin-top: 22px; }
.vf-social a {
  display: grid;
  place-items: center;
  width: 40px; height: 40px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ivory);
  transition: border-color 0.3s ease, color 0.3s ease, transform 0.3s ease, background 0.3s ease;
}
.vf-social a:hover {
  border-color: var(--gold-0);
  color: var(--gold-1);
  transform: translateY(-2px);
  background: rgba(216,179,106,0.06);
}
.vf-social svg { width: 16px; height: 16px; }

/* ── Bottom bar ───────────────────────────────────────── */
.vf-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px 32px;
  padding: 26px 0 30px;
}

.vf-country {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0 14px;
  transition: border-color 0.3s ease;
}
.vf-country:hover, .vf-country:focus-within { border-color: var(--gold-0); }
.vf-country svg { width: 14px; height: 14px; color: var(--gold-0); flex: none; }
.vf-country select {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--ivory);
  font: 300 13px 'Jost', system-ui, sans-serif;
  letter-spacing: 0.06em;
  padding: 11px 22px 11px 0;
  cursor: pointer;
}
.vf-country select option { color: #111; }
.vf-caret {
  position: absolute;
  right: 14px;
  pointer-events: none;
  color: var(--muted);
  font-size: 10px;
}

.vf-pay { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.vf-pay-chip {
  display: grid;
  place-items: center;
  min-width: 52px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(236,233,224,0.14);
  border-radius: 6px;
  background: linear-gradient(160deg, var(--ink-2), var(--ink-1));
  color: var(--muted);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: color 0.3s ease, border-color 0.3s ease;
}
.vf-pay-chip:hover { color: var(--ivory); border-color: var(--line); }

.vf-copy { font-size: 12.5px; color: var(--muted); letter-spacing: 0.05em; }

/* Ghost wordmark */
.vf-ghost {
  position: absolute;
  left: 50%;
  bottom: -0.28em;
  transform: translateX(-50%);
  z-index: 1;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: clamp(90px, 17vw, 240px);
  letter-spacing: 0.18em;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(216,179,106,0.09), rgba(216,179,106,0));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 900px) {
  .vf-top { grid-template-columns: 1fr; align-items: start; }
  .vf-mid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 540px) {
  .vf-mid { grid-template-columns: 1fr; gap: 36px; }
  .vf-bottom { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .vf-root *, .vf-root *::after { transition: none !important; }
}
`;

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

const payments = ["Visa", "MC", "Amex", "PayPal", "Pay", "G Pay"];

const countries = [
    "United Kingdom (GBP £)",
  "India (INR ₹)",
  "United States (USD £)",
  "European Union (EUR €)",
  "United Arab Emirates (AED)",
  "Japan (JPY ¥)",
  "Australia (AUD £)",
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const { data: storeSettings } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60 * 1000,
  });
  const storeName = storeSettings?.storeName || "Veluntra";

  const subscribe = () => {
    if (email.trim()) setJoined(true);
  };

  return (
    <footer className="vf-root" aria-label="Site footer">
      <style>{css}</style>
      <div aria-hidden="true" className="vf-ghost">{storeName}</div>

      <div className="vf-shell">
        {/* Brand + Newsletter */}
        <div className="vf-top">
          <div>
            <h2 className="vf-brand">{storeName}</h2>
            <p className="vf-tagline">
              Considered design, enduring materials. Crafted in small ateliers and
              delivered to sixty countries worldwide.
            </p>
          </div>

          <div>
            <span className="vf-news-label">The {storeName} Letter</span>
            {joined ? (
              <p className="vf-news-done">Welcome to the house. Your first letter arrives soon.</p>
            ) : (
              <>
                <div className="vf-news-form">
                  <input
                    className="vf-news-input"
                    type="email"
                    placeholder="Email address"
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && subscribe()}
                  />
                  <button className="vf-news-btn" onClick={subscribe}>
                    Subscribe
                  </button>
                </div>
                <p className="vf-news-note">
                  Private previews, atelier notes, and first access to new collections.
                </p>
              </>
            )}
          </div>
        </div>

        <hr className="vf-hairline" />

        {/* Link columns */}
        <div className="vf-mid">
          <nav aria-label="Company">
            <h3 className="vf-col-title">Company</h3>
            <ul className="vf-list">
              <li><a className="vf-link" href="#about">About</a></li>
              <li><a className="vf-link" href="#careers">Careers</a></li>
              <li><a className="vf-link" href="#contact">Contact</a></li>
            </ul>
          </nav>

          <nav aria-label="Support">
            <h3 className="vf-col-title">Support</h3>
            <ul className="vf-list">
              <li><a className="vf-link" href="#support">Client Care</a></li>
              <li><a className="vf-link" href="#returns">Returns</a></li>
              <li><a className="vf-link" href="#shipping">Shipping</a></li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h3 className="vf-col-title">Legal</h3>
            <ul className="vf-list">
              <li><a className="vf-link" href="#privacy">Privacy</a></li>
              <li><a className="vf-link" href="#terms">Terms</a></li>
              <li><a className="vf-link" href="#cookies">Cookies</a></li>
            </ul>
          </nav>

          <div className="vf-atelier">
            <h3 className="vf-col-title">Get in touch</h3>
            {storeSettings?.contactAddress && <p>{storeSettings.contactAddress}</p>}
            {storeSettings?.contactPhone && <p>{storeSettings.contactPhone}</p>}
            {storeSettings?.contactEmail && (
              <p>
                <a href={`mailto:${storeSettings.contactEmail}`}>{storeSettings.contactEmail}</a>
              </p>
            )}
            <div className="vf-social">
              {socials.map((s) => {
                const href = storeSettings?.socialLinks?.[s.platform] || "#";
                return (
                  <a
                    key={s.label}
                    href={href}
                    aria-label={s.label}
                    target={href !== "#" ? "_blank" : undefined}
                    rel={href !== "#" ? "noopener noreferrer" : undefined}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">{s.path}</svg>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <hr className="vf-hairline" />

        {/* Bottom bar */}
        <div className="vf-bottom">
          <div className="vf-country">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9S14.6 18.4 12 21c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z" />
            </svg>
            <select aria-label="Country and currency" defaultValue={countries[0]}>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="vf-caret">▾</span>
          </div>

          <div className="vf-pay" aria-label="Accepted payment methods">
            {payments.map((p) => (
              <span key={p} className="vf-pay-chip">{p}</span>
            ))}
          </div>

          <p className="vf-copy">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
