import api, { unwrap } from "../lib/api";

export const productsApi = {
  /** Returns { items, meta } — paginated. */
  list: (params) => api.get("/products", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  getById: (id) => api.get(`/products/${id}`).then(unwrap),
  create: (payload) => api.post("/products", payload).then(unwrap),
  update: (id, payload) => api.patch(`/products/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/products/${id}`).then(unwrap),
  exportCsv: () => api.get("/products/export", { responseType: "blob" }).then((r) => r.data),
  importCsv: (file, storeId) => {
    const form = new FormData();
    form.append("file", file);
    if (storeId) form.append("storeId", storeId);
    return api.post("/products/import", form, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
  },
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
