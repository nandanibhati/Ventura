import api, { unwrap } from "../lib/api";

export const ordersApi = {
  create: (payload) => api.post("/orders", payload).then(unwrap),
  /** Public, unauthenticated order-status lookup by order number + email — for the storefront
   * chatbot's "track my order" flow, works for guest and logged-in orders alike. */
  track: (orderNumber, email) => api.post("/orders/track", { orderNumber, email }).then(unwrap),
  list: (params) => api.get("/orders", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  getById: (id) => api.get(`/orders/${id}`).then(unwrap),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }).then(unwrap),
  requestReturn: (id, reason) => api.post(`/orders/${id}/return`, { reason }).then(unwrap),
  requestExchange: (id, reason) => api.post(`/orders/${id}/exchange`, { reason }).then(unwrap),
  /** Downloads the invoice PDF (auth header required, so this can't just be a plain <a href>). */
  downloadInvoice: async (id, orderNumber) => {
    const response = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${orderNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const addressesApi = {
  list: () => api.get("/addresses").then(unwrap),
  create: (payload) => api.post("/addresses", payload).then(unwrap),
  update: (id, payload) => api.patch(`/addresses/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/addresses/${id}`).then(unwrap),
};

export const wishlistApi = {
  list: () => api.get("/wishlist").then(unwrap),
  add: (productId) => api.post("/wishlist", { productId }).then(unwrap),
  remove: (productId) => api.delete(`/wishlist/${productId}`).then(unwrap),
};

export const notificationsApi = {
  list: () => api.get("/notifications").then(unwrap),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then(unwrap),
  markAllRead: () => api.patch("/notifications/read-all").then(unwrap),
  registerDevice: (token, platform) => api.post("/notifications/register-device", { token, platform }).then(unwrap),
};
