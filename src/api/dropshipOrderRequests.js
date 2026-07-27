import api, { unwrap } from "../lib/api";

export const dropshipOrderRequestsApi = {
  /** Dropshipper sees only their own; admin sees everyone's — scoped server-side by role. */
  list: (params) => api.get("/dropship-order-requests", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  create: (payload) => api.post("/dropship-order-requests", payload).then(unwrap),
  setStatus: (id, status) => api.patch(`/dropship-order-requests/${id}/status`, { status }).then(unwrap),
};
