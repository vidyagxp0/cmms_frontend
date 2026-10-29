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
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import UserDynamicGrid from "../../../components/common/DataTable/UserDynamicGrid";
import { CALIBRATED_BY_COLUMNS, CALIBRATION_RESULT_GRID } from "./calibrationColumn";

import { getProfile } from "../../../services/authApi";
import { getCalibrationUser, getAllEquipmentData, addCalibrationChild } from "../../../services/usersApi/calibrationApi";
import FormAttachment from "../../../components/common/Attachment/FormAttachment";
import SymbolicInput from "../../../components/common/SymbolicInput/SymbolicInput";
import { getRecordNumber } from "../../../services/usersApi/workflowCommonApi";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";

dayjs.extend(customParseFormat);

const TABS = [
  { id: "management", label: "General Information" },
  { id: "implementor", label: "HOD / Designee Review" },
  { id: "qa-review", label: "QA Approval Review" },
];

const REQUIRED_FIELDS = [];

const SYSTEM_FIELDS = [
  { key: "documentNumber", label: "Document Number" },
  { key: "documentType", label: "Document Type" },
  { key: "recordNumber", label: "Record Number" },
  { key: "initiator", label: "Initiator" },
  { key: "dateOfInitiation", label: "Date of Initiation" },
  { key: "initiationDepartment", label: "Initiation Department" },
];

const FIELD_LABELS = {
  shortDescription: "Short Description",
  previousCalibrationDate: "Calibration Done Date",
  nextCalibrationDate: "Calibration Next Due Date",
  instrumentName: "Name",
  instrumentId: "ID No.",
  location: "Location",
  make: "Make",
  model: "Sr.No/ Model No.",
  instrumentRange: "Instrument Range",
  leastCount: "Least Count",
  accuracy: "Accuracy",
  calibrationTestPoints: "Calibration test points",
  operatingRange: "Operating Range",
  envTemperature: "Environmental Condition Temperature",
  envHumidity: "Environmental Condition Relative Humidity",
  comments: "Remarks",
  attachment: "Attachment",
};

// ✅ FIXED toDayjs — checks clone method BEFORE isDayjs to handle serialized state
const toDayjs = (val) => {
  if (!val) return null;
  
  // Serialized dayjs object from navigate() state — has $d but NO clone method
  if (typeof val === "object" && val.$d !== undefined && typeof val.clone !== "function") {
    const parsed = dayjs(val.$d);
    return parsed.isValid() ? parsed : null;
  }
  
  // Real dayjs instance
  if (dayjs.isDayjs(val) && typeof val.clone === "function") {
    return val.isValid() ? val.clone() : null;
  }
  
  // String values
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const strict = dayjs(trimmed, "DD/MM/YYYY", true);
    if (strict.isValid()) return strict;
    const iso = dayjs(trimmed, "DD-MM-YYYY", true);
    if (iso.isValid()) return iso;
    const generic = dayjs(trimmed);
    return generic.isValid() ? generic : null;
  }
  
  // Fallback: Date, number, etc.
  const d = dayjs(val);
  return d.isValid() ? d : null;
};

const normalizeGridRows = (rows = []) => {
  return rows.map((row, index) => {
    const rowData = { row_id: index + 1 };
    Object.keys(row).forEach((key) => {
      if (key.startsWith("_")) return;
      let value = row[key] !== undefined && row[key] !== null ? row[key] : "";
      if (dayjs.isDayjs(value)) value = value.format("DD/MM/YYYY");
      rowData[key] = { key, label: key, value };
    });
    return rowData;
  });
};

const buildChildProcessData = (values, systemValues) => {
  const processData = SYSTEM_FIELDS.map((field) => ({ key: field.key, label: field.label, value: systemValues[field.key] || "" }));
  const fieldsToInclude = [
    "shortDescription", "instrumentName", "instrumentId", "location", "make", "model",
    "instrumentRange", "leastCount", "accuracy", "calibrationTestPoints", "operatingRange",
    "envTemperature", "envHumidity", "previousCalibrationDate", "nextCalibrationDate",
    "comments", "attachment"
  ];
  fieldsToInclude.forEach((key) => {
    let value = values[key] !== undefined && values[key] !== null ? values[key] : "";
    if (dayjs.isDayjs(value)) value = value.format("DD/MM/YYYY");
    processData.push({ key, label: FIELD_LABELS[key] || key, value });
  });
  return processData;
};

const CalibrationChild = () => {
  const { processId: urlProcessId } = useParams();
  const [activeTab, setActiveTab] = useState("management");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const { rowData, shortDescription: parentShortDesc, processId: passedProcessId, parentId } = location.state || {};
  const processId = passedProcessId || urlProcessId;
  const { processName, siteName } = location.state || {};

  const [hodUsers, setHodUsers] = useState([]);
  const [qaReviewers, setQaReviewers] = useState([]);
  const [qaApprovers, setQaApprovers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [calibrationResultRows, setCalibrationResultRows] = useState([]);
  const [calibrationResultTest, setCalibrationResultTest] = useState([]);
  const [initiator, setInitiator] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [initiationDepartment, setInitiationDepartment] = useState("");
  const [recordNumber, setRecordNumber] = useState("");
  const [dateOfInitiation, setDateOfInitiation] = useState("");
  const [formInitialValues, setFormInitialValues] = useState({});

  useEffect(() => {
    let isMounted = true;

    console.log("🔍 CalibrationChild location.state:", location.state);

    if (!rowData) {
      toast.error("No data provided for this calibration item.");
      navigate(-1);
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      setEquipmentLoading(true);
      setUsersLoading(true);

      try {
        const [profileRes, recordNumRes, equipmentRes, usersRes] = await Promise.allSettled([
          getProfile(),
          processId ? getRecordNumber(processId) : Promise.resolve(null),
          getAllEquipmentData(),
          getCalibrationUser(),
        ]);

        if (!isMounted) return;

        let profileName = "";
        let profileId = "";
        let profileDeptId = "";
        let profileDeptName = "";
        const now = dayjs().format("DD/MM/YYYY HH:mm:ss");
        let recNum = "";

        if (profileRes.status === "fulfilled" && profileRes.value?.data?.data) {
          const profile = profileRes.value.data.data;
          profileName = profile?.name || "";
          profileId = profile?.id || "";
          profileDeptId = profile?.department?.id || "";
          profileDeptName = profile?.department?.name || "";
          setInitiator(profileName);
          setInitiatorId(profileId);
          setDepartmentId(profileDeptId);
          setInitiationDepartment(profileDeptName);
          setDateOfInitiation(now);
        }

        if (recordNumRes.status === "fulfilled" && recordNumRes.value?.data?.data) {
          recNum = recordNumRes.value.data.data.record_number || "";
          setRecordNumber(recNum);
        } else if (recordNumRes.status === "rejected") {
          console.error("Failed to fetch record number:", recordNumRes.reason);
        }

        if (equipmentRes.status === "fulfilled" && equipmentRes.value?.data?.data) {
          const data = equipmentRes.value.data.data || [];
          const options = data.map((item) => ({ value: item.id, label: item.instrument_name || item.name || "" }));
          const map = {};
          data.forEach((item) => { map[item.id] = item; });
          setEquipmentOptions(options);
          setEquipmentMap(map);
        } else if (equipmentRes.status === "rejected") {
          console.error("Failed to fetch equipment:", equipmentRes.reason);
        }

        if (usersRes.status === "fulfilled" && usersRes.value?.data?.data) {
          const data = usersRes.value.data.data || {};
          setHodUsers(data?.hod || []);
          setQaReviewers(data?.qa_reviewer || []);
          setQaApprovers(data?.qa_approver || []);
        } else if (usersRes.status === "rejected") {
          console.error("Failed to fetch calibration users:", usersRes.reason);
        }

        // ✅ Build values
        const values = {
          documentNumber: "SMLJ/ENG/SOP-GEN/005/F08-02",
          documentType: "Formats",
          recordNumber: recNum,
          initiator: rowData.initiator || profileName,
          dateOfInitiation: rowData.dateOfInitiation || now,
          initiationDepartment: rowData.initiationDepartment || profileDeptName,
          shortDescription: rowData.shortDescription || parentShortDesc || "",
          instrumentName: rowData.equipmentInstrumentName || rowData.instrumentName || "",
          instrumentId: rowData.equipmentInstrumentId || rowData.instrumentId || "",
          location: rowData.location || "",
          make: rowData.make || "",
          model: rowData.model || "",
          instrumentRange: rowData.instrumentrange || rowData.instrumentRange || "",
          leastCount: rowData.leastCount || "",
          accuracy: rowData.accuracy || "",
          calibrationTestPoints: rowData.calibrationTestPoints || "",
          operatingRange: rowData.operatingrange || rowData.operatingRange || "",
          envTemperature: rowData.envTemperature || "",
          envHumidity: rowData.envHumidity || "",
          previousCalibrationDate: toDayjs(rowData.previousCalibrationDate || rowData.plannedDate),
          nextCalibrationDate: toDayjs(rowData.nextCalibrationDate || rowData.calibrationDoneDate),
          comments: rowData.comments || "",
          attachment: rowData.attachment || [],
        };

        console.log("✅ Built form initial values:", values);
        setFormInitialValues(values);
        setCalibrationResultRows(rowData.calibrationResultRows || []);
        setCalibrationResultTest(rowData.calibrationResultTest || []);
      } catch (error) {
        console.error("❌ Failed to load initial data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setEquipmentLoading(false);
          setUsersLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [rowData, processId, parentShortDesc, navigate, location.state]);

  const handleTabChange = (tabId) => {
    if (tabId !== "management") {
      toast.warning("Please fill all mandatory fields and save the record before accessing other tabs.");
      return;
    }
    setActiveTab(tabId);
  };

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
      setActiveTab("management");
      return;
    }
    form.submit();
  };

  const buildFullProcessData = (values) => {
    const systemValues = {
      documentNumber: values.documentNumber || "SMLJ/ENG/SOP-GEN/005/F08-02",
      documentType: values.documentType || "Formats",
      recordNumber: values.recordNumber || recordNumber,
      initiator: values.initiator || initiator,
      dateOfInitiation: values.dateOfInitiation || dateOfInitiation,
      initiationDepartment: values.initiationDepartment || initiationDepartment,
    };
    return buildChildProcessData(values, systemValues);
  };

  const handleSubmit = async (values) => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const processData = buildFullProcessData(values);

      const normalizedCalibrationRows = normalizeGridRows(calibrationResultRows);
      const normalizedTestRows = normalizeGridRows(calibrationResultTest);

      const gridData = [
        { name: "calibrationResults", rows: normalizedCalibrationRows },
        { name: "masterInstrumentsDetails", rows: normalizedTestRows },
      ];

      const initiationDate = values.dateOfInitiation || dateOfInitiation;
      const formattedInitiationDate = dayjs(initiationDate, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");

      const payload = {
        process_id: 5,
        stage_id: 18,
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
        navigate("/user/calibration-management-dashboard");
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
    navigate("/user/calibration-management-dashboard");
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
            <h1 className="text-[22px] font-semibold tracking-tight text-[#263B35]">Create Child Calibration</h1>
          </div>
        </div>
        <div className="flex items-center gap-8 border-l border-slate-200 pl-6">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B8983]">Site</p>
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
        initialValues={formInitialValues}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="w-full [&_.ant-form-item-label>label]:!text-[12px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-explain-error]:!text-[11px]"
      >
        {activeTab === "management" && (
          <section>
            <SectionHeader title="SYSTEM INFORMATION" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {SYSTEM_FIELDS.map((field) => (
                <Form.Item key={field.key} name={field.key} label={field.label} className="!mb-4">
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
              className="!mb-4">
                <FormInput placeholder="Enter short description" />
              </Form.Item>
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />
            <SectionHeader title="INSTRUMENT / EQUIPMENT DETAILS" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {/* ✅ EXACT SEQUENCE MATCHING PANEL */}
              <Form.Item name="previousCalibrationDate" label="Calibration Done Date" className="!mb-4">
                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Select date" disabled />
              </Form.Item>
              <Form.Item name="nextCalibrationDate" label="Calibration Next Due Date" className="!mb-4">
                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Select date" disabled />
              </Form.Item>
              
              <Form.Item name="instrumentName" label="Name" className="!mb-4">
                <FormSelect placeholder="Select Instrument" options={equipmentOptions} />
              </Form.Item>
              <Form.Item name="instrumentId" label="ID No." className="!mb-4">
                <FormInput placeholder="e.g. EQ-001" />
              </Form.Item>
              
              <Form.Item name="make" label="Make" className="!mb-4">
                <FormInput placeholder="e.g. Fluke" />
              </Form.Item>
              <Form.Item name="instrumentRange" label="Instrument Range" className="!mb-4">
                <SymbolicInput placeholder="e.g. 0-1000 V" defaultDiscipline="Range" />
              </Form.Item>
              
              <Form.Item name="model" label="Sr.No/ Model No." className="!mb-4">
                <FormInput placeholder="e.g. 87V" />
              </Form.Item>
              <Form.Item name="operatingRange" label="Operating Range" className="!mb-4">
                <SymbolicInput placeholder="e.g. 0-500 V" defaultDiscipline="Operating Range" />
              </Form.Item>
              
              <Form.Item name="leastCount" label="Least Count" className="!mb-4">
                <SymbolicInput placeholder="e.g. 0.01" defaultDiscipline="Least Count" />
              </Form.Item>
              <Form.Item name="accuracy" label="Accuracy" className="!mb-4">
                <SymbolicInput placeholder="e.g. ±0.5%" defaultDiscipline="Accuracy" />
              </Form.Item>
              
              <Form.Item name="calibrationTestPoints" label="Calibration test points" className="!mb-4">
                <SymbolicInput placeholder="e.g. 0, 50, 100" defaultDiscipline="Test Points" />
              </Form.Item>
              <Form.Item name="location" label="Location" className="!mb-4">
                <FormInput placeholder="Lab A, Room 101" />
              </Form.Item>
              
              <Form.Item name="envTemperature" label="Environmental Condition Temperature" className="!mb-4">
                <SymbolicInput placeholder="e.g. 25" defaultDiscipline="Temperature" />
              </Form.Item>
              <Form.Item name="envHumidity" label="Environmental Condition Relative Humidity" className="!mb-4">
                <SymbolicInput placeholder="e.g. 45% RH ± 5%" defaultDiscipline="Humidity" />
              </Form.Item>
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />
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
            <div className="mt-4">
              <UserDynamicGrid
                name="Master Instruments Details"
                columns={CALIBRATION_RESULT_GRID}
                value={calibrationResultTest}
                onChange={setCalibrationResultTest}
                allowAdd={true}
                allowDelete={true}
                addButtonLabel="Add Parameter"
                minRows={0}
                rowKey="_rowId"
              />
            </div>

            <div className="my-9 h-px w-full bg-slate-200" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="comments" label="Remarks" className="!mb-4 md:col-span-2">
                <FormTextArea rows={4} placeholder="Additional remarks..." />
              </Form.Item>
              <Form.Item
                name="attachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "implementor" && (
          <section>
            <SectionHeader title="HOD / DESIGNEE REVIEW" />
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
                <FormAttachment disabled />
              </Form.Item>
            </div>
          </section>
        )}

        {activeTab === "qa-review" && (
          <section>
            <SectionHeader title="QA APPROVAL REVIEW" />
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <Form.Item name="qaReviewComments" label="Comments" className="!mb-4 md:col-span-2">
                <FormTextArea rows={5} placeholder="Enter QA approval review comments..." />
              </Form.Item>
              <Form.Item
                name="qaReviewAttachment"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="!mb-4 md:col-span-2"
              >
                <FormAttachment disabled />
              </Form.Item>
            </div>
          </section>
        )}
      </Form>

      <FloatingActionButtons onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} saveLabel="Create" cancelLabel="Cancel" />
    </div>
  );
};

export default CalibrationChild;