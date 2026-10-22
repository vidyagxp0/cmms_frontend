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
import Audit from "../pages/user/Audit/Audit";
import CalibrationChild from "../pages/user/CalibrationPlanner/CalibrationChild";
import CalibrationChildPanel from "../pages/user/CalibrationPlanner/CalibrationChildPanel";
import CreateEquipment from "../pages/user/Equipment/CreateEquipment";
import ManagementDashboard from "../pages/user/CalibrationManagement/ManagementDashorad";
import PreventivePlannerDashboard from "../pages/user/PreventiveMaintence/PreventivePlannerDashboard";
import PreventiveMaintenanceDashboard from "../pages/user/PreventiveMaintence/PreventiveMaintenanceDashboard ";
import PreventivePlannerCreate from "../pages/user/PreventiveMaintence/PreventivePlannerCreate";
import PreventivePlannerPanel from "../pages/user/PreventiveMaintence/PreventivePlannerPanel";
import PreventiveMaintenanceCreate from "../pages/user/PreventiveMaintence/PreventiveMaintenanceCreate";
import PreventiveMaintenancePanel from "../pages/user/PreventiveMaintence/PreventiveMaintenancePanel";
import CalibrationManagmentAudit from "../pages/user/Audit/CalibrationManagmentAudit";
// import FieldInstrumetsDashboard from "../pages/user/FieldInstruments/FieldInstrumetsDashboard";
import CreateFieldInstruments from "../pages/user/FieldInstruments/CreateFieldInstruments";
import FIeldInstrumentsPanel from "../pages/user/FieldInstruments/FIeldInstrumentsPanel";
import EquipmentAudit from "../pages/user/Equipment/EquipmentAudit";
import FieldInstrumentAudit from "../pages/user/FieldInstruments/FieldInstrumentAudit";
import FieldInstrumentPlannerDashboard from "../pages/user/FieldInstrumentPlanner/FieldInstrumentPlannerDashboard";
import FieldInstrumentPlannerCreate from "../pages/user/FieldInstrumentPlanner/FieldInstrumentPlannerCreate";
import FieldInstrumentsPlannerPanel from "../pages/user/FieldInstrumentPlanner/FieldInstrumentsPlannerPanel";
import FieldInstrumetsDashboard from "../pages/user/FieldInstruments/FieldInstrumetsDashboard";
import FieldInstrumentsPlannerAudit from "../pages/user/FieldInstrumentPlanner/FieldInstrumentsPlannerAudit";

function UserRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<Navigate to="equipment-dashboard" replace />} />
        <Route path="user-profile" element={<UserProfile />} />
        <Route path="user-setting" element={<UserSetting />} />

        <Route path="cmms-dashboard" element={<UserDashboard />} />
        <Route path="create-record" element={<ProcessPage />} />
        <Route path="new-audit/:recordId" element={<Audit />} />
        <Route path="audit-calibration-management/:recordId" element={<CalibrationManagmentAudit />} />

        {/* Equipment Routes*/}
        <Route path="equipment-dashboard" element={<EquipDashboard />} />
        <Route path="create-equipment" element={<CreateEquipment />} />
        <Route path="equipment-panel/:id" element={<EquipmentPanel/>} />
        <Route path="instrument-master-audit/:id" element={<EquipmentAudit/>} />


        {/* Instruments Routes*/}
        <Route path="field-instruments-dashboard" element={<FieldInstrumetsDashboard />} />
        <Route path="create-field-instruments" element={<CreateFieldInstruments />} />
        <Route path="field-instruments-panel/:id" element={<FIeldInstrumentsPanel />} />
        <Route path="field-instruments-audit/:id" element={<FieldInstrumentAudit />} />

        {/* Engineering and Calibration Routes*/}
        <Route path="engineering-dashboard" element={<EngineeringDashboard />} />
        <Route path="calibration-planner-create/:processId" element={<CreateCalibration />} />
        <Route path="calibration-planner-panel/:recordId" element={<CalibrationPanel/>} />
        
        {/* Engineering and Calibration Child Routes*/}
        <Route path="calibration-management-create/:processId/:recordId" element={<CalibrationChild/>} />
        <Route path="calibration-management-panel/:processId/:recordId" element={<CalibrationChildPanel/>} />
        <Route path="calibration-management-dashboard" element={<ManagementDashboard />} />

        {/* Preventive Maintenance Routes*/}
        <Route path="preventive-planner-dashboard" element={<PreventivePlannerDashboard />} />
        <Route path="preventive-maintenance-dashboard" element={<PreventiveMaintenanceDashboard />} />
        <Route path="preventive-maintenance-planner-create/:processId" element={<PreventivePlannerCreate />} />
        <Route path="preventive-maintenance-planner-panel/:processId/:recordId" element={<PreventivePlannerPanel />} />
        <Route path="preventive-maintenance-create/:processId/:recordId" element={<PreventiveMaintenanceCreate  />} />
        <Route path="preventive-maintenance-panel/:processId/:recordId" element={<PreventiveMaintenancePanel  />} />

                {/* Field Instrument Planner Routes*/}
        <Route path="field-instrument-planner-dashboard" element={<FieldInstrumentPlannerDashboard />} />
        <Route path="field-instrument-planner-create/:processId" element={<FieldInstrumentPlannerCreate />} />
        <Route path="field-instruments-planner-panel/:recordId" element={<FieldInstrumentsPlannerPanel />} /> 
        <Route path="field-instruments-planner-audit/:recordId" element={<FieldInstrumentsPlannerAudit />} /> 
        {/* <Route path="equipment-panel/:id" element={<EquipmentPanel/>} /> */}
      </Route>
    </Routes>
  );
}

export default UserRoutes;
