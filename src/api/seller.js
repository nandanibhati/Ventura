import api, { unwrap } from "../lib/api";

export const sellerApi = {
  overview: (params) => api.get("/seller/overview", { params }).then(unwrap),
  listProducts: (params) => api.get("/seller/products", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  listOrders: (params) => api.get("/seller/orders", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  updateOrderStatus: (id, payload) => api.patch(`/seller/orders/${id}/status`, payload).then(unwrap),
  listCustomers: () => api.get("/seller/customers").then(unwrap),
  getStore: () => api.get("/seller/store").then(unwrap),
  updateStoreBranding: (payload) => api.patch("/seller/store", payload).then(unwrap),
  requestFulfillment: (orderId, orderItemId, sellerNote) =>
    api.post("/seller/fulfillment-requests", { orderId, orderItemId, sellerNote }).then(unwrap),
};
