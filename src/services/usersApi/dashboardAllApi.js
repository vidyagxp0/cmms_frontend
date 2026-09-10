import api from "../api";

export const getAllCalibrationPlannerRecords = (params = {}) => {
    return api.get("/user/get-calibration-planner-records", {
        params,
    });
};

export const getAllCalibrationManagementRecords = (params = {}) => {
    return api.get("/user/get-calibration-management-records", {
        params,
    });
};