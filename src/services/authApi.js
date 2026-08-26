import api from "./api";

export const login = (payload) => api.post("/login", payload);

export const logout = () => api.post("/logout");

export const getProfile = () => api.get("/profile");

export const updateProfile = () => api.put("/update/profile");

export const changePasword = () => api.put("/change-password");
