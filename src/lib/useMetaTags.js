import { useEffect } from "react";

const SITE_URL = "https://veluntra.co.uk";
const SITE_NAME = "Veluntra";
const DEFAULT_DESCRIPTION =
  "Shop the latest electronics at Veluntra — laptops, audio, smart home, and more, with fast shipping and secure checkout.";
const DEFAULT_TITLE = `${SITE_NAME} — Electronics, Delivered`;

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Sets document.title, meta description, OG/Twitter tags, a canonical URL, and (optionally) a
 * JSON-LD structured-data script for the lifetime of the calling page — restores the site-wide
 * defaults from index.html on unmount instead of leaving a stale product's tags on the next page.
 * `path` should be the route path (e.g. `/product/${id}`) used to build the canonical/og:url. */
export function useMetaTags({ title, description = DEFAULT_DESCRIPTION, path, structuredData } = {}) {
  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);

    const canonicalUrl = path ? `${SITE_URL}${path}` : undefined;
    if (canonicalUrl) {
      upsertLink("canonical", canonicalUrl);
      upsertMeta("property", "og:url", canonicalUrl);
    }

    let scriptEl = null;
    if (structuredData) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.textContent = JSON.stringify(structuredData);
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = previousTitle;
      upsertMeta("name", "description", DEFAULT_DESCRIPTION);
      upsertMeta("property", "og:title", DEFAULT_TITLE);
      upsertMeta("property", "og:description", DEFAULT_DESCRIPTION);
      upsertMeta("name", "twitter:title", DEFAULT_TITLE);
      upsertMeta("name", "twitter:description", DEFAULT_DESCRIPTION);
      if (scriptEl) scriptEl.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, structuredData]);
}
