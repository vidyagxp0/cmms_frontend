import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Form, Input } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import CalibrationGrid from "./CalibrationGrid";
import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FormSelect from "../../../components/common/Form/FormSelect";
import FormTextArea from "../../../components/common/Form/FormTextArea";
import FormDisabledInput from "../../../components/common/Form/FormDisabledInput";
import FormAttachment from "../../../components/common/Form/FormAttachment";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import "../../../components/common/ProcesStageTabs/Scrollerbar.css";

import { getProfile } from "../../../services/authApi";
import { addCalibration, getAllEquipmentData, getCalibrationUser, getRecordNumber } from "../../../services/usersApi/calibrationApi";
import { formatDate, formatDateTime } from "../../../utils/date";

const TABS = [
  { id: "general", label: "General Information" },
  { id: "hod", label: "HOD / Designee Review (Engineering Dept)" },
  { id: "user-dept-review", label: "User Department Review (User Dept)" },
  { id: "qa-review", label: "QA Approval Review" },
];

const REQUIRED_FIELDS = [{ name: "shortDescription", label: "Short Description" }];

const normalizeGridRows = (rows = [], equipmentMap = {}) => {
  return rows.map((row, index) => {
    const rowData = { row_id: index + 1 };
    Object.keys(row).forEach((key) => {
      if (key === "monthlyCalibration" || key === "calibrationFrequencyStartDate") {
        rowData[key] = row[key];
        return;
      }
      let value = row[key] !== undefined && row[key] !== null ? row[key] : "";
      if (key === "equipmentInstrumentName") {
        const id = value;
        if (id && equipmentMap[id]) value = equipmentMap[id].name;
        else value = "";
      } else {
        if (key === "previousCalibrationDate" && value) value = formatDate(value);
        else if (key === "nextCalibrationDate" && value) value = formatDate(value);
        else if (key === "calibrationDate" && value) value = formatDate(value);
      }
      rowData[key] = { key, label: key, value };
    });
    return rowData;
  });
};

const buildProcessData = (values, systemFields) => [
  ...systemFields.map((field) => ({ key: field.name, label: field.label, value: values?.[field.name] || "" })),
  { key: "short_description", label: "Short Description", value: values?.shortDescription || "" },
  { key: "comment", label: "Comments", value: values?.comments || "" },
  { key: "attachment", label: "Attachment", value: values?.attachment || [] },
  { key: "year", label: "Year", value: values?.year || "" },
  { key: "block", label: "Block", value: values?.block || "" },
  { key: "area", label: "Area", value: values?.area || "" },
  { key: "hod_review_comments", label: "HOD / Designee Review Comments", value: values?.hodReviewComments || "" },
  { key: "hod_review_attachment", label: "HOD / Designee Review Attachment", value: values?.hodReviewAttachment || [] },
  { key: "user_dept_review_comments", label: "User Dept Review Comments", value: values?.userDeptReviewComments || "" },
  { key: "user_dept_review_attachment", label: "User Dept Review Attachment", value: values?.userDeptReviewAttachment || [] },
  { key: "qa_review_comments", label: "QA Review Comments", value: values?.qaReviewComments || "" },
  { key: "qa_review_attachment", label: "QA Review Attachment", value: values?.qaReviewAttachment || [] },
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [calibrationRows, setCalibrationRows] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [initiator, setInitiator] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [initiationDepartment, setInitiationDepartment] = useState("");
  const [recordNumber, setRecordNumber] = useState("");
  const [dateOfInitiation] = useState(() => formatDateTime(new Date()));
  const [hodUsers, setHodUsers] = useState([]);
  const [qaReviewers, setQaReviewers] = useState([]);

  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const { processId } = useParams();
  const { processName, siteName } = location.state || {};

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getProfile();
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
      } catch (error) { console.error("Failed to fetch profile:", error); } finally { setIsLoading(false); }
    };
    fetchProfile();
  }, [form, dateOfInitiation]);

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
    if (!processId) return;
    const fetchRecordNumber = async () => {
      try {
        const response = await getRecordNumber(processId);
        const generatedRecordNumber = response?.data?.data?.record_number || "";
        setRecordNumber(generatedRecordNumber);
        form.setFieldsValue({ recordNumber: generatedRecordNumber });
      } catch (error) {
        console.error("Failed to generate record number:", error);
        toast.error(error?.response?.data?.message || "Failed to generate record number.");
      }
    };
    fetchRecordNumber();
  }, [processId, form]);

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

  const systemFields = [
    { name: "recordNumber", label: "Record Number", value: recordNumber },
    { name: "siteLocationCode", label: "Site / Location Code", value: "Unit IV" },
    { name: "initiator", label: "Initiator", value: initiator },
    { name: "dateOfInitiation", label: "Date of Initiation", value: dateOfInitiation },
    { name: "initiationDepartment", label: "Initiation Department", value: initiationDepartment },
  ];

  const handleTabChange = (tabId) => {
    if (tabId !== "general") {
      const missingFields = validateCalibrationForm(form);
      if (missingFields.length > 0) {
        toast.warning("Please fill all mandatory fields in General Information before accessing other tabs.");
        setActiveTab("general");
        return;
      }
    }
    setActiveTab(tabId);
  };

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
      const processData = buildProcessData(values, systemFields);
      const gridData = normalizeGridRows(calibrationRows, equipmentMap);
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
    } finally { setIsSaving(false); }
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
        <ProcessTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
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
            {isLoading ? (
              <Skeleton variant="formskeleton" />
            ) : (
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
            )}
            <div className="mt-5">
              <SectionHeader title="CALIBRATION INFORMATION" />
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <Form.Item name="year" label="Year" className="!mb-4">
                  <Input placeholder="Enter Year" />
                </Form.Item>
                <Form.Item name="block" label="Block" className="!mb-4">
                  <Input placeholder="Enter Block" />
                </Form.Item>
                <Form.Item name="area" label="Area" className="!mb-4">
                  <Input placeholder="Enter Area" />
                </Form.Item>
              </div>
              <CalibrationGrid
                value={calibrationRows}
                onChange={setCalibrationRows}
                equipmentOptions={equipmentOptions}
                equipmentMap={equipmentMap}
                equipmentLoading={equipmentLoading}
              />
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
            <div className="my-9 h-px w-full bg-slate-200" />
          </section>
        )}

        {activeTab === "hod" && (
          <section>
            <SectionHeader title="HOD / DESIGNEE REVIEW (ENGINEERING DEPT)" />
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

        {activeTab === "user-dept-review" && (
          <section>
            <SectionHeader title="USER DEPT REVIEW (USER DEPT)" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="userDeptReviewComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter comments..." />
              </Form.Item>
              <Form.Item
                name="userDeptReviewAttachment"
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
      </Form>

      <FloatingActionButtons onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} saveLabel="Save" cancelLabel="Cancel" />
    </div>
  );
};

export default CreateCalibration;