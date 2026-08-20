import axios from "axios";
import { appConfig } from "../config/appConfig";

const api = axios.create({
  baseURL: appConfig.apiUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  timeout: 30000
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");

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
      sessionStorage.removeItem("access_token");
      // Central auth redirect can be added here later.
    }

    return Promise.reject(error);
  }
);

export default api;
