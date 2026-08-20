import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute({
    children,
    allowedRoles = ["Admin", "User"],
}) {
    const location = useLocation();

    const user = useAuthStore((state) => state.user);

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user?.roles?.[0])
    ) {
        return <Navigate to="/not-authorized" replace />;
    }

    return children;
}

export default ProtectedRoute;