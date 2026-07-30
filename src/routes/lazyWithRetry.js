import { lazy } from "react";

/**
 * Vite's hashed chunk filenames change on every deploy. A tab left open across a deploy still
 * references the old, now-deleted chunk URL - the fetch fails (the SPA's history-fallback
 * serves index.html for it instead of a 404, so the browser sees "text/html" where it expected
 * JS) and the lazy import throws forever. Retrying the same URL can't help since the file is
 * genuinely gone; the fix is a one-time hard reload to pick up the current index.html (and the
 * correct chunk references it points to) instead of leaving the user stuck on a dead route.
 */
export function lazyWithRetry(importFn) {
  return lazy(async () => {
    try {
      const mod = await importFn();
      sessionStorage.removeItem("chunk-reload-attempted");
      return mod;
    } catch (err) {
      if (!sessionStorage.getItem("chunk-reload-attempted")) {
        sessionStorage.setItem("chunk-reload-attempted", "1");
        window.location.reload();
        return new Promise(() => {}); // reload is already in flight
      }
      throw err;
    }
  });
}
