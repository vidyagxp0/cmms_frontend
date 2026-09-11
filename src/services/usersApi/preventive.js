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

{/* Preventive Maintenance Management  Child Apis*/}

export const getPreventiveMaintenceDetail = (id) =>
    api.get(`/user/show-preventive-maintenance-record/${id}`);

export const addPreventiveMaintence = (payload) =>
    api.post("/user/store-preventive-maintenance-record", payload);

export const updatePreventiveMaintence = (id, payload) =>
    api.put(`/user/update-preventive-maintenance-record/${id}`, payload);

export const executePreventiveMaintenceActivity = (id, payload) =>
    api.post(`/user/preventive-maintenance-record-stage/${id}`, payload);

