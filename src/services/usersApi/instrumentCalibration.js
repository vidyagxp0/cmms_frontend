import api from "../api";

export const getInstrumentCalibrationDetail = (id) =>
    api.get(`/user/show-addendum-field-instrument-planner-record/${id}`);

export const executeInstrumentCalibrationActivity = (id, payload) =>
    api.post(`/user/addendum-field-instrument-planner-moveStage/${id}`, payload);

export const addInstrumentCalibration = (payload) =>
    api.post("/user/store-addendum-field-instrument-planner-record", payload);

export const updateInstrumentCalibration = (id, payload) =>
    api.put(`/user/update-addendum-field-instrument-planner-record/${id}`, payload);


export const getAllInstrumentCalibrationData = (params = {}) => {
    // return api.get("/user/addendum-field-instrument-planner-records");
      return api.get("/user/addendum-field-instrument-planner-records", {
        params,
    });
};

export const getInstrumentCalibrationReport = (id) => {
    return api.get(`/user/addendum-field-instrument-planner-singleReport/${id}`, {
        responseType: "blob",
    });
};

export const getInstrumentCalibrationAudit = (id, params = {}) => {
    return api.get(`/user/addendum-field-instrument-planner-audit/${id}`, {params});
};

export const getAllFieldsInstrumentMasters = () => {
    return api.get("/user/all-fields-instrument-masters");
};