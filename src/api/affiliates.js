import api, { unwrap } from "../lib/api";

export const affiliatesApi = {
  /** Returns null if the current user doesn't have an affiliate profile. */
  getMine: () => api.get("/affiliates/me").then(unwrap),
};
