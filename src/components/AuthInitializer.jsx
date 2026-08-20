import { useEffect } from "react";
import { getProfile } from "../services/authApi";
import { useAuthStore } from "../store/authStore";
import AuthLoader from "./ui/AuthLoader";
const AuthInitializer = ({ children }) => {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);

    const setUser = useAuthStore((state) => state.setUser);
    const setLoading = useAuthStore((state) => state.setLoading);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    useEffect(() => {
        const restoreUser = async () => {
            const token = sessionStorage.getItem("access_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await getProfile();

                setUser(response.data.data);
            } catch (error) {
                console.error("Failed to restore user:", error);

                sessionStorage.removeItem("access_token");
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