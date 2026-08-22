import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute({
    children,
    tokenKey,
    authType,
    allowedRoles = [],
}) {
    const location = useLocation();

    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);

    const token = sessionStorage.getItem(tokenKey);
    const storedAuthType = sessionStorage.getItem("auth_type");

    // Wait until authentication restoration is complete
    if (loading) {
        return null;
    }

    // No token
    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Wrong authentication type
    if (storedAuthType !== authType) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // User restoration failed
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Role authorization
    if (
        allowedRoles.length > 0 &&
        !user.roles?.some((role) =>
            allowedRoles.includes(role)
        )
    ) {
        return (
            <Navigate
                to="/not-authorized"
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;