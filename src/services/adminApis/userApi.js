import api from "../api";

export const getUsers = () =>
    api.get("/admin/users-listing");

export const getPid = () =>
    api.get("/admin/users-pid");

export const getUsersDetail = (id) =>
    api.get(`/admin/user-detail/${id}`);

export const addUsers = (payload) =>
    api.post("/admin/store-user", payload);

export const updateUsers = (id, payload) =>
    api.put(`/admin/update-user/${id}`, payload);

export const deleteUser = (id) =>
    api.delete(`/admin/delete-user/${id}`);