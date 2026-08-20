import api from "../api";

export const getAudits = (params = {}) => {
    return api.get("/admin/audit-listing", {
        params,
    });
};