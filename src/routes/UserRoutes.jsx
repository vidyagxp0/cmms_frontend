import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "../components/layout/UserLayout/UserLayout";
import UserDashboard from "../pages/user/UserDashboard/userDashboard";
import Calibration from "../pages/user/Calibration/Calibration";

function UserRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<UserDashboard />} />

        <Route path="calibration" element={<Calibration />} />
      </Route>
    </Routes>
  );
}

export default UserRoutes;
