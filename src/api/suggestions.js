import api, { unwrap } from "../lib/api";

export const suggestionsApi = {
  create: (payload) => api.post("/suggestions", payload).then(unwrap),
};
