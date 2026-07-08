/**
 * Token persistence, isolated behind a small interface so a future React
 * Native app can swap this module for SecureStore/AsyncStorage without
 * touching anything that calls it.
 *
 * The refresh token is NOT stored here — it lives in an httpOnly cookie the browser manages
 * on its own, never readable by JS. Only the short-lived access token is kept in localStorage.
 */
const ACCESS_KEY = "Veluntra.accessToken";

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  setTokens: ({ accessToken }) => {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
  },
};

/** Guest cart session id — a client-generated UUID persisted so an anonymous cart survives a refresh. */
const SESSION_KEY = "Veluntra.guestSessionId";

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
