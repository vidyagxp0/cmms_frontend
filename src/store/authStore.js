import { create } from "zustand";
import { clearRequestCache } from "../services/requestCache";

export const useAuthStore = create((set) => ({
    user: null,
    permissions: [],
    loading: true,

    setUser: (user) =>
        set({
            user,
            permissions: user?.permissions || [],
        }),

    setPermissions: (permissions) =>
        set({
            permissions,
        }),

    setLoading: (loading) =>
        set({
            loading,
        }),

    clearAuth: () => {
        clearRequestCache();
        sessionStorage.removeItem("admin_token");
        sessionStorage.removeItem("user_token");
        sessionStorage.removeItem("auth_type");
        sessionStorage.removeItem("session_start_time");
        sessionStorage.removeItem("vgxp_notification_modal_shown");

        set({
            user: null,
            permissions: [],
            loading: false,
        });
    },
}));