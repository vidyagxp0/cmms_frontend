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

// All FIeld Instruments API

export const getAllFieldInstruments = (params = {}) => {
    return api.get("/user/field-instruments-listing", {
        params,
    });
};
export const getFieldInstrumentDetail = (id) =>
    api.get(`/user/fields-instrument-master-detail/${id}`);

export const addFieldInstrument = (payload) =>
    api.post("/user/store-field-instrument-master", payload);

export const updateFieldInstrument = (id, payload) =>
    api.put(`/user/update-master-fields-instrument/${id}`, payload);

// export const deleteRole = (id) =>
//     api.delete(`/admin/delete-role/${id}`);