import React, { useEffect, useState } from "react";
import {
    Activity,
    MapPin,
    Workflow,
} from "lucide-react";
import { Form, Input } from "antd";
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";
import { toast } from "sonner";

import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FormTextArea from "../../../components/common/Form/FormTextArea";
import FormDisabledInput from "../../../components/common/Form/FormDisabledInput";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import FormAttachment from "../../../components/common/Attachment/FormAttachment";

import "../../../components/common/ProcesStageTabs/Scrollerbar.css";

import { getProfile } from "../../../services/authApi";
import {
    getAllEquipmentData,
    getCalibrationUser,
} from "../../../services/usersApi/calibrationApi";

import {
    formatDate,
    formatDateTime,
} from "../../../utils/date";

import {
    addMultipleAttachments,
} from "../../../components/common/Attachment/attachmentApi";

import { getRecordNumber } from "../../../services/usersApi/workflowCommonApi";
import InstrumentCalibrationGrid from "./InstrumentCalibrationGrid";
import { addInstrumentCalibration } from "../../../services/usersApi/instrumentCalibration";

const TABS = [
    { id: "general", label: "General Information" },
    { id: "hod", label: "HOD / Designee Review" },
    { id: "user-dept-review", label: "User Dept Review" },
    { id: "qa-review", label: "QA Approval Review" },
];

const REQUIRED_FIELDS = [{ name: "shortDescription", label: "Short Description" }];

// Updated labels to perfectly match the new grid structure
const GRID_LABELS = {
    equipmentName: "Equipment Name",
    instrumentName: "Instrument Name",
    instrumentId: "Instrument ID No.",
    make: "Make",
    modelNo: "Sr. No./ Model No.",
    leastCount: "Least Count",
    location: "Location",
    accuracy: "Accuracy",
    instrumentRange: "Instrument Range",
    operatingRange: "Operating Range",
    calibrationTestPoint: "Calibration test point",
    category: "*Category",
    calibrationNextDueDate: "Calibration Next Due Date",
    calibrationDoneDate: "Calibration Done Date",
    remark: "Remarks",
};

const normalizeGridRows = (rows = [], equipmentMap = {}) => {
    return rows.map((row, index) => {
        const rowData = { row_id: index + 1 };
        Object.keys(row).forEach((key) => {
            let value = row[key] !== undefined && row[key] !== null ? row[key] : "";
            
            if (key === "equipmentName") {
                const id = value;
                if (id && equipmentMap[id]) {
                    value = equipmentMap[id].instrument_name || equipmentMap[id].name || "";
                } else {
                    value = "";
                }
            } else if (["calibrationNextDueDate", "calibrationDoneDate"].includes(key) && value) {
                value = formatDate(value);
            }
            
            // Map the key to its proper UI label
            rowData[key] = { key, label: GRID_LABELS[key] || key, value };
        });
        return rowData;
    });
};

const buildProcessData = (values, systemFields) => [
    ...systemFields.map((field) => ({
        key: field.name,
        label: field.label,
        value: values?.[field.name] || "",
    })),
    { key: "short_description", label: "Short Description", value: values?.shortDescription || "" },
    { key: "comment", label: "Comments", value: values?.comments || "" },
    { key: "attachment", label: "Attachment", value: [] },
    { key: "year", label: "Year", value: values?.year || "" },
    { key: "block", label: "Block", value: values?.block || "" },
    { key: "area", label: "Area", value: values?.area || "" },
    { key: "hod_review_comments", label: "HOD / Designee Review Comments", value: values?.hodReviewComments || "" },
    { key: "hod_review_attachment", label: "HOD / Designee Review Attachment", value: [] },
    { key: "user_dept_review_comments", label: "User Dept Review Comments", value: values?.userDeptReviewComments || "" },
    { key: "user_dept_review_attachment", label: "User Dept Review Attachment", value: [] },
    { key: "qa_review_comments", label: "QA Review Comments", value: values?.qaReviewComments || "" },
    { key: "qa_review_attachment", label: "QA Review Attachment", value: [] },
];

const validateForm = (form) => {
    const values = form.getFieldsValue();
    return REQUIRED_FIELDS.filter((field) => {
        const value = values?.[field.name];
        if (typeof value === "string") return !value.trim();
        return value === undefined || value === null || value === "";
    });
};

const InstrumentCalibrationCreate = () => {
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
        let isMounted = true;

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
                    generatedRecordNumber = recordNumRes.value.data.data.record_number || "";
                    setRecordNumber(generatedRecordNumber);
                } else if (recordNumRes.status === "rejected") {
                    console.error("Failed to generate record number:", recordNumRes.reason);
                }

                form.setFieldsValue({
                    initiator: userName,
                    initiationDepartment: departmentName,
                    dateOfInitiation,
                    documentNumber: "SMLJ/ENG/SOP-GEN/005/F15-02",
                    documentType: "Formats",
                    recordNumber: generatedRecordNumber,
                });

                if (equipmentRes.status === "fulfilled" && equipmentRes.value?.data?.data) {
                    const data = equipmentRes.value.data.data || [];
                    const options = data.map((item) => ({
                        value: item.id,
                        label: item.instrument_name || item.name || `Instrument ${item.id}`,
                    }));
                    const map = {};
                    data.forEach((item) => { map[item.id] = item; });
                    setEquipmentOptions(options);
                    setEquipmentMap(map);
                }

                if (usersRes.status === "fulfilled" && usersRes.value?.data?.data) {
                    const data = usersRes.value.data.data || {};
                    setHodUsers(data?.hod || []);
                    setQaReviewers(data?.qa_reviewer || []);
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    setEquipmentLoading(false);
                    setUsersLoading(false);
                }
            }
        };

        loadInitialData();

        return () => { isMounted = false; };
    }, [processId, form, dateOfInitiation]);

    const systemFields = [
        { name: "documentNumber", label: "Document Number", value: "SMLJ/ENG/SOP-GEN/005/F15-02" },
        { name: "documentType", label: "Document Type", value: "Formats" },
        { name: "recordNumber", label: "Record Number", value: recordNumber },
        { name: "initiator", label: "Initiator", value: initiator },
        { name: "dateOfInitiation", label: "Date of Initiation", value: dateOfInitiation },
        { name: "initiationDepartment", label: "Initiation Department", value: initiationDepartment },
    ];

    const handleTabChange = (tabId) => {
        if (tabId !== "general") {
            const missingFields = validateForm(form);
            if (missingFields.length > 0) {
                toast.warning("Please complete all mandatory fields in General Information and save the record before accessing the other tabs.");
                setActiveTab("general");
                return;
            }
        }
        setActiveTab(tabId);
    };

    const handleSave = async () => {
        if (isSaving) return;
        const missingFields = validateForm(form);
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
                stage_id: 39,
                department_id: departmentId,
                initiator_id: initiatorId,
                initiator_name: initiator,
                short_description: values?.shortDescription || "",
                initiation_date: dateOfInitiation,
                process_data: processData,
                gridData,
                checklistData: [],
            };

            const response = await addInstrumentCalibration(payload);

            if (response?.data?.success) {
                toast.success("Field Instrument Calibration Addendum record created successfully.");
                form.resetFields();
                setCalibrationRows([]);
                navigate("/user/field-instrument-calibration-addendum-dashboard");
                return;
            }
            toast.error(response?.data?.message || "Failed to create Field Instrument Calibration Addendum record.");
        } catch (error) {
            console.error("Field Instrument Calibration Addendum submission failed:", error);
            toast.error(error?.response?.data?.message || "Failed to create Field Instrument Calibration Addendum record. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (isSaving) return;
        form.resetFields();
        setCalibrationRows([]);
        navigate("/user/field-instrument-calibration-addendum-dashboard");
    };

    return (
        <div className="w-full min-h-full bg-transparent pb-6">
            {/* PAGE HEADER */}
            <header className="mb-4 w-full">
                <div className="flex min-h-[60px] flex-col gap-3 py-1 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[11px] border border-[#C6D8D0] bg-[#E8F0EC] text-[#4F7064]">
                            <Activity size={19} strokeWidth={1.9} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate font-[var(--font-display)] text-[20px] font-bold tracking-[-0.02em] text-[#244F4A]">
                                    Create Field Instrument Calibration Addendum
                                </h1>
                                <span className="hidden rounded-full border border-[#D0BE97] bg-[#F7F0E3] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#896B38] sm:inline-flex">
                                    New Record
                                </span>
                            </div>
                            <p className="mt-0.5 text-[10.5px] font-medium text-[#74857D]">
                                Create and submit a new controlled field instrument calibration addendum record.
                            </p>
                        </div>
                    </div>

                    {/* CONTEXT */}
                    <div className="flex shrink-0 items-center gap-3 rounded-none border-0 bg-transparent px-0 py-0">
                        <div className="flex items-center gap-2 rounded-none bg-transparent px-0 py-0">
                            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#EAF1ED] text-[#58776C]">
                                <MapPin size={12} strokeWidth={1.9} />
                            </span>
                            {/* <div>
                                <p className="font-[var(--font-display)] text-[7.5px] font-extrabold uppercase tracking-[0.12em] text-[#82928B]">Site</p>
                                <p className="max-w-[110px] truncate font-[var(--font-display)] text-[10.5px] font-bold tracking-[-0.01em] text-[#344A43]">
                                    {siteName || "Unit IV"}
                                </p>
                            </div> */}
                        </div>
                        <div className="mx-1 h-7 w-px bg-[#DCE5E0]" />
                        <div className="flex items-center gap-2 rounded-none bg-transparent px-0 py-0">
                            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#EAF1EC] text-[#58776C]">
                                <Workflow size={12} strokeWidth={1.9} />
                            </span>
                            <div>
                                <p className="font-[var(--font-display)] text-[7.5px] font-extrabold uppercase tracking-[0.12em] text-[#82928B]">Process</p>
                                <p className="max-w-[150px] truncate font-[var(--font-display)] text-[10.5px] font-bold tracking-[-0.01em] text-[#344A43]">
                                    {processName || "Field Instrument Calibration Addendum"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* PROCESS TABS */}
            <div className="mb-5">
                <ProcessTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
            </div>

            {/* FORM */}
            <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={handleSubmit}
                className="w-full [&_.ant-form-item-label>label]:!text-[11px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1 [&_.ant-form-item-explain-error]:!text-[10px]"
            >
                {/* GENERAL INFORMATION */}
                {activeTab === "general" && (
                    <>
                        <section className="overflow-hidden bg-transparent shadow-none">
                            <SectionHeader title="GENERAL INFORMATION" />
                            {isLoading ? (
                                <div className="px-4 py-4 sm:px-5">
                                    <Skeleton variant="formskeleton" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-x-8 gap-y-1 px-1 pb-1 pt-4 md:grid-cols-2 md:px-1">
                                    {systemFields.map((field) => (
                                        <Form.Item key={field.name} name={field.name} label={field.label} className="!mb-3">
                                            <FormDisabledInput />
                                        </Form.Item>
                                    ))}
                                    <Form.Item
                                        name="shortDescription"
                                        label={<span>Short Description <span className="text-[#C94B4F]">*</span></span>}
                                        rules={[{ required: true, whitespace: true, message: "Please enter Short Description" }]}
                                        className="!mb-3"
                                    >
                                        <FormInput placeholder="Enter short description" />
                                    </Form.Item>
                                </div>
                            )}
                        </section>

                        {/* FIELD INSTRUMENT INFORMATION */}
                        <section className="overflow-hidden bg-transparent shadow-none">
                            <SectionHeader title="FIELD INSTRUMENT INFORMATION" />
                            <div className="px-1 pb-1 pt-4">
                                <div className="grid grid-cols-1 gap-x-7 md:grid-cols-2">
                                    <Form.Item name="year" label="Year" className="!mb-3">
                                        <Input placeholder="Enter Year" />
                                    </Form.Item>
                                    <Form.Item name="block" label="Block" className="!mb-3">
                                        <Input placeholder="Enter Block" />
                                    </Form.Item>
                                    <Form.Item name="area" label="Area" className="!mb-3">
                                        <Input placeholder="Enter Area" />
                                    </Form.Item>
                                </div>

                                {/* REUSABLE GRID */}
                                <div className="mt-1">
                                    <InstrumentCalibrationGrid
                                        name="Field Instrument Calibration Addendum"
                                        value={calibrationRows}
                                        onChange={setCalibrationRows}
                                        equipmentOptions={equipmentOptions}
                                        equipmentMap={equipmentMap}
                                        equipmentLoading={equipmentLoading}
                                        showAddButton={false}
                                    />
                                </div>

                                {/* COMMENTS */}
                                <Form.Item name="comments" label="Comments" className="!mb-3 mt-4">
                                    <FormTextArea rows={4} placeholder="Enter comments..." />
                                </Form.Item>

                                {/* ATTACHMENT */}
                                <Form.Item name="attachment" label="Attachment" valuePropName="value" className="!mb-0">
                                    <FormAttachment
                                        multiple={true}
                                        recordId={null}
                                        attachmentField="attachment"
                                        label="Attachment"
                                        uploadApi={addMultipleAttachments}
                                        disabled={false}
                                    />
                                </Form.Item>
                            </div>
                        </section>
                    </>
                )}

                {/* HOD REVIEW */}
                {activeTab === "hod" && (
                    <section className="overflow-hidden bg-transparent shadow-none">
                        <SectionHeader title="HOD / DESIGNEE REVIEW (ENGINEERING DEPT)" />
                        <div className="px-1 pb-1 pt-4">
                            <Form.Item name="hodReviewComments" label="Comments" className="!mb-4">
                                <FormTextArea rows={4} placeholder="Enter comments..." />
                            </Form.Item>
                            <Form.Item
                                name="hodReviewAttachment"
                                label="Attachment"
                                valuePropName="value"
                                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                                className="!mb-0"
                            >
                                <FormAttachment
                                    multiple={true}
                                    attachmentField="hod_review_attachment"
                                    label="HOD Review Attachment"
                                    uploadApi={addMultipleAttachments}
                                />
                            </Form.Item>
                        </div>
                    </section>
                )}

                {/* USER DEPARTMENT REVIEW */}
                {activeTab === "user-dept-review" && (
                    <section className="overflow-hidden bg-transparent shadow-none">
                        <SectionHeader title="USER DEPARTMENT REVIEW (USER DEPT)" />
                        <div className="px-1 pb-1 pt-4">
                            <Form.Item name="userDeptReviewComments" label="Comments" className="!mb-4">
                                <FormTextArea rows={4} placeholder="Enter comments..." />
                            </Form.Item>
                            <Form.Item
                                name="userDeptReviewAttachment"
                                label="Attachment"
                                valuePropName="value"
                                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                                className="!mb-0"
                            >
                                <FormAttachment
                                    multiple={true}
                                    attachmentField="user_dept_review_attachment"
                                    label="User Dept Review Attachment"
                                    uploadApi={addMultipleAttachments}
                                />
                            </Form.Item>
                        </div>
                    </section>
                )}

                {/* QA REVIEW */}
                {activeTab === "qa-review" && (
                    <section className="overflow-hidden bg-transparent shadow-none">
                        <SectionHeader title="QA APPROVAL REVIEW" />
                        <div className="px-1 pb-1 pt-4">
                            <Form.Item name="qaReviewComments" label="Comments" className="!mb-4">
                                <FormTextArea rows={4} placeholder="Enter comments..." />
                            </Form.Item>
                            <Form.Item
                                name="qaReviewAttachment"
                                label="Attachment"
                                valuePropName="value"
                                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                                className="!mb-0"
                            >
                                <FormAttachment
                                    multiple={true}
                                    attachmentField="qa_review_attachment"
                                    label="QA Review Attachment"
                                    uploadApi={addMultipleAttachments}
                                />
                            </Form.Item>
                        </div>
                    </section>
                )}
            </Form>

            {/* FLOATING ACTIONS */}
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

export default InstrumentCalibrationCreate;