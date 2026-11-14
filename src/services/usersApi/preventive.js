import api from "../api";

export const getPreventiveDetail = (id) =>
    api.get(`/user/show-preventive-planner-record/${id}`);

export const addPreventive = (payload) =>
    api.post("/user/store-preventive-planner-record", payload);

export const updatePreventive = (id, payload) =>
    api.put(`/user/update-preventive-planner-record/${id}`, payload);

export const executePreventiveActivity = (id, payload) =>
    api.post(`/user/preventive-planner-record-stage/${id}`, payload);

export const getPreventivePlannerSingleReport = (id) => {
    return api.get(`/user/preventive-planner-singleReport/${id}`, {
        responseType: "blob",
    });
};

export const getPreventiveAuditListing = (id, params = {}) => {
    return api.get(`/user/preventive-planner-audit-listing/${id}`, {params});
};

// export const deleteRole = (id) =>
//     api.delete(`/admin/delete-role/${id}`);

{/* Preventive Maintenance Management  Child Apis*/}

export const getPreventiveMaintenceDetail = (id) =>
    api.get(`/user/show-preventive-maintenance-record/${id}`);

export const addPreventiveMaintence = (payload) =>
    api.post("/user/store-preventive-maintenance-record", payload);

export const updatePreventiveMaintence = (id, payload) =>
    api.put(`/user/update-preventive-maintenance-record/${id}`, payload);

export const executePreventiveMaintenceActivity = (id, payload) =>
    api.post(`/user/preventive-maintenance-record-stage/${id}`, payload);

export const getEquipmentMasterChecklist = (equipmentId, frequency) => {
  return api.get(
    `/user/equipment-master-checklist/${equipmentId}/${(frequency)}`
  );
};

export const getPrevemtiveMaintenanceAuditListing = (id, params = {}) => {
    return api.get(`/user/preventive-maintenance-audit-listing/${id}`, {params});
};

export const getPreventiveMaintenanceSingleReport = (id) => {
    return api.get(`/user/addendum-peventive-management-singleReport/${id}`, {
        responseType: "blob",
    });
};


// All Addendum Preventive Planner APIs

export const getAddendumPreventiveDetail = (id) =>
    api.get(`/user/preventive-addendum-detail/${id}`);

export const addAddendumPreventive = (payload) =>
    api.post("/user/store-preventive-addendum", payload);

export const updateAddendumPreventive = (id, payload) =>
    api.put(`/user/update-preventive-addendum/${id}`, payload);

export const executeAddendumPreventiveActivity = (id, payload) =>
    api.post(`/user/preventive-addendum-record-stage/${id}`, payload);

export const getAddendumPreventivePlannerSingleReport = (id) => {
    return api.get(`/user/preventive-addendum-report/${id}`, {
        responseType: "blob",
    });
};

export const getAddendumPreventiveAuditListing = (id, params = {}) => {
    return api.get(`/user/preventive-addendum/audit-trail/${id}`, {params});
};

// All Addendum Preventive Child APIs

export const getAddendumPreventiveChildDetail = (id) =>
    api.get(`/user/show-addendum-peventive-management-record/${id}`);

export const addAddendumPreventiveChild = (payload) =>
    api.post("/user/store-addendum-peventive-management-record", payload);

export const updateAddendumPreventiveChild = (id, payload) =>
    api.put(`/user/update-addendum-peventive-management-record/${id}`, payload);

export const executeAddendumPreventiveActivityChild = (id, payload) =>
    api.post(`/user/addendumpeventiveManagement-record-stage/${id}`, payload);

export const getAddendumPreventivePlannerSingleReportChild = (id) => {
    return api.get(`/user/addendum-peventive-management-singleReport/${id}`, {
        responseType: "blob",
    });
};

export const getAddendumPreventiveAuditListingChild = (id, params = {}) => {
    return api.get(`/user/addendum-peventive-management-audit/${id}`, {params});
};