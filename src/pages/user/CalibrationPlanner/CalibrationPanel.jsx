import React, { useCallback, useEffect, useState } from "react";
import { Form } from "antd";
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
import EmptyTab from "../../../components/common/Form/EmptyTab";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import UserDynamicGrid from "../../../components/common/DataTable/UserDynamicGrid";

import calibrationColumns from "./calibrationColumn";

import { getProfile } from "../../../services/authApi";
import { executeCalibrationActivity, getCalibrationDetail, getCalibrationUser, updateCalibration, getAllActivites, getAllActivityLogs, getAllStages, getAllPermissions } from "../../../services/usersApi/calibrationApi";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const TABS = [
  { id: "general", label: "General Information" },
  { id: "hod", label: "HOD / Designee Review" },
  { id: "qa-review", label: "QA Review" },
  { id: "qa-approval", label: "QA Approval" },
  { id: "activity", label: "Activity Log" },
];

const REQUIRED_FIELDS = [
  { name: "shortDescription", label: "Short Description" },
  { name: "hod", label: "HOD / Designee" },
  { name: "qaReviewer", label: "QA Reviewer" },
  { name: "qaApproval", label: "QA Approval" },
];

const getProcessValue = (processData = [], key) => {
  const field = processData.find((item) => item?.key === key);
  return field?.value ?? "";
};

const normalizeGridRows = (rows = []) =>
  rows.map((row, index) => {
    const { _rowId, row_id, ...cleanRow } = row || {};

    return {
      ...cleanRow,
      previousCalibrationDate: cleanRow?.previousCalibrationDate
        ? dayjs(cleanRow.previousCalibrationDate, "DD/MM/YYYY")
        : null,
      nextCalibrationDate: cleanRow?.nextCalibrationDate
        ? dayjs(cleanRow.nextCalibrationDate, "DD/MM/YYYY")
        : null,
      row_id: index + 1,
    };
  });

const getUserPair = (userId, users = []) => {
  const user = users.find((item) => String(item?.id) === String(userId));
  return { id: user?.id || userId || "", name: user?.name || "" };
};

const buildProcessData = (values, systemFields, hodUsers, qaReviewers, qaApprovers) => [
  ...systemFields.map((field) => ({ key: field.name, label: field.label, value: values?.[field.name] || "" })),
  { key: "short_description", label: "Short Description", value: values?.shortDescription || "" },
  { key: "hod", label: "HOD / Designee", value: getUserPair(values?.hod, hodUsers) },
  { key: "qa_reviewer", label: "QA Reviewer", value: getUserPair(values?.qaReviewer, qaReviewers) },
  { key: "qa_approval", label: "QA Approval", value: getUserPair(values?.qaApproval, qaApprovers) },
  { key: "comment", label: "Comments", value: values?.comments || "" },
  { key: "attachment", label: "Attachment", value: values?.attachment || [] },
  { key: "hod_review_comments", label: "HOD / Designee Review Comments", value: values?.hodReviewComments || "" },
  { key: "hod_review_attachment", label: "HOD / Designee Review Attachment", value: values?.hodReviewAttachment || [] },
  { key: "qa_review_comments", label: "QA Review Comments", value: values?.qaReviewComments || "" },
  { key: "qa_review_attachment", label: "QA Review Attachment", value: values?.qaReviewAttachment || [] },
  { key: "qa_approval_comments", label: "QA Approval Comments", value: values?.qaApprovalComments || "" },
  { key: "qa_approval_attachment", label: "QA Approval Attachment", value: values?.qaApprovalAttachment || [] },
];

const validateCalibrationForm = (form) => {
  const values = form.getFieldsValue();
  return REQUIRED_FIELDS.filter((field) => {
    const value = values?.[field.name];
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
  const [qaApprovers, setQaApprovers] = useState([]);

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { recordId } = useParams();

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

  const fetchCalibrationDetail = useCallback(async () => {
    if (!recordId) {
      toast.error("Calibration record ID is missing.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await getCalibrationDetail(recordId);
      const responseData = response?.data?.data;
      if (!responseData) {
        toast.error("Calibration record not found.");
        return;
      }
      setProcessId(responseData?.process_id || null);
      setActiveStageId(responseData?.stage?.id || responseData?.stage_id || null);
      setProcessName(responseData?.process?.name || "");

      const processData = responseData?.process_data || [];
      const recordNumber = getProcessValue(processData, "recordNumber");
      const locationCode = getProcessValue(processData, "siteLocationCode");
      const processInitiator = getProcessValue(processData, "initiator");
      const processDateOfInitiation = getProcessValue(processData, "dateOfInitiation");
      const dueDate = getProcessValue(processData, "dueDate");
      const processDepartment = getProcessValue(processData, "initiationDepartment");
      const shortDescription = getProcessValue(processData, "short_description");
      const hod = getProcessValue(processData, "hod");
      const qaReviewer = getProcessValue(processData, "qa_reviewer");
      const qaApproval = getProcessValue(processData, "qa_approval");
      const comments = getProcessValue(processData, "comment");
      const attachment = getProcessValue(processData, "attachment");
      const hodReviewComments = getProcessValue(processData, "hod_review_comments");
      const hodReviewAttachment = getProcessValue(processData, "hod_review_attachment");
      const qaReviewComments = getProcessValue(processData, "qa_review_comments");
      const qaReviewAttachment = getProcessValue(processData, "qa_review_attachment");
      const qaApprovalComments = getProcessValue(processData, "qa_approval_comments");
      const qaApprovalAttachment = getProcessValue(processData, "qa_approval_attachment");

      setSiteLocationCode(locationCode || "");
      setInitiator(responseData?.initiator?.name || processInitiator || "");
      setInitiatorId(responseData?.initiator?.id || responseData?.initiator_id || "");
      setDepartmentId(responseData?.department?.id || responseData?.department_id || "");
      setInitiationDepartment(responseData?.department?.name || processDepartment || "");
      setDateOfInitiation(processDateOfInitiation || responseData?.initiation_date || "");

      form.setFieldsValue({
        recordNumber,
        siteLocationCode: locationCode || "",
        initiator: responseData?.initiator?.name || processInitiator || "",
        dateOfInitiation: processDateOfInitiation || responseData?.initiation_date || "",
        dueDate,
        initiationDepartment: responseData?.department?.name || processDepartment || "",
        shortDescription,
        hod: hod && typeof hod === "object" ? hod?.id : hod || "",
        qaReviewer: qaReviewer && typeof qaReviewer === "object" ? qaReviewer?.id : qaReviewer || "",
        qaApproval: qaApproval && typeof qaApproval === "object" ? qaApproval?.id : qaApproval || "",
        comments,
        attachment: attachment || [],
        hodReviewComments,
        hodReviewAttachment: hodReviewAttachment || [],
        qaReviewComments,
        qaReviewAttachment: qaReviewAttachment || [],
        qaApprovalComments,
        qaApprovalAttachment: qaApprovalAttachment || [],
      });

      const gridRows = (responseData?.grid_records || []).flatMap(
        (record) => record?.grid_data || []
      );

      setCalibrationRows(normalizeGridRows(gridRows));
    } catch (error) {
      console.error("Failed to fetch calibration detail:", error);
      toast.error(error?.response?.data?.message || "Failed to load Calibration record.");
    } finally {
      setIsLoading(false);
    }
  }, [recordId, form]);

  useEffect(() => {
    fetchCalibrationDetail();
  }, [fetchCalibrationDetail]);

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

  useEffect(() => {
  if (!recordId) {
    setCanPerformActivity(false);
    setPermissionsLoading(false);
    return;
  }

  const fetchPermissions = async () => {
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
  };

  fetchPermissions();
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
    toast.error(
      error?.response?.data?.message ||
        "Failed to load activity history."
    );
    setActivityLogs([]);
  } finally {
    setActivityLogsLoading(false);
  }
}, [recordId]);

useEffect(() => {
  fetchActivityLogs();
}, [fetchActivityLogs]);

  // const handleActivitySuccess = async () => {
  //   await fetchCalibrationDetail();
  //   await fetchActivityLogs();
  // };

  const handleActivitySuccess = async () => {
  try {
    const values = form.getFieldsValue(true);
    await handleSubmit(values);
    await fetchCalibrationDetail();
    await fetchActivityLogs();
  } catch (error) {
    console.error("Failed to save calibration after activity:", error);
  }
};

  const systemFields = [
    { name: "recordNumber", label: "Record Number", value: form.getFieldValue("recordNumber") || "" },
    { name: "siteLocationCode", label: "Site / Location Code", value: form.getFieldValue("siteLocationCode") || "" },
    { name: "initiator", label: "Initiator", value: initiator },
    { name: "dateOfInitiation", label: "Date of Initiation", value: dateOfInitiation },
    // { name: "dueDate", label: "Due Date", value: form.getFieldValue("dueDate") || "" },
    { name: "initiationDepartment", label: "Initiation Department", value: initiationDepartment },
  ];

  const handleSave = async () => {
    if (isSaving || isLoading || usersLoading) return;
    const missingFields = validateCalibrationForm(form);
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
      const processData = buildProcessData(values, systemFields, hodUsers, qaReviewers, qaApprovers);
      const gridData = calibrationRows.map((row, index) => ({
        ...row,
        previousCalibrationDate: row.previousCalibrationDate
          ? dayjs(row.previousCalibrationDate).format("DD/MM/YYYY")
          : "",
        nextCalibrationDate: row.nextCalibrationDate
          ? dayjs(row.nextCalibrationDate).format("DD/MM/YYYY")
          : "",
        row_id: index + 1,
      }));
      const payload = {
        process_id: Number(processId),
        stage_id: Number(activeStageId),
        department_id: Number(departmentId),
        initiator_id: Number(initiatorId),
        short_description: values?.shortDescription || "",
        initiation_date: values?.dateOfInitiation || dateOfInitiation || "",
        process_data: processData,
        gridData,
        checklistData: [],
      };
      const response = await updateCalibration(recordId, payload);
      if (response?.data?.success || response?.data?.status === true) {
        toast.success("Calibration updated successfully.");
        return;
      }
      toast.error(response?.data?.message || "Failed to update Calibration.");
    } catch (error) {
      console.error("Calibration update failed:", error);
      toast.error(error?.response?.data?.message || "Failed to update Calibration. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
                <FormInput placeholder="Enter short description" />
              </Form.Item>
            </div>
            <div className="mt-5">
              <UserDynamicGrid name="Calibration Planner" columns={calibrationColumns} value={calibrationRows} onChange={setCalibrationRows} />
            </div>
            <div className="my-9 h-px w-full bg-slate-200" />
            <SectionHeader title="CALIBRATION INFORMATION" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item
                name="hod"
                label={<span>HOD / Designee <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: "Please select HOD / Designee" }]}
                className="!mb-4"
              >
                <FormSelect placeholder={usersLoading ? "Loading HOD / Designee..." : "Select HOD / Designee"} options={hodOptions} disabled={usersLoading} />
              </Form.Item>
              <Form.Item
                name="qaReviewer"
                label={<span>QA Reviewer <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: "Please select QA Reviewer" }]}
                className="!mb-4"
              >
                <FormSelect placeholder={usersLoading ? "Loading QA Reviewer..." : "Select QA Reviewer"} options={qaReviewerOptions} disabled={usersLoading} />
              </Form.Item>
              <Form.Item
                name="qaApproval"
                label={<span>QA Approval <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: "Please select QA Approver" }]}
                className="!mb-4"
              >
                <FormSelect placeholder={usersLoading ? "Loading QA Approver..." : "Select QA Approver"} options={qaApproverOptions} disabled={usersLoading} />
              </Form.Item>
              <Form.Item name="comments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter comments..." />
              </Form.Item>
              <Form.Item
                name="attachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "hod" && (
          <section>
            <SectionHeader title="HOD / DESIGNEE REVIEW" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="hodReviewComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter comments..." />
              </Form.Item>
              <Form.Item
                name="hodReviewAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "qa-review" && (
          <section>
            <SectionHeader title="QA REVIEW" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="qaReviewComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter comments..." />
              </Form.Item>
              <Form.Item
                name="qaReviewAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "qa-approval" && (
          <section>
            <SectionHeader title="QA APPROVAL" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="qaApprovalComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter comments..." />
              </Form.Item>
              <Form.Item
                name="qaApprovalAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment />
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
            {/* Activity Name */}
            <div className="mb-5">
              <p className="text-[13px] font-semibold text-[#3E4A5C]">
                Activity Name
              </p>

              <p className="mt-1 text-[14px] font-semibold text-[#182234]">
                {log.activity_name || "—"}
              </p>
            </div>

            {/* Activity Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Performed By */}
              <div>
                <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">
                  Performed By
                </p>

                <div className="flex min-h-11 items-center rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3">
                  <span className="text-[14px] text-[#526071]">
                    {log.performed_by
                      ? `${log.performed_by}`
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Date Performed */}
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

              {/* Comments */}
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