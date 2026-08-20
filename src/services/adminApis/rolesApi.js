import api from "../api";

export const addRole = (payload) => api.post("/admin/store-role", payload);

export const getRoles = () => api.get("/admin/roles-listing");
