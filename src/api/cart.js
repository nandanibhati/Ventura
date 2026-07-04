import api, { unwrap } from "../lib/api";

export const cartApi = {
  get: () => api.get("/cart").then(unwrap),
  addItem: (payload) => api.post("/cart/items", payload).then(unwrap),
  updateItem: (itemId, quantity) => api.patch(`/cart/items/${itemId}`, { quantity }).then(unwrap),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`).then(unwrap),
  applyCoupon: (code) => api.post("/cart/coupon", { code }).then(unwrap),
  removeCoupon: () => api.delete("/cart/coupon").then(unwrap),
  merge: (sessionId) => api.post("/cart/merge", { sessionId }).then(unwrap),
};

export const couponsApi = {
  list: (params) => api.get("/coupons", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  create: (payload) => api.post("/coupons", payload).then(unwrap),
  update: (id, payload) => api.patch(`/coupons/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/coupons/${id}`).then(unwrap),
};
