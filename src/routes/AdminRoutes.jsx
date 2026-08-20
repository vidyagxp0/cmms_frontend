import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard/Dashboard";
import UserManagement from "../pages/admin/UserManage/UserManagement";
import RolesManagementList from "../pages/admin/RolesManage/RolesManagementList";
import DepartmentManagement from "../pages/admin/DepartmentManage/DepartmentManagement";
import AuditHistory from "../pages/admin/AuditHistory/AuditHistory";
import AddRole from "../pages/admin/RolesManage/AddRole";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<AdminDashboard />} />

        <Route path="users-management" element={<UserManagement />} />
        <Route path="roles-management" element={<RolesManagementList />} />
        <Route path="create-role" element={<AddRole />} />
        <Route path="department-management" element={<DepartmentManagement />} />
        <Route path="audit-history" element={<AuditHistory />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
