import { useEffect } from "react";
import { getProfile } from "../services/authApi";
import { useAuthStore } from "../store/authStore";
import AuthLoader from "./ui/AuthLoader";

const AuthInitializer = ({ children }) => {
    const loading = useAuthStore((state) => state.loading);
    const setUser = useAuthStore((state) => state.setUser);
    const setLoading = useAuthStore((state) => state.setLoading);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    useEffect(() => {
        const restoreUser = async () => {
            const authType = sessionStorage.getItem("auth_type");

            const token =
                authType === "Admin"
                    ? sessionStorage.getItem("admin_token")
                    : authType === "User"
                        ? sessionStorage.getItem("user_token")
                        : null;

            // No authentication found
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await getProfile();

                const apiUser = response.data.data;

                const user = {
                    id: apiUser.id,
                    name: apiUser.name,
                    email: apiUser.email,
                    roleType: apiUser.role_type,
                    roles: apiUser.roles || [],
                    permissions: apiUser.permissions || [],
                };

                setUser(user);
            } catch (error) {
                console.error("Failed to restore user:", error);

                clearAuth();
            } finally {
                setLoading(false);
            }
        };

        restoreUser();
    }, [setUser, setLoading, clearAuth]);

    if (loading) {
        return <AuthLoader />;
    }

    return children;
};

export default AuthInitializer;