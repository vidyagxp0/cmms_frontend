import { Routes, Route, Navigate } from "react-router-dom";

import AdminRoutes from "./AdminRoutes";
import UserRoutes from "./UserRoutes";
import Login from "../pages/auth/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            {/* Default Route */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            {/* Public Routes */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Admin Routes */}
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute
                        tokenKey="admin_token"
                        authType="Admin"
                        allowedRoles={["Admin"]}
                    >
                        <AdminRoutes />
                    </ProtectedRoute>
                }
            />

            {/* User Routes */}
            <Route
                path="/user/*"
                element={
                    <ProtectedRoute
                        tokenKey="user_token"
                        authType="User"
                    >
                        <UserRoutes />
                    </ProtectedRoute>
                }
            />

            {/* 404 */}
            <Route
                path="/404"
                element={<NotFound />}
            />

            {/* Unknown Route */}
            <Route
                path="*"
                element={<Navigate to="/404" replace />}
            />
        </Routes>
    );
}

export default AppRoutes;