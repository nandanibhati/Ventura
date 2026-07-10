import api, { unwrap } from "../lib/api";

export const adminApi = {
  listUsers: (params) => api.get("/admin/users", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  getCustomerDetail: (id) => api.get(`/admin/users/${id}`).then(unwrap),
  setUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }).then(unwrap),
  setUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then(unwrap),
  createAdmin: (payload) => api.post("/admin/users/admins", payload).then(unwrap),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(unwrap),

  listOrders: (params) => api.get("/admin/orders", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  updateOrderStatus: (id, payload) => api.patch(`/admin/orders/${id}/status`, payload).then(unwrap),
  assignSeller: (id, storeId) => api.patch(`/admin/orders/${id}/assign-seller`, { storeId }).then(unwrap),
  downloadInvoice: async (id, orderNumber) => {
    const response = await api.get(`/admin/orders/${id}/invoice`, { responseType: "blob" });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${orderNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  listProducts: (params) => api.get("/admin/products", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  listActivityLogs: (params) => api.get("/admin/activity-logs", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  analytics: (params) => api.get("/admin/analytics", { params }).then(unwrap),
  dashboardSummary: () => api.get("/admin/dashboard-summary").then(unwrap),

  resetUserPassword: (id) => api.post(`/admin/users/${id}/reset-password`).then(unwrap),
  listStores: (params) => api.get("/admin/sellers", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  setStoreStatus: (id, status) => api.patch(`/admin/sellers/${id}/status`, { status }).then(unwrap),
  setStoreCommission: (id, commissionPercent) => api.patch(`/admin/sellers/${id}/commission`, { commissionPercent }).then(unwrap),

  listSuggestions: (params) => api.get("/admin/suggestions", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  setSuggestionStatus: (id, status) => api.patch(`/admin/suggestions/${id}/status`, { status }).then(unwrap),
  deleteSuggestion: (id) => api.delete(`/admin/suggestions/${id}`).then(unwrap),

  listReviews: (params) => api.get("/admin/reviews", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  approveReview: (id) => api.post(`/admin/reviews/${id}/approve`).then(unwrap),
  rejectReview: (id) => api.post(`/admin/reviews/${id}/reject`).then(unwrap),
  setReviewFeatured: (id, isFeatured) => api.patch(`/admin/reviews/${id}/featured`, { isFeatured }).then(unwrap),
  replyToReview: (id, reply) => api.post(`/admin/reviews/${id}/reply`, { reply }).then(unwrap),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`).then(unwrap),

  listWarehouseStock: (params) => api.get("/admin/warehouse-stock", { params }).then(unwrap),
  adjustWarehouseStock: (productId, payload) => api.post(`/admin/warehouse-stock/${productId}/adjust`, payload).then(unwrap),
  warehouseStockHistory: (productId, variantId) =>
    api.get(`/admin/warehouse-stock/${productId}/history`, { params: variantId ? { variantId } : {} }).then(unwrap),
};
