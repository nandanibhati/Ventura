import api, { unwrap } from "../lib/api";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then(unwrap),
  login: (payload) => api.post("/auth/login", payload).then(unwrap),
  refresh: (refreshToken) => api.post("/auth/refresh", { refreshToken }).then(unwrap),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }).then(unwrap),
  me: () => api.get("/auth/me").then(unwrap),
  requestPasswordReset: (email) => api.post("/auth/password/forgot", { email }).then(unwrap),
  resetPassword: (token, newPassword) => api.post("/auth/password/reset", { token, newPassword }).then(unwrap),
  requestEmailVerification: () => api.post("/auth/email/verify/request").then(unwrap),
  verifyEmail: (token) => api.post("/auth/email/verify", { token }).then(unwrap),
};
