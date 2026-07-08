import api, { unwrap } from "../lib/api";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then(unwrap),
  login: (payload) => api.post("/auth/login", payload).then(unwrap),
  // The refresh token itself is never touched by JS — it lives in an httpOnly cookie the browser
  // attaches automatically (see withCredentials in lib/api.js), so nothing is passed here.
  refresh: () => api.post("/auth/refresh").then(unwrap),
  logout: () => api.post("/auth/logout").then(unwrap),
  me: () => api.get("/auth/me").then(unwrap),
  requestPasswordReset: (email) => api.post("/auth/password/forgot", { email }).then(unwrap),
  resetPassword: (token, newPassword) => api.post("/auth/password/reset", { token, newPassword }).then(unwrap),
  requestEmailVerification: () => api.post("/auth/email/verify/request").then(unwrap),
  verifyEmail: (token) => api.post("/auth/email/verify", { token }).then(unwrap),
};
