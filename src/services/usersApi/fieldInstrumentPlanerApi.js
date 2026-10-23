import api from "../api";

export const getAllRecords = (params = {}) => {
    return api.get("/user/get-engineering-records", {
        params,
    });
};

export const getCalibrationUser = () => {
    return api.get("/role-based-users");
};



export const getFieldInstrumentPlannerDetail = (id) =>
    api.get(`/user/show-field-instrument-planner-record/${id}`);

export const executeFieldInstrumentPlannerActivity = (id, payload) =>
    api.post(`/user/field-instrument-planner-record-stage/${id}`, payload);

export const addFieldInstrumentPlanner = (payload) =>
    api.post("/user/store-field-instrument-planner-record", payload);

export const updateFieldInstrumentPlanner = (id, payload) =>
    api.put(`/user/update-field-instrument-planner-record/${id}`, payload);

export const getFieldInstrumentAuditRecord = (id, params = {}) => {
    return api.get(`/user/field-instrument-audit-listing/${id}`, {params});
};

export const getAllFieldInstrumentPlannerData = () => {
    return api.get("/user/all-fields-instrument-masters");
};

export const getFieldInstrumentPlannerReport = (id) => {
    return api.get(`/user/field-instrument-planner-singleReport/${id}`, {
        responseType: "blob",
    });
};

export const getFieldInstrumentPlannerAudit = (id, params = {}) => {
    return api.get(`/user/field-instrument-planner-audit-listing/${id}`, {params});
};