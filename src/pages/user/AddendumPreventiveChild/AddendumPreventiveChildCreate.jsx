import React, { useEffect, useMemo, useState } from "react";
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
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";

dayjs.extend(customParseFormat);

const TABS = [
  { id: "general", label: "General Information" },
  { id: "engineer-review", label: "HOD / Designee Review" },
  { id: "qa-approval", label: "QA Approval" },
];

const REQUIRED_FIELDS = [
  { name: "shortDescription", label: "Short Description" },
];

/** Safe array coercion. */
const asArray = (value) => (Array.isArray(value) ? value : []);

/** Extract array from common API wrapper shapes. */
const extractArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.results)) return raw.results;
  if (Array.isArray(raw?.items)) return raw.items;
  if (raw && typeof raw === "object") {
    // eslint-disable-next-line no-console
    console.warn("Unexpected array response shape:", raw);
  }
  return [];
};

const AddendumPreventiveChildCreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // ✅ Memoise `state` so its identity is stable across renders
  const state = useMemo(() => location.state || {}, [location.state]);

  const {
    rowData,
    shortDescription: parentShortDescription = "",
    processId: stateProcessId,
    parentId: stateParentId,
    childType,
    preventiveFrequency: passedFrequency = "",
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

  // ✅ NEW: track initial values + form readiness
  const [formInitialValues, setFormInitialValues] = useState({});
  const [formReady, setFormReady] = useState(false);

  // Prefill sources from the parent row
  const rowEquipmentName = rowData?.equipmentInstrumentName || "";
  const rowEquipmentDbId = rowData?.equipmentDbId || "";
  const rowEquipmentCode = rowData?.equipmentInstrumentId || "";
  const rowBlock = rowData?.block || "";
  const rowDepartment = rowData?.department || "";
  const rowLocation = rowData?.location || "";
  const rowPrevDate = rowData?.previousPreventiveDate || "";
  const rowNextDate = rowData?.nextPreventiveDate || "";
  const rowRemark = rowData?.remark || "";

  // ✅ Safety net — re-apply values AFTER the Form actually mounts
  useEffect(() => {
    if (
      !isLoading &&
      formReady &&
      formInitialValues &&
      Object.keys(formInitialValues).length > 0
    ) {
      form.setFieldsValue(formInitialValues);
    }
  }, [isLoading, formReady, formInitialValues, form]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      setEquipmentLoading(true);

      let userName = "";
      let departmentName = "";
      let generatedRecordNumber = "";
      let equipmentValue = "";

      try {
        const [profileRes, recordNumRes, equipmentRes] =
          await Promise.allSettled([
            getProfile(),
            routeProcessId
              ? getRecordNumber(routeProcessId)
              : Promise.resolve(null),
            getAllEquipmentData(),
          ]);

        if (!isMounted) return;

        // Profile
        if (profileRes.status === "fulfilled" && profileRes.value?.data?.data) {
          const profile = profileRes.value.data.data;
          userName = profile?.name || "";
          setInitiator(userName);
          setInitiatorId(profile?.id || "");
          setDepartmentId(profile?.department?.id || "");
          departmentName = profile?.department?.name || "";
          setInitiationDepartment(departmentName);
        } else if (profileRes.status === "rejected") {
          console.error("Failed to fetch profile:", profileRes.reason);
        }

        // Record number
        if (
          recordNumRes.status === "fulfilled" &&
          recordNumRes.value?.data?.data
        ) {
          generatedRecordNumber =
            recordNumRes.value.data.data.record_number || "";
          setRecordNumber(generatedRecordNumber);
        } else if (recordNumRes.status === "rejected") {
          console.error("Failed to fetch record number:", recordNumRes.reason);
        }

        // ✅ Equipment — guarded
        let equipmentData = [];
        const map = {};

        if (
          equipmentRes.status === "fulfilled" &&
          equipmentRes.value?.data?.data !== undefined
        ) {
          equipmentData = extractArray(equipmentRes.value.data.data);

          const options = equipmentData.map((item) => {
            const name =
              item.equipment_name || item.instrument_name || item.name || "";
            return { value: name, label: name };
          });

          equipmentData.forEach((item) => {
            const name =
              item.equipment_name || item.instrument_name || item.name || "";
            if (name) map[name] = item;
          });

          setEquipmentOptions(options);
          setEquipmentMap(map);
        } else if (equipmentRes.status === "rejected") {
          console.error("Failed to fetch equipment:", equipmentRes.reason);
        }

        // Resolve the equipment name from the parent row
        if (rowEquipmentName && map[rowEquipmentName]) {
          equipmentValue = rowEquipmentName;
        } else if (rowEquipmentName) {
          const found = equipmentData.find(
            (item) =>
              String(item.id) === String(rowEquipmentName) ||
              String(item.id) === String(rowEquipmentDbId) ||
              item.instrument_id_no === rowEquipmentName ||
              item.instrument_id_no === rowEquipmentCode ||
              item.equipment_id_no === rowEquipmentCode
          );
          if (found)
            equipmentValue =
              found.equipment_name || found.instrument_name || found.name || "";
        } else if (rowEquipmentDbId) {
          const found = equipmentData.find(
            (item) => String(item.id) === String(rowEquipmentDbId)
          );
          if (found)
            equipmentValue =
              found.equipment_name || found.instrument_name || found.name || "";
        }
      } catch (error) {
        console.error("❌ Error loading initial data (unexpected):", error);
      } finally {
        if (!isMounted) return;

        // ✅ ALWAYS build & set values — never skip on error
        const values = {
          recordNumber: generatedRecordNumber || "",
          initiator: userName || "",
          dateOfInitiation,
          initiationDepartment: departmentName || "",
          shortDescription: parentShortDescription || "",
          equipmentInstrumentName: equipmentValue || undefined,
          equipmentInstrumentId:
            rowEquipmentCode ||
            equipmentMap[equipmentValue]?.equipment_id_no ||
            equipmentMap[equipmentValue]?.instrument_id_no ||
            "",
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
          preventiveFrequency: passedFrequency || "",
        };

        setFormInitialValues(values);
        form.setFieldsValue(values);
        setFormReady(true);

        setIsLoading(false);
        setEquipmentLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeProcessId, form, dateOfInitiation, passedFrequency]);

  const systemFields = [
    { name: "recordNumber", label: "Record Number" },
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
    // {
    //   key: "previousPreventiveDate",
    //   label: "Previous Preventive Date",
    //   value: values?.previousPreventiveDate
    //     ? dayjs(values.previousPreventiveDate).format("DD/MM/YYYY")
    //     : "",
    // },
    // {
    //   key: "nextPreventiveDate",
    //   label: "Next Preventive Date",
    //   value: values?.nextPreventiveDate
    //     ? dayjs(values.nextPreventiveDate).format("DD/MM/YYYY")
    //     : "",
    // },
    { key: "remark", label: "Remark", value: values?.remark || "" },
    {
      key: "attachment",
      label: "Attachment",
      value: values?.attachment || [],
    },
    {
      key: "engineer_review_comments",
      label: "HOD / Designee Review Comments",
      value: values?.engineerReviewComments || "",
    },
    {
      key: "engineer_review_attachment",
      label: "HOD / Designee Review Attachment",
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
      key: "preventive_frequency",
      label: "Preventive Frequency",
      value: values?.preventiveFrequency || "",
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
        process_id: Number(routeProcessId) || 13,
        stage_id: 66,
        childType,
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
        toast.success("Addendum Preventive Maintenance created successfully.");
        form.resetFields();
        navigate("/user/preventive-maintenance-dashboard");
        return;
      }

      toast.error(
        response?.data?.message ||
          "Failed to create Addendum Preventive Maintenance."
      );
    } catch (error) {
      console.error("Addendum Preventive Maintenance submission failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to create Addendum Preventive Maintenance. Please try again."
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
              Create Addendum Preventive Maintenance
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-8 border-l border-slate-200 pl-6">
          <div className="h-9 w-px bg-slate-200" />
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">
              Process
            </p>
            <p className="text-sm font-semibold text-[#344A43]">
              Addendum Preventive Maintenance
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
        initialValues={formInitialValues}
        preserve={true}
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
                <FormInput placeholder="Block" disabled />
              </Form.Item>

              <Form.Item name="department" label="Department" className="!mb-4">
                <FormInput placeholder="Department" disabled />
              </Form.Item>

              <Form.Item name="location" label="Location" className="!mb-4">
                <FormInput placeholder="Location" disabled />
              </Form.Item>

              {/* <Form.Item
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
              </Form.Item> */}

              <Form.Item
                name="preventiveFrequency"
                label="Preventive Frequency"
                className="!mb-4"
              >
                <FormSelect
                  placeholder="—"
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "half-yearly", label: "Half Yearly" },
                    { value: "yearly", label: "Yearly" },
                  ]}
                  disabled
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
              <FormAttachment disabled />
            </Form.Item>
          </section>
        )}

        {activeTab === "engineer-review" && (
          <section>
            <SectionHeader title="HOD / DESIGNEE REVIEW" />
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
                <FormAttachment disabled />
              </Form.Item>
            </div>
          </section>
        )}

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
                <FormAttachment disabled />
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

export default AddendumPreventiveChildCreate;