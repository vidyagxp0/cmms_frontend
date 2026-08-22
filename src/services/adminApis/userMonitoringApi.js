import api from "../api";

export const getUserMonitoring = (params = {}) => {
    return api.get("/admin/user-activity-logs", {
        params,
    });
};