import api, { unwrap } from "../lib/api";

export const productsApi = {
  /** Returns { items, meta } — paginated. */
  list: (params) => api.get("/products", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  getById: (id) => api.get(`/products/${id}`).then(unwrap),
  /** Full edit-form detail (cost price, reserved stock) — owning seller or admin only. */
  getByIdForManage: (id) => api.get(`/products/${id}/manage`).then(unwrap),
  /** Whole-catalogue browse at dropship pricing — approved dropshipper/admin only. */
  listDropshipCatalogue: (params) =>
    api.get("/products/dropship-catalogue", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  create: (payload) => api.post("/products", payload).then(unwrap),
  update: (id, payload) => api.patch(`/products/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/products/${id}`).then(unwrap),
  duplicate: (id) => api.post(`/products/${id}/duplicate`).then(unwrap),
  exportCsv: () => api.get("/products/export", { responseType: "blob" }).then((r) => r.data),
  importCsv: (file, storeId) => {
    const form = new FormData();
    form.append("file", file);
    if (storeId) form.append("storeId", storeId);
    return api.post("/products/import", form, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
  },

  bulkUpdatePrice: (ids, mode, value) => api.post("/products/bulk/price", { ids, mode, value }).then(unwrap),
  bulkUpdateStock: (ids, mode, value, reason) => api.post("/products/bulk/stock", { ids, mode, value, reason }).then(unwrap),
  bulkUpdateStatus: (ids, status) => api.post("/products/bulk/status", { ids, status }).then(unwrap),
  bulkUpdateCategory: (ids, categoryId) => api.post("/products/bulk/category", { ids, categoryId }).then(unwrap),
  bulkUpdateBrand: (ids, brandId) => api.post("/products/bulk/brand", { ids, brandId }).then(unwrap),
  bulkUpdateTags: (ids, mode, tags) => api.post("/products/bulk/tags", { ids, mode, tags }).then(unwrap),
  bulkDelete: (ids) => api.post("/products/bulk/delete", { ids }).then(unwrap),

  adjustStock: (id, payload) => api.post(`/products/${id}/stock-adjustment`, payload).then(unwrap),
  inventoryHistory: (id, params) => api.get(`/products/${id}/inventory-history`, { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  getAnalytics: (id) => api.get(`/products/${id}/analytics`).then(unwrap),
};

export const reviewsApi = {
  listForProduct: (productId) => api.get(`/products/${productId}/reviews`).then(unwrap),
  create: (productId, payload) => api.post(`/products/${productId}/reviews`, payload).then(unwrap),
  markHelpful: (productId, reviewId) => api.post(`/products/${productId}/reviews/${reviewId}/helpful`).then(unwrap),
  reportAbuse: (productId, reviewId) => api.post(`/products/${productId}/reviews/${reviewId}/report`).then(unwrap),
  listFeatured: (limit) => api.get("/reviews/featured", { params: { limit } }).then(unwrap),
};

export const uploadsApi = {
  uploadImages: (files) => {
    const form = new FormData();
    for (const file of files) form.append("files", file);
    return api.post("/uploads/images", form, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
  },
};
