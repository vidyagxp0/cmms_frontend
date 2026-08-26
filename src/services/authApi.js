import api from "./api";

export const login = (payload) => api.post("/login", payload);

export const logout = () => api.post("/logout");

export const getProfile = () => api.get("/profile");

export const updateProfile = (payload) => api.put("/update/profile", payload);

export const changePasword = (payload) => api.put("/change-password", payload);
