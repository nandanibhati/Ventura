import api, { unwrap } from "../lib/api";

export const categoriesApi = {
  list: () => api.get("/categories").then(unwrap),
  create: (payload) => api.post("/categories", payload).then(unwrap),
  update: (id, payload) => api.patch(`/categories/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/categories/${id}`).then(unwrap),
  reorder: (items) => api.patch("/categories/reorder", { items }).then(unwrap),
};

export const brandsApi = {
  list: () => api.get("/brands").then(unwrap),
  create: (payload) => api.post("/brands", payload).then(unwrap),
  update: (id, payload) => api.patch(`/brands/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/brands/${id}`).then(unwrap),
  reorder: (items) => api.patch("/brands/reorder", { items }).then(unwrap),
};

export const statsApi = {
  getPublicStats: () => api.get("/stats").then(unwrap),
};

export const settingsApi = {
  getPublic: () => api.get("/settings").then(unwrap),
  getForAdmin: () => api.get("/settings/admin").then(unwrap),
  update: (payload) => api.patch("/settings/admin", payload).then(unwrap),
  getAuditHistory: (params) => api.get("/settings/admin/history", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  restore: (logId, reason) => api.post(`/settings/admin/history/${logId}/restore`, { reason }).then(unwrap),
};

export const permissionsApi = {
  getGrid: () => api.get("/permissions").then(unwrap),
  bulkSet: (items, reason) => api.patch("/permissions", { items, reason }).then(unwrap),
};

export const promotionsApi = {
  listActive: () => api.get("/promotions/active").then(unwrap),
  list: (params) => api.get("/promotions", { params }).then((r) => r.data),
  create: (payload) => api.post("/promotions", payload).then(unwrap),
  update: (id, payload) => api.patch(`/promotions/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/promotions/${id}`).then(unwrap),
};

export const shippingApi = {
  list: () => api.get("/shipping-methods").then(unwrap),
  create: (payload) => api.post("/shipping-methods", payload).then(unwrap),
  update: (id, payload) => api.patch(`/shipping-methods/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/shipping-methods/${id}`).then(unwrap),
};

export const homepageApi = {
  listPublic: () => api.get("/homepage/sections").then(unwrap),
  listAll: () => api.get("/homepage/admin/sections").then(unwrap),
  create: (payload) => api.post("/homepage/admin/sections", payload).then(unwrap),
  update: (id, payload) => api.patch(`/homepage/admin/sections/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/homepage/admin/sections/${id}`).then(unwrap),
  reorder: (items) => api.patch("/homepage/admin/sections/reorder", { items }).then(unwrap),
  getHistory: (params) => api.get("/homepage/admin/history", { params }).then(unwrap),
  restoreSection: (logId, reason) => api.post(`/homepage/admin/history/${logId}/restore`, { reason }).then(unwrap),
};
