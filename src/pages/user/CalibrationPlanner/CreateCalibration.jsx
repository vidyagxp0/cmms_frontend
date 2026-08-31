import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Form } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
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
import { addCalibration, getCalibrationUser } from "../../../services/usersApi/calibrationApi";
import { formatDate, formatDateTime } from "../../../utils/date";

const TABS = [
  { id: "general", label: "General Information" },
  { id: "hod", label: "HOD / Designee Review" },
  { id: "qa-review", label: "QA Review" },
  { id: "qa-approval", label: "QA Approval" },
  // { id: "activity", label: "Activity Log" },
];

const REQUIRED_FIELDS = [
  { name: "shortDescription", label: "Short Description" },
  { name: "hod", label: "HOD / Designee" },
  { name: "qaReviewer", label: "QA Reviewer" },
  { name: "qaApproval", label: "QA Approval" },
];

const normalizeGridRows = (rows = []) =>
  rows.map((row, index) => {
    const { _rowId, ...cleanRow } = row || {};
    return {
      ...cleanRow,
      row_id: index + 1,
      ...(row?.calibrationDate ? { calibrationDate: formatDate(row.calibrationDate) } : {}),
      ...(row?.previousCalibrationDate ? { previousCalibrationDate: formatDate(row.previousCalibrationDate) } : {}),
      ...(row?.nextCalibrationDate ? { nextCalibrationDate: formatDate(row.nextCalibrationDate) } : {}),
    };
  });

const getUserPair = (userId, users = []) => {
  const user = users.find((item) => item?.id === userId);
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

const CreateCalibration = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [calibrationRows, setCalibrationRows] = useState([]);
  const [initiator, setInitiator] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [initiationDepartment, setInitiationDepartment] = useState("");
  const [dateOfInitiation] = useState(() => formatDateTime(new Date()));

  const [hodUsers, setHodUsers] = useState([]);
  const [qaReviewers, setQaReviewers] = useState([]);
  const [qaApprovers, setQaApprovers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [form] = Form.useForm();

  const location = useLocation();
  const navigate = useNavigate();
  const { processId } = useParams();
  const { processName, siteName } = location.state || {};

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        console.log("Profile Response:", response);
        const profile = response?.data?.data;
        if (!profile) return;
        const userName = profile?.name || "";
        const userId = profile?.id || "";
        const profileDepartmentId = profile?.department?.id || "";
        const departmentName = profile?.department?.name || "";
        setInitiator(userName);
        setInitiatorId(userId);
        setDepartmentId(profileDepartmentId);
        setInitiationDepartment(departmentName);
        form.setFieldsValue({
          initiator: userName,
          initiationDepartment: departmentName,
          dateOfInitiation,
          siteLocationCode: "Unit IV",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [form, dateOfInitiation]);

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

  const hodOptions = hodUsers.map((user) => ({ value: user.id, label: user.name }));
  const qaReviewerOptions = qaReviewers.map((user) => ({ value: user.id, label: user.name }));
  const qaApproverOptions = qaApprovers.map((user) => ({ value: user.id, label: user.name }));

  const systemFields = [
    { name: "recordNumber", label: "Record Number", value: "CAL-2026-000124" },
    { name: "siteLocationCode", label: "Site / Location Code", value: "Unit IV" },
    { name: "initiator", label: "Initiator", value: initiator },
    { name: "dateOfInitiation", label: "Date of Initiation", value: dateOfInitiation },
    // { name: "dueDate", label: "Due Date", value: "01-Sep-2026" },
    { name: "initiationDepartment", label: "Initiation Department", value: initiationDepartment },
  ];

  const handleSave = async () => {
    if (isSaving) return;
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
    if (isSaving) return;
    try {
      setIsSaving(true);
      const processData = buildProcessData(values, systemFields, hodUsers, qaReviewers, qaApprovers);
      const gridData = normalizeGridRows(calibrationRows);
      const payload = {
        process_id: Number(processId),
        stage_id: 1,
        department_id: departmentId,
        initiator_id: initiatorId,
        short_description: values?.shortDescription || "",
        initiation_date: dateOfInitiation,
        process_data: processData,
        gridData,
        checklistData: [],
      };
      console.log("Calibration Payload:", payload);
      const response = await addCalibration(payload);
      if (response?.data?.success) {
        toast.success("Calibration created successfully.");
        form.resetFields();
        setCalibrationRows([]);
        navigate("/user/engineering-dashboard");
        return;
      }
      toast.error(response?.data?.message || "Failed to create Calibration.");
    } catch (error) {
      console.error("Calibration submission failed:", error);
      toast.error(error?.response?.data?.message || "Failed to create Calibration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    form.resetFields();
    setCalibrationRows([]);
    navigate("/user/engineering-dashboard");
  };

  return (
    <div className="w-full">
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#263B35]">Create Calibration</h1>
          </div>
        </div>
        <div className="flex items-center gap-8 border-l border-slate-200 pl-6">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">Site</p>
            <p className="text-sm font-semibold text-[#344A43]">{siteName || "Unit IV"}</p>
          </div>
          <div className="h-9 w-px bg-slate-200" />
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">Process</p>
            <p className="text-sm font-semibold text-[#344A43]">{processName || "Calibration Management"}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
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
                <FormSelect
                  placeholder={usersLoading ? "Loading HOD / Designee..." : "Select HOD / Designee"}
                  options={hodOptions}
                  disabled={usersLoading}
                />
              </Form.Item>
              <Form.Item
                name="qaReviewer"
                label={<span>QA Reviewer <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: "Please select QA Reviewer" }]}
                className="!mb-4"
              >
                <FormSelect
                  placeholder={usersLoading ? "Loading QA Reviewer..." : "Select QA Reviewer"}
                  options={qaReviewerOptions}
                  disabled={usersLoading}
                />
              </Form.Item>
              <Form.Item
                name="qaApproval"
                label={<span>QA Approval <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: "Please select QA Approver" }]}
                className="!mb-4"
              >
                <FormSelect
                  placeholder={usersLoading ? "Loading QA Approver..." : "Select QA Approver"}
                  options={qaApproverOptions}
                  disabled={usersLoading}
                />
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

        {/* {activeTab === "activity" && (
          <EmptyTab title="Activity Log" description="Record activities and workflow history will be displayed here." />
        )} */}
      </Form>

      <FloatingActionButtons onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} saveLabel="Save" cancelLabel="Cancel" />
    </div>
  );
};

export default CreateCalibration;