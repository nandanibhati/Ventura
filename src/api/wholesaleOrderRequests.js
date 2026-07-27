import api, { unwrap } from "../lib/api";

export const wholesaleOrderRequestsApi = {
  /** Wholesaler sees only their own; admin sees everyone's — scoped server-side by role. */
  list: (params) => api.get("/wholesale-order-requests", { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  create: (payload) => api.post("/wholesale-order-requests", payload).then(unwrap),
  setStatus: (id, status) => api.patch(`/wholesale-order-requests/${id}/status`, { status }).then(unwrap),
};
