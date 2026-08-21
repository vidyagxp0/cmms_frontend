import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard/Dashboard";
import UserManagementList from "../pages/admin/UserManage/UserManagementList";
import RolesManagementList from "../pages/admin/RolesManage/RolesManagementList";
import DepartmentManagelist from "../pages/admin/DepartmentManage/DepartmentManagelist";
import AuditHistory from "../pages/admin/AuditHistory/AuditHistory";
import AddRole from "../pages/admin/RolesManage/AddRole";
import EditRole from "../pages/admin/RolesManage/EditRole";
import AddUser from "../pages/admin/UserManage/AddUser";
import EditUser from "../pages/admin/UserManage/EditUser";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<AdminDashboard />} />

        <Route path="users-management" element={<UserManagementList />} />
        <Route path="new-user" element={<AddUser />} />
        <Route path="update-user/:id" element={<EditUser />} />
        <Route path="roles-management" element={<RolesManagementList />} />
        <Route path="create-role" element={<AddRole />} />
        <Route path="update-role/:id" element={<EditRole />} />
        <Route path="department-management" element={<DepartmentManagelist />} />
        <Route path="audit-history" element={<AuditHistory />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
