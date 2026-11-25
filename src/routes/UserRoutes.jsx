import { Routes, Route, Navigate } from "react-router-dom";
import { lazyPage } from "./lazyPage";

import UserLayout from "../components/layout/UserLayout/UserLayout";
const UserDashboard = lazyPage(() => import("../pages/user/UserDashboard/UserDashboard"));
const ProcessPage = lazyPage(() => import("../pages/user/ProcessPage/ProcessPage"));
const EquipDashboard = lazyPage(() => import("../pages/user/Equipment/EquipDashboard"));
const EquipmentPanel = lazyPage(() => import("../pages/user/Equipment/EquipmentPanel"));
const EngineeringDashboard = lazyPage(() => import("../pages/user/Engineering/EngineeringDashboard"));
const UserProfile = lazyPage(() => import("../pages/user/UserProfile/UserProfile"));
const UserSetting = lazyPage(() => import("../pages/user/UserProfile/UserSetting"));
const CreateCalibration = lazyPage(() => import("../pages/user/CalibrationPlanner/CreateCalibration"));
const CalibrationPanel = lazyPage(() => import("../pages/user/CalibrationPlanner/CalibrationPanel"));
const Audit = lazyPage(() => import("../pages/user/Audit/Audit"));
const CalibrationChild = lazyPage(() => import("../pages/user/CalibrationPlanner/CalibrationChild"));
const CalibrationChildPanel = lazyPage(() => import("../pages/user/CalibrationPlanner/CalibrationChildPanel"));
const CreateEquipment = lazyPage(() => import("../pages/user/Equipment/CreateEquipment"));
const ManagementDashboard = lazyPage(() => import("../pages/user/CalibrationManagement/ManagementDashorad"));
const PreventivePlannerDashboard = lazyPage(() => import("../pages/user/PreventiveMaintence/PreventivePlannerDashboard"));
const PreventiveMaintenanceDashboard = lazyPage(() => import("../pages/user/PreventiveMaintence/PreventiveMaintenanceDashboard "));
const PreventivePlannerCreate = lazyPage(() => import("../pages/user/PreventiveMaintence/PreventivePlannerCreate"));
const PreventivePlannerPanel = lazyPage(() => import("../pages/user/PreventiveMaintence/PreventivePlannerPanel"));
const PreventiveMaintenanceCreate = lazyPage(() => import("../pages/user/PreventiveMaintence/PreventiveMaintenanceCreate"));
const PreventiveMaintenancePanel = lazyPage(() => import("../pages/user/PreventiveMaintence/PreventiveMaintenancePanel"));
const CalibrationManagmentAudit = lazyPage(() => import("../pages/user/Audit/CalibrationManagmentAudit"));
// import FieldInstrumetsDashboard from "../pages/user/FieldInstruments/FieldInstrumetsDashboard";
const CreateFieldInstruments = lazyPage(() => import("../pages/user/FieldInstruments/CreateFieldInstruments"));
const FIeldInstrumentsPanel = lazyPage(() => import("../pages/user/FieldInstruments/FIeldInstrumentsPanel"));
const EquipmentAudit = lazyPage(() => import("../pages/user/Equipment/EquipmentAudit"));
const FieldInstrumentAudit = lazyPage(() => import("../pages/user/FieldInstruments/FieldInstrumentAudit"));
const FieldInstrumentPlannerDashboard = lazyPage(() => import("../pages/user/FieldInstrumentPlanner/FieldInstrumentPlannerDashboard"));
const FieldInstrumentPlannerCreate = lazyPage(() => import("../pages/user/FieldInstrumentPlanner/FieldInstrumentPlannerCreate"));
const FieldInstrumentsPlannerPanel = lazyPage(() => import("../pages/user/FieldInstrumentPlanner/FieldInstrumentsPlannerPanel"));
const FieldInstrumetsDashboard = lazyPage(() => import("../pages/user/FieldInstruments/FieldInstrumetsDashboard"));
const FieldInstrumentsPlannerAudit = lazyPage(() => import("../pages/user/FieldInstrumentPlanner/FieldInstrumentsPlannerAudit"));
const PreventivePlannerAudit = lazyPage(() => import("../pages/user/PreventiveMaintence/PreventivePlannerAudit"));
const PreventiveMaintenanceAudit = lazyPage(() => import("../pages/user/PreventiveMaintence/PreventiveMaintenanceAudit"));
const InstrumentCalibrationDashboard = lazyPage(() => import("../pages/user/FieldInstrumentCalibration/InstrumentCalibrationDashboard"));
const InstrumentCalibrationCreate = lazyPage(() => import("../pages/user/FieldInstrumentCalibration/InstrumentCalibrationCreate"));
const InstrumentsCalibrationPanel = lazyPage(() => import("../pages/user/FieldInstrumentCalibration/InstrumentsCalibrationPanel"));
const InstrumentsCalibrationAudit = lazyPage(() => import("../pages/user/FieldInstrumentCalibration/InstrumentsCalibrationAudit"));
const SpareInstrumentDashboard = lazyPage(() => import("../pages/user/SpareInstrumentMaster/SpareInstrumentDashboard"));
const SpareInstrumentCreate = lazyPage(() => import("../pages/user/SpareInstrumentMaster/SpareInstrumentCreate"));
const SpareInstrumentPanel = lazyPage(() => import("../pages/user/SpareInstrumentMaster/SpareInstrumentPanel"));
const SpareInstrumentAudit = lazyPage(() => import("../pages/user/SpareInstrumentMaster/SpareInstrumentAudit"));
const ImportMasterEquipmentData = lazyPage(() => import("../pages/user/ImportMasterEquipmentData/ImportMasterEquipmentData"));
const EquipmentMasterDashboard = lazyPage(() => import("../pages/user/EquipmentMaster/EquipmentMasterDashboard"));
const EquipmentMasterCreate = lazyPage(() => import("../pages/user/EquipmentMaster/EquipmentMasterCreate"));
const EquipmentMasterPanel = lazyPage(() => import("../pages/user/EquipmentMaster/EquipmentMasterPanel"));
const EquipmentMasterAudit = lazyPage(() => import("../pages/user/EquipmentMaster/EquipmentMasterAudit"));
const AddendumPreventivePlannerDashboard = lazyPage(() => import("../pages/user/AddendumPreventivePlanner/AddendumPreventivePlannerDashboard"));
const AddendumPreventivePlannerCreate = lazyPage(() => import("../pages/user/AddendumPreventivePlanner/AddendumPreventivePlannerCreate"));
const AddendumPreventivePlannerPanel = lazyPage(() => import("../pages/user/AddendumPreventivePlanner/AddendumPreventivePlannerPanel"));
const AddendumPreventivePlannerAudit = lazyPage(() => import("../pages/user/AddendumPreventivePlanner/AddendumPreventivePlannerAudit"));
const AddendumCalibrationChildAudit = lazyPage(() => import("../pages/user/AddendumChildCalibration/AddendumCalibrationChildAudit"));
const AddendumCalibrationChildCreate = lazyPage(() => import("../pages/user/AddendumChildCalibration/AddendumCalibrationChildCreate"));
const AddendumCalibrationChildPanel = lazyPage(() => import("../pages/user/AddendumChildCalibration/AddendumCalibrationChildPanel"));
const AddendumCalibrationChildDashboard = lazyPage(() => import("../pages/user/AddendumChildCalibration/AddendumCalibrationChildDashboard"));
const AddendumPreventiveChildPanel = lazyPage(() => import("../pages/user/AddendumPreventiveChild/AddendumPreventiveChildPanel"));
const AddendumPreventiveChildCreate = lazyPage(() => import("../pages/user/AddendumPreventiveChild/AddendumPreventiveChildCreate"));
const AddendumPreventiveChildAudit = lazyPage(() => import("../pages/user/AddendumPreventiveChild/AddendumPreventiveChildAudit"));
const AddendumPreventiveChildDashboard = lazyPage(() => import("../pages/user/AddendumPreventiveChild/AddendumPreventiveChildDashboard"));
const UnPlannedCalibrationDashboard = lazyPage(() => import("../pages/user/UnPlannedCalibration/UnCalibrationDashboard"));
const UnCreateCalibration = lazyPage(() => import("../pages/user/UnPlannedCalibration/UnCreateCalibration"));
const UnCreateCalibrationPanel = lazyPage(() => import("../pages/user/UnPlannedCalibration/UnCalibrationPanel"));
const UnCalibrationChild = lazyPage(() => import("../pages/user/UnPlannedCalibration/UnCalibrationChild"));
const UnCalibrationChildPanel = lazyPage(() => import("../pages/user/UnPlannedCalibration/UnCalibrationChildPanel"));
const NotificationList = lazyPage(() => import("../pages/user/Notification/NotificationList"));

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
        <Route path="calibration-management-panel/:recordId" element={<CalibrationChildPanel/>} />
        <Route path="calibration-management-dashboard" element={<ManagementDashboard />} />

        {/* Preventive Maintenance Routes*/}
        <Route path="preventive-planner-dashboard" element={<PreventivePlannerDashboard />} />
        <Route path="preventive-planner-audit/:recordId" element={<PreventivePlannerAudit />} />
        <Route path="preventive-maintenance-dashboard" element={<PreventiveMaintenanceDashboard />} />
        <Route path="preventive-maintenance-audit/:recordId" element={<PreventiveMaintenanceAudit />} />
        <Route path="preventive-maintenance-planner-create/:processId" element={<PreventivePlannerCreate />} />
        <Route path="preventive-maintenance-planner-panel/:recordId" element={<PreventivePlannerPanel />} />
        <Route path="preventive-maintenance-create/:processId/:recordId" element={<PreventiveMaintenanceCreate  />} />
        <Route path="preventive-maintenance-panel/:recordId" element={<PreventiveMaintenancePanel  />} />

                {/* Field Instrument Planner Routes*/}
        <Route path="field-instrument-planner-dashboard" element={<FieldInstrumentPlannerDashboard />} />
        <Route path="field-instrument-planner-create/:processId" element={<FieldInstrumentPlannerCreate />} />
        <Route path="field-instruments-planner-panel/:recordId" element={<FieldInstrumentsPlannerPanel />} /> 
        <Route path="field-instruments-planner-audit/:recordId" element={<FieldInstrumentsPlannerAudit />} /> 

        {/* Field Instrument Calibration Routes*/}
        <Route path="field-instrument-calibration-addendum-dashboard" element={<InstrumentCalibrationDashboard />} />
        <Route path="field-instrument-calibration-addendum-create/:processId" element={<InstrumentCalibrationCreate />} />
        <Route path="field-instrument-calibration-addendum-panel/:recordId" element={<InstrumentsCalibrationPanel />} /> 
        <Route path="field-instrument-calibration-addendum-audit/:recordId" element={<InstrumentsCalibrationAudit />} /> 

        {/* Spare Instrument Calibration Routes*/}
        <Route path="spare-instrument-calibration-master-dashboard" element={<SpareInstrumentDashboard />} />
        <Route path="spare-instrument-calibration-master-create" element={<SpareInstrumentCreate />} />
        <Route path="spare-instrument-calibration-master-panel/:id" element={<SpareInstrumentPanel />} /> 
        <Route path="spare-instrument-calibration-master-audit/:recordId" element={<SpareInstrumentAudit />} /> 

        {/* Equipment Master Routes*/}
        <Route path="equipment-master-dashboard" element={<EquipmentMasterDashboard />} />
        <Route path="equipment-master-create" element={<EquipmentMasterCreate />} />
        <Route path="equipment-master-panel/:id" element={<EquipmentMasterPanel />} /> 
        <Route path="equipment-master-audit/:recordId" element={<EquipmentMasterAudit />} /> 

        {/*  Addendum Preventive Planner Routes*/}
        <Route path="addendum-preventive-planner-dashboard" element={<AddendumPreventivePlannerDashboard />} />
        <Route path="addendum-preventive-planner-create/:processId" element={<AddendumPreventivePlannerCreate />} />
        <Route path="addendum-preventive-planner-panel/:recordId" element={<AddendumPreventivePlannerPanel />} /> 
        <Route path="addendum-preventive-planner-audit/:recordId" element={<AddendumPreventivePlannerAudit />} /> 

        {/*  Addendum Calibration Child Routes*/}
        <Route path="addendum-calibration-management-dashboard" element={<AddendumCalibrationChildDashboard />} />
        <Route path="addendum-calibration-management-create/:processId" element={<AddendumCalibrationChildCreate />} />
        <Route path="addendum-calibration-management-panel/:recordId" element={<AddendumCalibrationChildPanel />} /> 
        <Route path="addendum-calibration-management-audit/:recordId" element={<AddendumCalibrationChildAudit />} /> 

        {/*  Addendum Preventive Child Routes*/}
        <Route path="addendum-preventive-management-dashboard" element={<AddendumPreventiveChildDashboard />} />
        <Route path="addendum-preventive-management-create/:processId" element={<AddendumPreventiveChildCreate />} />
        <Route path="addendum-preventive-management-panel/:recordId" element={<AddendumPreventiveChildPanel />} /> 
        <Route path="addendum-preventive-management-audit/:recordId" element={<AddendumPreventiveChildAudit />} /> 

        {/*  Unplanned Calibration Routes*/}
        <Route path="unplanned-calibration-dashboard" element={<UnPlannedCalibrationDashboard />} />
        <Route path="unplanned-calibration-create/:processId" element={<UnCreateCalibration />} />
        <Route path="unplanned-calibration-panel/:recordId" element={<UnCreateCalibrationPanel />} /> 
        <Route path="unplanned-calibration-management-create/:processId/:recordId" element={<UnCalibrationChild />} />
        <Route path="unplanned-calibration-management-panel/:recordId" element={<UnCalibrationChildPanel />} />
        {/* <Route path="unplanned-calibration-management-dashboard" element={<ManagementDashboard />} /> */}
        {/* <Route path="unplanned-calibration-audit/:recordId" element={<UnPlannedCalibrationAudit />} />  */}

        
        {/* Import Master Equipment Data and Notifcations Routes*/}
        <Route path="import-master-equipment-data" element={<ImportMasterEquipmentData />} />
        <Route path="notification-list" element={<NotificationList />} />

      </Route>
    </Routes>
  );
}

export default UserRoutes;
