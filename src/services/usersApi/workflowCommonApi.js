import api from "../api";

export const getAllActivites = (stageId) => {
    return api.get(`/user/activities-list/${stageId}`);
};

export const getAllActivityLogs = (recordId, processId) => {
    return api.get(`/user/user-activity-history/${recordId}/${processId}`);
};

export const getAllPermissions = (recordId) => {
    return api.get(`/user/user-record-permission/${recordId}`);
};

export const getRecordNumber = (processId) => {
    return api.get(`/user/generate-record-number/${processId}`);
};

export const getAllStages = (processId) => {
    return api.get(`/user/stages-list/${processId}`);
};

export const getAllDepartments = () => {
    return api.get("/user/user-departments-listing");
};

export const getAllDepartmentMasters = (departmentId, type) => {
    return api.get(`/user/get-master-data/${departmentId}/${type}`);
};

export const getAllDepartmentMastersGlobal = (type) => {
    return api.get(`/user/get-master-data-global/${type}`);
};

export const getRecordNotifications = (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return api.get(
        `/user/record-notifications${query ? `?${query}` : ""}`
    );
};