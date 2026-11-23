import axios from "axios";
import { appConfig } from "../config/appConfig";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
    baseURL: appConfig.apiUrl,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

const getActiveToken = () => {
    const authType = sessionStorage.getItem("auth_type");
    if (authType === "Admin") return sessionStorage.getItem("admin_token");
    if (authType === "User") return sessionStorage.getItem("user_token");
    return null;
};

api.interceptors.request.use(
    (config) => {
        const token = getActiveToken();

        // Remember which session sent this request (see 401 handling below).
        config.__authToken = token || null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (config.headers?.Authorization) {
            // A retried / re-sent request must never carry a token from a
            // session that has since logged out.
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Retry ONLY idempotent reads (GET), ONLY once, and ONLY for transient
// failures (network drop, gateway errors). Mutations (POST/PUT/PATCH/DELETE)
// are never retried, so a save can never be submitted twice by this layer.
const RETRYABLE_STATUS = new Set([502, 503, 504]);

const isTransientGetFailure = (error) => {
    const config = error.config;
    if (!config || config.__retried) return false;
    if ((config.method || "get").toLowerCase() !== "get") return false;
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") return false;
    if (config.responseType === "blob") return false; // report downloads: let the user retry
    if (!error.response) return error.code !== "ECONNABORTED"; // network error, not our 30s timeout
    return RETRYABLE_STATUS.has(error.response.status);
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (isTransientGetFailure(error)) {
            error.config.__retried = true;
            await new Promise((resolve) => setTimeout(resolve, 600));
            return api.request(error.config);
        }

        // A 401 for a request sent by a session that has already ended (e.g.
        // user A's slow request returning after user B logged in) must not
        // log out the current session.
        const sentBySupersededSession =
            error.config?.__authToken &&
            error.config.__authToken !== getActiveToken();

        if (error.response?.status === 401 && !sentBySupersededSession) {
            // Same cleanup as a manual logout: tokens, auth_type, session
            // timer, notification flag, cached lookups and the in-memory user.
            useAuthStore.getState().clearAuth();

            const isLoginRequest = error.config?.url?.includes("/login");
            const isLoginPage = window.location.pathname === "/login";

            if (!isLoginRequest && !isLoginPage) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;