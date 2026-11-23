import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { lazyPage } from "./lazyPage";
import ProtectedRoute from "./ProtectedRoute";
import SessionTimeout from "../components/common/SessionTimeout/SessionTimeout";

// Split by area: a logged-in user never downloads the login animation code,
// and an admin never downloads the user-module pages (and vice versa).
const AdminRoutes = lazyPage(() => import("./AdminRoutes"), { prefetch: false });
const UserRoutes = lazyPage(() => import("./UserRoutes"), { prefetch: false });
const Login = lazyPage(() => import("../pages/auth/Login/Login"), { prefetch: false });
const NotFound = lazyPage(() => import("../pages/NotFound/NotFound"), { prefetch: false });

function AppRoutes() {
    return (
        <Suspense fallback={null}>
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
                    <SessionTimeout tokenKey="admin_token" />
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
                    <SessionTimeout tokenKey="user_token" />
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
        </Suspense>
    );
}

export default AppRoutes;