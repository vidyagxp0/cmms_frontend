import React, { useCallback, useEffect, useState, useRef } from "react";
import { Activity } from "lucide-react";
import { Form, DatePicker } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import ProcessStage from "../../../components/common/ProcesStageTabs/ProcessStage";
import ProcessActivities from "../../../components/common/ProcesStageTabs/ProcessActivities";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FormSelect from "../../../components/common/Form/FormSelect";
import FormTextArea from "../../../components/common/Form/FormTextArea";
import FormDisabledInput from "../../../components/common/Form/FormDisabledInput";
import FormAttachment from "../../../components/common/Form/FormAttachment";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import UserDynamicGrid from "../../../components/common/DataTable/UserDynamicGrid";
import CALIBRATED_BY_COLUMNS from "./calibrationColumn";

import { getProfile } from "../../../services/authApi";
import {
  getCalibrationUser,
  getAllEquipmentData,
  getCalibrationChildDetail,
  updateCalibrationChild,
  getAllActivites,
  getAllActivityLogs,
  getAllStages,
  getAllPermissions,
  executeCalibrationActivity,
} from "../../../services/usersApi/calibrationApi";

// Tabs for child – with stageId for each tab (matches child workflow)
const TABS = [
  { id: "management", label: "Calibration Management", stageId: 19 },
  { id: "implementor", label: "Implementor Review", stageId: 20 },
  { id: "qa-review", label: "QA Review", stageId: 21 },
  { id: "qa-approval", label: "QA Approval", stageId: 22 },
  { id: "activity", label: "Activity Log", stageId: 23 },
];

// Only these three are required
const REQUIRED_FIELDS = [
  { name: "hod", label: "HOD / Designee" },
  { name: "qaReviewer", label: "QA Reviewer" },
  { name: "qaApproval", label: "QA Approval" },
];

// ===== Helpers (same as creation) =====
const getProcessValue = (processData = [], key) => {
  if (Array.isArray(processData)) {
    const field = processData.find((item) => item?.key === key);
    return field?.value ?? "";
  }
  if (processData && typeof processData === "object") {
    if (processData[key] !== undefined) return processData[key] ?? "";
    const field = Object.values(processData).find((item) => item?.key === key);
    return field?.value ?? "";
  }
  return "";
};

const buildGridPayload = (rows = []) => {
  return rows.map((row, index) => {
    const rowData = { row_id: index + 1 };
    Object.keys(row).forEach((key) => {
      if (key.startsWith("_")) return;
      let value = row[key] !== undefined && row[key] !== null ? row[key] : "";
      if (dayjs.isDayjs(value)) {
        value = value.format("DD/MM/YYYY");
      }
      rowData[key] = { key, label: key, value };
    });
    return rowData;
  });
};

const getUserPair = (userId, users) => {
  const user = users.find((u) => String(u.id) === String(userId));
  return { id: user?.id || userId || "", name: user?.name || "" };
};

const buildProcessData = (values, systemValues, hodUsers, qaReviewers, qaApprovers) => {
  const systemFields = [
    { key: "recordNumber", label: "Record Number" },
    { key: "siteLocationCode", label: "Site / Location Code" },
    { key: "initiator", label: "Initiator" },
    { key: "dateOfInitiation", label: "Date of Initiation" },
    { key: "initiationDepartment", label: "Initiation Department" },
  ];
  const baseData = systemFields.map((field) => ({
    key: field.key,
    label: field.label,
    value: systemValues[field.key] || "",
  }));

  const otherFields = [
    "shortDescription",
    "instrumentName",
    "instrumentId",
    "location",
    "makeModel",
    "range",
    "leastCount",
    "criticality",
    "calibrationFrequency",
    "previousCalibrationDate",
    "nextCalibrationDate",
    "standardReference",
    "dueReminder",
    "procedureReference",
    "standardUsed",
    "parameters",
    "unscheduledReason",
    "eventReference",
    "calibrationResults",
    "certificateNumber",
    "costOfCalibration",
    "calibrationComment",
    "comments",
    "attachment",
  ];

  otherFields.forEach((key) => {
    let value = values[key] !== undefined && values[key] !== null ? values[key] : "";
    if (dayjs.isDayjs(value)) {
      value = value.format("DD/MM/YYYY");
    }
    const labelMap = {
      shortDescription: "Short Description",
      instrumentName: "Instrument / Equipment Name",
      instrumentId: "Instrument/Equipment ID",
      location: "Location",
      makeModel: "Make & Model",
      range: "Range",
      leastCount: "Least Count",
      criticality: "Critical & Non Critical",
      calibrationFrequency: "Calibration Frequency",
      previousCalibrationDate: "Previous Calibration Date",
      nextCalibrationDate: "Next Calibration Date",
      standardReference: "Calibration Standard Reference",
      dueReminder: "Calibration Due Reminder",
      procedureReference: "Calibration Procedures Reference Document",
      standardUsed: "Calibration Standard used",
      parameters: "Calibration Parameters",
      unscheduledReason: "Reason for Unscheduled or Event Based Calibration",
      eventReference: "Event Reference No.",
      calibrationResults: "Calibration Results",
      certificateNumber: "Calibration Certificate number",
      costOfCalibration: "Cost of Calibration",
      calibrationComment: "Calibration Comment / Observations",
      comments: "Comments",
      attachment: "Attachment",
    };
    baseData.push({ key, label: labelMap[key] || key, value });
  });

  // Assignments (as objects)
  baseData.push({
    key: "hod",
    label: "HOD / Designee",
    value: getUserPair(values.hod, hodUsers),
  });
  baseData.push({
    key: "qa_reviewer",
    label: "QA Reviewer",
    value: getUserPair(values.qaReviewer, qaReviewers),
  });
  baseData.push({
    key: "qa_approval",
    label: "QA Approval",
    value: getUserPair(values.qaApproval, qaApprovers),
  });

  return baseData;
};

// ===== Main Component =====
const CalibrationChildPanel = () => {
  const [activeTab, setActiveTab] = useState("management");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [workflowLoading, setWorkflowLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { recordId } = useParams();

  // ---- Workflow states ----
  const [workflowStages, setWorkflowStages] = useState([]);
  const [processId, setProcessId] = useState(null);
  const [activeStageId, setActiveStageId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [canPerformActivity, setCanPerformActivity] = useState(false);

  // ---- Equipment ----
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const equipmentMapRef = useRef(equipmentMap);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // ---- Users ----
  const [hodUsers, setHodUsers] = useState([]);
  const [qaReviewers, setQaReviewers] = useState([]);
  const [qaApprovers, setQaApprovers] = useState([]);

  // ---- Profile data ----
  const [initiator, setInitiator] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [loginUserId, setLoginUserId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [initiationDepartment, setInitiationDepartment] = useState("");
  const [dateOfInitiation, setDateOfInitiation] = useState("");
  const [siteLocationCode, setSiteLocationCode] = useState("");
  const [processName, setProcessName] = useState("");
  const [recordNumber, setRecordNumber] = useState("");

  // ---- Child record specific ----
  const [shortDescription, setShortDescription] = useState("");
  const [calibrationResultRows, setCalibrationResultRows] = useState([]);
  const [parentId, setParentId] = useState(null);

  // Refs
  const isFetchingRef = useRef(false);
  const requiredValuesRef = useRef({
    hod: "",
    qaReviewer: "",
    qaApproval: "",
  });

  useEffect(() => {
    equipmentMapRef.current = equipmentMap;
  }, [equipmentMap]);

  // ---- Editable checks using the correct stage IDs for child ----
  const STAGE_IDS = {
    management: 19,
    implementor: 20,
    qaReview: 21,
    qaApproval: 22,
    // activity is not editable
  };

  const isStageEditable = (stageId) => {
    return (
      Number(activeStageId) === Number(stageId) &&
      canPerformActivity === true &&
      permissionsLoading === false
    );
  };

  const isManagementEditable = isStageEditable(STAGE_IDS.management);
  const isImplementorEditable = isStageEditable(STAGE_IDS.implementor);
  const isQaReviewEditable = isStageEditable(STAGE_IDS.qaReview);
  const isQaApprovalEditable = isStageEditable(STAGE_IDS.qaApproval);

  // ---- Fetch profile ----
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response?.data?.data;
        if (!profile) return;
        setInitiator(profile?.name || "");
        setInitiatorId(profile?.id || "");
        setLoginUserId(profile?.id || "");
        setDepartmentId(profile?.department?.id || "");
        setInitiationDepartment(profile?.department?.name || "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // ---- Fetch equipment ----
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setEquipmentLoading(true);
        const response = await getAllEquipmentData();
        const data = response?.data?.data || [];
        const options = data.map((item) => ({
          value: item.id,
          label: item.name,
        }));
        const map = {};
        data.forEach((item) => {
          map[item.id] = item;
        });
        setEquipmentOptions(options);
        setEquipmentMap(map);
      } catch (error) {
        console.error("Failed to fetch equipment:", error);
        toast.error("Could not load equipment list.");
      } finally {
        setEquipmentLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  // ---- Fetch users ----
  useEffect(() => {
    const fetchCalibrationUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await getCalibrationUser();
        const data = response?.data?.data || {};
        setHodUsers(data?.hod || []);
        setQaReviewers(data?.qa_reviewer || []);
        setQaApprovers(data?.qa_approver || []);
      } catch (error) {
        console.error("Failed to fetch calibration users:", error);
        toast.error(error?.response?.data?.message || "Failed to load workflow users.");
        setHodUsers([]);
        setQaReviewers([]);
        setQaApprovers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchCalibrationUsers();
  }, []);

  const hodOptions = hodUsers.map((user) => ({ value: user?.id, label: user?.name }));
  const qaReviewerOptions = qaReviewers.map((user) => ({ value: user?.id, label: user?.name }));
  const qaApproverOptions = qaApprovers.map((user) => ({ value: user?.id, label: user?.name }));

  // ---- Fetch child detail ----
  const fetchChildDetail = useCallback(async () => {
    if (!recordId) {
      toast.error("Child record ID is missing.");
      return;
    }
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const response = await getCalibrationChildDetail(recordId);
      const data = response?.data?.data;
      if (!data) {
        toast.error("Child calibration record not found.");
        return;
      }

      setProcessId(data?.process_id || null);
      setActiveStageId(data?.stage?.id || data?.stage_id || null);
      setProcessName(data?.process?.name || "");
      setParentId(data?.parent_id || null);

      const processData = data?.process_data || [];

      const recNum = getProcessValue(processData, "recordNumber");
      const locCode = getProcessValue(processData, "siteLocationCode");
      const initiatorName = getProcessValue(processData, "initiator");
      const initDate = getProcessValue(processData, "dateOfInitiation");
      const dept = getProcessValue(processData, "initiationDepartment");
      const shortDesc = getProcessValue(processData, "shortDescription");
      const instrumentName = getProcessValue(processData, "instrumentName");
      const instrumentId = getProcessValue(processData, "instrumentId");
      const location = getProcessValue(processData, "location");
      const makeModel = getProcessValue(processData, "makeModel");
      const range = getProcessValue(processData, "range");
      const leastCount = getProcessValue(processData, "leastCount");
      const criticality = getProcessValue(processData, "criticality");
      const calibrationFreq = getProcessValue(processData, "calibrationFrequency");
      const prevCalDate = getProcessValue(processData, "previousCalibrationDate");
      const nextCalDate = getProcessValue(processData, "nextCalibrationDate");
      const standardRef = getProcessValue(processData, "standardReference");
      const dueReminder = getProcessValue(processData, "dueReminder");
      const procedureRef = getProcessValue(processData, "procedureReference");
      const standardUsed = getProcessValue(processData, "standardUsed");
      const parameters = getProcessValue(processData, "parameters");
      const unscheduledReason = getProcessValue(processData, "unscheduledReason");
      const eventRef = getProcessValue(processData, "eventReference");
      const calResults = getProcessValue(processData, "calibrationResults");
      const certNum = getProcessValue(processData, "certificateNumber");
      const cost = getProcessValue(processData, "costOfCalibration");
      const calComment = getProcessValue(processData, "calibrationComment");
      const comments = getProcessValue(processData, "comments");
      const attachment = getProcessValue(processData, "attachment");

      const hod = getProcessValue(processData, "hod");
      const qaReviewer = getProcessValue(processData, "qa_reviewer");
      const qaApproval = getProcessValue(processData, "qa_approval");

      const hodId = hod && typeof hod === "object" ? hod?.id : hod || "";
      const qaReviewerId = qaReviewer && typeof qaReviewer === "object" ? qaReviewer?.id : qaReviewer || "";
      const qaApprovalId = qaApproval && typeof qaApproval === "object" ? qaApproval?.id : qaApproval || "";

      setRecordNumber(recNum || "");
      setSiteLocationCode(locCode || "");
      setInitiator(initiatorName || data?.initiator?.name || "");
      setInitiatorId(data?.initiator?.id || "");
      setDepartmentId(data?.department?.id || "");
      setInitiationDepartment(dept || data?.department?.name || "");
      setDateOfInitiation(initDate || data?.initiation_date || "");
      setShortDescription(shortDesc || "");

      requiredValuesRef.current = {
        hod: hodId,
        qaReviewer: qaReviewerId,
        qaApproval: qaApprovalId,
      };

      const parseDate = (val) => {
        if (!val) return null;
        if (dayjs.isDayjs(val)) return val;
        return dayjs(val, "DD/MM/YYYY", true);
      };

      form.setFieldsValue({
        recordNumber: recNum || "",
        siteLocationCode: locCode || "",
        initiator: initiatorName || data?.initiator?.name || "",
        dateOfInitiation: initDate || data?.initiation_date || "",
        initiationDepartment: dept || data?.department?.name || "",
        shortDescription: shortDesc || "",
        instrumentName: instrumentName || "",
        instrumentId: instrumentId || "",
        location: location || "",
        makeModel: makeModel || "",
        range: range || "",
        leastCount: leastCount || "",
        criticality: criticality || "",
        calibrationFrequency: calibrationFreq || "",
        previousCalibrationDate: parseDate(prevCalDate),
        nextCalibrationDate: parseDate(nextCalDate),
        standardReference: standardRef || "",
        dueReminder: dueReminder || "",
        procedureReference: procedureRef || "",
        standardUsed: standardUsed || "",
        parameters: parameters || "",
        unscheduledReason: unscheduledReason || "",
        eventReference: eventRef || "",
        calibrationResults: calResults || "",
        certificateNumber: certNum || "",
        costOfCalibration: cost || "",
        calibrationComment: calComment || "",
        hod: hodId,
        qaReviewer: qaReviewerId,
        qaApproval: qaApprovalId,
        comments: comments || "",
        attachment: attachment || [],
      });

      const gridRecords = data?.grid_records || [];
      const rawRows = gridRecords.flatMap((rec) => rec?.grid_data || []);
      const normalizedRows = rawRows.map((item) => {
        const row = {};
        Object.keys(item).forEach((key) => {
          if (key === "row_id") {
            row.row_id = item.row_id;
          } else if (
            item[key] &&
            typeof item[key] === "object" &&
            Object.prototype.hasOwnProperty.call(item[key], "value")
          ) {
            row[key] = item[key].value;
          } else {
            row[key] = item[key];
          }
        });
        return row;
      });
      setCalibrationResultRows(normalizedRows);

    } catch (error) {
      console.error("Failed to fetch child detail:", error);
      toast.error(error?.response?.data?.message || "Failed to load child calibration record.");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [recordId, form]);

  useEffect(() => {
    fetchChildDetail();
  }, [fetchChildDetail]);

  // ---- Workflow stages, activities, permissions, logs ----
  useEffect(() => {
    if (!processId) return;
    const fetchStages = async () => {
      try {
        setWorkflowLoading(true);
        const response = await getAllStages(processId);
        const stages = response?.data?.data || [];
        setWorkflowStages(stages.filter((stage) => stage?.is_active !== false));
      } catch (error) {
        console.error("Failed to fetch workflow stages:", error);
        toast.error(error?.response?.data?.message || "Failed to load workflow stages.");
        setWorkflowStages([]);
      } finally {
        setWorkflowLoading(false);
      }
    };
    fetchStages();
  }, [processId]);

  useEffect(() => {
    if (!activeStageId) {
      setActivities([]);
      setActivitiesLoading(false);
      return;
    }
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await getAllActivites(activeStageId);
        const activityList = response?.data?.data || [];
        setActivities(activityList.filter((activity) => activity?.is_active !== false));
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        toast.error(error?.response?.data?.message || "Failed to load activities.");
        setActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, [activeStageId]);

  const fetchPermissions = useCallback(async () => {
    if (!recordId) {
      setCanPerformActivity(false);
      setPermissionsLoading(false);
      return;
    }
    try {
      setPermissionsLoading(true);
      const response = await getAllPermissions(recordId);
      const canPerform = response?.data?.data?.permission?.can_perform_action === true;
      setCanPerformActivity(canPerform);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setCanPerformActivity(false);
      toast.error(error?.response?.data?.message || "Failed to check activity permissions.");
    } finally {
      setPermissionsLoading(false);
    }
  }, [recordId]);

  const fetchActivityLogs = useCallback(async () => {
    if (!recordId) {
      setActivityLogs([]);
      return;
    }
    try {
      setActivityLogsLoading(true);
      const response = await getAllActivityLogs(recordId);
      setActivityLogs(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch activity history:", error);
      toast.error(error?.response?.data?.message || "Failed to load activity history.");
      setActivityLogs([]);
    } finally {
      setActivityLogsLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Sync active tab with stage – same as reference panel
  useEffect(() => {
    if (!activeStageId) return;
    const matchingTab = TABS.find((tab) => Number(tab.stageId) === Number(activeStageId));
    if (matchingTab) {
      setActiveTab(matchingTab.id);
    }
  }, [activeStageId]);

  // ---- Save / Update ----
  const systemValues = {
    recordNumber: form.getFieldValue("recordNumber") || recordNumber,
    siteLocationCode: form.getFieldValue("siteLocationCode") || siteLocationCode,
    initiator: form.getFieldValue("initiator") || initiator,
    dateOfInitiation: form.getFieldValue("dateOfInitiation") || dateOfInitiation,
    initiationDepartment: form.getFieldValue("initiationDepartment") || initiationDepartment,
  };

  const handleSave = async () => {
    if (isSaving || isLoading || usersLoading) return;

    const values = form.getFieldsValue();
    const missing = REQUIRED_FIELDS.filter((field) => {
      const val = values[field.name];
      if (typeof val === "string") return !val.trim();
      return val === undefined || val === null || val === "";
    });
    if (missing.length > 0) {
      const names = missing.map((f) => f.label).join(", ");
      toast.error(`Required fields missing: ${names}`);
      form.setFields(
        missing.map((f) => ({
          name: f.name,
          errors: [`${f.label} is required`],
        }))
      );
      setActiveTab("management");
      return;
    }
    form.submit();
  };

  const handleSubmit = async (values) => {
    if (isSaving || !recordId) return;
    try {
      setIsSaving(true);
      const mergedValues = { ...values };
      REQUIRED_FIELDS.forEach(({ name }) => {
        if (!mergedValues[name] && requiredValuesRef.current[name]) {
          mergedValues[name] = requiredValuesRef.current[name];
        }
      });

      const processData = buildProcessData(
        mergedValues,
        systemValues,
        hodUsers,
        qaReviewers,
        qaApprovers
      );
      const gridData = buildGridPayload(calibrationResultRows);

      const payload = {
        process_id: Number(processId),
        stage_id: Number(activeStageId),
        department_id: Number(departmentId),
        initiator_id: Number(initiatorId),
        short_description: mergedValues.shortDescription || "",
        initiation_date: dayjs(mergedValues.dateOfInitiation || dateOfInitiation).format("DD/MM/YYYY HH:mm"),
        process_data: processData,
        gridData: gridData,
        checklistData: [],
      };

      const response = await updateCalibrationChild(recordId, payload);
      if (response?.data?.success || response?.data?.status === true) {
        toast.success("Child calibration updated successfully.");
        await fetchChildDetail();
        await fetchPermissions();
        await fetchActivityLogs();
      } else {
        toast.error(response?.data?.message || "Failed to update child calibration.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error?.response?.data?.message || "Failed to update child calibration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivitySuccess = async () => {
    try {
      const values = form.getFieldsValue(true);
      await handleSubmit(values);
      await fetchChildDetail();
      await fetchPermissions();
      await fetchActivityLogs();
    } catch (error) {
      console.error("Failed to save after activity:", error);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    navigate("/user/engineering-dashboard");
  };

  // ---- Render ----
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton variant="title" className="w-full" />
        <Skeleton variant="form" fields={6} />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ===== HEADER ===== */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#263B35]">
              Child Calibration
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-8 border-l border-slate-200 pl-6">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">
              Site
            </p>
            <p className="text-sm font-semibold text-[#344A43]">
              {siteLocationCode || "Unit IV"}
            </p>
          </div>
          <div className="h-9 w-px bg-slate-200" />
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">
              Process
            </p>
            <p className="text-sm font-semibold text-[#344A43]">
              {processName || "Calibration Management"}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Workflow Stage & Activities ===== */}
      <div className="mb-2 space-y-2">
        <ProcessStage
          stages={workflowStages}
          activeStageId={activeStageId}
          loading={workflowLoading}
        />
        <div className="flex flex-col gap-2 rounded-xl border border-[#DCE8E2] bg-white p-2 shadow-[0_3px_14px_rgba(21,44,32,0.04)] lg:flex-row lg:items-center">
          <div className="flex min-w-0 shrink-0 items-center gap-4 rounded-lg bg-[#F7FAF8] px-3 py-2 lg:w-[40%]">
            <div className="h-7 w-px shrink-0 bg-[#DCE8E2]" />
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#8A9992]">
                Process
              </p>
              <p className="truncate text-[11px] font-semibold text-[#344A43]">
                {processName || "—"}
              </p>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <ProcessActivities
              activities={activities}
              loading={activitiesLoading}
              recordId={recordId}
              userId={loginUserId}
              activityApi={executeCalibrationActivity}
              onActivitySuccess={handleActivitySuccess}
              canPerformActivity={canPerformActivity}
              permissionsLoading={permissionsLoading}
              onExit={() => navigate("/user/engineering-dashboard")}
            />
          </div>
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div className="mb-6">
        <ProcessTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* ===== Form ===== */}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="w-full [&_.ant-form-item-label>label]:!text-[12px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-explain-error]:!text-[11px]"
      >
        {activeTab === "management" && (
          <section>
            <SectionHeader title="SYSTEM INFORMATION" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="recordNumber" label="Record Number" className="!mb-4">
                <FormDisabledInput />
              </Form.Item>
              <Form.Item name="siteLocationCode" label="Site / Location Code" className="!mb-4">
                <FormDisabledInput />
              </Form.Item>
              <Form.Item name="initiator" label="Initiator" className="!mb-4">
                <FormDisabledInput />
              </Form.Item>
              <Form.Item name="dateOfInitiation" label="Date of Initiation" className="!mb-4">
                <FormDisabledInput />
              </Form.Item>
              <Form.Item name="initiationDepartment" label="Initiation Department" className="!mb-4">
                <FormDisabledInput />
              </Form.Item>
              <Form.Item
                name="shortDescription"
                label="Short Description"
                className="!mb-4"
              >
                <FormInput placeholder="Enter short description" disabled={!isManagementEditable} />
              </Form.Item>
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />

            <SectionHeader title="INSTRUMENT / EQUIPMENT DETAILS" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="instrumentName" label="Instrument / Equipment Name" className="!mb-4">
                <FormSelect
                  placeholder={equipmentLoading ? "Loading..." : "Select Instrument"}
                  options={equipmentOptions}
                  disabled={equipmentLoading || !isManagementEditable}
                />
              </Form.Item>
              <Form.Item name="instrumentId" label="Instrument/Equipment ID" className="!mb-4">
                <FormInput placeholder="e.g. EQ-001" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="location" label="Location" className="!mb-4">
                <FormInput placeholder="Lab A, Room 101" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="makeModel" label="Make & Model" className="!mb-4">
                <FormInput placeholder="e.g. Fluke 87V" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="range" label="Range" className="!mb-4">
                <FormInput placeholder="e.g. 0-1000 V" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="leastCount" label="Least Count" className="!mb-4">
                <FormInput placeholder="e.g. 0.01" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="criticality" label="Critical & Non Critical" className="!mb-4">
                <FormSelect
                  placeholder="Select"
                  options={[
                    { value: "Critical", label: "Critical" },
                    { value: "Non-Critical", label: "Non-Critical" },
                  ]}
                  disabled={!isManagementEditable}
                />
              </Form.Item>
              <Form.Item name="calibrationFrequency" label="Calibration Frequency" className="!mb-4">
                <FormSelect
                  placeholder="Select"
                  options={[
                    { value: "Monthly", label: "Monthly" },
                    { value: "Quarterly", label: "Quarterly" },
                    { value: "Half-Yearly", label: "Half-Yearly" },
                    { value: "Yearly", label: "Yearly" },
                  ]}
                  disabled={!isManagementEditable}
                />
              </Form.Item>

              <Form.Item name="previousCalibrationDate" label="Previous Calibration Date" className="!mb-4">
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Select date"
                  disabled={!isManagementEditable}
                />
              </Form.Item>
              <Form.Item name="nextCalibrationDate" label="Next Calibration Date" className="!mb-4">
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Select date"
                  disabled={!isManagementEditable}
                />
              </Form.Item>

              <Form.Item name="standardReference" label="Calibration Standard Reference" className="!mb-4">
                <FormInput placeholder="e.g. ISO 17025" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="dueReminder" label="Calibration Due Reminder" className="!mb-4">
                <FormInput placeholder="Days before due" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="procedureReference" label="Calibration Procedures Reference Document" className="!mb-4">
                <FormInput placeholder="Doc #" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="standardUsed" label="Calibration Standard used" className="!mb-4">
                <FormInput placeholder="Standard name" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="parameters" label="Calibration Parameters" className="!mb-4">
                <FormInput placeholder="e.g. Voltage, Current" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="unscheduledReason" label="Reason for Unscheduled or Event Based Calibration" className="!mb-4">
                <FormInput placeholder="Explain reason" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="eventReference" label="Event Reference No." className="!mb-4">
                <FormInput placeholder="e.g. EVT-123" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="calibrationResults" label="Calibration Results" className="!mb-4">
                <FormSelect
                  placeholder="Select"
                  options={[
                    { value: "Pass", label: "Pass" },
                    { value: "Fail", label: "Fail" },
                    { value: "Out of Tolerance", label: "Out of Tolerance" },
                  ]}
                  disabled={!isManagementEditable}
                />
              </Form.Item>
              <Form.Item name="certificateNumber" label="Calibration Certificate number" className="!mb-4">
                <FormInput placeholder="Cert #" disabled={!isManagementEditable} />
              </Form.Item>
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />

            <SectionHeader title="CALIBRATION RESULT" />
            <div className="mt-4">
              <UserDynamicGrid
                name="Calibration Results"
                description="Parameter-wise calibration results"
                columns={CALIBRATED_BY_COLUMNS}
                value={calibrationResultRows}
                onChange={setCalibrationResultRows}
                allowAdd={isManagementEditable}
                allowDelete={isManagementEditable}
                addButtonLabel="Add Parameter"
                minRows={0}
                rowKey="_rowId"
                deleteRow={(updatedRows) => 
                    updateCalibrationChild(recordId, { gridData: updatedRows })
                }              />
            </div>

            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 mt-6">
              <Form.Item name="costOfCalibration" label="Cost of Calibration" className="!mb-4">
                <FormInput placeholder="Enter cost" type="number" disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item name="calibrationComment" label="Calibration Comment / Observations" className="!mb-4 md:col-span-2">
                <FormTextArea rows={3} placeholder="Enter any comments or observations..." disabled={!isManagementEditable} />
              </Form.Item>
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />

            <SectionHeader title="ASSIGNMENTS" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item
                name="hod"
                label={<span>HOD / Designee <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: "Please select HOD" }]}
                className="!mb-4"
              >
                <FormSelect
                  placeholder={usersLoading ? "Loading..." : "Select HOD / Designee"}
                  options={hodOptions}
                  disabled={usersLoading || !isManagementEditable}
                />
              </Form.Item>
              <Form.Item
                name="qaReviewer"
                label={<span>QA Reviewer <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: "Please select QA Reviewer" }]}
                className="!mb-4"
              >
                <FormSelect
                  placeholder={usersLoading ? "Loading..." : "Select QA Reviewer"}
                  options={qaReviewerOptions}
                  disabled={usersLoading || !isManagementEditable}
                />
              </Form.Item>
              <Form.Item
                name="qaApproval"
                label={<span>QA Approval <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: "Please select QA Approver" }]}
                className="!mb-4"
              >
                <FormSelect
                  placeholder={usersLoading ? "Loading..." : "Select QA Approver"}
                  options={qaApproverOptions}
                  disabled={usersLoading || !isManagementEditable}
                />
              </Form.Item>
              <Form.Item name="comments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={4} placeholder="Additional comments..." disabled={!isManagementEditable} />
              </Form.Item>
              <Form.Item
                name="attachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled={!isManagementEditable} />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "implementor" && (
          <section>
            <SectionHeader title="IMPLEMENTOR REVIEW" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="implementorComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter review comments..." disabled={!isImplementorEditable} />
              </Form.Item>
              <Form.Item
                name="implementorAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled={!isImplementorEditable} />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "qa-review" && (
          <section>
            <SectionHeader title="QA REVIEW" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="qaReviewComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter QA review comments..." disabled={!isQaReviewEditable} />
              </Form.Item>
              <Form.Item
                name="qaReviewAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled={!isQaReviewEditable} />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "qa-approval" && (
          <section>
            <SectionHeader title="QA APPROVAL" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="qaApprovalComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter QA approval comments..." disabled={!isQaApprovalEditable} />
              </Form.Item>
              <Form.Item
                name="qaApprovalAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled={!isQaApprovalEditable} />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "activity" && (
          <section>
            <SectionHeader title="ACTIVITY LOG" />
            <div className="mt-5 space-y-4">
              {activityLogsLoading ? (
                <Skeleton variant="activityLog" />
              ) : activityLogs.length === 0 ? (
                <div className="rounded-lg border border-[#DCE3EA] bg-white p-5 text-center text-sm text-slate-500">
                  No activity history found.
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-[#DCE3EA] bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                  >
                    <div className="mb-5">
                      <p className="text-[13px] font-semibold text-[#3E4A5C]">Activity Name</p>
                      <p className="mt-1 text-[14px] font-semibold text-[#182234]">
                        {log.activity_name || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">Performed By</p>
                        <div className="flex min-h-11 items-center rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3">
                          <span className="text-[14px] text-[#526071]">{log.performed_by || "—"}</span>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">Date Performed</p>
                        <div className="flex min-h-11 items-center rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3">
                          <span className="text-[14px] text-[#526071]">{log.performed_at || "—"}</span>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">Comments</p>
                        <div className="h-11 overflow-y-auto rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3 py-2">
                          <p className="break-words text-[14px] leading-5 text-[#526071]">
                            {log.comment || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </Form>

      <FloatingActionButtons
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving || isLoading || usersLoading}
        saveLabel="Update"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default CalibrationChildPanel;