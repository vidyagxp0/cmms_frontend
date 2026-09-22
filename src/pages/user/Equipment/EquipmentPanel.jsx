import React, { useEffect, useState } from "react";
import {
  Activity,
  Wrench,
  Hash,
  Factory,
  Cpu,
  Layers3,
} from "lucide-react";
import { Form } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import ChecklistConfiguration from "./ChecklistConfig";
import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";

import {
  getEquipmentDetail,
  updateEquipment,
} from "../../../services/usersApi/equipmentApi";

/* ───────────────────────── Tabs config ───────────────────────── */

const TABS = [
  { id: "equipment", label: "Equipment Information" },
  { id: "checklist", label: "Checklist Configuration" },
];

const EMPTY_CHECKLIST = {
  checklist_name: "",
  include_serial_number: true,
  question_columns: [],
  data_columns: [],
  questions: [],
};

const SELECTION_TYPES = [
  "single_select",
  "multi_select",
  "single_select_checkbox",
  "multi_select_checkbox",
];

/* ───────────────────────── Helpers ───────────────────────── */

const normalizeIncomingChecklist = (raw) => {
  if (!raw) return { ...EMPTY_CHECKLIST };

  /* New shape already */
  if (
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    (raw.question_columns || raw.data_columns || raw.questions)
  ) {
    return {
      checklist_name: raw.checklist_name || "",
      include_serial_number: raw.include_serial_number !== false,
      question_columns: Array.isArray(raw.question_columns)
        ? raw.question_columns.map((c, i) => ({
            id: c.id ?? `qc-${i}`,
            column_header: c.column_header || "",
          }))
        : [],
      data_columns: Array.isArray(raw.data_columns)
        ? raw.data_columns.map((c, i) => ({
            id: c.id ?? `dc-${i}`,
            column_header: c.column_header || "",
          }))
        : [],
      questions: Array.isArray(raw.questions)
        ? raw.questions.map((q, i) => ({
            id: q.id ?? `q-${i}`,
            values: q.values || {},
            data_cells:
              q.data_cells && typeof q.data_cells === "object"
                ? Object.fromEntries(
                    Object.entries(q.data_cells).map(([colId, cell], ci) => {
                      const base = {
                        field_type: cell?.field_type || "text",
                        options: Array.isArray(cell?.options)
                          ? cell.options.map((o, oi) =>
                              typeof o === "string"
                                ? { id: `opt-${i}-${ci}-${oi}`, value: o }
                                : {
                                    id: o.id ?? `opt-${i}-${ci}-${oi}`,
                                    value: o.value || "",
                                  }
                            )
                          : [],
                      };

                      if (base.field_type === "checkbox") {
                        base.checkbox_variant =
                          cell?.checkbox_variant || "normal";
                        if (base.checkbox_variant === "esign") {
                          base.esign_type = cell?.esign_type || "simple";
                        }
                      }

                      return [colId, base];
                    })
                  )
                : {},
            frequency_enabled: q.frequency_enabled !== false,
            frequency: q.frequency || "",
          }))
        : [],
    };
  }

  /* Legacy shape: [{ category, checkpoints: [string, ...] }, ...] */
  if (Array.isArray(raw)) {
    const questionColumns = [
      { id: "qc-1", column_header: "Question" },
    ];

    const questions = [];
    raw.forEach((cat, catIdx) => {
      (cat.checkpoints || []).forEach((cp, cpIdx) => {
        const text = typeof cp === "string" ? cp : cp?.text || "";
        if (!text.trim()) return;
        questions.push({
          id: `q-${catIdx}-${cpIdx}`,
          values: { "qc-1": text },
          data_cells: {},
        });
      });
    });

    return {
      checklist_name: "",
      include_serial_number: true,
      question_columns: questionColumns,
      data_columns: [],
      questions,
    };
  }

  return { ...EMPTY_CHECKLIST };
};

/* ───────────────────────── Component ───────────────────────── */

const EquipmentPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("equipment");

  const [checklistConfig, setChecklistConfig] = useState(EMPTY_CHECKLIST);

  /* ───────── Fetch detail ───────── */
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        toast.error("Equipment ID is missing.");
        navigate(-1);
        return;
      }

      try {
        setIsLoading(true);

        const response = await getEquipmentDetail(id);
        const data = response?.data?.data;

        if (!data) {
          toast.error("Equipment not found.");
          navigate(-1);
          return;
        }

        form.setFieldsValue({
          name: data.name || "",
          equipment_id: data.equipment_id || "",
          make: data.make || "",
          model: data.model || "",
          equipment_type: data.equipment_type || "",
        });

        setChecklistConfig(normalizeIncomingChecklist(data.checklist_config));
      } catch (error) {
        console.error("Failed to fetch equipment detail:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load equipment details."
        );
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id, form, navigate]);

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
        const values = {};
        let hasAny = false;

        checklistConfig.question_columns.forEach((col) => {
          const newColId = questionColumnIdMap[col.id];
          if (!newColId) return;

          const v = row.values?.[col.id]?.trim() || "";
          if (v) hasAny = true;

          values[newColId] = v;
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
          values,
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
    };

    /* ── Submit ── */
    try {
      setIsSaving(true);

      const payload = {
        name: values.name.trim(),
        equipment_id: values.equipment_id.trim(),
        make: values.make.trim(),
        model: values.model.trim(),
        equipment_type: values.equipment_type.trim(),
        checklist_config: cleanedChecklistConfig,
      };

      await updateEquipment(id, payload);

      toast.success("Equipment updated successfully.");
    } catch (error) {
      console.error("Failed to update equipment:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update equipment. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    navigate("/user/equipment-dashboard");
  };

  /* ───────── Loading state ───────── */
  if (isLoading) {
    return (
      <div className="w-full min-h-full bg-[var(--color-background)] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl space-y-5">
          <Skeleton variant="title" className="w-full" />
          <Skeleton variant="form" fields={6} />
        </div>
      </div>
    );
  }

  /* ───────── Render ───────── */
  return (
    <div className="min-h-full w-full bg-[var(--color-background)] px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* ═══════════════ HEADER ═══════════════ */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] border border-[#C7D8D2] bg-[#E8F0ED] text-[#56766D] shadow-[0_2px_8px_rgba(86,118,109,0.06)]">
              <Wrench size={19} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[22px] font-bold tracking-[-0.035em] text-[var(--color-text-primary)]">
                  Equipment Details
                </h1>
                <span className="hidden h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--color-secondary)] sm:block" />
              </div>
              <p className="mt-0.5 text-[10.5px] font-medium text-[var(--color-text-secondary)]">
                Review and maintain the configuration of this equipment asset.
              </p>
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

        {/* ═══════════════ TAB 1: EQUIPMENT INFORMATION ═══════════════ */}
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          className="
            w-full

            [&_.ant-form-item-label>label]:!text-[10.5px]
            [&_.ant-form-item-label>label]:!font-bold
            [&_.ant-form-item-label>label]:!uppercase
            [&_.ant-form-item-label>label]:!tracking-[0.07em]
            [&_.ant-form-item-label]:!pb-1.5

            [&_.ant-form-item-explain-error]:!text-[10.5px]
            [&_.ant-form-item-required::before]:!text-[#B54A4A]
            [&_.ant-input]:!rounded-[10px]
          "
        >
          <div
            style={{
              display: activeTab === "equipment" ? "block" : "none",
            }}
          >
            <section className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_5px_20px_rgba(36,50,56,0.055)]">
              <div className="h-[3px] w-full bg-[var(--color-primary)]" />

              {/* SECTION HEADER */}
              <div className="border-b border-[var(--color-border-soft)] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[9px] border border-[#C9D9D3] bg-[#E8F0ED] text-[#56766D]">
                    <Activity size={16} strokeWidth={1.9} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-bold tracking-[-0.015em] text-[var(--color-text-primary)]">
                        Equipment Information
                      </h2>
                      <span className="h-[5px] w-[5px] rounded-full bg-[var(--color-secondary)]" />
                    </div>
                    <p className="mt-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                      Core identification and equipment specifications.
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM */}
              <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                  {/* EQUIPMENT NAME */}
                  <Form.Item
                    name="name"
                    label={
                      <span className="flex items-center gap-1.5">
                        <Wrench
                          size={12}
                          strokeWidth={1.9}
                          className="text-[#56766D]"
                        />
                        Equipment Name
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

                  {/* EQUIPMENT ID */}
                  <Form.Item
                    name="equipment_id"
                    label={
                      <span className="flex items-center gap-1.5">
                        <Hash
                          size={12}
                          strokeWidth={1.9}
                          className="text-[#56766D]"
                        />
                        Equipment ID
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please enter equipment ID",
                      },
                    ]}
                    className="!mb-4"
                  >
                    <FormInput placeholder="e.g. EQ-001" />
                  </Form.Item>

                  {/* MAKE */}
                  <Form.Item
                    name="make"
                    label={
                      <span className="flex items-center gap-1.5">
                        <Factory
                          size={12}
                          strokeWidth={1.9}
                          className="text-[#56766D]"
                        />
                        Make
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please enter manufacturer",
                      },
                    ]}
                    className="!mb-4"
                  >
                    <FormInput placeholder="Enter manufacturer" />
                  </Form.Item>

                  {/* MODEL */}
                  <Form.Item
                    name="model"
                    label={
                      <span className="flex items-center gap-1.5">
                        <Cpu
                          size={12}
                          strokeWidth={1.9}
                          className="text-[#56766D]"
                        />
                        Model
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please enter equipment model",
                      },
                    ]}
                    className="!mb-4"
                  >
                    <FormInput placeholder="Enter equipment model" />
                  </Form.Item>

                  {/* EQUIPMENT TYPE */}
                  <Form.Item
                    name="equipment_type"
                    label={
                      <span className="flex items-center gap-1.5">
                        <Layers3
                          size={12}
                          strokeWidth={1.9}
                          className="text-[#56766D]"
                        />
                        Equipment Type
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please enter equipment type",
                      },
                    ]}
                    className="!mb-0 md:col-span-2"
                  >
                    <FormInput placeholder="Enter equipment type" />
                  </Form.Item>
                </div>
              </div>
            </section>
          </div>
        </Form>

        {/* ═══════════════ TAB 2: CHECKLIST CONFIGURATION ═══════════════ */}
        {activeTab === "checklist" && (
          <section className="mt-2 overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_5px_20px_rgba(36,50,56,0.055)]">
            <div className="h-[2px] w-full bg-[var(--color-secondary)]" />

            <div className="p-5 sm:p-6">
              <ChecklistConfiguration
                value={checklistConfig}
                onChange={setChecklistConfig}
                description="Define categorical inspection checkpoints for the field engineers."
              />
            </div>
          </section>
        )}
      </div>

      {/* ═══════════════ FLOATING ACTIONS ═══════════════ */}
      <FloatingActionButtons
        onSave={() => form.submit()}
        onCancel={handleCancel}
        isSaving={isSaving}
        saveLabel="Update"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default EquipmentPanel;