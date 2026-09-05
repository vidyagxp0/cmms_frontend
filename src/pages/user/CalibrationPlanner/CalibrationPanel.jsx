import React, { useCallback, useEffect, useState, useRef } from "react";
import { Form, Input } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

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
import CalibrationGrid from "./CalibrationGrid";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import "../../../components/common/ProcesStageTabs/Scrollerbar.css";

import { getProfile } from "../../../services/authApi";
import { executeCalibrationActivity, getCalibrationDetail, getCalibrationUser, updateCalibration, getAllActivites, getAllActivityLogs, getAllStages, getAllPermissions, getAllEquipmentData } from "../../../services/usersApi/calibrationApi";

dayjs.extend(customParseFormat);

const TABS = [
  { id: "general", label: "General Information", stageId: 1 },
  { id: "hod", label: "HOD / Designee Review (Engineering Dept)", stageId: 2 },
  { id: "user-dept-review", label: "User Department Review (User Dept)", stageId: 3 },
  { id: "qa-review", label: "QA Approval Review", stageId: 4 },
  { id: "activity", label: "Activity Log", stageId: 5 },
];

const REQUIRED_FIELDS = [{ name: "shortDescription", label: "Short Description" }];

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
      if (key === "monthlyCalibration" || key === "calibrationFrequencyStartDate") {
        rowData[key] = row[key];
        return;
      }
      let value = row[key] !== undefined && row[key] !== null ? row[key] : "";
      if (key === "previousCalibrationDate" && value) value = dayjs(value).format("DD/MM/YYYY");
      else if (key === "nextCalibrationDate" && value) value = dayjs(value).format("DD/MM/YYYY");
      else if (key === "calibrationDate" && value) value = dayjs(value).format("DD/MM/YYYY");
      if (key === "equipmentInstrumentName" && value && equipmentMap[value]) value = equipmentMap[value]?.name || value;
      rowData[key] = { key, label: key, value };
    });
    return rowData;
  });
};

const buildProcessData = (values, systemFields) => [
  ...systemFields.map((field) => ({ key: field.name, label: field.label, value: values?.[field.name] || "" })),
  { key: "short_description", label: "Short Description", value: values?.shortDescription || "" },
  { key: "year", label: "Year", value: values?.year || "" },
  { key: "block", label: "Block", value: values?.block || "" },
  { key: "area", label: "Area", value: values?.area || "" },
  { key: "comment", label: "Comments", value: values?.comments || "" },
  { key: "attachment", label: "Attachment", value: values?.attachment || [] },
  { key: "hod_review_comments", label: "HOD / Designee Review Comments", value: values?.hodReviewComments || "" },
  { key: "hod_review_attachment", label: "HOD / Designee Review Attachment", value: values?.hodReviewAttachment || [] },
  { key: "user_dept_review_comments", label: "User Dept Review Comments", value: values?.userDeptReviewComments || "" },
  { key: "user_dept_review_attachment", label: "User Dept Review Attachment", value: values?.userDeptReviewAttachment || [] },
  { key: "qa_review_comments", label: "QA Review Comments", value: values?.qaReviewComments || "" },
  { key: "qa_review_attachment", label: "QA Review Attachment", value: values?.qaReviewAttachment || [] },
];

const validateCalibrationForm = (form, storedRequired) => {
  const values = form.getFieldsValue();
  return REQUIRED_FIELDS.filter((field) => {
    let value = values?.[field.name];
    if (value === undefined || value === null || value === "") value = storedRequired[field.name];
    if (typeof value === "string") return !value.trim();
    return value === undefined || value === null || value === "";
  });
};

const CreateCalibrationPanel = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [workflowLoading, setWorkflowLoading] = useState(true);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [processId, setProcessId] = useState(null);
  const [activeStageId, setActiveStageId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [canPerformActivity, setCanPerformActivity] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [calibrationRows, setCalibrationRows] = useState([]);
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
  const [hodUsers, setHodUsers] = useState([]);
  const [qaReviewers, setQaReviewers] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isFetchingRef = useRef(false);
  const requiredValuesRef = useRef({ shortDescription: "" });

  useEffect(() => { equipmentMapRef.current = equipmentMap; }, [equipmentMap]);

  const isStageEditable = (stageId) => Number(activeStageId) === Number(stageId) && canPerformActivity === true && permissionsLoading === false;
  const isGeneralEditable = isStageEditable(1);
  const isHodEditable = isStageEditable(2);
  const isUserDeptEditable = isStageEditable(3);
  const isQaReviewEditable = isStageEditable(4);

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
      } catch (error) { console.error("Failed to fetch profile:", error); }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setEquipmentLoading(true);
        const response = await getAllEquipmentData();
        const data = response?.data?.data || [];
        const options = data.map((item) => ({ value: item.id, label: item.name }));
        const map = {};
        data.forEach((item) => { map[item.id] = item; });
        setEquipmentOptions(options);
        setEquipmentMap(map);
      } catch (error) {
        console.error("Failed to fetch equipment:", error);
        toast.error("Could not load equipment list.");
      } finally { setEquipmentLoading(false); }
    };
    fetchEquipment();
  }, []);

  useEffect(() => {
    const fetchCalibrationUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await getCalibrationUser();
        const data = response?.data?.data || {};
        setHodUsers(data?.hod || []);
        setQaReviewers(data?.qa_reviewer || []);
      } catch (error) {
        console.error("Failed to fetch calibration users:", error);
        toast.error(error?.response?.data?.message || "Failed to load workflow users.");
        setHodUsers([]);
        setQaReviewers([]);
      } finally { setUsersLoading(false); }
    };
    fetchCalibrationUsers();
  }, []);

  const fetchCalibrationDetail = useCallback(async () => {
    if (!recordId) { toast.error("Calibration record ID is missing."); return; }
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setIsLoading(true);
      const response = await getCalibrationDetail(recordId);
      const responseData = response?.data?.data;
      if (!responseData) { toast.error("Calibration record not found."); return; }
      setProcessId(responseData?.process_id || null);
      const backendStageId = responseData?.stage?.id || responseData?.stage_id || null;
      setActiveStageId(backendStageId);
      setProcessName(responseData?.process?.name || "");
      const processData = responseData?.process_data || [];
      const recordNumber = getProcessValue(processData, "recordNumber");
      const locationCode = getProcessValue(processData, "siteLocationCode");
      const processInitiator = getProcessValue(processData, "initiator");
      const processDateOfInitiation = getProcessValue(processData, "dateOfInitiation");
      const dueDate = getProcessValue(processData, "dueDate");
      const processDepartment = getProcessValue(processData, "initiationDepartment");
      const shortDescription = getProcessValue(processData, "short_description");
      const comments = getProcessValue(processData, "comment");
      const attachment = getProcessValue(processData, "attachment");
      const year = getProcessValue(processData, "year");
      const block = getProcessValue(processData, "block");
      const area = getProcessValue(processData, "area");
      const hodReviewComments = getProcessValue(processData, "hod_review_comments");
      const hodReviewAttachment = getProcessValue(processData, "hod_review_attachment");
      const userDeptReviewComments = getProcessValue(processData, "user_dept_review_comments");
      const userDeptReviewAttachment = getProcessValue(processData, "user_dept_review_attachment");
      const qaReviewComments = getProcessValue(processData, "qa_review_comments");
      const qaReviewAttachment = getProcessValue(processData, "qa_review_attachment");

      setSiteLocationCode(locationCode || "");
      setInitiator(responseData?.initiator?.name || processInitiator || "");
      setInitiatorId(responseData?.initiator?.id || responseData?.initiator_id || "");
      setDepartmentId(responseData?.department?.id || responseData?.department_id || "");
      setInitiationDepartment(responseData?.department?.name || processDepartment || "");
      setDateOfInitiation(processDateOfInitiation || responseData?.initiation_date || "");

      requiredValuesRef.current = { shortDescription: shortDescription || "" };

      form.setFieldsValue({
        recordNumber,
        siteLocationCode: locationCode || "",
        initiator: responseData?.initiator?.name || processInitiator || "",
        dateOfInitiation: processDateOfInitiation || responseData?.initiation_date || "",
        dueDate,
        initiationDepartment: responseData?.department?.name || processDepartment || "",
        shortDescription,
        year,
        block,
        area,
        comments,
        attachment: attachment || [],
        hodReviewComments,
        hodReviewAttachment: hodReviewAttachment || [],
        userDeptReviewComments,
        userDeptReviewAttachment: userDeptReviewAttachment || [],
        qaReviewComments,
        qaReviewAttachment: qaReviewAttachment || [],
      });

      const currentEquipmentMap = equipmentMapRef.current;
      const gridRows = (responseData?.grid_records || []).flatMap((record) => record?.grid_data || []);
      const rawRows = gridRows.map((item) => {
        const row = {};
        Object.keys(item).forEach((key) => {
          if (key === "row_id") row.row_id = item.row_id;
          else if (key === "monthlyCalibration") row.monthlyCalibration = item[key] || {};
          else if (key === "calibrationFrequencyStartDate") row.calibrationFrequencyStartDate = item[key] || "";
          else if (item[key] && typeof item[key] === "object" && Object.prototype.hasOwnProperty.call(item[key], "value")) row[key] = item[key].value;
          else row[key] = item[key];
        });
        return row;
      });

      const normalizedRows = rawRows.map((row) => {
        const newRow = { ...row };
        newRow.monthlyCalibration = row.monthlyCalibration && typeof row.monthlyCalibration === "object" ? row.monthlyCalibration : {};
        newRow.calibrationFrequencyStartDate = row.calibrationFrequencyStartDate || "";
        if (newRow.equipmentInstrumentName && typeof newRow.equipmentInstrumentName === "string") {
          const found = Object.values(currentEquipmentMap).find((eq) => eq.name === newRow.equipmentInstrumentName);
          if (found) newRow.equipmentInstrumentName = found.id;
        }
        if (newRow.previousCalibrationDate) newRow.previousCalibrationDate = dayjs(newRow.previousCalibrationDate, "DD/MM/YYYY");
        if (newRow.nextCalibrationDate) newRow.nextCalibrationDate = dayjs(newRow.nextCalibrationDate, "DD/MM/YYYY");
        if (newRow.calibrationDate) newRow.calibrationDate = dayjs(newRow.calibrationDate, "DD/MM/YYYY");
        return newRow;
      });
      setCalibrationRows(normalizedRows);
    } catch (error) {
      console.error("Failed to fetch calibration detail:", error);
      toast.error(error?.response?.data?.message || "Failed to load Calibration record.");
    } finally { setIsLoading(false); isFetchingRef.current = false; }
  }, [recordId, form]);

  useEffect(() => { fetchCalibrationDetail(); }, [fetchCalibrationDetail]);

  useEffect(() => {
    if (!processId) return;
    const fetchStages = async () => {
      try {
        setWorkflowLoading(true);
        const response = await getAllStages(processId);
        const stages = response?.data?.data || [];
        const activeStages = stages.filter((stage) => stage?.is_active !== false && Number(stage?.id) !== 6);
        setWorkflowStages(activeStages);
      } catch (error) {
        console.error("Failed to fetch workflow stages:", error);
        toast.error(error?.response?.data?.message || "Failed to load workflow stages.");
        setWorkflowStages([]);
      } finally { setWorkflowLoading(false); }
    };
    fetchStages();
  }, [processId]);

  useEffect(() => {
    if (!activeStageId) { setActivities([]); setActivitiesLoading(false); return; }
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
      } finally { setActivitiesLoading(false); }
    };
    fetchActivities();
  }, [activeStageId]);

  const fetchPermissions = useCallback(async () => {
    if (!recordId) { setCanPerformActivity(false); setPermissionsLoading(false); return; }
    try {
      setPermissionsLoading(true);
      const response = await getAllPermissions(recordId);
      const canPerform = response?.data?.data?.permission?.can_perform_action === true;
      setCanPerformActivity(canPerform);
    } catch (error) {
      console.error("Failed to fetch record permissions:", error);
      setCanPerformActivity(false);
      toast.error(error?.response?.data?.message || "Failed to check activity permissions.");
    } finally { setPermissionsLoading(false); }
  }, [recordId]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const fetchActivityLogs = useCallback(async () => {
    if (!recordId) { setActivityLogs([]); return; }
    try {
      setActivityLogsLoading(true);
      const response = await getAllActivityLogs(recordId);
      setActivityLogs(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch activity history:", error);
      toast.error(error?.response?.data?.message || "Failed to load activity history.");
      setActivityLogs([]);
    } finally { setActivityLogsLoading(false); }
  }, [recordId]);

  useEffect(() => { fetchActivityLogs(); }, [fetchActivityLogs]);

  useEffect(() => {
    if (!activeStageId) return;
    const matchingTab = TABS.find((tab) => Number(tab.stageId) === Number(activeStageId));
    if (matchingTab) setActiveTab(matchingTab.id);
  }, [activeStageId]);

  const systemFields = [
    { name: "recordNumber", label: "Record Number", value: form.getFieldValue("recordNumber") || "" },
    { name: "siteLocationCode", label: "Site / Location Code", value: form.getFieldValue("siteLocationCode") || "" },
    { name: "initiator", label: "Initiator", value: initiator },
    { name: "dateOfInitiation", label: "Date of Initiation", value: dateOfInitiation },
    { name: "initiationDepartment", label: "Initiation Department", value: initiationDepartment },
  ];

  const handleViewChild = (rowIndex, rowData) => {
    const shortDesc = form.getFieldValue("shortDescription") || "";
    navigate(`/user/calibration-management-create/${5}/${recordId}`, {
      state: { rowData, shortDescription: shortDesc, processId: 5, parentId: recordId },
    });
  };

  const handleSave = async () => {
    if (isSaving || isLoading || usersLoading) return;
    const missingFields = validateCalibrationForm(form, requiredValuesRef.current);
    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map((field) => field.label).join(", ");
      toast.error(`Required fields missing: ${missingFieldNames}`);
      form.setFields(missingFields.map((field) => ({ name: field.name, errors: [`${field.label} is required`] })));
      setActiveTab("general");
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
        if (!mergedValues[name] && requiredValuesRef.current[name]) mergedValues[name] = requiredValuesRef.current[name];
      });
      const processData = buildProcessData(mergedValues, systemFields);
      const gridData = buildGridPayload(calibrationRows, equipmentMap);
      const payload = {
        process_id: Number(processId),
        stage_id: Number(activeStageId),
        department_id: Number(departmentId),
        initiator_id: Number(initiatorId),
        short_description: mergedValues?.shortDescription || "",
        initiation_date: mergedValues?.dateOfInitiation || dateOfInitiation || "",
        process_data: processData,
        gridData,
        checklistData: [],
      };
      console.log("Calibration Update Payload:", payload);
      const response = await updateCalibration(recordId, payload);
      if (response?.data?.success || response?.data?.status === true) {
        toast.success("Calibration updated successfully.");
        await fetchCalibrationDetail();
        await fetchPermissions();
        await fetchActivityLogs();
        return;
      }
      toast.error(response?.data?.message || "Failed to update Calibration.");
    } catch (error) {
      console.error("Calibration update failed:", error);
      toast.error(error?.response?.data?.message || "Failed to update Calibration. Please try again.");
    } finally { setIsSaving(false); }
  };

  const handleActivitySuccess = async () => {
    try {
      const values = form.getFieldsValue(true);
      if (canPerformActivity) await handleSubmit(values);
      await fetchCalibrationDetail();
      await fetchPermissions();
      await fetchActivityLogs();
    } catch (error) { console.error("Failed to save calibration after activity:", error); }
  };

  const handleCancel = () => {
    if (isSaving) return;
    navigate("/user/engineering-dashboard");
  };

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
      <div className="mb-2 space-y-2">
        <ProcessStage stages={workflowStages} activeStageId={activeStageId} loading={workflowLoading} />
        <div className="flex flex-col gap-2 rounded-xl border border-[#DCE8E2] bg-white p-2 shadow-[0_3px_14px_rgba(21,44,32,0.04)] lg:flex-row lg:items-center">
          <div className="flex min-w-0 shrink-0 items-center gap-4 rounded-lg bg-[#F7FAF8] px-3 py-2 lg:w-[40%]">
            <div className="h-7 w-px shrink-0 bg-[#DCE8E2]" />
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#8A9992]">Process</p>
              <p className="truncate text-[11px] font-semibold text-[#344A43]">{processName || "—"}</p>
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

      <div className="mb-6">
        <ProcessTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="w-full [&_.ant-form-item-label>label]:!text-[12px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-explain-error]:!text-[11px]"
      >
        {activeTab === "general" && (
          <section>
            <SectionHeader title="GENERAL INFORMATION" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {systemFields.map((field) => (
                <Form.Item key={field.name} name={field.name} label={field.label} className="!mb-4">
                  <FormDisabledInput />
                </Form.Item>
              ))}
              <Form.Item
                name="shortDescription"
                label={<span>Short Description <span className="text-red-500">*</span></span>}
                rules={[{ required: true, whitespace: true, message: "Please enter Short Description" }]}
                className="!mb-4"
              >
                <FormInput placeholder="Enter short description" disabled={!isGeneralEditable} />
              </Form.Item>
            </div>
            <div className="my-9 h-px w-full bg-slate-200" />
            <SectionHeader title="CALIBRATION INFORMATION" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="year" label="Year" className="!mb-4">
                <Input placeholder="Enter Year" disabled={!isGeneralEditable} />
              </Form.Item>
              <Form.Item name="block" label="Block" className="!mb-4">
                <Input placeholder="Enter Block" disabled={!isGeneralEditable} />
              </Form.Item>
              <Form.Item name="area" label="Area" className="!mb-4">
                <Input placeholder="Enter Area" disabled={!isGeneralEditable} />
              </Form.Item>
            </div>
            <div className="mt-5">
              <CalibrationGrid
                value={calibrationRows}
                onChange={setCalibrationRows}
                equipmentOptions={equipmentOptions}
                equipmentMap={equipmentMap}
                equipmentLoading={equipmentLoading}
                onViewChild={handleViewChild}
                recordId={recordId}
                disabled={!isGeneralEditable}
              />
            </div>
            <Form.Item name="comments" label="Comments" className="!mb-4 md:col-span-2">
              <FormTextArea rows={5} placeholder="Enter comments..." disabled={!isGeneralEditable} />
            </Form.Item>
            <Form.Item
              name="attachment"
              label="Attachment"
              valuePropName="fileList"
              getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment disabled={!isGeneralEditable} />
            </Form.Item>
          </section>
        )}

        {activeTab === "hod" && (
          <section>
            <SectionHeader title="HOD / DESIGNEE REVIEW (ENGINEERING DEPT)" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="hodReviewComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter comments..." disabled={!isHodEditable} />
              </Form.Item>
              <Form.Item
                name="hodReviewAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled={!isHodEditable} />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "user-dept-review" && (
          <section>
            <SectionHeader title="USER DEPT REVIEW (USER DEPT)" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="userDeptReviewComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter comments..." disabled={!isUserDeptEditable} />
              </Form.Item>
              <Form.Item
                name="userDeptReviewAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled={!isUserDeptEditable} />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "qa-review" && (
          <section>
            <SectionHeader title="QA REVIEW" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="qaReviewComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter comments..." disabled={!isQaReviewEditable} />
              </Form.Item>
              <Form.Item
                name="qaReviewAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled={!isQaReviewEditable} />
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
                <div className="rounded-lg border border-[#DCE3EA] bg-white p-5 text-center text-sm text-slate-500">No activity history found.</div>
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

export default CreateCalibrationPanel;