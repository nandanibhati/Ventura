/**
 * Token persistence, isolated behind a small interface so a future React
 * Native app can swap this module for SecureStore/AsyncStorage without
 * touching anything that calls it.
 */
const ACCESS_KEY = "ventura.accessToken";
const REFRESH_KEY = "ventura.refreshToken";

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

/** Guest cart session id — a client-generated UUID persisted so an anonymous cart survives a refresh. */
const SESSION_KEY = "ventura.guestSessionId";

export function getGuestSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function clearGuestSessionId() {
  localStorage.removeItem(SESSION_KEY);
}
