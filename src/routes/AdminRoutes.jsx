import { Routes, Route, Navigate } from "react-router-dom";
import { lazyPage } from "./lazyPage";
import AdminLayout from "../components/layout/AdminLayout/AdminLayout";
const AdminDashboard = lazyPage(() => import("../pages/admin/AdminDashboard/Dashboard"));
const UserManagementList = lazyPage(() => import("../pages/admin/UserManage/UserManagementList"));
const RolesManagementList = lazyPage(() => import("../pages/admin/RolesManage/RolesManagementList"));
const DepartmentManagelist = lazyPage(() => import("../pages/admin/DepartmentManage/DepartmentManagelist"));
const AuditHistory = lazyPage(() => import("../pages/admin/AuditHistory/AuditHistory"));
const AddRole = lazyPage(() => import("../pages/admin/RolesManage/AddRole"));
const EditRole = lazyPage(() => import("../pages/admin/RolesManage/EditRole"));
const AddUser = lazyPage(() => import("../pages/admin/UserManage/AddUser"));
const EditUser = lazyPage(() => import("../pages/admin/UserManage/EditUser"));
const UserMonitoring = lazyPage(() => import("../pages/admin/UserMonitoring/UserMonitoring"));

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
        <Route path="users-monitoring" element={<UserMonitoring />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
