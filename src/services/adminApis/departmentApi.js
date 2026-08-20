import api from "../api";

export const addDepartment = (payload) =>
    api.post("/admin/store-department", payload);

export const getDepartments = () =>
    api.get("/admin/departments-listing");

export const updateDepartment = (id, payload) =>
    api.put(`/admin/update-department/${id}`, payload);

export const deleteDepartment = (id) =>
    api.delete(`/admin/delete-department/${id}`);