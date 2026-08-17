import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute({
    children,
    allowedRoles = ["admin", "user"],
}) {
    const location = useLocation();

    const user = useAuthStore(
        (state) => state.user
    );

    // Not logged in
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Role is not allowed
    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
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