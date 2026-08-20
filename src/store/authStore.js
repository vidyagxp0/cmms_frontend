import { create } from "zustand";

export const useAuthStore = create((set) => ({
    user: null,
    permissions: [],
    loading: true,

    setUser: (user) =>
        set({
            user,
        }),

    setPermissions: (permissions) =>
        set({
            permissions,
        }),

    setLoading: (loading) =>
        set({
            loading,
        }),

    clearAuth: () =>
        set({
            user: null,
            permissions: [],
            loading: false,
        }),
}));