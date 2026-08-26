import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "../components/layout/UserLayout/UserLayout";
import UserDashboard from "../pages/user/UserDashboard/UserDashboard";
import ProcessPage from "../pages/user/ProcessPage/ProcessPage";
import EquipDashboard from "../pages/user/Equipment/EquipDashboard";
import EquipmentPanel from "../pages/user/Equipment/EquipmentPanel";
import EngineeringDashboard from "../pages/user/Engineering/EngineeringDashboard";
import UserProfile from "../pages/user/UserProfile/UserProfile";
import UserSetting from "../pages/user/UserProfile/UserSetting";
import CreateCalibration from "../pages/user/CalibrationPlanner/CreateCalibration";
import CalibrationPanel from "../pages/user/CalibrationPlanner/CalibrationPanel";

function UserRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<Navigate to="equipment-dashboard" replace />} />
        <Route path="user-profile" element={<UserProfile />} />
        <Route path="user-setting" element={<UserSetting />} />

        <Route path="cmms-dashboard" element={<UserDashboard />} />
        <Route path="create-record" element={<ProcessPage />} />

        {/* Equipment Routes*/}
        <Route path="equipment-dashboard" element={<EquipDashboard />} />
        <Route path="equipment-panel/:id" element={<EquipmentPanel/>} />

        {/* Engineering and Calibration Routes*/}
        <Route path="engineering-dashboard" element={<EngineeringDashboard />} />
        <Route path="calibration-planner-create/:processId" element={<CreateCalibration />} />
        <Route path="calibration-planner-panel/:id" element={<CalibrationPanel/>} />

        {/* <Route path="equipment-panel/:id" element={<EquipmentPanel/>} /> */}
      </Route>
    </Routes>
  );
}

export default UserRoutes;
