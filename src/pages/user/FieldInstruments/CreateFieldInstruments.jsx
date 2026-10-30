import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import FormInput from "../../../components/common/Form/FormInput";
import FormTextArea from "../../../components/common/Form/FormTextArea";
import FormAttachment from "../../../components/common/Attachment/FormAttachment";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import { addFieldInstrument } from "../../../services/usersApi/equipmentApi";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import ChecklistConfigField from "./ChecklistConfigField";
import { getProfile } from "../../../services/authApi";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";

/* ───────────────────────── Tabs config ───────────────────────── */

const TABS = [
    { id: "instrument", label: "Field Instrument Information" },
    { id: "checklist", label: "Checklist Configuration" },
    { id: "hod", label: "HOD / Designee Review (Engineering Dept)" },
    { id: "qa-review", label: "QA Approval Review" },
];

/* ───────────────────────── Required fields for tab validation ───────────────────────── */

const REQUIRED_FIELDS = [
    { name: "equipment_name", label: "Equipment Name" },
    { name: "instrument_name", label: "Instrument Name" },
    { name: "instrument_id_no", label: "Instrument ID No." },
    { name: "make", label: "Make" },
    { name: "sr_no_model_no", label: "Sr. No. / Model No." },
    { name: "least_count", label: "Least Count" },
    { name: "location", label: "Location" },
    { name: "accuracy", label: "Accuracy" },
    { name: "instrument_range", label: "Instrument Range" },
    { name: "operating_range", label: "Operating Range" },
    { name: "calibration_test_points", label: "Calibration Test Points" },
    { name: "category", label: "Category" },
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

const CreateFieldInstruments = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);
    const [checklistConfig, setChecklistConfig] = useState(EMPTY_CHECKLIST);
    const [activeTab, setActiveTab] = useState("instrument");

        const [loginUserId, setLoginUserId] = useState("");
        
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
    
    

    /* ───────── Tab switch with validation ───────── */

    const handleTabChange = (tabId) => {
        const RESTRICTED_TABS = ["hod", "qa-review"];

        if (RESTRICTED_TABS.includes(tabId)) {
            const missingFields = validateInstrumentForm(form);

            if (missingFields.length > 0) {
                toast.warning(
                    "Please complete all mandatory fields in Field Instrument Information before accessing the other tabs."
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

                    const isSelection = SELECTION_TYPES.includes(
                        cell.field_type
                    );

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
                        nextCell.checkbox_variant =
                            cell.checkbox_variant || "normal";

                        if (nextCell.checkbox_variant === "esign") {
                            nextCell.esign_type =
                                cell.esign_type || "simple";
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
            include_serial_number:
                checklistConfig.include_serial_number !== false,
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

        /* ───────── Submit ───────── */

        try {
            setIsSaving(true);

            const payload = {
                equipment_name: values.equipment_name.trim(),
                instrument_name: values.instrument_name.trim(),
                instrument_id_no: values.instrument_id_no.trim(),
                make: values.make.trim(),
                sr_no_model_no: values.sr_no_model_no.trim(),
                least_count: values.least_count.trim(),
                location: values.location.trim(),
                accuracy: values.accuracy.trim(),
                instrument_range: values.instrument_range.trim(),
                operating_range: values.operating_range.trim(),
                calibration_test_points:
                    values.calibration_test_points.trim(),
                category: values.category.trim(),
                checklist_config: cleanedChecklistConfig,
                stage_id: 28 || null,
                process_id: 6 || null,
                initiator_id: loginUserId || null, 

                /* Review fields */
                hod_review_comments: values.hodReviewComments || "",
                hod_review_attachment: values.hodReviewAttachment || [],
                qa_review_comments: values.qaReviewComments || "",
                qa_review_attachment: values.qaReviewAttachment || [],
            };


            await addFieldInstrument(payload);

            toast.success("Field instrument created successfully.");

            form.resetFields();
            setChecklistConfig({ ...EMPTY_CHECKLIST });
            setActiveTab("instrument");

            navigate("/user/field-instruments-dashboard");
        } catch (error) {
            console.error("Failed to create field instrument:", error);

            toast.error(
                error?.response?.data?.message ||
                    "Failed to create field instrument. Please try again."
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

        navigate("/user/field-instruments-dashboard");
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
                            Field Instrument
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

            {/* ═══════════════ FORM (wraps instrument, HOD, QA tabs) ═══════════════ */}

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
                {/* ─────────── TAB 1: FIELD INSTRUMENT INFORMATION ─────────── */}

                {activeTab === "instrument" && (
                    <section>
                        <SectionHeader title="FIELD INSTRUMENT INFORMATION" />

                        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                            {/* EQUIPMENT NAME */}
                            <Form.Item
                                name="equipment_name"
                                label={
                                <span className="inline-flex items-center">
                                    Equipment Name
                                    <RequiredAsterisk message="Equipment Name is required. Please enter the equipment name." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter equipment name",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter equipment name" />
                            </Form.Item>

                            {/* INSTRUMENT NAME */}
                            <Form.Item
                                name="instrument_name"
                               label={
                                <span className="inline-flex items-center">
                                    Instrument Name
                                    <RequiredAsterisk message="Instrument Name is required. Please enter the instrument name." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter instrument name",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter instrument name" />
                            </Form.Item>

                            {/* INSTRUMENT ID NO. */}
                            <Form.Item
                                name="instrument_id_no"
                                label={
                                <span className="inline-flex items-center">
                                    Instrument ID No.
                                    <RequiredAsterisk message="Instrument ID No. is required. Please enter the instrument ID number." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message:
                                            "Please enter instrument ID No.",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter instrument ID No." />
                            </Form.Item>

                            {/* MAKE */}
                            <Form.Item
                                name="make"
                                label={
                                <span className="inline-flex items-center">
                                    Make
                                    <RequiredAsterisk message="Make is required. Please enter the instrument make." />
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

                            {/* SR. NO. / MODEL NO. */}
                            <Form.Item
                                name="sr_no_model_no"
                                label={
                                <span className="inline-flex items-center">
                                    Sr. No. / Model No.
                                    <RequiredAsterisk message="Sr. No. / Model No. is required. Please enter the serial or model number." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message:
                                            "Please enter Sr. No. / Model No.",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter Sr. No. / Model No." />
                            </Form.Item>

                            {/* LEAST COUNT */}
                            <Form.Item
                                name="least_count"
                                label={
                                <span className="inline-flex items-center">
                                    Least Count
                                    <RequiredAsterisk message="Least Count is required. Please enter the least count." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter least count",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter least count" />
                            </Form.Item>

                            {/* LOCATION */}
                            <Form.Item
                                name="location"
                                label={
                                <span className="inline-flex items-center">
                                    Location
                                    <RequiredAsterisk message="Location is required. Please enter the instrument location." />
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

                            {/* ACCURACY */}
                            <Form.Item
                                name="accuracy"
                                label={
                                <span className="inline-flex items-center">
                                    Accuracy
                                    <RequiredAsterisk message="Accuracy is required. Please enter the instrument accuracy." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter accuracy",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter accuracy" />
                            </Form.Item>

                            {/* INSTRUMENT RANGE */}
                            <Form.Item
                                name="instrument_range"
                                label={
                                <span className="inline-flex items-center">
                                    Instrument Range
                                    <RequiredAsterisk message="Instrument Range is required. Please enter the instrument range." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message:
                                            "Please enter instrument range",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter instrument range" />
                            </Form.Item>

                            {/* OPERATING RANGE */}
                            <Form.Item
                                name="operating_range"
                                label={
                                <span className="inline-flex items-center">
                                    Operating Range
                                    <RequiredAsterisk message="Operating Range is required. Please enter the operating range." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message:
                                            "Please enter operating range",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter operating range" />
                            </Form.Item>

                            {/* CALIBRATION TEST POINTS */}
                            <Form.Item
                                name="calibration_test_points"
                                label={
                                <span className="inline-flex items-center">
                                    Calibration Test Points
                                    <RequiredAsterisk message="Calibration Test Points are required. Please enter the calibration test points." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message:
                                            "Please enter calibration test points",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter calibration test points" />
                            </Form.Item>

                            {/* CATEGORY */}
                            <Form.Item
                                name="category"
                                label={
                                <span className="inline-flex items-center">
                                    Category
                                    <RequiredAsterisk message="Category is required. Please enter the category." />
                                </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter category",
                                    },
                                ]}
                                className="!mb-4"
                            >
                                <FormInput placeholder="Enter category" />
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
                                <FormTextArea
                                    rows={4}
                                    placeholder="Enter comments..."
                                />
                            </Form.Item>

                            <Form.Item
                                name="hodReviewAttachment"
                                label="Attachment"
                                valuePropName="fileList"
                                getValueFromEvent={(event) =>
                                    Array.isArray(event)
                                        ? event
                                        : event?.fileList
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
                                <FormTextArea
                                    rows={4}
                                    placeholder="Enter comments..."
                                />
                            </Form.Item>

                            <Form.Item
                                name="qaReviewAttachment"
                                label="Attachment"
                                valuePropName="fileList"
                                getValueFromEvent={(event) =>
                                    Array.isArray(event)
                                        ? event
                                        : event?.fileList
                                }
                                className="!mb-0"
                            >
                                <FormAttachment disabled />
                            </Form.Item>
                        </div>
                    </section>
                )}
            </Form>

            {/* ═══════════════ TAB 2: CHECKLIST CONFIGURATION (outside Form) ═══════════════ */}

            {activeTab === "checklist" && (
                <ChecklistConfigField
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

export default CreateFieldInstruments;