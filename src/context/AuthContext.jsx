import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import { tokenStorage, getGuestSessionId, clearGuestSessionId } from "../lib/tokenStorage";
import { cartApi } from "../api/cart";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "guest"

  const bootstrap = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setStatus("guest");
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
    } catch {
      tokenStorage.clear();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    bootstrap();
    const onExpired = () => {
      setUser(null);
      setStatus("guest");
    };
    window.addEventListener("Veluntra:session-expired", onExpired);
    return () => window.removeEventListener("Veluntra:session-expired", onExpired);
  }, [bootstrap]);

  const afterAuth = useCallback(async (result) => {
    tokenStorage.setTokens(result);
    setUser(result.user);
    setStatus("authenticated");
    // Fold any guest cart built up before login into the now-authenticated user's cart.
    const sessionId = getGuestSessionId();
    try {
      await cartApi.merge(sessionId);
    } catch {
      // Non-fatal — the user's own cart is still usable even if the merge fails.
    } finally {
      clearGuestSessionId();
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      const result = await authApi.login({ email, password });
      await afterAuth(result);
      return result.user;
    },
    [afterAuth]
  );

  const register = useCallback(
    async (payload) => {
      const result = await authApi.register(payload);
      await afterAuth(result);
      return result.user;
    },
    [afterAuth]
  );

  const logout = useCallback(async () => {
    tokenStorage.clear();
    setUser(null);
    setStatus("guest");
    // The refresh token itself lives in an httpOnly cookie the browser attaches automatically —
    // best-effort revoke server-side; the local session is already cleared either way.
    authApi.logout().catch(() => {});
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      role: user?.role || null,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, status, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
