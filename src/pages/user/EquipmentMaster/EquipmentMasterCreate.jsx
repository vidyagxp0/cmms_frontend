import React, { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { Form, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import FormInput from "../../../components/common/Form/FormInput";
import FormTextArea from "../../../components/common/Form/FormTextArea";
import FormAttachment from "../../../components/common/Attachment/FormAttachment";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import { getProfile } from "../../../services/authApi";
import { getAllDepartments } from "../../../services/usersApi/workflowCommonApi";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";
import ChecklistConfiguration from "../../../components/checklist/ChecklistConfig";
import { addEquipmentMaster } from "../../../services/usersApi/equipmentApi";

/* ───────────────────────── Tabs config ───────────────────────── */

const TABS = [
    { id: "instrument", label: "General Information" },
    { id: "checklist", label: "Checklist Configuration" },
    { id: "hod", label: "HOD / Designee Review (Engineering Dept)" },
    { id: "qa-review", label: "QA Approval Review" },
];

/* ───────────────────────── Required fields for tab validation ───────────────────────── */

const REQUIRED_FIELDS = [
    { name: "department_id",    label: "Department" },
    { name: "instrument_name",  label: "Equipment / Instrument Name" },
    { name: "instrument_id_no", label: "Equipment / Instrument Code Number" },
    { name: "location",         label: "Location" },
    { name: "asset_code",       label: "Asset Code" },
    { name: "make",             label: "Make" },
    { name: "model",            label: "Model" },
    { name: "capacity",         label: "Capacity" },
];

const EMPTY_CHECKLIST = {
    checklist_name: "",
    include_serial_number: true,
    question_columns: [],
    data_columns: [],
    questions: [],
    note: {
        heading: "Note:",
        include_serial_number: true,
        items: [],
    },
};

const SELECTION_TYPES = [
    "single_select",
    "multi_select",
    "single_select_checkbox",
    "multi_select_checkbox",
];

/* ───────────────────────── Validation helper ───────────────────────── */

const validateInstrumentForm = (form) => {
    const values = form.getFieldsValue();

    return REQUIRED_FIELDS.filter((field) => {
        const value = values?.[field.name];

        if (typeof value === "string") {
            return !value.trim();
        }

        return value === undefined || value === null || value === "";
    });
};

/* ───────────────────────── Component ───────────────────────── */

const EquipmentMasterCreate = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);
    const [checklistConfig, setChecklistConfig] = useState(EMPTY_CHECKLIST);
    const [activeTab, setActiveTab] = useState("instrument");
    const [loginUserId, setLoginUserId] = useState("");

    /* ───────── Profile ───────── */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                const profile = response?.data?.data;
                if (!profile) return;
                setLoginUserId(profile?.id || "");
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, []);

    /* ───────── Departments dropdown ───────── */
    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchDepartments = async () => {
            setDepartmentsLoading(true);
            try {
                const response = await getAllDepartments();
                const data = response?.data?.data ?? [];
                if (isMounted) {
                    setDepartments(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Failed to fetch departments:", error);
                if (isMounted) setDepartments([]);
            } finally {
                if (isMounted) setDepartmentsLoading(false);
            }
        };

        fetchDepartments();
        return () => {
            isMounted = false;
        };
    }, []);

    const departmentOptions = useMemo(
        () =>
            departments.map((dept, idx) => ({
                label:
                    dept.name ||
                    dept.department_name ||
                    dept.dept_name ||
                    "Unnamed Department",
                value:
                    dept.id ||
                    dept.department_id ||
                    dept.dept_id ||
                    idx,
            })),
        [departments]
    );

    /* ───────── Tab switch with validation ───────── */

    const handleTabChange = (tabId) => {
        const RESTRICTED_TABS = ["hod", "qa-review"];

        if (RESTRICTED_TABS.includes(tabId)) {
            const missingFields = validateInstrumentForm(form);

            if (missingFields.length > 0) {
                toast.warning(
                    "Please complete all mandatory fields in General Information and save the record before accessing the other tabs."
                );

                setActiveTab("instrument");
                return;
            }
        }

        setActiveTab(tabId);
    };

    /* ───────── Submit ───────── */

    const handleSubmit = async (values) => {
        if (isSaving) return;

        const questionColumnIdMap = {};
        const dataColumnIdMap = {};

        const cleanedQuestionColumns = checklistConfig.question_columns
            .filter((column) => column?.column_header?.trim() !== "")
            .map((column, idx) => {
                const newId = idx + 1;
                questionColumnIdMap[column.id] = newId;

                return {
                    id: newId,
                    column_header: column.column_header.trim(),
                };
            });

        const cleanedDataColumns = checklistConfig.data_columns
            .filter((column) => column?.column_header?.trim() !== "")
            .map((column, idx) => {
                const newId = idx + 1;
                dataColumnIdMap[column.id] = newId;

                return {
                    id: newId,
                    column_header: column.column_header.trim(),
                };
            });

        let questionCounter = 0;

        const cleanedQuestions = checklistConfig.questions
            .map((row) => {
                const questionValues = {};
                let hasAny = false;

                checklistConfig.question_columns.forEach((col) => {
                    const newColId = questionColumnIdMap[col.id];
                    if (!newColId) return;

                    const v = row.values?.[col.id]?.trim() || "";
                    if (v) hasAny = true;
                    questionValues[newColId] = v;
                });

                if (!hasAny) return null;

                const data_cells = {};

                checklistConfig.data_columns.forEach((col) => {
                    const newColId = dataColumnIdMap[col.id];
                    if (!newColId) return;

                    const cell = row.data_cells?.[col.id] || {
                        field_type: "text",
                        options: [],
                    };

                    const isSelection = SELECTION_TYPES.includes(cell.field_type);

                    const nextCell = {
                        field_type: cell.field_type || "text",
                        required: cell.required === true,
                        options: isSelection
                            ? (cell.options || [])
                                  .filter((o) => o?.value?.trim())
                                  .map((o, optIdx) => ({
                                      id: optIdx + 1,
                                      value: o.value.trim(),
                                  }))
                            : [],
                    };

                    if (cell.field_type === "checkbox") {
                        nextCell.checkbox_variant = cell.checkbox_variant || "normal";
                        if (nextCell.checkbox_variant === "esign") {
                            nextCell.esign_type = cell.esign_type || "simple";
                        }
                    }

                    data_cells[newColId] = nextCell;
                });

                questionCounter += 1;

                return {
                    id: questionCounter,
                    values: questionValues,
                    data_cells,
                    frequency_enabled: row.frequency_enabled !== false,
                    frequency: row.frequency || "",
                };
            })
            .filter(Boolean);

        const cleanedChecklistConfig = {
            checklist_name: checklistConfig.checklist_name?.trim() || "",
            include_serial_number: checklistConfig.include_serial_number !== false,
            question_columns: cleanedQuestionColumns,
            data_columns: cleanedDataColumns,
            questions: cleanedQuestions,

            notes: {
                heading: checklistConfig.note?.heading?.trim() || "",
                include_serial_number:
                    checklistConfig.note?.include_serial_number !== false,
                items: (checklistConfig.note?.items || [])
                    .filter((it) => it?.value?.trim())
                    .map((it, idx) => ({
                        id: idx + 1,
                        value: it.value.trim(),
                    })),
            },
        };

        /* ── Resolve department name for payload ── */
        const selectedDeptOption = departmentOptions.find(
            (opt) => String(opt.value) === String(values.department_id)
        );
        const selectedDepartmentName = selectedDeptOption?.label || "";

        /* ───────── Submit ───────── */

        try {
            setIsSaving(true);

            const payload = {
                department_id: values.department_id ?? null,
                department_name: selectedDepartmentName,

                equipment_name: values.instrument_name.trim(),
                equipment_id_no: values.instrument_id_no.trim(),
                equipment_make: values.make.trim(),
                equipment_model: values.model.trim(),
                equipment_location: values.location.trim(),
                asset_code: values.asset_code.trim(),
                capacity: values.capacity.trim(),

                checklist_config: cleanedChecklistConfig,
                stage_id: 50 || null,
                process_id: 10 || null,
                initiator_id: loginUserId || null,

                hod_review_comments: values.hodReviewComments || null,
                hod_review_attachment: values.hodReviewAttachment || null,
                qa_review_comments: values.qaReviewComments || null,
                qa_review_attachment: values.qaReviewAttachment || null,
            };

            await addEquipmentMaster(payload);

            toast.success("Equipment Master created successfully.");

            form.resetFields();
            setChecklistConfig({ ...EMPTY_CHECKLIST });
            setActiveTab("instrument");

            navigate("/user/equipment-master-dashboard");
        } catch (error) {
            console.error("Failed to create equipment master:", error);

            toast.error(
                error?.response?.data?.message ||
                    "Failed to create Equipment Master. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    /* ───────── Cancel ───────── */

    const handleCancel = () => {
        if (isSaving) return;

        form.resetFields();
        setChecklistConfig({ ...EMPTY_CHECKLIST });
        setActiveTab("instrument");

        navigate("/user/equipment-master-dashboard");
    };

    return (
        <div className="w-full">
            {/* ═══════════════ HEADER ═══════════════ */}

            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Activity size={20} />
                        </div>

                        <h1 className="text-[22px] font-semibold tracking-tight text-[#263B35]">
                            Equipment Master
                        </h1>
                    </div>
                </div>
            </div>

            {/* ═══════════════ TABS ═══════════════ */}

            <div className="mb-5">
                <ProcessTabs
                    tabs={TABS}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
            </div>

            {/* ═══════════════ FORM ═══════════════ */}

            <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={handleSubmit}
                className="
                    w-full
                    [&_.ant-form-item-label>label]:!text-[12px]
                    [&_.ant-form-item-label>label]:!font-semibold
                    [&_.ant-form-item-label]:!pb-1.5
                    [&_.ant-form-item-explain-error]:!text-[11px]
                "
            >
                {/* ─────────── TAB 1: GENERAL INFORMATION ─────────── */}

                {activeTab === "instrument" && (
                    <section>
                        <SectionHeader title="GENERAL INFORMATION" />

                        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">

                            {/* SELECT DEPARTMENT */}
                            <Form.Item
                                name="department_id"
                                label={
                                    <span className="inline-flex items-center">
                                        Select Department
                                        <RequiredAsterisk message="Department is required. Please select a department." />
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a department",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <Select
                                    placeholder="Select a department"
                                    options={departmentOptions}
                                    loading={departmentsLoading}
                                    showSearch
                                    optionFilterProp="label"
                                    allowClear={false}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            {/* EQUIPMENT / INSTRUMENT NAME */}
                            <Form.Item
                                name="instrument_name"
                                label={
                                    <span className="inline-flex items-center">
                                        Equipment / Instrument Name
                                        <RequiredAsterisk message="Equipment / Instrument Name is required." />
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter equipment / instrument name",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter equipment / instrument name" />
                            </Form.Item>

                            {/* EQUIPMENT / INSTRUMENT CODE NUMBER */}
                            <Form.Item
                                name="instrument_id_no"
                                label={
                                    <span className="inline-flex items-center">
                                        Equipment / Instrument Code Number
                                        <RequiredAsterisk message="Equipment / Instrument Code Number is required." />
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter equipment / instrument code number",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter equipment / instrument code number" />
                            </Form.Item>

                            {/* LOCATION */}
                            <Form.Item
                                name="location"
                                label={
                                    <span className="inline-flex items-center">
                                        Location
                                        <RequiredAsterisk message="Location is required." />
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter location",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter location" />
                            </Form.Item>

                            {/* ASSET CODE */}
                            <Form.Item
                                name="asset_code"
                                label={
                                    <span className="inline-flex items-center">
                                        Asset Code
                                        <RequiredAsterisk message="Asset Code is required." />
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter Asset Code",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter Asset Code" />
                            </Form.Item>

                            {/* MAKE */}
                            <Form.Item
                                name="make"
                                label={
                                    <span className="inline-flex items-center">
                                        Make
                                        <RequiredAsterisk message="Make is required." />
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter make",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter make" />
                            </Form.Item>

                            {/* MODEL */}
                            <Form.Item
                                name="model"
                                label={
                                    <span className="inline-flex items-center">
                                        Model
                                        <RequiredAsterisk message="Model is required." />
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter model",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter model" />
                            </Form.Item>

                            {/* CAPACITY */}
                            <Form.Item
                                name="capacity"
                                label={
                                    <span className="inline-flex items-center">
                                        Capacity
                                        <RequiredAsterisk message="Capacity is required." />
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter capacity",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter capacity" />
                            </Form.Item>
                        </div>
                    </section>
                )}

                {/* ─────────── TAB 3: HOD REVIEW ─────────── */}

                {activeTab === "hod" && (
                    <section>
                        <SectionHeader title="HOD / DESIGNEE REVIEW (ENGINEERING DEPT)" />

                        <div className="px-1 pb-1 pt-4">
                            <Form.Item
                                name="hodReviewComments"
                                label="Comments"
                                className="!mb-4"
                            >
                                <FormTextArea rows={4} placeholder="Enter comments..." />
                            </Form.Item>

                            <Form.Item
                                name="hodReviewAttachment"
                                label="Attachment"
                                valuePropName="fileList"
                                getValueFromEvent={(event) =>
                                    Array.isArray(event) ? event : event?.fileList
                                }
                                className="!mb-0"
                            >
                                <FormAttachment disabled />
                            </Form.Item>
                        </div>
                    </section>
                )}

                {/* ─────────── TAB 4: QA REVIEW ─────────── */}

                {activeTab === "qa-review" && (
                    <section>
                        <SectionHeader title="QA APPROVAL REVIEW" />

                        <div className="px-1 pb-1 pt-4">
                            <Form.Item
                                name="qaReviewComments"
                                label="Comments"
                                className="!mb-4"
                            >
                                <FormTextArea rows={4} placeholder="Enter comments..." />
                            </Form.Item>

                            <Form.Item
                                name="qaReviewAttachment"
                                label="Attachment"
                                valuePropName="fileList"
                                getValueFromEvent={(event) =>
                                    Array.isArray(event) ? event : event?.fileList
                                }
                                className="!mb-0"
                            >
                                <FormAttachment disabled />
                            </Form.Item>
                        </div>
                    </section>
                )}
            </Form>

            {/* ═══════════════ TAB 2: CHECKLIST CONFIGURATION ═══════════════ */}

            {activeTab === "checklist" && (
                <ChecklistConfiguration
                    value={checklistConfig}
                    onChange={setChecklistConfig}
                    description="Build a flexible multi-question inspection checklist with configurable response fields."
                />
            )}

            {/* ═══════════════ FLOATING ACTIONS ═══════════════ */}

            <FloatingActionButtons
                onSave={() => form.submit()}
                onCancel={handleCancel}
                isSaving={isSaving}
                saveLabel="Create"
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default EquipmentMasterCreate;