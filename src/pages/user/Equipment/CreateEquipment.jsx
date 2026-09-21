import React, { useState } from "react";
import { Activity } from "lucide-react";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import FormInput from "../../../components/common/Form/FormInput";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import { addEquipment } from "../../../services/usersApi/equipmentApi";
import ChecklistConfiguration from "./ChecklistConfig";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";

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

/* ───────────────────────── Component ───────────────────────── */

const CreateEquipment = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [checklistConfig, setChecklistConfig] = useState(EMPTY_CHECKLIST);
  const [activeTab, setActiveTab] = useState("equipment");

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

          const cell = row.data_cells?.[col.id] || { field_type: "text", options: [] };
          const isSelection = SELECTION_TYPES.includes(cell.field_type);

          data_cells[newColId] = {
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

    /* ── Validation ── */
    if (checklistConfig.checklist_name?.trim() === "") {
      toast.error("Please enter checklist name.");
      setActiveTab("checklist");
      return;
    }

    if (cleanedQuestionColumns.length === 0) {
      toast.error("Please add at least one Question Column.");
      setActiveTab("checklist");
      return;
    }

    if (cleanedQuestions.length === 0) {
      toast.error("Please add at least one checklist question.");
      setActiveTab("checklist");
      return;
    }

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

      console.log("Create Equipment Payload:", payload);

      await addEquipment(payload);

      toast.success("Equipment created successfully.");

      form.resetFields();
      setChecklistConfig({ ...EMPTY_CHECKLIST });
      setActiveTab("equipment");

      navigate("/user/equipment-dashboard");
    } catch (error) {
      console.error("Failed to create equipment:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to create equipment. Please try again."
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
    setActiveTab("equipment");

    navigate("/user/equipment-dashboard");
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
              Create Equipment
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

      {/* ═══════════════ TAB 1: EQUIPMENT INFORMATION ═══════════════ */}
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
        <div style={{ display: activeTab === "equipment" ? "block" : "none" }}>
          <section>
            <SectionHeader title="EQUIPMENT INFORMATION" />

            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {/* EQUIPMENT NAME */}
              <Form.Item
                name="name"
                label={
                  <span>
                    Equipment Name <span className="text-red-500">*</span>
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
                  <span>
                    Equipment ID <span className="text-red-500">*</span>
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
                  <span>
                    Make <span className="text-red-500">*</span>
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
                  <span>
                    Model <span className="text-red-500">*</span>
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
                  <span>
                    Equipment Type <span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Please enter equipment type",
                  },
                ]}
                className="!mb-4 md:col-span-2"
              >
                <FormInput placeholder="Enter equipment type" />
              </Form.Item>
            </div>
          </section>
        </div>
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

export default CreateEquipment;