import api from "../api";

export const getRoles = () =>
    api.get("/admin/roles-listing");

export const getRoleDetail = (id) =>
    api.get(`/admin/role-detail/${id}`);

export const addRole = (payload) =>
    api.post("/admin/store-role", payload);

export const updateRole = (id, payload) =>
    api.put(`/admin/update-role/${id}`, payload);

export const deleteRole = (id) =>
    api.delete(`/admin/delete-role/${id}`);