import api, { unwrap } from "../lib/api";

export const partnerApplicationsApi = {
  create: (payload) => api.post("/partner-applications", payload).then(unwrap),
};
