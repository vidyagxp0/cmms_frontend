import api from "./api";
import { cachedRequest, clearRequestCache, invalidateRequest } from "./requestCache";

export const login = (payload) => {
    clearRequestCache();
    return api.post("/login", payload);
};

// Logout is best-effort: callers always clear the local session afterwards.
// A short timeout keeps idle-logout / the Logout button from hanging for the
// default 30s when the API is slow or unreachable.
export const LOGOUT_TIMEOUT_MS = 5000;

export const logout = () => {
    clearRequestCache();
    return api.post("/logout", undefined, { timeout: LOGOUT_TIMEOUT_MS });
};

// Called by ~30 pages on mount. Cached for 5 minutes and shared between
// concurrent callers, so opening a page no longer waits on a profile request.
export const getProfile = () => cachedRequest("profile", () => api.get("/profile"));

export const updateProfile = async (payload) => {
    const response = await api.put("/update/profile", payload);
    invalidateRequest("profile");
    return response;
};

export const changePasword = (payload) => api.put("/change-password", payload);
