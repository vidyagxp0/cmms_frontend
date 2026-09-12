import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Form, DatePicker } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FormSelect from "../../../components/common/Form/FormSelect";
import FormTextArea from "../../../components/common/Form/FormTextArea";
import FormDisabledInput from "../../../components/common/Form/FormDisabledInput";
import FormAttachment from "../../../components/common/Attachment/FormAttachment";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import "../../../components/common/ProcesStageTabs/Scrollerbar.css";

import { getProfile } from "../../../services/authApi";
import { getAllEquipmentData } from "../../../services/usersApi/calibrationApi";
import { addPreventiveMaintence } from "../../../services/usersApi/preventive";
import { getRecordNumber } from "../../../services/usersApi/workflowCommonApi";
import { formatDateTime } from "../../../utils/date";
import { addMultipleAttachments } from "../../../components/common/Attachment/attachmentApi";

dayjs.extend(customParseFormat);

const TABS = [
  { id: "general", label: "General Information" },
  { id: "engineer-review", label: "Review By Engineer Dept" },
  { id: "qa-approval", label: "QA Approval" },
];

const REQUIRED_FIELDS = [
  { name: "shortDescription", label: "Short Description" },
];

const PreventiveMaintenanceCreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const state = location.state || {};
  const {
    rowData = {},
    shortDescription: parentShortDescription = "",
    processId: stateProcessId,
    parentId: stateParentId,
  } = state;

  const routeProcessId = params.processId || stateProcessId || null;
  const routeParentId =
    params.parentId || params.recordId || stateParentId || null;

  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [initiator, setInitiator] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [initiationDepartment, setInitiationDepartment] = useState("");
  const [recordNumber, setRecordNumber] = useState("");
  const [dateOfInitiation] = useState(() => formatDateTime(new Date()));

  // Prefill sources from the parent row
  const rowEquipmentId = rowData?.equipmentInstrumentName || "";
  const rowEquipmentCode = rowData?.equipmentInstrumentId || "";
  const rowBlock = rowData?.block || "";
  const rowDepartment = rowData?.department || "";
  const rowLocation = rowData?.location || "";
  const rowPrevDate = rowData?.previousPreventiveDate || "";
  const rowNextDate = rowData?.nextPreventiveDate || "";
  const rowRemark = rowData?.remark || "";

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      setEquipmentLoading(true);

      try {
        const [profileRes, recordNumRes, equipmentRes] = await Promise.allSettled([
          getProfile(),
          routeProcessId ? getRecordNumber(routeProcessId) : Promise.resolve(null),
          getAllEquipmentData(),
        ]);

        if (!isMounted) return;

        let userName = "";
        let departmentName = "";
        let generatedRecordNumber = "";

        if (profileRes.status === "fulfilled" && profileRes.value?.data?.data) {
          const profile = profileRes.value.data.data;
          userName = profile?.name || "";
          setInitiator(userName);
          setInitiatorId(profile?.id || "");
          setDepartmentId(profile?.department?.id || "");
          departmentName = profile?.department?.name || "";
          setInitiationDepartment(departmentName);
        }

        if (recordNumRes.status === "fulfilled" && recordNumRes.value?.data?.data) {
          generatedRecordNumber =
            recordNumRes.value.data.data.record_number || "";
          setRecordNumber(generatedRecordNumber);
        }

        let equipmentData = [];
        const map = {};

        if (equipmentRes.status === "fulfilled" && equipmentRes.value?.data?.data) {
          equipmentData = equipmentRes.value.data.data || [];
          const options = equipmentData.map((item) => ({
            value: item.id,
            label: item.name,
          }));
          equipmentData.forEach((item) => {
            map[item.id] = item;
          });
          setEquipmentOptions(options);
          setEquipmentMap(map);
        } else if (equipmentRes.status === "rejected") {
          console.error("Failed to fetch equipment:", equipmentRes.reason);
        }

        let equipmentValue = rowEquipmentId;
        if (rowEquipmentId && map[rowEquipmentId]) {
          equipmentValue = rowEquipmentId;
        } else if (rowEquipmentId) {
          const found = equipmentData.find(
            (item) => item.name === rowEquipmentId
          );
          if (found) equipmentValue = found.id;
        }

        form.setFieldsValue({
          recordNumber: generatedRecordNumber,
          siteLocationCode: "Unit IV",
          initiator: userName,
          dateOfInitiation,
          initiationDepartment: departmentName,
          shortDescription: parentShortDescription || "",
          equipmentInstrumentName: equipmentValue || undefined,
          equipmentInstrumentId: rowEquipmentCode,
          block: rowBlock,
          department: rowDepartment,
          location: rowLocation,
          previousPreventiveDate: rowPrevDate ? dayjs(rowPrevDate) : null,
          nextPreventiveDate: rowNextDate ? dayjs(rowNextDate) : null,
          remark: rowRemark,
          attachment: [],
          engineerReviewComments: "",
          engineerReviewAttachment: [],
          qaApprovalComments: "",
          qaApprovalAttachment: [],
        });
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setEquipmentLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeProcessId, form, dateOfInitiation]);

  const systemFields = [
    { name: "recordNumber", label: "Record Number" },
    { name: "siteLocationCode", label: "Site / Location Code" },
    { name: "initiator", label: "Initiator" },
    { name: "dateOfInitiation", label: "Date of Initiation" },
    { name: "initiationDepartment", label: "Initiation Department" },
  ];

  const buildProcessData = (values) => [
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
  ];

  const validateCalibrationForm = (formInstance) => {
    const values = formInstance.getFieldsValue();
    return REQUIRED_FIELDS.filter((field) => {
      const value = values?.[field.name];
      if (typeof value === "string") return !value.trim();
      return value === undefined || value === null || value === "";
    });
  };

  // Only General Information tab is accessible on this create screen.
  const handleTabChange = (tabId) => {
    if (tabId !== "general") {
      toast.warning(
        "Please complete all mandatory fields in General Information and save the record before accessing the other tabs."
      );
      setActiveTab("general");
      return;
    }
    setActiveTab(tabId);
  };

  const handleSave = async () => {
    if (isSaving) return;
    const missingFields = validateCalibrationForm(form);
    if (missingFields.length > 0) {
      const names = missingFields.map((f) => f.label).join(", ");
      toast.error(`Required fields missing: ${names}`);
      form.setFields(
        missingFields.map((f) => ({
          name: f.name,
          errors: [`${f.label} is required`],
        }))
      );
      setActiveTab("general");
      return;
    }
    form.submit();
  };

  const handleSubmit = async (values) => {
    if (isSaving) return;
    try {
      setIsSaving(true);

      const processData = buildProcessData(values);

      const payload = {
        process_id: Number(routeProcessId),
        // TODO: replace 12 with the actual initial stage id of child process 4
        stage_id: 13,
        department_id: Number(departmentId),
        initiator_id: Number(initiatorId),
        initiator_name: initiator,
        short_description: values?.shortDescription || "",
        initiation_date: dateOfInitiation,
        parent_id: Number(routeParentId),
        is_child: 1,
        process_data: processData,
        gridData: [],
        checklistData: [],
      };

      const response = await addPreventiveMaintence(payload);

      if (response?.data?.success || response?.data?.status === true) {
        toast.success("Preventive Maintenance created successfully.");
        form.resetFields();
        navigate("/user/preventive-maintenance-dashboard");
        return;
      }

      toast.error(
        response?.data?.message || "Failed to create Preventive Maintenance."
      );
    } catch (error) {
      console.error("Preventive Maintenance submission failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to create Preventive Maintenance. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    form.resetFields();
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

  return (
    <div className="w-full">
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#263B35]">
              Create Preventive Maintenance
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-8 border-l border-slate-200 pl-6">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">
              Site
            </p>
            <p className="text-sm font-semibold text-[#344A43]">Unit IV</p>
          </div>
          <div className="h-9 w-px bg-slate-200" />
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">
              Process
            </p>
            <p className="text-sm font-semibold text-[#344A43]">
              Preventive Maintenance
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <ProcessTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="w-full [&_.ant-form-item-label>label]:!text-[12px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-explain-error]:!text-[11px]"
      >
        {/* General Information */}
        {activeTab === "general" && (
          <section>
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
                <FormInput placeholder="Enter short description" />
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
                <FormInput placeholder="Block" />
              </Form.Item>

              <Form.Item name="department" label="Department" className="!mb-4">
                <FormInput placeholder="Department" />
              </Form.Item>

              <Form.Item name="location" label="Location" className="!mb-4">
                <FormInput placeholder="Location" />
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
                />
              </Form.Item>
            </div>

            <Form.Item name="remark" label="Remark" className="!mb-4 md:col-span-2">
              <FormTextArea rows={4} placeholder="Enter remark..." />
            </Form.Item>

            <Form.Item
              name="attachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                attachmentField="attachment"
                label="Attachment"
                uploadApi={addMultipleAttachments}
              />
            </Form.Item>
          </section>
        )}

        {/* Review By Engineer Dept */}
        {activeTab === "engineer-review" && (
          <section>
            <SectionHeader title="REVIEW BY ENGINEER DEPT" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item
                name="engineerReviewComments"
                label="Comments"
                className="!mb-4 md:col-span-2"
              >
                <FormTextArea rows={5} placeholder="Enter comments..." />
              </Form.Item>

              <Form.Item
                name="engineerReviewAttachment"
                label="Attachment"
                valuePropName="value"
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment
                  multiple={true}
                  attachmentField="engineer_review_attachment"
                  label="Review By Engineer Dept Attachment"
                  uploadApi={addMultipleAttachments}
                />
              </Form.Item>
            </div>
          </section>
        )}

        {/* QA Approval */}
        {activeTab === "qa-approval" && (
          <section>
            <SectionHeader title="QA APPROVAL" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item
                name="qaApprovalComments"
                label="Comments"
                className="!mb-4 md:col-span-2"
              >
                <FormTextArea rows={5} placeholder="Enter comments..." />
              </Form.Item>

              <Form.Item
                name="qaApprovalAttachment"
                label="Attachment"
                valuePropName="value"
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment
                  multiple={true}
                  attachmentField="qa_approval_attachment"
                  label="QA Approval Attachment"
                  uploadApi={addMultipleAttachments}
                />
              </Form.Item>
            </div>
          </section>
        )}
      </Form>

      <FloatingActionButtons
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
        saveLabel="Save"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default PreventiveMaintenanceCreate;