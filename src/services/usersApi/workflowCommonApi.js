import api from "../api";
import { cachedRequest } from "../requestCache";

// Workflow configuration (stage lists, stage activities, departments) is the
// same for every record, so it is cached and shared between pages.
// Record-specific data (permissions, logs, record numbers) is NEVER cached.

export const getAllActivites = (stageId) =>
    cachedRequest(`activities:${stageId}`, () =>
        api.get(`/user/activities-list/${stageId}`)
    );

export const getAllActivityLogs = (recordId, processId) => {
    return api.get(`/user/user-activity-history/${recordId}/${processId}`);
};

export const getAllPermissions = (recordId) => {
    return api.get(`/user/user-record-permission/${recordId}`);
};

export const getRecordNumber = (processId) => {
    return api.get(`/user/generate-record-number/${processId}`);
};

export const getAllStages = (processId) =>
    cachedRequest(`stages:${processId}`, () =>
        api.get(`/user/stages-list/${processId}`)
    );

export const getAllDepartments = () =>
    cachedRequest("departments", () =>
        api.get("/user/user-departments-listing")
    );

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

//Fetch Master Deprtment APi
export const getAllMasterDepartments = () =>
    api.get("/user/all-equipment-masters");
