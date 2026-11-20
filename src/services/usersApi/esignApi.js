import axios from "axios";
import { appConfig } from "../../config/appConfig";

// Plain instance — NO auto-logout on 401
const esignApi = axios.create({
  baseURL: appConfig.apiUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Still attach the token so the backend can identify the current session if needed
esignApi.interceptors.request.use(
  (config) => {
    const authType = sessionStorage.getItem("auth_type");
    const token =
      authType === "Admin"
        ? sessionStorage.getItem("admin_token")
        : authType === "User"
        ? sessionStorage.getItem("user_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const eSignChecklist = (payload) =>
  esignApi.post("/user/check-user-crendentials", payload);