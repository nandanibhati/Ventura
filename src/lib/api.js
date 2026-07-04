import axios from "axios";
import { tokenStorage, getGuestSessionId } from "./tokenStorage";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({ baseURL });

// Attach the access token (and, for guest cart requests, a session id) to every request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.url?.startsWith("/cart")) {
    config.headers["X-Session-Id"] = getGuestSessionId();
  }
  return config;
});

let refreshPromise = null;

/** Exchanges the stored refresh token for a new pair. De-duplicated so parallel 401s only refresh once. */
async function refreshTokens() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken })
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
        window.dispatchEvent(new CustomEvent("ventura:session-expired"));
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
