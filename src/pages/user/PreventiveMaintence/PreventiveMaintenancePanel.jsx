import React, { useCallback, useEffect, useState, useRef } from "react";
import { Form, DatePicker } from "antd";
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
import FormAttachment from "../../../components/common/Attachment/FormAttachment";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import "../../../components/common/ProcesStageTabs/Scrollerbar.css";
import "../../../components/ui/disabledFields.css";

import { getProfile } from "../../../services/authApi";
import { getAllEquipmentData } from "../../../services/usersApi/calibrationApi";
import {
  executePreventiveMaintenceActivity,
  getPreventiveMaintenceDetail,
  updatePreventiveMaintence,
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
} from "../../../services/usersApi/workflowCommonApi";

dayjs.extend(customParseFormat);

const TABS = [
  { id: "general", label: "General Information", stageId: 13 },
  { id: "engineer-review", label: "Review By Engineer Dept", stageId: 14 },
  { id: "qa-approval", label: "QA Approval", stageId: 15 },
  { id: "activity", label: "Activity Log", stageId: 16 },
  { id: "cancellation", label: "Cancellation", stageId: 17 },
];

const REQUIRED_FIELDS = [
  { name: "shortDescription", label: "Short Description" },
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

const buildProcessData = (values, systemFields) => [
  ...systemFields.map((field) => ({
    key: field.name,
    label: field.label,
    value: values?.[field.name] || "",
  })),
  {
    key: "short_description",
    label: "Short Description",
    value: values?.shortDescription || "",
  },
  {
    key: "equipmentInstrumentName",
    label: "Equipment Name",
    value: values?.equipmentInstrumentName || "",
  },
  {
    key: "equipmentInstrumentId",
    label: "Equipment Code",
    value: values?.equipmentInstrumentId || "",
  },
  { key: "block", label: "Block", value: values?.block || "" },
  { key: "department", label: "Department", value: values?.department || "" },
  { key: "location", label: "Location", value: values?.location || "" },
  {
    key: "previousPreventiveDate",
    label: "Previous Preventive Date",
    value: values?.previousPreventiveDate
      ? dayjs(values.previousPreventiveDate).format("DD/MM/YYYY")
      : "",
  },
  {
    key: "nextPreventiveDate",
    label: "Next Preventive Date",
    value: values?.nextPreventiveDate
      ? dayjs(values.nextPreventiveDate).format("DD/MM/YYYY")
      : "",
  },
  { key: "remark", label: "Remark", value: values?.remark || "" },
  {
    key: "attachment",
    label: "Attachment",
    value: values?.attachment || [],
  },
  {
    key: "engineer_review_comments",
    label: "Review By Engineer Dept Comments",
    value: values?.engineerReviewComments || "",
  },
  {
    key: "engineer_review_attachment",
    label: "Review By Engineer Dept Attachment",
    value: values?.engineerReviewAttachment || [],
  },
  {
    key: "qa_approval_comments",
    label: "QA Approval Comments",
    value: values?.qaApprovalComments || "",
  },
  {
    key: "qa_approval_attachment",
    label: "QA Approval Attachment",
    value: values?.qaApprovalAttachment || [],
  },
  {
    key: "cancellation_remark",
    label: "Cancellation Remark",
    value: values?.cancellationRemark || "",
  },
  {
    key: "cancellation_attachment",
    label: "Cancellation Attachment",
    value: values?.cancellationAttachment || [],
  },
];

const validatePreventiveMaintenceForm = (form, storedRequired) => {
  const values = form.getFieldsValue();
  return REQUIRED_FIELDS.filter((field) => {
    let value = values?.[field.name];
    if (value === undefined || value === null || value === "")
      value = storedRequired[field.name];
    if (typeof value === "string") return !value.trim();
    return value === undefined || value === null || value === "";
  });
};

const PreventiveMaintenancePanel = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const requiredValuesRef = useRef({ shortDescription: "" });

  useEffect(() => {
    equipmentMapRef.current = equipmentMap;
  }, [equipmentMap]);

  const isStageEditable = (stageId) =>
    Number(activeStageId) === Number(stageId) &&
    canPerformActivity === true &&
    permissionsLoading === false;

  const isGeneralEditable = isStageEditable(13);
  const isEngineerReviewEditable = isStageEditable(14);
  const isQaApprovalEditable = isStageEditable(15);
  const isCancellationEditable = isStageEditable(17);

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
    const fetchEquipment = async () => {
      try {
        setEquipmentLoading(true);
        const response = await getAllEquipmentData();
        const data = response?.data?.data || [];
        const options = data.map((item) => ({ value: item.id, label: item.name }));
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

  const fetchPreventiveMaintenceDetail = useCallback(
    async (isInitial = false) => {
      if (!recordId) {
        toast.error("Preventive Maintenance record ID is missing.");
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        if (isInitial) setIsLoading(true);
        const response = await getPreventiveMaintenceDetail(recordId);
        const responseData = response?.data?.data;
        if (!responseData) {
          toast.error("Preventive Maintenance record not found.");
          return;
        }
        setProcessId(responseData?.process_id || null);
        const backendStageId =
          responseData?.stage?.id || responseData?.stage_id || null;
        setActiveStageId(backendStageId);
        setProcessName(responseData?.process?.name || "");

        const processData = responseData?.process_data || [];
        const recordNumber = getProcessValue(processData, "recordNumber");
        const locationCode = getProcessValue(processData, "siteLocationCode");
        const processInitiator = getProcessValue(processData, "initiator");
        const processDateOfInitiation = getProcessValue(
          processData,
          "dateOfInitiation"
        );
        const processDepartment = getProcessValue(
          processData,
          "initiationDepartment"
        );
        const shortDescription = getProcessValue(
          processData,
          "short_description"
        );
        const equipmentName = getProcessValue(
          processData,
          "equipmentInstrumentName"
        );
        const equipmentCode = getProcessValue(
          processData,
          "equipmentInstrumentId"
        );
        const block = getProcessValue(processData, "block");
        const department = getProcessValue(processData, "department");
        const locationVal = getProcessValue(processData, "location");
        const prevDate = getProcessValue(processData, "previousPreventiveDate");
        const nextDate = getProcessValue(processData, "nextPreventiveDate");
        const remark = getProcessValue(processData, "remark");
        const attachment = getProcessValue(processData, "attachment");
        const engineerReviewComments = getProcessValue(
          processData,
          "engineer_review_comments"
        );
        const engineerReviewAttachment = getProcessValue(
          processData,
          "engineer_review_attachment"
        );
        const qaApprovalComments = getProcessValue(
          processData,
          "qa_approval_comments"
        );
        const qaApprovalAttachment = getProcessValue(
          processData,
          "qa_approval_attachment"
        );
        const cancellationRemark = getProcessValue(
          processData,
          "cancellation_remark"
        );
        const cancellationAttachment = getProcessValue(
          processData,
          "cancellation_attachment"
        );

        setSiteLocationCode(locationCode || "");

        const backendInitiatorId =
          responseData?.initiator?.id ?? responseData?.initiator_id ?? "";
        const backendInitiatorName =
          responseData?.initiator?.name ?? processInitiator ?? "";

        setInitiatorId(backendInitiatorId);
        setInitiator(backendInitiatorName);
        setDepartmentId(
          responseData?.department?.id || responseData?.department_id || ""
        );
        setInitiationDepartment(
          responseData?.department?.name || processDepartment || ""
        );
        setDateOfInitiation(
          processDateOfInitiation || responseData?.initiation_date || ""
        );

        requiredValuesRef.current = {
          shortDescription: shortDescription || "",
        };

        // Resolve equipment name → id for the disabled Select
        const currentEquipmentMap = equipmentMapRef.current;
        let equipmentValue = equipmentName || undefined;
        if (equipmentName && currentEquipmentMap[equipmentName]) {
          equipmentValue = equipmentName;
        } else if (equipmentName) {
          const found = Object.values(currentEquipmentMap).find(
            (eq) => eq.name === equipmentName
          );
          if (found) equipmentValue = found.id;
        }

        form.setFieldsValue({
          recordNumber,
          siteLocationCode: locationCode || "",
          initiator: backendInitiatorName,
          dateOfInitiation:
            processDateOfInitiation || responseData?.initiation_date || "",
          initiationDepartment:
            responseData?.department?.name || processDepartment || "",
          shortDescription,
          equipmentInstrumentName: equipmentValue,
          equipmentInstrumentId: equipmentCode || "",
          block: block || "",
          department: department || "",
          location: locationVal || "",
          previousPreventiveDate: prevDate ? dayjs(prevDate, "DD/MM/YYYY") : null,
          nextPreventiveDate: nextDate ? dayjs(nextDate, "DD/MM/YYYY") : null,
          remark: remark || "",
          attachment: attachment || [],
          engineerReviewComments: engineerReviewComments || "",
          engineerReviewAttachment: engineerReviewAttachment || [],
          qaApprovalComments: qaApprovalComments || "",
          qaApprovalAttachment: qaApprovalAttachment || [],
          cancellationRemark: cancellationRemark || "",
          cancellationAttachment: cancellationAttachment || [],
        });
      } catch (error) {
        console.error("Failed to fetch preventive maintenance detail:", error);
        toast.error(
          error?.response?.data?.message ||
            "Failed to load Preventive Maintenance record."
        );
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [recordId, form]
  );

  useEffect(() => {
    fetchPreventiveMaintenceDetail(true);
  }, [fetchPreventiveMaintenceDetail]);

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
      const response = await getAllActivityLogs(recordId);
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
  }, [recordId]);

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
    {
      name: "recordNumber",
      label: "Record Number",
      value: form.getFieldValue("recordNumber") || "",
    },
    {
      name: "siteLocationCode",
      label: "Site / Location Code",
      value: form.getFieldValue("siteLocationCode") || "",
    },
    { name: "initiator", label: "Initiator", value: initiator },
    {
      name: "dateOfInitiation",
      label: "Date of Initiation",
      value: dateOfInitiation,
    },
    {
      name: "initiationDepartment",
      label: "Initiation Department",
      value: initiationDepartment,
    },
  ];

  const handleSave = async () => {
    if (isSaving || isLoading) return;
    const missingFields = validatePreventiveMaintenceForm(
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

      const payload = {
        process_id: Number(processId),
        stage_id: Number(activeStageId),
        department_id: Number(departmentId),
        initiator_id: Number(initiatorId),
        initiator_name: initiator,
        short_description: mergedValues?.shortDescription || "",
        initiation_date:
          mergedValues?.dateOfInitiation || dateOfInitiation || "",
        process_data: processData,
        gridData: [],
        checklistData: [],
      };

      const response = await updatePreventiveMaintence(recordId, payload);

      if (response?.data?.success || response?.data?.status === true) {
        toast.success("Preventive Maintenance updated successfully.");
        await fetchPreventiveMaintenceDetail();
        await fetchPermissions();
        await fetchActivityLogs();
        return;
      }
      toast.error(
        response?.data?.message || "Failed to update Preventive Maintenance."
      );
    } catch (error) {
      console.error("Preventive Maintenance update failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update Preventive Maintenance. Please try again."
      );
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
        await fetchPreventiveMaintenceDetail(false);
        await fetchPermissions();
        await fetchActivityLogs();
      }
    } catch (error) {
      console.error(
        "Failed to save preventive maintenance after activity:",
        error
      );
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton variant="title" className="w-full" />
        <Skeleton variant="form" fields={6} />
      </div>
    );
  }

  const isCancellationStageActive = Number(activeStageId) === 17;

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
              activityApi={executePreventiveMaintenceActivity}
              onActivitySuccess={handleActivitySuccess}
              canPerformActivity={canPerformActivity}
              permissionsLoading={permissionsLoading}
              onExit={() => navigate(-1)}
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
                <span>
                  Short Description <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Please enter Short Description",
                },
              ]}
              className="!mb-4"
            >
              <FormInput
                placeholder="Enter short description"
                disabled={!isGeneralEditable}
              />
            </Form.Item>
          </div>

          <div className="my-9 h-px w-full bg-slate-200" />
          <SectionHeader title="EQUIPMENT DETAILS" />

          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="equipmentInstrumentName"
              label="Equipment Name"
              className="!mb-4"
            >
              <FormSelect
                placeholder={equipmentLoading ? "Loading..." : "Equipment name"}
                options={equipmentOptions}
                disabled
              />
            </Form.Item>

            <Form.Item
              name="equipmentInstrumentId"
              label="Equipment Code"
              className="!mb-4"
            >
              <FormInput placeholder="Equipment code" disabled />
            </Form.Item>

            <Form.Item name="block" label="Block" className="!mb-4">
              <FormInput placeholder="Block" disabled={!isGeneralEditable} />
            </Form.Item>

            <Form.Item name="department" label="Department" className="!mb-4">
              <FormInput
                placeholder="Department"
                disabled={!isGeneralEditable}
              />
            </Form.Item>

            <Form.Item name="location" label="Location" className="!mb-4">
              <FormInput placeholder="Location" disabled={!isGeneralEditable} />
            </Form.Item>

            <Form.Item
              name="previousPreventiveDate"
              label="Previous Preventive Date"
              className="!mb-4"
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Select date"
                disabled={!isGeneralEditable}
              />
            </Form.Item>

            <Form.Item
              name="nextPreventiveDate"
              label="Next Preventive Date"
              className="!mb-4"
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Select date"
                disabled={!isGeneralEditable}
              />
            </Form.Item>
          </div>

          <Form.Item name="remark" label="Remark" className="!mb-4 md:col-span-2">
            <FormTextArea
              rows={4}
              placeholder="Enter remark..."
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

        {/* Review By Engineer Dept */}
        <section
          style={{ display: activeTab === "engineer-review" ? "block" : "none" }}
        >
          <SectionHeader title="REVIEW BY ENGINEER DEPT" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="engineerReviewComments"
              label="Comments"
              className="!mb-4 md:col-span-2"
            >
              <FormTextArea
                rows={5}
                placeholder="Enter comments..."
                disabled={!isEngineerReviewEditable}
              />
            </Form.Item>

            <Form.Item
              name="engineerReviewAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={recordId}
                attachmentField="engineer_review_attachment"
                label="Review By Engineer Dept Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isEngineerReviewEditable}
              />
            </Form.Item>
          </div>
        </section>

        {/* QA Approval */}
        <section
          style={{ display: activeTab === "qa-approval" ? "block" : "none" }}
        >
          <SectionHeader title="QA APPROVAL" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="qaApprovalComments"
              label="Comments"
              className="!mb-4 md:col-span-2"
            >
              <FormTextArea
                rows={5}
                placeholder="Enter comments..."
                disabled={!isQaApprovalEditable}
              />
            </Form.Item>

            <Form.Item
              name="qaApprovalAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={recordId}
                attachmentField="qa_approval_attachment"
                label="QA Approval Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isQaApprovalEditable}
              />
            </Form.Item>
          </div>
        </section>

        {/* Cancellation */}
        <section
          style={{ display: activeTab === "cancellation" ? "block" : "none" }}
        >
          <SectionHeader title="CANCELLATION" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="cancellationRemark"
              label="Remark"
              className="!mb-4 md:col-span-2"
            >
              <FormTextArea
                rows={5}
                placeholder="Enter cancellation remark..."
              />
            </Form.Item>
            <Form.Item
              name="cancellationAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={false}
                recordId={recordId}
                attachmentField="cancellation_attachment"
                label="Cancellation Attachment"
                uploadApi={addSingleAttachment}
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
                <div
                  key={log.id}
                  className="rounded-lg border border-[#DCE3EA] bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-5">
                    <p className="text-[13px] font-semibold text-[#3E4A5C]">
                      Activity Name
                    </p>
                    <p className="mt-1 text-[14px] font-semibold text-[#182234]">
                      {log.activity_name || "—"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">
                        Performed By
                      </p>
                      <div className="flex min-h-11 items-center rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3">
                        <span className="text-[14px] text-[#526071]">
                          {log.performed_by || "—"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">
                        Date Performed
                      </p>
                      <div className="flex min-h-11 items-center rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3">
                        <span className="text-[14px] text-[#526071]">
                          {log.performed_at || "—"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">
                        Comments
                      </p>
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

export default PreventiveMaintenancePanel;