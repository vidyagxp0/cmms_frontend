import api from "../api";


// Spare Instrument Master All APis
export const getSpareInstrumentMasterDetail = (id) =>
    api.get(`/user/spare-instrument-master-detail/${id}`);

export const executeSpareInstrumentActivity = (id, payload) =>
    api.post(`/user/spare-instrument-record-stage/${id}`, payload);

export const addSpareInstrumentMaster = (payload) =>
    api.post("/user/store-spare-instrument-master", payload);

export const updateSpareInstrumentMaster = (id, payload) =>
    api.put(`/user/update-master-spare-instrument/${id}`, payload);

export const getSpareInstrumentAuditRecord = (id, params = {}) => {
    return api.get(`/user/spare-instruments/audit-trail/${id}`, {params});
};

export const getAllPermissionsSpareInstrument = (recordId) => {
    return api.get(`/user/spare-instrument-record-permission/${recordId}`);
};