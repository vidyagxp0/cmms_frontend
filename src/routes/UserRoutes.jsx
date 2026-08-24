import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "../components/layout/UserLayout/UserLayout";
import UserDashboard from "../pages/user/UserDashboard/userDashboard";
import ProcessPage from "../pages/user/ProcessPage/ProcessPage";
import EquipDashboard from "../pages/user/Equipment/EquipDashboard";
import EquipmentPanel from "../pages/user/Equipment/EquipmentPanel";
import EngineeringDashboard from "../pages/user/Engineering/EngineeringDashboard";

function UserRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<Navigate to="equipment-dashboard" replace />} />

        <Route path="cmms-dashboard" element={<UserDashboard />} />
        <Route path="create-record" element={<ProcessPage />} />


        <Route path="equipment-dashboard" element={<EquipDashboard />} />
        <Route path="equipment-panel/:id" element={<EquipmentPanel/>} />

        <Route path="engineering-dashboard" element={<EngineeringDashboard />} />
        {/* <Route path="equipment-panel/:id" element={<EquipmentPanel/>} /> */}
      </Route>
    </Routes>
  );
}

export default UserRoutes;
