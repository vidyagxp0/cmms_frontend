import React, { useCallback, useEffect, useState, useRef } from "react";
import { Form, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import ProcessStage from "../../../components/common/ProcesStageTabs/ProcessStage";
import ProcessActivities from "../../../components/common/ProcesStageTabs/ProcessActivities";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FormTextArea from "../../../components/common/Form/FormTextArea";
import FormDisabledInput from "../../../components/common/Form/FormDisabledInput";
import FormAttachment from "../../../components/common/Attachment/FormAttachment";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import "../../../components/common/ProcesStageTabs/Scrollerbar.css";
import "../../../components/ui/disabledFields.css";

import { getProfile } from "../../../services/authApi";
import {
  executePreventiveActivity,
  getPreventiveDetail,
  updatePreventive,
} from "../../../services/usersApi/preventive";
import {
  addMultipleAttachments,
  addSingleAttachment,
} from "../../../components/common/Attachment/attachmentApi";
import {
  getAllActivites,
  getAllActivityLogs,
  getAllPermissions,
  getAllStages,
  getAllDepartments,
  getAllDepartmentMasters,
} from "../../../services/usersApi/workflowCommonApi";
import PreventiveGrid, {
  getRowBiggestFrequency,
  createEmptyWeeklyData,
} from "./PreventiveGrid";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";

dayjs.extend(customParseFormat);

const MONTHS = [
  { key: "jan" }, { key: "feb" }, { key: "mar" }, { key: "apr" },
  { key: "may" }, { key: "jun" }, { key: "jul" }, { key: "aug" },
  { key: "sep" }, { key: "oct" }, { key: "nov" }, { key: "dec" },
];

const TABS = [
  { id: "general", label: "General Information", stageId: 7 },
  { id: "hod", label: "HOD / Designee Review", stageId: 8 },
  { id: "user-dept-review", label: "QA Review", stageId: 9 },
  { id: "qa-review", label: "QA Approval Review", stageId: 10 },
  { id: "activity", label: "Activity Log", stageId: 11 },
  { id: "cancellation", label: "Cancellation", stageId: 12 },
];

// ✅ instrumentType removed
const REQUIRED_FIELDS = [
  { name: "shortDescription", label: "Short Description" },
  { name: "selectedDeptId", label: "Select Department" },
];

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

const buildGridPayload = (rows = [], equipmentMap = {}) => {
  return rows.map((row, index) => {
    const rowData = { row_id: index + 1 };
    Object.keys(row).forEach((key) => {
      if (key === "isFromApi" || key === "weeklyPreventive") return;

      let value = row[key] !== undefined && row[key] !== null ? row[key] : "";
      if (key === "previousPreventiveDate" && value)
        value = dayjs(value).format("DD/MM/YYYY");
      else if (key === "nextPreventiveDate" && value)
        value = dayjs(value).format("DD/MM/YYYY");

      if (key === "equipmentInstrumentName" && value && equipmentMap[value])
        value = equipmentMap[value]?.equipment_name || equipmentMap[value]?.instrument_name || equipmentMap[value]?.name || value;

      rowData[key] = { key, label: key, value };
    });
    return rowData;
  });
};

const buildRowFromEquipment = (item = {}) => {
  const newRow = {
    equipmentDbId: item.id !== undefined && item.id !== null ? String(item.id) : "",
    equipmentInstrumentName: item.equipment_name || item.instrument_name || item.name || "",
    equipmentInstrumentId: item.instrument_id_no || item.equipment_id || "",
    location: item.location || "",
    make: item.make || "",
    model: item.sr_no_model_no || item.model || "",
    remark: "",
    isFromApi: true,
  };

  MONTHS.forEach((m) => {
    newRow[`${m.key}_planned`] = "";
    newRow[`${m.key}_executed`] = "";
  });

  return newRow;
};

// ✅ instrumentType removed from process_data
const buildProcessData = (values, systemFields) => [
  ...systemFields.map((field) => ({
    key: field.name,
    label: field.label,
    value: values?.[field.name] || field.value || "",
  })),
  {
    key: "master_department",
    label: "Select Department",
    value: values?.selectedDeptId ? Number(values.selectedDeptId) : null,
  },
  {
    key: "short_description",
    label: "Short Description",
    value: values?.shortDescription || "",
  },
  { key: "comment", label: "Comments", value: values?.comments || "" },
  { key: "attachment", label: "Attachment", value: [] },
  {
    key: "hod_review_comments",
    label: "HOD / Designee Review Comments",
    value: values?.hodReviewComments || "",
  },
  {
    key: "hod_review_attachment",
    label: "HOD / Designee Review Attachment",
    value: [],
  },
  {
    key: "user_dept_review_comments",
    label: "User Dept Review Comments",
    value: values?.userDeptReviewComments || "",
  },
  {
    key: "user_dept_review_attachment",
    label: "User Dept Review Attachment",
    value: values?.userDeptReviewAttachment || [],
  },
  {
    key: "qa_review_comments",
    label: "QA Review Comments",
    value: values?.qaReviewComments || "",
  },
  {
    key: "qa_review_attachment",
    label: "QA Review Attachment",
    value: [],
  },
  {
    key: "cancellation_remark",
    label: "Cancellation Remark",
    value: values?.cancellationRemark || "",
  },
  {
    key: "cancellation_attachment",
    label: "Cancellation Attachment",
    value: [],
  },
];

const validatePreventivePlannerForm = (form, storedRequired) => {
  const values = form.getFieldsValue();
  return REQUIRED_FIELDS.filter((field) => {
    let value = values?.[field.name];
    if (value === undefined || value === null || value === "")
      value = storedRequired[field.name];
    if (typeof value === "string") return !value.trim();
    return value === undefined || value === null || value === "";
  });
};

const PreventivePlannerPanel = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowLoading, setWorkflowLoading] = useState(true);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [processId, setProcessId] = useState(2);
  const [activeStageId, setActiveStageId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [canPerformActivity, setCanPerformActivity] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [preventiveRows, setPreventiveRows] = useState([]);

  const [headerWeekDates, setHeaderWeekDates] = useState({});

  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const equipmentMapRef = useRef(equipmentMap);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [initiator, setInitiator] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [loginUserId, setLoginUserId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [initiationDepartment, setInitiationDepartment] = useState("");
  const [dateOfInitiation, setDateOfInitiation] = useState("");
  const [siteLocationCode, setSiteLocationCode] = useState("");
  const [processName, setProcessName] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isFetchingRef = useRef(false);

  // ✅ instrumentType removed
  const requiredValuesRef = useRef({ shortDescription: "", selectedDeptId: "" });

  // New Department States for Dropdown
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  // NEW: Track when user manually changes a dropdown
  const userChangedDropdownRef = useRef(false);

  // ✅ Only watch department now
  const selectedDeptIdWatch = Form.useWatch("selectedDeptId", form);

  // Auto-populate refs
  const equipmentDataRef = useRef([]);
  const hasInitialDetailLoadedRef = useRef(false);
  const hasInitialEquipmentLoadedRef = useRef(false);
  const savedRowsCountRef = useRef(0);
  const autoPopulateDoneRef = useRef(false);

  const canCreateChild =
    Number(activeStageId) === 11 &&
    userRoles.some((role) => String(role).toLowerCase() === "initiator");

  useEffect(() => {
    equipmentMapRef.current = equipmentMap;
  }, [equipmentMap]);

  const isStageEditable = (stageId) =>
    Number(activeStageId) === Number(stageId) &&
    canPerformActivity === true &&
    permissionsLoading === false;

  const isGeneralEditable = isStageEditable(7);
  const isHodEditable = isStageEditable(8);
  const isUserDeptEditable = isStageEditable(9);
  const isQaReviewEditable = isStageEditable(10);
  const isCancellationEditable = isStageEditable(11);

  const tryAutoPopulateOnInitial = useCallback(() => {
    if (autoPopulateDoneRef.current) return;
    if (!hasInitialDetailLoadedRef.current) return;
    if (!hasInitialEquipmentLoadedRef.current) return;

    if (savedRowsCountRef.current > 0) {
      autoPopulateDoneRef.current = true;
      return;
    }

    const equipment = equipmentDataRef.current;
    if (!Array.isArray(equipment) || equipment.length === 0) return;

    autoPopulateDoneRef.current = true;
    setPreventiveRows(equipment.map(buildRowFromEquipment));
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response?.data?.data;
        if (!profile) return;
        setLoginUserId(profile?.id || "");
        setUserRoles(Array.isArray(profile?.roles) ? profile.roles : []);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const response = await getAllDepartments();
        const data = response?.data?.data ?? [];
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        toast.error("Could not load departments.");
      } finally {
        setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // ✅ Dynamic API fetch — ONLY based on Department (always "equipment_master")
  useEffect(() => {
    let isCurrent = true;

    const fetchEquipment = async () => {
      setEquipmentOptions([]);
      setEquipmentMap({});
      equipmentMapRef.current = {};

      if (!selectedDeptIdWatch) {
        equipmentDataRef.current = [];
        hasInitialEquipmentLoadedRef.current = true;
        setPreventiveRows([]);
        setEquipmentLoading(false);
        return;
      }

      // ✅ Always use "equipment_master" — instrument type is no longer a field
      const apiType = "equipment_master";

      try {
        setEquipmentLoading(true);
        const response = await getAllDepartmentMasters(selectedDeptIdWatch, apiType);

        if (!isCurrent) return;

        const data = response?.data?.data || [];

        const options = data.map((item) => ({
          value: String(item.id),
          label: item.equipment_name || item.instrument_name || item.name || "",
        }));

        const map = {};
        data.forEach((item) => {
          map[String(item.id)] = item;
        });

        setEquipmentOptions(options);
        setEquipmentMap(map);
        equipmentMapRef.current = map;

        equipmentDataRef.current = data;
        hasInitialEquipmentLoadedRef.current = true;

        if (userChangedDropdownRef.current) {
          setPreventiveRows(data.map(buildRowFromEquipment));
          userChangedDropdownRef.current = false;
        } else {
          tryAutoPopulateOnInitial();
        }
      } catch (error) {
        if (!isCurrent) return;
        console.error("Failed to fetch equipment:", error);
        toast.error("Could not load equipment list.");
        hasInitialEquipmentLoadedRef.current = true;
        tryAutoPopulateOnInitial();
      } finally {
        if (isCurrent) {
          setEquipmentLoading(false);
        }
      }
    };

    fetchEquipment();

    return () => {
      isCurrent = false;
    };
  }, [selectedDeptIdWatch, tryAutoPopulateOnInitial]);

  const fetchPreventiveDetail = useCallback(
    async (isInitial = false) => {
      if (!recordId) {
        toast.error("Preventive Planner record ID is missing.");
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        if (isInitial) setIsLoading(true);
        const response = await getPreventiveDetail(recordId);

        let responseData = response?.data?.data;
        let gridRecords = [];
        let processData = [];

        if (Array.isArray(responseData)) {
          gridRecords = responseData;
          processData = [];
        } else if (responseData) {
          processData = responseData?.process_data || [];
          gridRecords = responseData?.grid_records || [];
        } else {
          toast.error("Preventive Planner record not found.");
          return;
        }

        if (!Array.isArray(responseData)) {
          setProcessId(responseData?.process_id || null);
          const backendStageId =
            responseData?.stage?.id || responseData?.stage_id || null;
          setActiveStageId(backendStageId);
          setProcessName(responseData?.process?.name || "");
        }

        const documentNumber = getProcessValue(processData, "documentNumber");
        const documentType = getProcessValue(processData, "documentType");
        const recordNumber = getProcessValue(processData, "recordNumber");
        const locationCode = getProcessValue(processData, "siteLocationCode");
        const processInitiator = getProcessValue(processData, "initiator");
        const processDateOfInitiation = getProcessValue(processData, "dateOfInitiation");
        const dueDate = getProcessValue(processData, "dueDate");
        const processDepartment = getProcessValue(processData, "initiationDepartment");
        const masterDepartmentId = getProcessValue(processData, "master_department");
        // ✅ instrumentType removed
        const shortDescription = getProcessValue(processData, "short_description");
        const comments = getProcessValue(processData, "comment");
        const attachment = getProcessValue(processData, "attachment");
        const hodReviewComments = getProcessValue(processData, "hod_review_comments");
        const hodReviewAttachment = getProcessValue(processData, "hod_review_attachment");
        const userDeptReviewComments = getProcessValue(processData, "user_dept_review_comments");
        const userDeptReviewAttachment = getProcessValue(processData, "user_dept_review_attachment");
        const qaReviewComments = getProcessValue(processData, "qa_review_comments");
        const qaReviewAttachment = getProcessValue(processData, "qa_review_attachment");
        const cancellationRemark = getProcessValue(processData, "cancellation_remark");
        const cancellationAttachment = getProcessValue(processData, "cancellation_attachment");

        const firstGridRecord = gridRecords[0] || null;
        const savedHeaderDates =
          firstGridRecord?.week_dates_data ||
          responseData?.headerWeekDates ||
          getProcessValue(processData, "headerWeekDates") ||
          {};

        setHeaderWeekDates(savedHeaderDates);
        setSiteLocationCode(locationCode || "");

        const backendInitiatorId =
          responseData?.initiator?.id ?? responseData?.initiator_id ?? "";
        const backendInitiatorName =
          responseData?.initiator?.name ?? processInitiator ?? "";

        setInitiatorId(backendInitiatorId);
        setInitiator(backendInitiatorName);
        setDepartmentId(responseData?.department?.id || responseData?.department_id || "");
        setInitiationDepartment(responseData?.department?.name || processDepartment || "");
        setDateOfInitiation(processDateOfInitiation || responseData?.initiation_date || "");

        // ✅ instrumentType removed
        requiredValuesRef.current = {
          shortDescription: shortDescription || "",
          selectedDeptId: masterDepartmentId || null,
        };

        // ✅ instrumentType removed
        form.setFieldsValue({
          documentNumber: documentNumber || "SMLJ/ENG/SOP-GEN/OO3/T01-01",
          documentType: documentType || "Formats",
          recordNumber,
          siteLocationCode: locationCode || "",
          initiator: backendInitiatorName,
          dateOfInitiation:
            processDateOfInitiation || responseData?.initiation_date || "",
          dueDate,
          initiationDepartment: responseData?.department?.name || processDepartment || "",
          selectedDeptId: masterDepartmentId || null,
          shortDescription,
          comments,
          attachment: attachment || [],
          hodReviewComments,
          hodReviewAttachment: hodReviewAttachment || [],
          userDeptReviewComments,
          userDeptReviewAttachment: userDeptReviewAttachment || [],
          qaReviewComments,
          qaReviewAttachment: qaReviewAttachment || [],
          cancellationRemark: cancellationRemark || "",
          cancellationAttachment: cancellationAttachment || [],
        });

        const currentEquipmentMap = equipmentMapRef.current;
        const gridRows = gridRecords.flatMap((record) => record?.grid_data || []);

        const rawRows = gridRows.map((item) => {
          const row = {};
          Object.keys(item).forEach((key) => {
            if (key === "row_id") row.row_id = item.row_id;
            else if (key === "weeklyPreventive") return;
            else if (
              item[key] &&
              typeof item[key] === "object" &&
              Object.prototype.hasOwnProperty.call(item[key], "value")
            )
              row[key] = item[key].value;
            else row[key] = item[key];
          });
          return row;
        });

        const normalizedRows = rawRows.map((row) => {
          const newRow = { ...row, isFromApi: true };

          MONTHS.forEach(({ key }) => {
            if (newRow[`${key}_planned`] === undefined || newRow[`${key}_planned`] === null) newRow[`${key}_planned`] = "";
            if (newRow[`${key}_executed`] === undefined || newRow[`${key}_executed`] === null) newRow[`${key}_executed`] = "";
          });

          if (
            newRow.equipmentInstrumentName &&
            typeof newRow.equipmentInstrumentName === "string" &&
            !currentEquipmentMap[newRow.equipmentInstrumentName]
          ) {
            const found = Object.values(currentEquipmentMap).find(
              (eq) =>
                eq.equipment_name === newRow.equipmentInstrumentName ||
                eq.instrument_name === newRow.equipmentInstrumentName ||
                eq.name === newRow.equipmentInstrumentName ||
                String(eq.id) === String(newRow.equipmentInstrumentName)
            );
            if (found) {
              newRow.equipmentInstrumentName =
                found.equipment_name ?? found.instrument_name ?? found.name ?? newRow.equipmentInstrumentName;
              newRow.equipmentDbId = found.id || newRow.equipmentDbId || "";
            }
          } else if (currentEquipmentMap[newRow.equipmentInstrumentName]) {
            newRow.equipmentDbId =
              currentEquipmentMap[newRow.equipmentInstrumentName].id || "";
          }

          newRow.previousPreventiveDate = newRow.previousPreventiveDate
            ? dayjs(newRow.previousPreventiveDate, "DD/MM/YYYY")
            : "";
          newRow.nextPreventiveDate = newRow.nextPreventiveDate
            ? dayjs(newRow.nextPreventiveDate, "DD/MM/YYYY")
            : "";

          return newRow;
        });

        if (isInitial && !hasInitialDetailLoadedRef.current) {
          hasInitialDetailLoadedRef.current = true;
          savedRowsCountRef.current = normalizedRows.length;
        }

        setPreventiveRows(normalizedRows);
        tryAutoPopulateOnInitial();
      } catch (error) {
        console.error("Failed to fetch preventive planner detail:", error);
        toast.error(
          error?.response?.data?.message ||
            "Failed to load Preventive Planner record."
        );
        if (isInitial) hasInitialDetailLoadedRef.current = true;
        tryAutoPopulateOnInitial();
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [recordId, form, tryAutoPopulateOnInitial]
  );

  useEffect(() => {
    fetchPreventiveDetail(true);
  }, [fetchPreventiveDetail]);

  useEffect(() => {
    if (!processId) return;
    const fetchStages = async () => {
      try {
        setWorkflowLoading(true);
        const response = await getAllStages(processId);
        const stages = response?.data?.data || [];
        const activeStages = stages.filter(
          (stage) => stage?.is_active !== false
        );
        setWorkflowStages(activeStages);
      } catch (error) {
        console.error("Failed to fetch workflow stages:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load workflow stages."
        );
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
        setActivities(
          activityList.filter((activity) => activity?.is_active !== false)
        );
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load activities."
        );
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
      const canPerform =
        response?.data?.data?.permission?.can_perform_action === true;
      setCanPerformActivity(canPerform);
    } catch (error) {
      console.error("Failed to fetch record permissions:", error);
      setCanPerformActivity(false);
      toast.error(
        error?.response?.data?.message ||
          "Failed to check activity permissions."
      );
    } finally {
      setPermissionsLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const fetchActivityLogs = useCallback(async () => {
    if (!recordId) {
      setActivityLogs([]);
      return;
    }
    try {
      setActivityLogsLoading(true);
      const response = await getAllActivityLogs(recordId, processId);
      setActivityLogs(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch activity history:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load activity history."
      );
      setActivityLogs([]);
    } finally {
      setActivityLogsLoading(false);
    }
  }, [recordId, processId]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  useEffect(() => {
    if (!activeStageId) return;
    const matchingTab = TABS.find(
      (tab) => Number(tab.stageId) === Number(activeStageId)
    );
    if (matchingTab) setActiveTab(matchingTab.id);
  }, [activeStageId]);

  const systemFields = [
    { name: "documentNumber", label: "Document Number", value: "SMLJ/ENG/SOP-GEN/OO3/T01-01" },
    { name: "documentType", label: "Document Type", value: "Formats" },
    { name: "recordNumber", label: "Record Number", value: form.getFieldValue("recordNumber") || "" },
    { name: "initiator", label: "Initiator", value: initiator },
    { name: "dateOfInitiation", label: "Date of Initiation", value: dateOfInitiation },
    { name: "initiationDepartment", label: "Initiation Department", value: initiationDepartment },
  ];

  const handleViewChild = (rowIndex, rowData, biggestFrequency) => {
    const shortDesc = form.getFieldValue("shortDescription") || "";
    const { code = "", label = "" } =
      biggestFrequency || getRowBiggestFrequency(rowData);

    navigate(`/user/preventive-maintenance-create/${4}/${recordId}`, {
      state: {
        rowData,
        shortDescription: shortDesc,
        processId: 4,
        parentId: recordId,
        preventiveFrequency: label,
        preventiveFrequencyCode: code,
      },
    });
  };

  const handleSave = async () => {
    if (isSaving || isLoading) return;
    const missingFields = validatePreventivePlannerForm(
      form,
      requiredValuesRef.current
    );
    if (missingFields.length > 0) {
      const missingFieldNames = missingFields
        .map((field) => field.label)
        .join(", ");
      toast.error(`Required fields missing: ${missingFieldNames}`);
      form.setFields(
        missingFields.map((field) => ({
          name: field.name,
          errors: [`${field.label} is required`],
        }))
      );
      setActiveTab("general");
      return;
    }
    form.submit();
  };

  const handleSaveBeforeActivity = async () => {
    if (isSaving || isLoading || !recordId) {
      return false;
    }
    try {
      const validatedValues = await form.validateFields();
      const saved = await handleSubmit(validatedValues);
      return saved === true;
    } catch (error) {
      const firstError = error?.errorFields?.[0]?.errors?.[0];
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error("Save before activity failed");
        console.error(error);
      }
      return false;
    }
  };

  const handleSubmit = async (values) => {
    if (isSaving || !recordId) return;
    try {
      setIsSaving(true);
      const allFormValues = form.getFieldsValue(true);
      const mergedValues = { ...allFormValues, ...values };
      REQUIRED_FIELDS.forEach(({ name }) => {
        if (!mergedValues[name] && requiredValuesRef.current[name])
          mergedValues[name] = requiredValuesRef.current[name];
      });

      const processData = buildProcessData(mergedValues, systemFields);
      const gridData = buildGridPayload(preventiveRows, equipmentMap);

      const selectedDeptObj = departments.find(
        (d) => String(d.id || d.department_id || d.dept_id) === String(mergedValues.selectedDeptId)
      );
      const selectedDeptName = selectedDeptObj?.name || selectedDeptObj?.department_name || selectedDeptObj?.dept_name || "";

      const payload = {
        process_id: Number(processId),
        stage_id: Number(activeStageId),
        department_id: mergedValues.selectedDeptId ? Number(mergedValues.selectedDeptId) : null,
        department_name: selectedDeptName,
        initiator_id: Number(initiatorId),
        initiator_name: initiator,
        short_description: mergedValues?.shortDescription || "",
        initiation_date:
          mergedValues?.dateOfInitiation || dateOfInitiation || "",
        process_data: processData,
        gridData,
        headerWeekDates,
        checklistData: [],
      };

      const response = await updatePreventive(recordId, payload);

      if (response?.data?.success || response?.data?.status === true) {
        toast.success("Preventive Planner updated successfully.");
        await fetchPreventiveDetail();
        await fetchPermissions();
        await fetchActivityLogs();
        return true;
      }
      toast.error(
        response?.data?.message || "Failed to update Preventive Planner."
      );
      return false;
    } catch (error) {
      console.error("Preventive Planner update failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update Preventive Planner. Please try again."
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivitySuccess = async () => {
    try {
      const values = form.getFieldsValue(true);
      if (canPerformActivity) {
        await handleSubmit(values);
      } else {
        await fetchPreventiveDetail(false);
        await fetchPermissions();
        await fetchActivityLogs();
      }
    } catch (error) {
      console.error("Failed to save preventive planner after activity:", error);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    navigate("/user/preventive-planner-dashboard");
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton variant="title" className="w-full" />
        <Skeleton variant="form" fields={6} />
      </div>
    );
  }

  const isCancellationStageActive = Number(activeStageId) === 12;

  const visibleTabs = isCancellationStageActive
    ? TABS.filter((tab) => tab.id === "cancellation")
    : TABS.filter((tab) => tab.id !== "cancellation");

  return (
    <div className="w-full">
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
              activityApi={executePreventiveActivity}
              onBeforeActivity={handleSaveBeforeActivity}
              onActivitySuccess={handleActivitySuccess}
              auditRoute={"/user/preventive-planner-audit"}
              canPerformActivity={canPerformActivity}
              permissionsLoading={permissionsLoading}
              onExit={() => navigate("/user/preventive-planner-dashboard")}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <ProcessTabs
          tabs={visibleTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <Form
        form={form}
        preserve={true}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        onFinishFailed={({ errorFields }) => {
          if (errorFields && errorFields.length > 0) {
            const firstError = errorFields[0]?.errors?.[0];
            if (firstError) toast.error(firstError);
          }
        }}
        className="w-full [&_.ant-form-item-label>label]:!text-[12px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-explain-error]:!text-[11px]"
      >
        {/* General Information */}
        <section style={{ display: activeTab === "general" ? "block" : "none" }}>
          <SectionHeader title="GENERAL INFORMATION" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            {systemFields.map((field) => (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                className="!mb-4"
              >
                <FormDisabledInput />
              </Form.Item>
            ))}

            <Form.Item
              name="shortDescription"
              label={
                <span className="inline-flex items-center">
                  Short Description
                  <RequiredAsterisk message="Short Description are required to proceed. Please enter your Short Description." />
                </span>
              }
              rules={[{ required: true, whitespace: true, message: "Please enter Short Description" }]}
              className="!mb-4"
            >
              <FormInput
                placeholder="Enter short description"
                disabled={!isGeneralEditable}
              />
            </Form.Item>

            {/* ✅ Instrument Type field removed */}

            <Form.Item
              name="selectedDeptId"
              label={
                <span className="inline-flex items-center">
                  Select Department
                  <RequiredAsterisk message="Department is required to proceed. Please select a department." />
                </span>
              }
              rules={[{ required: true, message: "Please select a department" }]}
              className="!mb-4"
            >
              <Select
                placeholder="Select a department"
                loading={departmentsLoading}
                options={departments.map((dept, idx) => ({
                  label:
                    dept.name ||
                    dept.department_name ||
                    dept.dept_name ||
                    "Unnamed Department",
                  value: dept.id || dept.department_id || dept.dept_id || idx,
                }))}
                showSearch
                optionFilterProp="label"
                allowClear={false}
                disabled={!isGeneralEditable}
                onChange={() => {
                  userChangedDropdownRef.current = true;
                  savedRowsCountRef.current = 0;
                  setPreventiveRows([]);
                }}
              />
            </Form.Item>
          </div>
          <div className="my-9 h-px w-full bg-slate-200" />
          <SectionHeader title="PREVENTIVE PLANNER INFORMATION" />
          <div className="mt-5">
            <PreventiveGrid
              value={preventiveRows}
              onChange={setPreventiveRows}
              equipmentOptions={equipmentOptions}
              equipmentMap={equipmentMap}
              equipmentLoading={equipmentLoading}
              recordId={recordId}
              disabled={!isGeneralEditable}
              showAddButton={false}
              canCreateChild={canCreateChild}
              onViewChild={handleViewChild}
              weekDates={headerWeekDates}
              onWeekDatesChange={setHeaderWeekDates}
            />
          </div>
          <Form.Item name="comments" label="Comments" className="!mb-4 md:col-span-2">
            <FormTextArea
              rows={5}
              placeholder="Enter comments..."
              disabled={!isGeneralEditable}
            />
          </Form.Item>
          <Form.Item
            name="attachment"
            label="Attachment"
            valuePropName="value"
            className="!mb-4 md:col-span-2"
          >
            <FormAttachment
              multiple={true}
              recordId={recordId}
              attachmentField="attachment"
              label="Attachment"
              uploadApi={addMultipleAttachments}
              disabled={!isGeneralEditable}
            />
          </Form.Item>
        </section>

        {/* HOD Review */}
        <section style={{ display: activeTab === "hod" ? "block" : "none" }}>
          <SectionHeader title="HOD / DESIGNEE REVIEW" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="hodReviewComments"
              label={
                <span className="inline-flex items-center">
                  Comments
                  <RequiredAsterisk message="Comments are required to proceed. Please enter your comments." />
                </span>
              }
              className="!mb-4 md:col-span-2"
            >
              <FormTextArea rows={5} placeholder="Enter comments..." disabled={!isHodEditable} />
            </Form.Item>
            <Form.Item
              name="hodReviewAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={recordId}
                attachmentField="hod_review_attachment"
                label="HOD / Designee Review Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isHodEditable}
              />
            </Form.Item>
          </div>
        </section>

        {/* QA Review */}
        <section style={{ display: activeTab === "user-dept-review" ? "block" : "none" }}>
          <SectionHeader title="QA REVIEW" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="userDeptReviewComments"
              label={
                <span className="inline-flex items-center">
                  Comments
                  <RequiredAsterisk message="Comments are required to proceed. Please enter your comments." />
                </span>
              }
              className="!mb-4 md:col-span-2"
            >
              <FormTextArea rows={5} placeholder="Enter comments..." disabled={!isUserDeptEditable} />
            </Form.Item>
            <Form.Item
              name="userDeptReviewAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={recordId}
                attachmentField="user_dept_review_attachment"
                label="QA Review Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isUserDeptEditable}
              />
            </Form.Item>
          </div>
        </section>

        {/* QA Approval Review */}
        <section style={{ display: activeTab === "qa-review" ? "block" : "none" }}>
          <SectionHeader title="QA APPROVAL REVIEW" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="qaReviewComments"
              label={
                <span className="inline-flex items-center">
                  Comments
                  <RequiredAsterisk message="Comments are required to proceed. Please enter your comments." />
                </span>
              }
              className="!mb-4 md:col-span-2"
            >
              <FormTextArea rows={5} placeholder="Enter comments..." disabled={!isQaReviewEditable} />
            </Form.Item>
            <Form.Item
              name="qaReviewAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={recordId}
                attachmentField="qa_review_attachment"
                label="QA Review Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isQaReviewEditable}
              />
            </Form.Item>
          </div>
        </section>

        {/* Cancellation */}
        <section style={{ display: activeTab === "cancellation" ? "block" : "none" }}>
          <SectionHeader title="CANCELLATION" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item name="cancellationRemark" label="Remark" className="!mb-4 md:col-span-2">
              <FormTextArea rows={5} placeholder="Enter cancellation remark..." />
            </Form.Item>
            <Form.Item
              name="cancellationAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={recordId}
                attachmentField="cancellation_attachment"
                label="Cancellation Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isCancellationEditable}
              />
            </Form.Item>
          </div>
        </section>

        {/* Activity Log */}
        <section style={{ display: activeTab === "activity" ? "block" : "none" }}>
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
                <div key={log.id} className="rounded-lg border border-[#DCE3EA] bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                  <div className="mb-5">
                    <p className="text-[13px] font-semibold text-[#3E4A5C]">Activity Name</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#182234]">{log.activity_name || "—"}</p>
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
                        <p className="break-words text-[14px] leading-5 text-[#526071]">{log.comment || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </Form>

      <FloatingActionButtons
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving || isLoading}
        saveLabel="Update"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default PreventivePlannerPanel;