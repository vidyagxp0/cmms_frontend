import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Form, DatePicker } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";

import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
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
  getRecordNumber,
  addCalibrationChild,
} from "../../../services/usersApi/calibrationApi";

// Tabs definition
const TABS = [
  { id: "management", label: "Calibration Management" },
  { id: "implementor", label: "Implementor Review" },
  { id: "qa-review", label: "QA Review" },
  { id: "qa-approval", label: "QA Approval" },
  { id: "activity", label: "Activity Log" },
];

// Only these three fields are required
const REQUIRED_FIELDS = [
  { name: "hod", label: "HOD / Designee" },
  { name: "qaReviewer", label: "QA Reviewer" },
  { name: "qaApproval", label: "QA Approval" },
];

// System fields for process_data
const SYSTEM_FIELDS = [
  { key: "recordNumber", label: "Record Number" },
  { key: "siteLocationCode", label: "Site / Location Code" },
  { key: "initiator", label: "Initiator" },
  { key: "dateOfInitiation", label: "Date of Initiation" },
  { key: "initiationDepartment", label: "Initiation Department" },
];

// UI Label Mapping for other fields
const FIELD_LABELS = {
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
  hod: "HOD / Designee",
  qa_reviewer: "QA Reviewer",
  qa_approval: "QA Approval",
};

// ===== Helper: Build Grid Payload (exclude _rowId) =====
const normalizeGridRows = (rows = []) => {
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

// ===== Helper: Build Process Data =====
const buildChildProcessData = (values, systemValues) => {
  const processData = SYSTEM_FIELDS.map((field) => ({
    key: field.key,
    label: field.label,
    value: systemValues[field.key] || "",
  }));

  const fieldsToInclude = [
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

  fieldsToInclude.forEach((key) => {
    let value = values[key] !== undefined && values[key] !== null ? values[key] : "";
    if (dayjs.isDayjs(value)) {
      value = value.format("DD/MM/YYYY");
    }
    processData.push({
      key,
      label: FIELD_LABELS[key] || key,
      value,
    });
  });

  return processData;
};

// ===== Main Component =====
const CalibrationChild = () => {
  const { processId: urlProcessId } = useParams();

  const [activeTab, setActiveTab] = useState("management");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    rowData,
    shortDescription: parentShortDesc,
    processId: passedProcessId,
    parentId,
  } = location.state || {};

  const processId = passedProcessId || urlProcessId;
  const { processName, siteName } = location.state || {};

  // ---- State ----
  const [hodUsers, setHodUsers] = useState([]);
  const [qaReviewers, setQaReviewers] = useState([]);
  const [qaApprovers, setQaApprovers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [calibrationResultRows, setCalibrationResultRows] = useState([]);

  // Profile / system data
  const [initiator, setInitiator] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [initiationDepartment, setInitiationDepartment] = useState("");
  const [recordNumber, setRecordNumber] = useState("");
  const [dateOfInitiation, setDateOfInitiation] = useState("");

  // ---- Fetch profile ----
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response?.data?.data;
        if (!profile) return;
        setInitiator(profile?.name || "");
        setInitiatorId(profile?.id || "");
        setDepartmentId(profile?.department?.id || "");
        setInitiationDepartment(profile?.department?.name || "");
        const now = dayjs().format("DD/MM/YYYY HH:mm");
        setDateOfInitiation(now);
        form.setFieldsValue({
          initiator: profile?.name || "",
          initiationDepartment: profile?.department?.name || "",
          dateOfInitiation: now,
          siteLocationCode: "Unit IV",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [form]);

  // ---- Fetch record number ----
  useEffect(() => {
    const fetchRecordNumber = async () => {
      if (!processId) return;
      try {
        const response = await getRecordNumber(processId);
        const num = response?.data?.data?.record_number || "";
        setRecordNumber(num);
        form.setFieldsValue({ recordNumber: num });
      } catch (error) {
        console.error("Failed to fetch record number:", error);
        toast.error("Could not load record number.");
      }
    };
    fetchRecordNumber();
  }, [processId, form]);

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

  // ---- Fetch workflow users ----
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await getCalibrationUser();
        const data = response?.data?.data || {};
        setHodUsers(data?.hod || []);
        setQaReviewers(data?.qa_reviewer || []);
        setQaApprovers(data?.qa_approver || []);
      } catch (error) {
        console.error("Failed to fetch calibration users:", error);
        toast.error("Failed to load workflow users.");
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ---- Populate form with rowData ----
  useEffect(() => {
    if (!rowData) {
      toast.error("No data provided for this calibration item.");
      navigate(-1);
      return;
    }

    const parseDate = (val) => {
      if (!val) return null;
      if (dayjs.isDayjs(val)) return val;
      return dayjs(val, "DD/MM/YYYY", true);
    };

    const values = {
      recordNumber: recordNumber,
      siteLocationCode: rowData.siteLocationCode || "Unit IV",
      initiator: rowData.initiator || initiator,
      dateOfInitiation: rowData.dateOfInitiation || dateOfInitiation,
      initiationDepartment: rowData.initiationDepartment || initiationDepartment,
      shortDescription: rowData.shortDescription || parentShortDesc || "",
      instrumentName: rowData.equipmentInstrumentName || "",
      instrumentId: rowData.instrumentId || "",
      location: rowData.location || "",
      makeModel: rowData.makeModel || "",
      range: rowData.range || "",
      leastCount: rowData.leastCount || "",
      criticality: rowData.criticality || "",
      calibrationFrequency: rowData.calibrationFrequency || "",
      previousCalibrationDate: parseDate(rowData.previousCalibrationDate),
      nextCalibrationDate: parseDate(rowData.nextCalibrationDate),
      standardReference: rowData.standardReference || "",
      dueReminder: rowData.dueReminder || "",
      procedureReference: rowData.procedureReference || "",
      standardUsed: rowData.standardUsed || "",
      parameters: rowData.parameters || "",
      unscheduledReason: rowData.unscheduledReason || "",
      eventReference: rowData.eventReference || "",
      calibrationResults: rowData.calibrationResults || "",
      certificateNumber: rowData.certificateNumber || "",
      costOfCalibration: rowData.costOfCalibration || "",
      calibrationComment: rowData.calibrationComment || "",
      hod: rowData.hod || "",
      qaReviewer: rowData.qaReviewer || "",
      qaApproval: rowData.qaApproval || "",
      comments: rowData.comments || "",
      attachment: rowData.attachment || [],
    };

    form.setFieldsValue(values);
    setCalibrationResultRows(rowData.calibrationResultRows || []);
    setIsLoading(false);
  }, [rowData, form, initiator, dateOfInitiation, initiationDepartment, parentShortDesc, navigate, recordNumber]);

  // ---- Options for selects ----
  const hodOptions = hodUsers.map((user) => ({ value: user.id, label: user.name }));
  const qaReviewerOptions = qaReviewers.map((user) => ({ value: user.id, label: user.name }));
  const qaApproverOptions = qaApprovers.map((user) => ({ value: user.id, label: user.name }));

  const criticalityOptions = [
    { value: "Critical", label: "Critical" },
    { value: "Non-Critical", label: "Non-Critical" },
  ];
  const frequencyOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "Yearly", label: "Yearly" },
  ];
  const resultOptions = [
    { value: "Pass", label: "Pass" },
    { value: "Fail", label: "Fail" },
    { value: "Out of Tolerance", label: "Out of Tolerance" },
  ];

  // ===== Helper: Get user pair =====
  const getUserPair = (userId, users) => {
    const user = users.find((u) => String(u.id) === String(userId));
    return { id: user?.id || userId || "", name: user?.name || "" };
  };

  // ---- Build full process data including assignments ----
  const buildFullProcessData = (values) => {
    const systemValues = {
      recordNumber: values.recordNumber || recordNumber,
      siteLocationCode: values.siteLocationCode || "Unit IV",
      initiator: values.initiator || initiator,
      dateOfInitiation: values.dateOfInitiation || dateOfInitiation,
      initiationDepartment: values.initiationDepartment || initiationDepartment,
    };

    const baseData = buildChildProcessData(values, systemValues);

    baseData.push({
      key: "hod",
      label: FIELD_LABELS.hod,
      value: getUserPair(values.hod, hodUsers),
    });
    baseData.push({
      key: "qa_reviewer",
      label: FIELD_LABELS.qa_reviewer,
      value: getUserPair(values.qaReviewer, qaReviewers),
    });
    baseData.push({
      key: "qa_approval",
      label: FIELD_LABELS.qa_approval,
      value: getUserPair(values.qaApproval, qaApprovers),
    });

    return baseData;
  };

  // ---- Tab switching (only management is allowed during creation) ----
  const handleTabChange = (tabId) => {
    if (tabId !== "management") {
      toast.warning(
        "Please fill all mandatory fields and save the record before accessing other tabs."
      );
      return;
    }
    setActiveTab(tabId);
  };

  // ---- Save handler ----
  const handleSave = async () => {
    if (isSaving) return;

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
    if (isSaving) return;
    try {
      setIsSaving(true);

      const processData = buildFullProcessData(values);
      const gridData = normalizeGridRows(calibrationResultRows);

      const initiationDate = values.dateOfInitiation || dateOfInitiation;
      const formattedInitiationDate = dayjs(initiationDate, "DD/MM/YYYY HH:mm").format("DD/MM/YYYY HH:mm");

      const payload = {
        process_id: Number(processId),
        stage_id: 19,
        is_child: true,
        parent_id: Number(parentId),
        department_id: Number(departmentId),
        initiator_id: Number(initiatorId),
        short_description: values.shortDescription || "",
        initiation_date: formattedInitiationDate,
        process_data: processData,
        gridData: gridData,
        checklistData: [],
      };

      const response = await addCalibrationChild(payload);
      if (response?.data?.success || response?.data?.status === true) {
        toast.success("Child calibration record created successfully.");
        navigate("/user/engineering-dashboard");
      } else {
        toast.error(response?.data?.message || "Failed to create child calibration.");
      }
    } catch (error) {
      console.error("Child calibration creation failed:", error);
      toast.error(error?.response?.data?.message || "Failed to create child calibration.");
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
      {/* Header – matches CreateCalibration style */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#263B35]">
              Create Child Calibration
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-8 border-l border-slate-200 pl-6">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">
              Site
            </p>
            <p className="text-sm font-semibold text-[#344A43]">{siteName || "Unit IV"}</p>
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

      {/* Tabs */}
      <div className="mb-8">
        <ProcessTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="w-full [&_.ant-form-item-label>label]:!text-[12px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-explain-error]:!text-[11px]"
      >
        {activeTab === "management" && (
          <section>
            {/* SYSTEM INFORMATION */}
            <SectionHeader title="SYSTEM INFORMATION" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="recordNumber" label="Record Number" className="!mb-4">
                <FormDisabledInput />
              </Form.Item>
              {SYSTEM_FIELDS.map((field) => (
                <Form.Item key={field.key} name={field.key} label={field.label} className="!mb-4">
                  <FormDisabledInput />
                </Form.Item>
              ))}
              <Form.Item name="shortDescription" label="Short Description" className="!mb-4">
                <FormInput placeholder="Enter short description" />
              </Form.Item>
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />

            {/* INSTRUMENT / EQUIPMENT DETAILS */}
            <SectionHeader title="INSTRUMENT / EQUIPMENT DETAILS" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="instrumentName" label="Instrument / Equipment Name" className="!mb-4">
                <FormSelect
                  placeholder={equipmentLoading ? "Loading..." : "Select Instrument"}
                  options={equipmentOptions}
                  disabled={equipmentLoading}
                />
              </Form.Item>
              <Form.Item name="instrumentId" label="Instrument/Equipment ID" className="!mb-4">
                <FormInput placeholder="e.g. EQ-001" />
              </Form.Item>
              <Form.Item name="location" label="Location" className="!mb-4">
                <FormInput placeholder="Lab A, Room 101" />
              </Form.Item>
              <Form.Item name="makeModel" label="Make & Model" className="!mb-4">
                <FormInput placeholder="e.g. Fluke 87V" />
              </Form.Item>
              <Form.Item name="range" label="Range" className="!mb-4">
                <FormInput placeholder="e.g. 0-1000 V" />
              </Form.Item>
              <Form.Item name="leastCount" label="Least Count" className="!mb-4">
                <FormInput placeholder="e.g. 0.01" />
              </Form.Item>
              <Form.Item name="criticality" label="Critical & Non Critical" className="!mb-4">
                <FormSelect placeholder="Select" options={criticalityOptions} />
              </Form.Item>
              <Form.Item name="calibrationFrequency" label="Calibration Frequency" className="!mb-4">
                <FormSelect placeholder="Select" options={frequencyOptions} />
              </Form.Item>

              <Form.Item name="previousCalibrationDate" label="Previous Calibration Date" className="!mb-4">
                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Select date" />
              </Form.Item>
              <Form.Item name="nextCalibrationDate" label="Next Calibration Date" className="!mb-4">
                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Select date" />
              </Form.Item>

              <Form.Item name="standardReference" label="Calibration Standard Reference" className="!mb-4">
                <FormInput placeholder="e.g. ISO 17025" />
              </Form.Item>
              <Form.Item name="dueReminder" label="Calibration Due Reminder" className="!mb-4">
                <FormInput placeholder="Days before due" />
              </Form.Item>
              <Form.Item name="procedureReference" label="Calibration Procedures Reference Document" className="!mb-4">
                <FormInput placeholder="Doc #" />
              </Form.Item>
              <Form.Item name="standardUsed" label="Calibration Standard used" className="!mb-4">
                <FormInput placeholder="Standard name" />
              </Form.Item>
              <Form.Item name="parameters" label="Calibration Parameters" className="!mb-4">
                <FormInput placeholder="e.g. Voltage, Current" />
              </Form.Item>
              <Form.Item name="unscheduledReason" label="Reason for Unscheduled or Event Based Calibration" className="!mb-4">
                <FormInput placeholder="Explain reason" />
              </Form.Item>
              <Form.Item name="eventReference" label="Event Reference No." className="!mb-4">
                <FormInput placeholder="e.g. EVT-123" />
              </Form.Item>
              <Form.Item name="calibrationResults" label="Calibration Results" className="!mb-4">
                <FormSelect placeholder="Select" options={resultOptions} />
              </Form.Item>
              <Form.Item name="certificateNumber" label="Calibration Certificate number" className="!mb-4">
                <FormInput placeholder="Cert #" />
              </Form.Item>
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />

            {/* CALIBRATION RESULT */}
            <SectionHeader title="CALIBRATION RESULT" />
            <div className="mt-4">
              <UserDynamicGrid
                name="Calibration Results"
                description="Add parameter-wise calibration results"
                columns={CALIBRATED_BY_COLUMNS}
                value={calibrationResultRows}
                onChange={setCalibrationResultRows}
                allowAdd={true}
                allowDelete={true}
                addButtonLabel="Add Parameter"
                minRows={0}
                rowKey="_rowId"
              />
            </div>

            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 mt-6">
              <Form.Item name="costOfCalibration" label="Cost of Calibration" className="!mb-4">
                <FormInput placeholder="Enter cost" type="number" />
              </Form.Item>
              <Form.Item name="calibrationComment" label="Calibration Comment / Observations" className="!mb-4 md:col-span-2">
                <FormTextArea rows={3} placeholder="Enter any comments or observations..." />
              </Form.Item>
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />

            {/* ASSIGNMENTS */}
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
                  placeholder={usersLoading ? "Loading..." : "Select QA Reviewer"}
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
                  placeholder={usersLoading ? "Loading..." : "Select QA Approver"}
                  options={qaApproverOptions}
                  disabled={usersLoading}
                />
              </Form.Item>
              <Form.Item name="comments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={4} placeholder="Additional comments..." />
              </Form.Item>
              <Form.Item
                name="attachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment />
              </Form.Item>
            </div>
          </section>
        )}

        {/* Other tabs – placeholders (not accessible until saved) */}
        {activeTab === "implementor" && (
          <section>
            <SectionHeader title="IMPLEMENTOR REVIEW" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="implementorComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter review comments..." />
              </Form.Item>
              <Form.Item
                name="implementorAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
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
                <FormTextArea rows={5} placeholder="Enter QA review comments..." />
              </Form.Item>
              <Form.Item
                name="qaReviewAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
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
                <FormTextArea rows={5} placeholder="Enter QA approval comments..." />
              </Form.Item>
              <Form.Item
                name="qaApprovalAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
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
            <div className="mt-4 rounded-lg border border-[#DCE3EA] bg-white p-5 text-center text-sm text-slate-500">
              Activity history will appear here.
            </div>
          </section>
        )}
      </Form>

      <FloatingActionButtons
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
        saveLabel="Create"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default CalibrationChild;