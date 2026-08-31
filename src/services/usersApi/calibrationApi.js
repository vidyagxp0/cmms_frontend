import api from "../api";

export const getAllRecords = (params = {}) => {
    return api.get("/user/get-engineering-records", {
        params,
    });
};

export const getCalibrationUser = () => {
    return api.get("/role-based-users");
};

export const getCalibrationDetail = (id) =>
    api.get(`/user/show-calibration-planner-record/${id}`);

export const executeCalibrationActivity = (id, payload) =>
    api.post(`/user/calibrationPlanner-record-stage/${id}`, payload);

export const addCalibration = (payload) =>
    api.post("/user/store-calibration-planner-record", payload);

export const updateCalibration = (id, payload) =>
    api.put(`/user/update-calibration-planner-record/${id}`, payload);

export const getCalibrationAuditRecord = (id, params = {}) => {
    return api.get(`/user/calibration-audit-listing/${id}`, {params});
};
