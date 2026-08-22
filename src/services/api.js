import axios from "axios";
import { appConfig } from "../config/appConfig";

const api = axios.create({
    baseURL: appConfig.apiUrl,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

api.interceptors.request.use(
    (config) => {
        const authType = sessionStorage.getItem("auth_type");

        let token = null;

        if (authType === "Admin") {
            token = sessionStorage.getItem("admin_token");
        } else if (authType === "User") {
            token = sessionStorage.getItem("user_token");
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem("admin_token");
            sessionStorage.removeItem("user_token");
            sessionStorage.removeItem("auth_type");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;