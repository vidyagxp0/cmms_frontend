import api from "./api";

export const getCalibrations = (params = {}) =>
  api.get("/calibrations", { params });

export const getCalibration = (id) =>
  api.get(`/calibrations/${id}`);

export const createCalibration = (payload) =>
  api.post("/calibrations", payload);

export const updateCalibration = (id, payload) =>
  api.put(`/calibrations/${id}`, payload);

export const deleteCalibration = (id) =>
  api.delete(`/calibrations/${id}`);
