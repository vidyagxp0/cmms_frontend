import api from "../api";

export const getAllActivites = (stageId) => {
    return api.get(`/user/activities-list/${stageId}`);
};

export const getAllActivityLogs = (recordId) => {
    return api.get(`/user/user-activity-history/${recordId}`);
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
