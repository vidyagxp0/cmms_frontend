import api from "../api";

export const getAllRecords = (params = {}) => {
    return api.get("/user/get-engineering-records",
        {
        params,
        });
};
export const getCalibrationDetail = (id) =>
    api.get(`/user/show-calibration-planner-record/${id}`);

export const addCalibration = (payload) =>
    api.post("/user/store-calibration-planner-record", payload);

export const updateEquipment = (id, payload) =>
    api.put(`/user/update-calibration-planner-record/${id}`, payload);

// export const getAllEquipment = (params = {}) => {
//     return api.get("/user/equipment-master-listing", {
//         params,
//     });
// };