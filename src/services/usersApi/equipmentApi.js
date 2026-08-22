import api from "../api";

export const getAllEquipment = (params = {}) => {
    return api.get("/user/equipment-master-listing", {
        params,
    });
};
export const getEquipmentDetail = (id) =>
    api.get(`/user/equipment-master-detail/${id}`);

export const addEquipment = (payload) =>
    api.post("/user/store-equipment-master", payload);

export const updateEquipment = (id, payload) =>
    api.put(`/user/update-master-equipment/${id}`, payload);

// export const deleteRole = (id) =>
//     api.delete(`/admin/delete-role/${id}`);