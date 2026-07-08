import axios from "axios";
import { tokenStorage, getGuestSessionId } from "./tokenStorage";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
const apiOrigin = baseURL.replace(/\/api\/v1\/?$/, "");

// Required so the browser sends/receives the httpOnly refresh-token cookie — the API is on a
// different origin (Render) than the SPA (Vercel) in production, so cookies need this opt-in.
export const api = axios.create({ baseURL, withCredentials: true });

/**
 * Uploaded file URLs come back from the backend as origin-relative paths
 * (e.g. "/uploads/xxx.png") since it doesn't know its own public hostname.
 * The frontend is served from a different origin (Vite dev server / static
 * host), so `<img src="/uploads/...">` would resolve against the wrong host
 * and 404 — this resolves it against the API's actual origin instead.
 */
export function resolveMediaUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${apiOrigin}${url}`;
}

// Attach the access token (and, for guest cart requests, a session id) to every request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.url?.startsWith("/cart") || config.url?.startsWith("/orders")) {
    // Guests need a session id both for their cart and to complete guest checkout on /orders.
    config.headers["X-Session-Id"] = getGuestSessionId();
  }
  return config;
});

let refreshPromise = null;

/** Exchanges the httpOnly refresh-token cookie for a new token pair. De-duplicated so parallel
 * 401s only refresh once. */
async function refreshTokens() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then(({ data }) => {
        tokenStorage.setTokens(data.data);
        return data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// On a 401 (expired access token), refresh once and retry the original request.
// If the refresh itself fails, clear tokens and let the caller's UI react to being logged out.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.startsWith("/auth/");

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        await refreshTokens();
        return api(original);
      } catch {
        tokenStorage.clear();
        window.dispatchEvent(new CustomEvent("Veluntra:session-expired"));
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Every endpoint responds with { success, data, meta? }. `unwrap` returns
 * just the payload (`data`) for the common case; when pagination `meta`
 * is needed too, read `response.data` (the full envelope) directly instead.
 */
export function unwrap(response) {
  return response.data.data;
}

export default api;
