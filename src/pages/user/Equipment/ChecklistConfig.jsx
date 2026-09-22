import React, { useMemo, useState } from "react";
import {
  Plus,
  X,
  Trash2,
  ClipboardCheck,
  ListChecks,
  Hash,
  HelpCircle,
  Database,
  Eye,
  GripVertical,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Input, Select, Switch, Tooltip, Checkbox, Radio } from "antd";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";

/* ─────────────────────────────── Constants ─────────────────────────────── */

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "datetime", label: "Date & Time" },
  { value: "checkbox", label: "Checkbox" },
  { value: "single_select", label: "Single Selection" },
  { value: "multi_select", label: "Multiple Selection" },
  { value: "single_select_checkbox", label: "Single Selection Checkbox" },
  { value: "multi_select_checkbox", label: "Multiple Selection Checkbox" },
];

const SELECTION_TYPES = [
  "single_select",
  "multi_select",
  "single_select_checkbox",
  "multi_select_checkbox",
];

const CHECKBOX_VARIANTS = [
  { value: "normal", label: "Normal Checkbox" },
  { value: "esign", label: "eSign Checkbox" },
];

const ESIGN_TYPES = [
  {
    value: "authenticated",
    label: "Authentication eSign",
    tooltip:
      "This is authenticated eSign. You must enter your username and password for verification before the sign is accepted.",
  },
  {
    value: "simple",
    label: "Simple eSign",
    tooltip:
      "Simple eSign: when checked, the field records the eSign username, current date and time.",
  },
];

const STEPS = [
  { key: "basic", label: "Basic Info", icon: Hash },
  { key: "columns", label: "Columns", icon: Database },
  { key: "questions", label: "Questions", icon: ListChecks },
  { key: "preview", label: "Preview", icon: Eye },
];

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const FREQUENCY_OPTIONS = [
  "Monthly",
  "Quarterly",
  "Half Yearly",
  "Yearly",
  "Two Yearly",
];

/** Every question × data-column intersection is its own cell, so each row can
 * pick a completely different field type (and its own options, for
 * selection types) for the same data column. */
const createDefaultCell = () => ({
  field_type: "text",
  options: [],
  checkbox_variant: "normal",
  esign_type: "simple",
  required: false,
});

/* ─────────────────────────── Main component ─────────────────────────── */

const ChecklistConfiguration = ({
  value = {},
  onChange,
  description = "Configure questions and data fields that engineers will use during inspection.",
  disabled = false,
  className = "",
}) => {
  const [activeStep, setActiveStep] = useState(0);

  /* ── Normalized state ── */
  const checklist = useMemo(
    () => ({
      checklist_name: value?.checklist_name || "",
      include_serial_number: value?.include_serial_number !== false,
      question_columns: Array.isArray(value?.question_columns)
        ? value.question_columns
        : [],
      data_columns: Array.isArray(value?.data_columns)
        ? value.data_columns
        : [],
      questions: Array.isArray(value?.questions) ? value.questions : [],
    }),
    [value]
  );

  const updateChecklist = (updates) => {
    onChange({ ...checklist, ...updates });
  };

  /* ── Basic info ── */
  const updateChecklistName = (v) => updateChecklist({ checklist_name: v });
  const updateSerialNumber = (v) =>
    updateChecklist({ include_serial_number: v });

  /* ── Question columns ── */
  const addQuestionColumn = () => {
    const newCol = { id: createId("question-column"), column_header: "" };
    updateChecklist({
      question_columns: [...checklist.question_columns, newCol],
    });
  };

  const updateQuestionColumn = (columnId, columnHeader) => {
    updateChecklist({
      question_columns: checklist.question_columns.map((c) =>
        c.id === columnId ? { ...c, column_header: columnHeader } : c
      ),
    });
  };

  const deleteQuestionColumn = (columnId) => {
    updateChecklist({
      question_columns: checklist.question_columns.filter(
        (c) => c.id !== columnId
      ),
      questions: checklist.questions.map((q) => {
        if (!q.values || !(columnId in q.values)) return q;
        const values = { ...q.values };
        delete values[columnId];
        return { ...q, values };
      }),
    });
  };

  const addDataColumn = () => {
    const newCol = { id: createId("data-column"), column_header: "" };
    updateChecklist({
      data_columns: [...checklist.data_columns, newCol],
      questions: checklist.questions.map((q) => ({
        ...q,
        data_cells: {
          ...(q.data_cells || {}),
          [newCol.id]: createDefaultCell(),
        },
      })),
    });
  };

  const updateDataColumn = (columnId, columnHeader) => {
    updateChecklist({
      data_columns: checklist.data_columns.map((c) =>
        c.id === columnId ? { ...c, column_header: columnHeader } : c
      ),
    });
  };

  const deleteDataColumn = (columnId) => {
    updateChecklist({
      data_columns: checklist.data_columns.filter((c) => c.id !== columnId),
      questions: checklist.questions.map((q) => {
        if (!q.data_cells || !(columnId in q.data_cells)) return q;
        const data_cells = { ...q.data_cells };
        delete data_cells[columnId];
        return { ...q, data_cells };
      }),
    });
  };

  /* ── Per-row data cell config (field type + options) ── */
  const getCell = (question, columnId) =>
    question.data_cells?.[columnId] || createDefaultCell();

  const updateDataCellType = (questionId, columnId, fieldType) => {
    updateChecklist({
      questions: checklist.questions.map((q) => {
        if (q.id !== questionId) return q;
        const prevCell = getCell(q, columnId);
        const isSelection = SELECTION_TYPES.includes(fieldType);
        let options = prevCell.options || [];
        if (isSelection && options.length === 0) {
          options = [{ id: createId("option"), value: "" }];
        }
        if (!isSelection) options = [];

        const nextCell = { ...prevCell, field_type: fieldType, options };

        if (fieldType === "checkbox") {
          nextCell.checkbox_variant =
            prevCell.checkbox_variant || "normal";
          if (nextCell.checkbox_variant === "esign") {
            nextCell.esign_type = prevCell.esign_type || "simple";
          }
        } else {
          delete nextCell.checkbox_variant;
          delete nextCell.esign_type;
        }

        return {
          ...q,
          data_cells: {
            ...(q.data_cells || {}),
            [columnId]: nextCell,
          },
        };
      }),
    });
  };

  const updateDataCellRequired = (questionId, columnId, required) => {
    updateChecklist({
      questions: checklist.questions.map((q) => {
        if (q.id !== questionId) return q;
        const cell = getCell(q, columnId);
        return {
          ...q,
          data_cells: {
            ...(q.data_cells || {}),
            [columnId]: {
              ...cell,
              required: !!required,
            },
          },
        };
      }),
    });
  };

  const updateDataCellCheckboxVariant = (questionId, columnId, variant) => {
    updateChecklist({
      questions: checklist.questions.map((q) => {
        if (q.id !== questionId) return q;
        const cell = getCell(q, columnId);
        return {
          ...q,
          data_cells: {
            ...(q.data_cells || {}),
            [columnId]: {
              ...cell,
              checkbox_variant: variant,
              esign_type:
                variant === "esign"
                  ? cell.esign_type || "simple"
                  : cell.esign_type,
            },
          },
        };
      }),
    });
  };

  const updateDataCellEsignType = (questionId, columnId, esignType) => {
    updateChecklist({
      questions: checklist.questions.map((q) => {
        if (q.id !== questionId) return q;
        const cell = getCell(q, columnId);
        return {
          ...q,
          data_cells: {
            ...(q.data_cells || {}),
            [columnId]: {
              ...cell,
              esign_type: esignType,
            },
          },
        };
      }),
    });
  };

  const addDataCellOption = (questionId, columnId) => {
    updateChecklist({
      questions: checklist.questions.map((q) => {
        if (q.id !== questionId) return q;
        const cell = getCell(q, columnId);
        return {
          ...q,
          data_cells: {
            ...(q.data_cells || {}),
            [columnId]: {
              ...cell,
              options: [
                ...(cell.options || []),
                { id: createId("option"), value: "" },
              ],
            },
          },
        };
      }),
    });
  };

  const updateDataCellOption = (questionId, columnId, optionId, value) => {
    updateChecklist({
      questions: checklist.questions.map((q) => {
        if (q.id !== questionId) return q;
        const cell = getCell(q, columnId);
        return {
          ...q,
          data_cells: {
            ...(q.data_cells || {}),
            [columnId]: {
              ...cell,
              options: (cell.options || []).map((o) =>
                o.id === optionId ? { ...o, value } : o
              ),
            },
          },
        };
      }),
    });
  };

  const deleteDataCellOption = (questionId, columnId, optionId) => {
    updateChecklist({
      questions: checklist.questions.map((q) => {
        if (q.id !== questionId) return q;
        const cell = getCell(q, columnId);
        return {
          ...q,
          data_cells: {
            ...(q.data_cells || {}),
            [columnId]: {
              ...cell,
              options: (cell.options || []).filter((o) => o.id !== optionId),
            },
          },
        };
      }),
    });
  };

  /* ── Questions (rows × question columns, each with its own data-cell config) ── */
  const addQuestion = () => {
    const data_cells = checklist.data_columns.reduce((acc, col) => {
      acc[col.id] = createDefaultCell();
      return acc;
    }, {});

    updateChecklist({
      questions: [
        ...checklist.questions,
        {
          id: createId("question"),
          values: {},
          data_cells,
          frequency_enabled: true,
          frequency: "",
        },
      ],
    });
    if (activeStep !== 2) setActiveStep(2);
  };

  const updateQuestionValue = (questionId, columnId, value) => {
    updateChecklist({
      questions: checklist.questions.map((q) =>
        q.id === questionId
          ? { ...q, values: { ...(q.values || {}), [columnId]: value } }
          : q
      ),
    });
  };

  const updateQuestionFrequencyValue = (questionId, freqValue) => {
    updateChecklist({
      questions: checklist.questions.map((q) =>
        q.id === questionId ? { ...q, frequency: freqValue } : q
      ),
    });
  };

  const deleteQuestion = (questionId) => {
    updateChecklist({
      questions: checklist.questions.filter((q) => q.id !== questionId),
    });
  };

  /* ── Derived / preview helpers ── */
  const validQuestionColumns = checklist.question_columns.filter((c) =>
    c.column_header?.trim()
  );
  const validDataColumns = checklist.data_columns.filter((c) =>
    c.column_header?.trim()
  );
  const validQuestions = checklist.questions.filter((q) =>
    Object.values(q.values || {}).some((v) => v?.trim())
  );
  const hasAnyFrequency = checklist.questions.some((q) => q.frequency_enabled);

  const stepCompletion = {
    basic: !!checklist.checklist_name?.trim(),
    columns: validQuestionColumns.length > 0,
    questions: validQuestions.length > 0,
    preview: validQuestionColumns.length > 0 && validQuestions.length > 0,
  };

  const stepBadge = {
    basic: checklist.checklist_name?.trim() ? "Named" : "Not set",
    columns: `${validQuestionColumns.length + validDataColumns.length} field${
      validQuestionColumns.length + validDataColumns.length === 1 ? "" : "s"
    }`,
    questions: `${validQuestions.length} row${
      validQuestions.length === 1 ? "" : "s"
    }`,
    preview: null,
  };

  const getFieldPreview = (cell) => {
    const opts = (cell.options || []).map((o) => o.value).filter(Boolean);
    switch (cell.field_type) {
      case "textarea":
        return "Enter remarks…";
      case "number":
        return "0";
      case "date":
        return "DD / MM / YYYY";
      case "time":
        return "HH : MM";
      case "datetime":
        return "DD / MM / YYYY  HH : MM";
      case "checkbox": {
        const variant = cell.checkbox_variant || "normal";
        if (variant === "esign") {
          const esignType = cell.esign_type || "simple";
          return esignType === "authenticated"
            ? "☐ eSign (Authentication)"
            : "☐ eSign (Simple)";
        }
        return "☐ Checkbox";
      }
      case "single_select":
        return opts.length ? `Select: ${opts.join(" · ")}` : "Select…";
      case "multi_select":
        return opts.length ? `Multi: ${opts.join(" · ")}` : "Select…";
      case "single_select_checkbox":
        return opts.length ? `Radio: ${opts.join(" · ")}` : "Select one…";
      case "multi_select_checkbox":
        return opts.length
          ? `Checkboxes: ${opts.join(" · ")}`
          : "Select multiple…";
      case "text":
      default:
        return "Enter value…";
    }
  };

  const goNext = () =>
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  return (
    <div className={`mt-8 w-full ${className}`}>
      <div className="mb-4">
        <SectionHeader title="CHECKLIST CONFIGURATION" />
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_5px_20px_rgba(36,50,56,0.045)]">
        <div className="h-[2px] w-full bg-[var(--color-secondary)]" />

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 border-b border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-[#D4DFDA] bg-[#EEF4F1] text-[var(--color-primary)]">
              <ClipboardCheck size={16} strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-[var(--color-text-primary)]">
                Multi Question Checklist
              </p>
              <p className="mt-0.5 max-w-[700px] text-[10.5px] font-medium leading-5 text-[var(--color-text-muted)]">
                {description}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#D5E0DB] bg-[#F7F9F7] px-2.5 py-1 text-[9px] font-bold text-[#60766D] sm:self-auto">
            <ClipboardCheck size={11} />
            {validQuestions.length} question{validQuestions.length === 1 ? "" : "s"} ·{" "}
            {validQuestionColumns.length + validDataColumns.length} field
            {validQuestionColumns.length + validDataColumns.length === 1
              ? ""
              : "s"}
          </span>
        </div>

        {/* ── Step navigation ── */}
        <div className="flex items-stretch gap-0 overflow-x-auto border-b border-[var(--color-border-soft)] bg-[#FBFCFB] px-3 sm:px-5">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStep;
            const isDone = stepCompletion[step.key];
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`group relative flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-left transition-all sm:px-4 ${
                  isActive
                    ? "border-[var(--color-primary)]"
                    : "border-transparent hover:border-[#DCE4E0]"
                }`}
              >
                <div
                  className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white"
                      : isDone
                      ? "bg-[#E3EEE7] text-[#3F6B58]"
                      : "bg-[#EEF1EF] text-[#93A09A]"
                  }`}
                >
                  {isDone && !isActive ? <Check size={12} /> : idx + 1}
                </div>
                <div className="min-w-0">
                  <p
                    className={`flex items-center gap-1.5 text-[10.5px] font-bold ${
                      isActive
                        ? "text-[var(--color-text-primary)]"
                        : "text-[#7B8883]"
                    }`}
                  >
                    <Icon size={12} strokeWidth={2} />
                    {step.label}
                  </p>
                  {stepBadge[step.key] && (
                    <p className="mt-0.5 text-[8.5px] font-medium text-[#9AA5A1]">
                      {stepBadge[step.key]}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5">
          {/* ═══════════════ STEP 1 · BASIC INFORMATION ═══════════════ */}
          {activeStep === 0 && (
            <section>
              <SectionHeading
                title="Basic Information"
                subtitle="Give this checklist a name and choose whether to show a serial number column."
              />

              <div className="rounded-[12px] border border-[#DCE4E0] bg-[#FAFBF9] p-4">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-[#65736E]">
                      Checklist Name <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Input
                      value={checklist.checklist_name}
                      onChange={(e) => updateChecklistName(e.target.value)}
                      disabled={disabled}
                      placeholder="e.g. Daily Equipment Inspection"
                      size="large"
                      className="!rounded-[9px] !text-[11.5px]"
                    />
                    <p className="mt-1.5 text-[9px] font-medium text-[#929D99]">
                      This name appears on the printed checklist and inspection records.
                    </p>
                  </div>

                  <div className="flex min-h-[40px] items-center gap-3 rounded-[10px] border border-[#DCE4E0] bg-white px-3 py-2.5">
                    <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] bg-[#EEF4F1] text-[#56766D]">
                      <Hash size={14} strokeWidth={2} />
                    </div>
                    <div className="min-w-[120px]">
                      <p className="text-[10.5px] font-bold text-[var(--color-text-primary)]">
                        Serial Number
                      </p>
                      <p className="text-[8.5px] font-medium text-[#8B9692]">
                        Include S/N column
                      </p>
                    </div>
                    <Switch
                      checked={checklist.include_serial_number}
                      onChange={updateSerialNumber}
                      disabled={disabled}
                      size="small"
                    />
                  </div>
                </div>
              </div>

              <StepFooter
                onNext={goNext}
                nextLabel="Continue to Columns"
                disabled={disabled}
              />
            </section>
          )}

          {/* ═══════════════ STEP 2 · COLUMN CONFIGURATION ═══════════════ */}
          {activeStep === 1 && (
            <section>
              <SectionHeading
                title="Column Configuration"
                subtitle="Add the question and data-field headers. You'll choose each data field's input type per question in the next step, so the same column can be text for one question and a dropdown for another."
              />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* ── Question Columns card ── */}
                <div className="overflow-hidden rounded-[12px] border border-[#DCE4E0] bg-[#FAFBF9]">
                  <ColumnHeader
                    icon={<HelpCircle size={15} strokeWidth={1.8} />}
                    title="Question Column"
                    tooltip="This column is used to display your inspection questions. Add more than one if each row needs several question fields (e.g. Question + Reference SOP)."
                    subtitle="Configure the column(s) where questions will appear."
                    buttonLabel="Add Question Column"
                    onAdd={addQuestionColumn}
                    disabled={disabled}
                  />

                  <div className="p-3">
                    {checklist.question_columns.length === 0 ? (
                      <EmptyState
                        icon={<HelpCircle size={20} />}
                        title="No question column added"
                        subtitle="Add a column to display your checklist questions."
                      />
                    ) : (
                      <div className="space-y-2">
                        {checklist.question_columns.map((column, index) => (
                          <div
                            key={column.id}
                            className="flex items-center gap-2 rounded-[9px] border border-[#DDE5E1] bg-white p-2"
                          >
                            <GripVertical
                              size={13}
                              className="shrink-0 text-[#A8B2AE]"
                            />
                            <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#EAF0ED] text-[8.5px] font-bold text-[#56766D]">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#8A9591]">
                                Column Header
                              </p>
                              <input
                                type="text"
                                value={column.column_header}
                                onChange={(e) =>
                                  updateQuestionColumn(column.id, e.target.value)
                                }
                                disabled={disabled}
                                placeholder="e.g. Inspection Question"
                                className="w-full border-none bg-transparent p-0 text-[11px] font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[#A3ADA9] focus:ring-0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteQuestionColumn(column.id)}
                              disabled={disabled}
                              className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] text-[#929E99] transition-all hover:bg-[#FCF1F1] hover:text-[#B54A4A] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Data Columns card ── */}
                <div className="overflow-hidden rounded-[12px] border border-[#DCE4E0] bg-[#FAFBF9]">
                  <ColumnHeader
                    icon={<Database size={15} strokeWidth={1.8} />}
                    title="Data Column"
                    tooltip="This is a response field header (e.g. Remarks, Status). Its input type is set per question in the Questions step — so Row 1 could be a Text field under this header while Row 2 is a Dropdown."
                    subtitle="Add the response field headers engineers will fill in."
                    buttonLabel="Add Data Column"
                    onAdd={addDataColumn}
                    disabled={disabled}
                  />

                  <div className="p-3">
                    {checklist.data_columns.length === 0 ? (
                      <EmptyState
                        icon={<Database size={20} />}
                        title="No data columns added"
                        subtitle="Add fields such as Status, Remarks, Reading, etc."
                      />
                    ) : (
                      <div className="space-y-2">
                        {checklist.data_columns.map((column, index) => (
                          <div
                            key={column.id}
                            className="flex items-center gap-2 rounded-[9px] border border-[#DDE5E1] bg-white p-2"
                          >
                            <GripVertical
                              size={13}
                              className="shrink-0 text-[#A8B2AE]"
                            />
                            <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#EAF0ED] text-[8.5px] font-bold text-[#56766D]">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#8A9591]">
                                Column Header
                              </p>
                              <input
                                type="text"
                                value={column.column_header}
                                onChange={(e) =>
                                  updateDataColumn(column.id, e.target.value)
                                }
                                disabled={disabled}
                                placeholder="e.g. Remarks"
                                className="w-full border-none bg-transparent p-0 text-[11px] font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[#A3ADA9] focus:ring-0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteDataColumn(column.id)}
                              disabled={disabled}
                              className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] text-[#929E99] transition-all hover:bg-[#FCF1F1] hover:text-[#B54A4A] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <StepFooter
                onBack={goBack}
                onNext={goNext}
                nextLabel="Continue to Questions"
                nextDisabled={validQuestionColumns.length === 0}
                disabled={disabled}
              />
            </section>
          )}

          {/* ═══════════════ STEP 3 · ADD QUESTIONS ═══════════════ */}
          {activeStep === 2 && (
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <SectionHeading
                  title="Add Questions"
                  subtitle="Add each inspection question, then pick the response field type per data column for that row — every row can be configured differently."
                  noMargin
                />
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={disabled || checklist.question_columns.length === 0}
                  className="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-[9px] bg-[var(--color-primary)] px-3 text-[10px] font-bold text-white shadow-[0_4px_11px_rgba(86,118,109,0.12)] transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={13} />
                  Add Question
                </button>
              </div>

              <div className="rounded-[12px] border border-[#DCE4E0] bg-[#FAFBF9] p-3">
                {checklist.question_columns.length === 0 ? (
                  <EmptyState
                    icon={<HelpCircle size={22} />}
                    title="Add a question column first"
                    subtitle="Go back to Columns to add at least one question column."
                  />
                ) : checklist.questions.length === 0 ? (
                  <EmptyState
                    icon={<ListChecks size={22} />}
                    title="No questions added"
                    subtitle='Click "Add Question" to start building your checklist.'
                  />
                ) : (
                  <div className="space-y-3">
                    {checklist.questions.map((question, rowIndex) => (
                      <div
                        key={question.id}
                        className="rounded-[10px] border border-[#DDE5E1] bg-white p-3 transition-all hover:border-[#CCD9D3]"
                      >
                        {/* Row header */}
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] bg-[#E8F0ED] text-[9px] font-bold text-[#56766D]">
                            {String(rowIndex + 1).padStart(2, "0")}
                          </div>
                          <p className="flex-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#8A9591]">
                            Row {rowIndex + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => deleteQuestion(question.id)}
                            disabled={disabled}
                            className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] text-[#929E99] transition-all hover:bg-[#FCF1F1] hover:text-[#B54A4A] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* One input per question column */}
                        <div
                          className={`grid gap-3 ${
                            checklist.question_columns.length === 1
                              ? "grid-cols-1"
                              : "grid-cols-1 md:grid-cols-2"
                          }`}
                        >
                          {checklist.question_columns.map((col, colIdx) => (
                            <div key={col.id}>
                              <label className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.07em] text-[#8A9591]">
                                {col.column_header?.trim() ||
                                  `Column ${colIdx + 1}`}
                              </label>
                              <input
                                type="text"
                                value={question.values?.[col.id] || ""}
                                onChange={(e) =>
                                  updateQuestionValue(
                                    question.id,
                                    col.id,
                                    e.target.value
                                  )
                                }
                                disabled={disabled}
                                placeholder={`Enter ${
                                  col.column_header?.toLowerCase() || "question"
                                }`}
                                className="w-full rounded-[8px] border border-[#DCE4E0] bg-white px-3 py-2 text-[11px] font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[#A3ADA9] focus:border-[var(--color-primary)]"
                              />
                            </div>
                          ))}
                        </div>

                        {checklist.data_columns.length > 0 && (
                          <div className="mt-3 rounded-[9px] border border-[#DCE4E0] bg-[#FAFBF9] p-2.5">
                            <p className="mb-2 flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.07em] text-[#8A9591]">
                              <Database size={11} />
                              Response Fields for this Question
                            </p>
                            <div
                              className={`grid gap-2.5 ${
                                checklist.data_columns.length === 1
                                  ? "grid-cols-1"
                                  : "grid-cols-1 md:grid-cols-2"
                              }`}
                            >
                              {checklist.data_columns.map((col) => {
                                const cell = getCell(question, col.id);
                                const isSelection = SELECTION_TYPES.includes(
                                  cell.field_type
                                );
                                const isRequired = cell.required === true;
                                return (
                                  <div
                                    key={col.id}
                                    className="rounded-[8px] border border-[#DDE5E1] bg-white p-2.5"
                                  >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <span className="truncate text-[9.5px] font-bold text-[var(--color-text-primary)]">
                                        {col.column_header?.trim() ||
                                          "Untitled field"}
                                      </span>

                                      <div className="flex shrink-0 items-center gap-2">
                                        <Tooltip title="Mark this response field as required">
                                          <label
                                            className={`flex cursor-pointer items-center gap-1 rounded-[6px] border px-1.5 py-[3px] text-[9px] font-bold transition-colors ${
                                              isRequired
                                                ? "border-[#F4B7B7] bg-[#FDF1F1] text-[#B54A4A]"
                                                : "border-[#DCE4E0] bg-white text-[#8A9591] hover:bg-[#F5F7F5]"
                                            } ${
                                              disabled
                                                ? "cursor-not-allowed opacity-60"
                                                : ""
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isRequired}
                                              onChange={(e) =>
                                                updateDataCellRequired(
                                                  question.id,
                                                  col.id,
                                                  e.target.checked
                                                )
                                              }
                                              disabled={disabled}
                                              className="h-[10px] w-[10px] cursor-pointer accent-[#B54A4A]"
                                            />
                                            Required Field
                                          </label>
                                        </Tooltip>

                                        <Select
                                          value={cell.field_type}
                                          onChange={(val) =>
                                            updateDataCellType(
                                              question.id,
                                              col.id,
                                              val
                                            )
                                          }
                                          disabled={disabled}
                                          options={FIELD_TYPES}
                                          size="small"
                                          className="min-w-[132px]"
                                          popupMatchSelectWidth={false}
                                        />
                                      </div>
                                    </div>

                                    {isSelection ? (
                                      <div className="space-y-1.5">
                                        {(cell.options || []).length === 0 ? (
                                          <p className="py-1 text-center text-[8.5px] font-medium italic text-[#9AA5A1]">
                                            Add at least one option.
                                          </p>
                                        ) : (
                                          (cell.options || []).map(
                                            (option, optIdx) => (
                                              <div
                                                key={option.id}
                                                className="flex items-center gap-1.5"
                                              >
                                                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#EAF0ED] text-[7.5px] font-bold text-[#56766D]">
                                                  {optIdx + 1}
                                                </span>
                                                <Input
                                                  value={option.value}
                                                  onChange={(e) =>
                                                    updateDataCellOption(
                                                      question.id,
                                                      col.id,
                                                      option.id,
                                                      e.target.value
                                                    )
                                                  }
                                                  disabled={disabled}
                                                  placeholder={`Option ${optIdx + 1}`}
                                                  size="small"
                                                  className="!rounded-[6px] !text-[10px]"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    deleteDataCellOption(
                                                      question.id,
                                                      col.id,
                                                      option.id
                                                    )
                                                  }
                                                  disabled={
                                                    disabled ||
                                                    (cell.options || []).length <= 1
                                                  }
                                                  className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] text-[#929E99] transition-all hover:bg-[#FCF1F1] hover:text-[#B54A4A] disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                  <X size={12} />
                                                </button>
                                              </div>
                                            )
                                          )
                                        )}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            addDataCellOption(question.id, col.id)
                                          }
                                          disabled={disabled}
                                          className="inline-flex h-[22px] items-center gap-1 rounded-[6px] bg-[var(--color-primary)] px-2 text-[8.5px] font-bold text-white transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          <Plus size={9} /> Add Option
                                        </button>
                                      </div>
                                    ) : cell.field_type === "checkbox" ? (
                                      <div className="space-y-2">
                                        <div>
                                          <p className="mb-1 text-[8.5px] font-bold uppercase tracking-[0.07em] text-[#8A9591]">
                                            Checkbox Type
                                          </p>
                                          <Radio.Group
                                            value={
                                              cell.checkbox_variant || "normal"
                                            }
                                            onChange={(e) =>
                                              updateDataCellCheckboxVariant(
                                                question.id,
                                                col.id,
                                                e.target.value
                                              )
                                            }
                                            disabled={disabled}
                                            size="small"
                                            className="flex flex-col gap-1"
                                          >
                                            {CHECKBOX_VARIANTS.map((v) => (
                                              <Radio
                                                key={v.value}
                                                value={v.value}
                                                className="!text-[10.5px]"
                                              >
                                                {v.label}
                                              </Radio>
                                            ))}
                                          </Radio.Group>
                                        </div>

                                        {(cell.checkbox_variant ||
                                          "normal") === "esign" && (
                                          <div>
                                            <p className="mb-1 text-[8.5px] font-bold uppercase tracking-[0.07em] text-[#8A9591]">
                                              eSign Type
                                            </p>
                                            <Radio.Group
                                              value={
                                                cell.esign_type || "simple"
                                              }
                                              onChange={(e) =>
                                                updateDataCellEsignType(
                                                  question.id,
                                                  col.id,
                                                  e.target.value
                                                )
                                              }
                                              disabled={disabled}
                                              size="small"
                                              className="flex flex-col gap-1"
                                            >
                                              {ESIGN_TYPES.map((t) => (
                                                <Tooltip
                                                  key={t.value}
                                                  title={t.tooltip}
                                                  placement="right"
                                                  overlayStyle={{
                                                    maxWidth: 260,
                                                  }}
                                                >
                                                  <Radio
                                                    value={t.value}
                                                    className="!text-[10.5px]"
                                                  >
                                                    {t.label}
                                                  </Radio>
                                                </Tooltip>
                                              ))}
                                            </Radio.Group>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="rounded-[6px] border border-dashed border-[#E0E6E3] bg-[#FAFBFA] px-2 py-1.5 text-[9px] font-medium text-[#9AA5A1]">
                                        {getFieldPreview(cell)}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Frequency provision for this question */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[9px] border border-[#DCE4E0] bg-[#FAFBF9] px-3 py-2.5">
                          <Tooltip title="Frequency is required on every question and can't be unchecked.">
                            <span className="cursor-not-allowed">
                              <Checkbox checked disabled>
                                <span className="text-[10px] font-bold text-[var(--color-text-primary)]">
                                  Frequency
                                </span>
                              </Checkbox>
                            </span>
                          </Tooltip>

                          <Select
                            value={question.frequency || undefined}
                            onChange={(val) =>
                              updateQuestionFrequencyValue(question.id, val)
                            }
                            placeholder="Select frequency"
                            options={FREQUENCY_OPTIONS.map((v) => ({
                              value: v,
                              label: v,
                            }))}
                            disabled={disabled}
                            size="middle"
                            className="min-w-[170px]"
                            popupMatchSelectWidth={false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <StepFooter
                onBack={goBack}
                onNext={goNext}
                nextLabel="Review Preview"
                nextDisabled={validQuestions.length === 0}
                disabled={disabled}
              />
            </section>
          )}

          {/* ═══════════════ STEP 4 · PREVIEW ═══════════════ */}
          {activeStep === 3 && (
            <section>
              <SectionHeading
                title="Checklist Preview"
                subtitle="This is exactly how the checklist will appear to the field engineer — each response field shows the input type configured for that specific row."
              />

              <div className="overflow-hidden rounded-[12px] border border-[#D5DFDB] bg-white shadow-[0_3px_12px_rgba(36,50,56,0.035)]">
                {/* Preview header */}
                <div className="flex items-center justify-between gap-3 border-b border-[#E1E7E4] bg-[#F7F9F7] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[#E8F0ED] text-[#56766D]">
                      <Eye size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[10.5px] font-bold text-[var(--color-text-primary)]">
                        {checklist.checklist_name?.trim() || "Checklist Preview"}
                      </p>
                      <p className="text-[8.5px] font-medium text-[#8A9591]">
                        Live preview
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#D5E0DB] bg-white px-2.5 py-1 text-[8px] font-bold text-[#60766D]">
                    {validQuestions.length} Questions
                  </span>
                </div>

                {validQuestionColumns.length === 0 &&
                validDataColumns.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <ClipboardCheck
                      size={24}
                      className="mx-auto text-[#A1ADA8]"
                    />
                    <p className="mt-2 text-[10.5px] font-semibold text-[#6E7B76]">
                      Nothing to preview yet
                    </p>
                    <p className="mt-1 text-[9px] font-medium text-[#9AA5A1]">
                      Add at least one column to see your checklist layout.
                    </p>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[650px] border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAF8]">
                          {checklist.include_serial_number && (
                            <th className="w-[55px] border-b border-r border-[#E1E7E4] px-3 py-3 text-center text-[8.5px] font-bold uppercase tracking-[0.06em] text-[#73817C]">
                              S/N
                            </th>
                          )}
                          {validQuestionColumns.map((column) => (
                            <th
                              key={column.id}
                              className="min-w-[220px] border-b border-r border-[#E1E7E4] px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.06em] text-[#596B64]"
                            >
                              {column.column_header.trim()}
                            </th>
                          ))}
                          {hasAnyFrequency && (
                            <th className="min-w-[130px] border-b border-r border-[#E1E7E4] px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.06em] text-[#596B64]">
                              Frequency
                            </th>
                          )}
                          {validDataColumns.map((column) => (
                            <th
                              key={column.id}
                              className="min-w-[160px] border-b border-r border-[#E1E7E4] px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.06em] text-[#596B64]"
                            >
                              <span className="inline-flex items-center gap-1">
                                {column.column_header.trim()}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {validQuestions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={
                                (checklist.include_serial_number ? 1 : 0) +
                                validQuestionColumns.length +
                                (hasAnyFrequency ? 1 : 0) +
                                validDataColumns.length
                              }
                              className="px-5 py-10 text-center text-[9.5px] font-medium text-[#929D99]"
                            >
                              Add questions to populate the checklist preview.
                            </td>
                          </tr>
                        ) : (
                          validQuestions.map((question, qIndex) => (
                            <tr
                              key={question.id}
                              className={`transition-colors hover:bg-[#FAFCFA] ${
                                qIndex % 2 === 1 ? "bg-[#FCFDFC]" : ""
                              }`}
                            >
                              {checklist.include_serial_number && (
                                <td className="border-b border-r border-[#E7ECE9] px-3 py-3 text-center text-[9px] font-bold text-[#70817A]">
                                  {String(qIndex + 1).padStart(2, "0")}
                                </td>
                              )}
                              {validQuestionColumns.map((column) => (
                                <td
                                  key={column.id}
                                  className="border-b border-r border-[#E7ECE9] px-3 py-3 text-[10px] font-medium leading-5 text-[#35453F]"
                                >
                                  {question.values?.[column.id]?.trim() || "—"}
                                </td>
                              ))}
                              {hasAnyFrequency && (
                                <td className="border-b border-r border-[#E7ECE9] px-3 py-3 text-[10px] font-semibold text-[#3F6B58]">
                                  {question.frequency_enabled ? (
                                    question.frequency || (
                                      <span className="font-medium text-[#9AA5A1]">
                                        Not selected
                                      </span>
                                    )
                                  ) : (
                                    <span className="font-medium text-[#9AA5A1]">—</span>
                                  )}
                                </td>
                              )}
                              {validDataColumns.map((column) => {
                                const cell = getCell(question, column.id);
                                const isRequired = cell.required === true;
                                return (
                                  <td
                                    key={column.id}
                                    className="border-b border-r border-[#E7ECE9] px-3 py-3"
                                  >
                                    <div className="rounded-[7px] border border-[#E0E6E3] bg-[#FAFBFA] px-2.5 py-2 text-[8.5px] font-medium text-[#9AA5A1]">
                                      {getFieldPreview(cell)}
                                    </div>
                                    <div className="mt-1 flex items-center gap-1.5 text-[7.5px] font-bold uppercase tracking-[0.05em] text-[#B2BCB7]">
                                      <span>
                                        {FIELD_TYPES.find(
                                          (t) => t.value === cell.field_type
                                        )?.label || "Text"}
                                      </span>
                                      {isRequired && (
                                        <span className="rounded-[4px] bg-[#FDF1F1] px-1 py-[1px] text-[7px] font-bold text-[#B54A4A]">
                                          REQ
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <StepFooter onBack={goBack} disabled={disabled} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── Small presentational helpers ─────────────────────── */

const SectionHeading = ({ title, subtitle, noMargin }) => (
  <div className={`${noMargin ? "" : "mb-3"}`}>
    <h3 className="text-[12px] font-bold text-[var(--color-text-primary)]">
      {title}
    </h3>
    <p className="mt-0.5 text-[9.5px] font-medium text-[var(--color-text-muted)]">
      {subtitle}
    </p>
  </div>
);

const ColumnHeader = ({
  icon,
  title,
  tooltip,
  subtitle,
  buttonLabel,
  onAdd,
  disabled,
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-[#E2E8E4] bg-white px-4 py-3">
    <div className="flex items-center gap-2.5">
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[#EEF4F1] text-[#56766D]">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-[10.5px] font-bold text-[var(--color-text-primary)]">
            {title}
          </p>
          <Tooltip title={tooltip} placement="top">
            <HelpCircle
              size={12}
              className="cursor-help text-[#98A39F]"
            />
          </Tooltip>
        </div>
        <p className="mt-0.5 text-[8.5px] font-medium text-[#8B9692]">
          {subtitle}
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className="inline-flex h-[31px] shrink-0 items-center gap-1.5 rounded-[8px] bg-[var(--color-primary)] px-2.5 text-[9.5px] font-bold text-white transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Plus size={12} />
      {buttonLabel}
    </button>
  </div>
);

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="rounded-[10px] border border-dashed border-[#D3DED9] bg-white px-4 py-7 text-center">
    <div className="mx-auto text-[#A1ADA8]">{icon}</div>
    <p className="mt-2 text-[10.5px] font-semibold text-[#6E7B76]">{title}</p>
    <p className="mt-1 text-[9px] font-medium text-[#9AA5A1]">{subtitle}</p>
  </div>
);

const StepFooter = ({ onBack, onNext, nextLabel, nextDisabled, disabled }) => (
  <div className="mt-5 flex items-center justify-between border-t border-[#E6EBE8] pt-4">
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#DCE4E0] bg-white px-3 py-2 text-[10px] font-bold text-[#5B6863] transition-all hover:bg-[#F5F7F5] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft size={13} />
        Back
      </button>
    ) : (
      <span />
    )}
    {onNext && (
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || nextDisabled}
        className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--color-primary)] px-3.5 py-2 text-[10px] font-bold text-white shadow-[0_4px_11px_rgba(86,118,109,0.12)] transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel}
        <ArrowRight size={13} />
      </button>
    )}
  </div>
);

export default ChecklistConfiguration;