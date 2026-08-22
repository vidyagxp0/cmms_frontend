import { create } from "zustand";

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
        sessionStorage.removeItem("admin_token");
        sessionStorage.removeItem("user_token");
        sessionStorage.removeItem("auth_type");

        set({
            user: null,
            permissions: [],
            loading: false,
        });
    },
}));