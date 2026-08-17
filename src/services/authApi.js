import api from "./api";

export const login = (payload) => api.post("/login", payload);

export const logout = () => api.post("/logout");

// export const getCurrentUser = () => api.get("/auth/me");
