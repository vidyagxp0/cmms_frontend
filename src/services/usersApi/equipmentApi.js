import api from "../api";

export const getAllEquipment = (params = {}) => {
    return api.get("/user/equipment-master-listing", {
        params,
    });
};
export const getEquipmentDetail = (id) =>
    api.get(`/user/equipment-master-detail/${id}`);

export const addEquipment = (payload) =>
    api.post("/user/store-equipment-master", payload);

export const updateEquipment = (id, payload) =>
    api.put(`/user/update-master-equipment/${id}`, payload);

//Equipment instrument master flow api

export const getAllPermissions = (recordId) => {
    return api.get(`/user/instrument-record-permission/${recordId}`);
};

export const executeCalibrationActivity = (id, payload) =>
    api.post(`/user/instrument-master-record-stage/${id}`, payload);

export const getInstrumentAuditTrail = (id, params = {}) => {
  return api.get(`/user/instruments/audit-trail/${id}`, {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      ...(params.search?.trim()
        ? { search: params.search.trim() }
        : {}),
      ...(params.from_date
        ? { from_date: params.from_date }
        : {}),
      ...(params.to_date
        ? { to_date: params.to_date }
        : {}),
    },
  });
};

export const getInstrumentReport = (id) => {
    return api.get(`/user/instrument-singleReport/${id}`, {
        responseType: "blob",
    });
};

// All FIeld Instruments API

export const getAllFieldInstruments = (params = {}) => {
    return api.get("/user/fields-instrument-master-listing", {
        params,
    });
};
export const getFieldInstrumentDetail = (id) =>
    api.get(`/user/fields-instrument-master-detail/${id}`);

export const addFieldInstrument = (payload) =>
    api.post("/user/store-fields-instrument-master", payload);

export const updateFieldInstrument = (id, payload) =>
    api.put(`/user/update-master-fields-instrument/${id}`, payload);


export const getAllPermissionsFieldInstrument = (recordId) => {
    return api.get(`/user/field-instrument-record-permission/${recordId}`);
};

export const executeFieldInstrumentActivity = (id, payload) =>
    api.post(`/user/fields-instrument-record-stage/${id}`, payload);


export const getFieldInstrumentAuditTrail = (id, params = {}) => {
  return api.get(
    `/user/fields-instruments/audit-trail/${id}`,
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        ...(params.search ? { search: params.search } : {}),
        ...(params.from_date ? { from_date: params.from_date } : {}),
        ...(params.to_date ? { to_date: params.to_date } : {}),
      },
    }
  );
};

export const getFieldInstrumentReport = (id) => {
    return api.get(`/user/fieldInstrument-singleReport/${id}`, {
        responseType: "blob",
    });
};