import api from "../api";

export const getAllStages = (processId) => {
    return api.get(`/user/stages-list/${processId}`);
};

export const getAllActivites = (stageId) => {
    return api.get(`/user/activities-list/${stageId}`);
};

export const getAllActivityLogs = (recordId) => {
    return api.get(`/user/user-activity-history/${recordId}`);
};

