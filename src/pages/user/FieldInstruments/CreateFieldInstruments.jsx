import React, { useState } from "react";
import { Activity } from "lucide-react";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import FormInput from "../../../components/common/Form/FormInput";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import { addFieldInstrument } from "../../../services/usersApi/equipmentApi";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import ChecklistConfigField from "./ChecklistConfigField";

/* ───────────────────────── Tabs config ───────────────────────── */

const TABS = [
    { id: "instrument", label: "Field Instrument Information" },
    { id: "checklist", label: "Checklist Configuration" },
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

/* ───────────────────────── Component ───────────────────────── */

const CreateFieldInstruments = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);
    const [checklistConfig, setChecklistConfig] = useState(EMPTY_CHECKLIST);
    const [activeTab, setActiveTab] = useState("instrument");

    /* ───────── Tab switch (free navigation) ───────── */

    const handleTabChange = (tabId) => {
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
            };

            console.log("Create Field Instrument Payload:", payload);

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

            {/* ═══════════════ TAB 1: FIELD INSTRUMENT INFORMATION ═══════════════ */}

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
                <div
                    style={{
                        display:
                            activeTab === "instrument" ? "block" : "none",
                    }}
                >
                    <section>
                        <SectionHeader title="FIELD INSTRUMENT INFORMATION" />

                        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                            {/* EQUIPMENT NAME */}
                            <Form.Item
                                name="equipment_name"
                                label={
                                    <span>
                                        Equipment Name{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Instrument Name{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Instrument ID No.{" "}
                                        <span className="text-red-500">*</span>
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Please enter instrument ID No.",
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
                                    <span>
                                        Make{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Sr. No. / Model No.{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Least Count{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Location{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Accuracy{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Instrument Range{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Operating Range{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Calibration Test Points{" "}
                                        <span className="text-red-500">*</span>
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
                                    <span>
                                        Category{" "}
                                        <span className="text-red-500">*</span>
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
                </div>
            </Form>

            {/* ═══════════════ TAB 2: CHECKLIST CONFIGURATION ═══════════════ */}

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