import api from "../api";

export const getPreventiveDetail = (id) =>
    api.get(`/user/show-preventive-planner-record/${id}`);

export const addPreventive = (payload) =>
    api.post("/user/store-preventive-planner-record", payload);

export const updatePreventive = (id, payload) =>
    api.put(`/user/update-preventive-planner-record/${id}`, payload);

export const executePreventiveActivity = (id, payload) =>
    api.post(`/user/preventive-planner-record-stage/${id}`, payload);




// export const deleteRole = (id) =>
//     api.delete(`/admin/delete-role/${id}`);