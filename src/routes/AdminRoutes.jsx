import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard/Dashboard";
import Masters from "../pages/admin/Masters/Master";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<AdminDashboard />} />

        <Route path="masters" element={<Masters />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
