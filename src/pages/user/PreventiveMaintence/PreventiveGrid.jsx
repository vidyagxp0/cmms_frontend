import React, { useEffect, useState } from "react";
import { Plus, Trash2, Table2 } from "lucide-react";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import UserModal from "../../../components/common/UserModal/UserModal";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";
import { updatePreventive } from "../../../services/usersApi/preventive";
import "../../../components/ui/disabledFields.css";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";

dayjs.extend(customParseFormat);
const { TextArea } = Input;

const MONTHS = [
  { key: "Jan", label: "January", index: 0 },
  { key: "Feb", label: "February", index: 1 },
  { key: "Mar", label: "March", index: 2 },
  { key: "Apr", label: "April", index: 3 },
  { key: "May", label: "May", index: 4 },
  { key: "Jun", label: "June", index: 5 },
  { key: "Jul", label: "July", index: 6 },
  { key: "Aug", label: "August", index: 7 },
  { key: "Sep", label: "September", index: 8 },
  { key: "Oct", label: "October", index: 9 },
  { key: "Nov", label: "November", index: 10 },
  { key: "Dec", label: "December", index: 11 },
];

const WEEKS_PER_MONTH = 5;

/* -------------------- Frequency helpers -------------------- */
export const FREQUENCY_PRIORITY = { Y: 4, Q: 3, H: 2, M: 1 };

export const FREQUENCY_LABEL_BY_CODE = {
  Y: "yearly",
  Q: "quarterly",
  H: "half-yearly",
  M: "monthly",
};

const WORD_PATTERNS = [
  [/HALF[\s-]?YEARLY|HALF[\s-]?YEAR/g, "H"],
  [/YEARLY|ANNUAL(LY)?/g, "Y"],
  [/QUARTERLY|QUARTER/g, "Q"],
  [/MONTHLY|MONTH/g, "M"],
];

const extractFrequencyTokens = (raw) => {
  if (raw === undefined || raw === null) return [];
  let str = String(raw).trim().toUpperCase();
  if (!str) return [];

  const tokens = new Set();

  WORD_PATTERNS.forEach(([re, code]) => {
    if (re.test(str)) tokens.add(code);
    str = str.replace(re, " ");
  });

  const letters = str.replace(/[^A-Z]/g, "");
  for (const ch of letters) {
    if (FREQUENCY_PRIORITY[ch] !== undefined) tokens.add(ch);
  }

  return [...tokens];
};

export const getRowBiggestFrequency = (row) => {
  const weekly = row?.weeklyPreventive;
  const codes = [];

  if (weekly && typeof weekly === "object") {
    Object.values(weekly).forEach((weeks) => {
      if (!Array.isArray(weeks)) return;
      weeks.forEach((week) => {
        if (!week) return;
        extractFrequencyTokens(week.planned).forEach((c) => codes.push(c));
        extractFrequencyTokens(week.actual).forEach((c) => codes.push(c));
      });
    });
  }

  if (codes.length === 0) return { code: "", label: "" };

  const code = codes.reduce((best, cur) =>
    FREQUENCY_PRIORITY[cur] > FREQUENCY_PRIORITY[best] ? cur : best
  );

  return { code, label: FREQUENCY_LABEL_BY_CODE[code] || "" };
};

/* -------------------- Weekly data helpers -------------------- */
const toFieldString = (value) => (typeof value === "string" ? value : "");

const createEmptyWeek = () => ({ planned: "", actual: "" });

const createEmptyWeeklyData = () => {
  const data = {};
  MONTHS.forEach(({ key }) => {
    data[key] = Array.from({ length: WEEKS_PER_MONTH }, createEmptyWeek);
  });
  return data;
};

const normalizeWeeklyData = (weeklyData) => {
  const normalized = createEmptyWeeklyData();
  if (!weeklyData || typeof weeklyData !== "object") return normalized;

  MONTHS.forEach(({ key }) => {
    const monthData = weeklyData[key];
    if (Array.isArray(monthData)) {
      for (let i = 0; i < WEEKS_PER_MONTH; i++) {
        normalized[key][i] = {
          planned: toFieldString(monthData[i]?.planned),
          actual: toFieldString(monthData[i]?.actual),
        };
      }
    }
  });
  return normalized;
};

/* -------------------- Header date helpers -------------------- */
const getSundayDates = (year, monthIndex) => {
  const first = dayjs(new Date(year, monthIndex, 1));
  const days = first.daysInMonth();
  const dates = [];
  for (let d = 1; d <= days; d++) {
    const date = dayjs(new Date(year, monthIndex, d));
    if (date.day() === 0) dates.push(date.format("YYYY-MM-DD"));
  }
  return dates;
};

const generateDefaultWeekDates = (year) => {
  const result = {};
  MONTHS.forEach(({ key, index }) => {
    const sundays = getSundayDates(year, index);
    result[key] = Array.from(
      { length: WEEKS_PER_MONTH },
      (_, i) => sundays[i] || ""
    );
  });
  return result;
};

const unwrapWeekDates = (input) => {
  if (!input) return null;

  if (input.week_dates_data && typeof input.week_dates_data === "object") {
    return input.week_dates_data;
  }

  if (typeof input === "object" && !Array.isArray(input)) {
    return input;
  }

  return null;
};

const getMergedWeekDates = (initial, currentYear) => {
  const defaults = generateDefaultWeekDates(currentYear);
  const normalized = unwrapWeekDates(initial);

  if (
    !normalized ||
    typeof normalized !== "object" ||
    Object.keys(normalized).length === 0
  ) {
    return defaults;
  }

  const merged = { ...defaults };
  MONTHS.forEach(({ key }) => {
    if (Array.isArray(normalized[key])) {
      merged[key] = Array.from({ length: WEEKS_PER_MONTH }, (_, i) => {
        const val = normalized[key][i];
        return typeof val === "string" && val.trim() ? val : "";
      });
    }
  });
  return merged;
};

/* -------------------- Main component -------------------- */
const PreventiveGrid = ({
  value = [],
  onChange,
  equipmentOptions = [],
  equipmentMap = {},
  equipmentLoading = false,
  name = "Preventive Maintenance Planner",
  description = "",
  addButtonLabel = "Add Row",
  minRows = 0,
  maxRows,
  onViewChild,
  viewChildLabel = "Child",
  recordId,
  disabled = false,
  canCreateChild = false,
  showAddButton = true,
  year = dayjs().year(),
  weekDates: initialWeekDates,
  onWeekDatesChange,
  blockValue = "",
  departmentValue = "",
}) => {
  const columns = [
    {
      key: "equipmentInstrumentName",
      title: "Equipment Name",
      type: "select",
      placeholder: "Select equipment name",
      required: true,
      minWidth: 240,
    },
    {
      key: "equipmentInstrumentId",
      title: "Equipment Code",
      type: "text",
      minWidth: 180,
    },
    {
      key: "location",
      title: "Location",
      type: "text",
      placeholder: "Enter location",
      minWidth: 180,
    },
  ];

  const rows = Array.isArray(value) ? value : [];
  const [deleteRowIndex, setDeleteRowIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [headerWeekDates, setHeaderWeekDates] = useState(() =>
    getMergedWeekDates(initialWeekDates, year)
  );

  useEffect(() => {
    const merged = getMergedWeekDates(initialWeekDates, year);

    setHeaderWeekDates(merged);

    if (onWeekDatesChange) {
      const normalized = unwrapWeekDates(initialWeekDates) || {};
      const incomingStr = JSON.stringify(normalized);
      const mergedStr = JSON.stringify(merged);

      if (incomingStr !== mergedStr) {
        onWeekDatesChange(merged);
      }
    }
  }, [initialWeekDates, year, onWeekDatesChange]);

  /* -------------------- Row actions -------------------- */
  const addRow = () => {
    if (disabled) return;
    if (maxRows !== undefined && rows.length >= maxRows) return;

    const newRow = {};
    columns.forEach((column) => {
      newRow[column.key] = "";
    });
    newRow.equipmentDbId = "";
    newRow.make = "";
    newRow.model = "";
    newRow.weeklyPreventive = createEmptyWeeklyData();
    newRow.remark = "";

    onChange([...rows, newRow]);
  };

  const handleDeleteRow = (rowIndex) => {
    if (disabled) return;
    if (rows.length <= minRows) return;
    setSelectedId(recordId);
    setDeleteRowIndex(rowIndex);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteRowIndex === null || rows.length <= minRows) return;
    try {
      const updatedRows = rows.filter((_, index) => index !== deleteRowIndex);
      const payload = { gridData: updatedRows };
      if (selectedId) await updatePreventive(selectedId, payload);
      onChange(updatedRows);
      setDeleteRowIndex(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete preventive row:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteRowIndex(null);
    setIsDeleteModalOpen(false);
  };

  /* -------------------- Cell updates -------------------- */
  const updateRow = (rowIndex, key, newValue) => {
    if (disabled) return;
    const updated = [...rows];
    const row = { ...updated[rowIndex] };

    if (key === "equipmentInstrumentName") {
      // newValue is the unique equipment DB id from the Select
      const equipment = equipmentMap[String(newValue)];

      if (equipment) {
        row.equipmentDbId = String(equipment.id);
        row.equipmentInstrumentName = equipment.instrument_name || "";
        row.equipmentInstrumentId =
          equipment.instrument_id_no || equipment.equipment_id || "";
        row.location = equipment.location || "";
        row.make = equipment.make || "";
        row.model = equipment.sr_no_model_no || equipment.model || "";
      } else {
        row.equipmentDbId = "";
        row.equipmentInstrumentName = "";
        row.equipmentInstrumentId = "";
        row.location = "";
        row.make = "";
        row.model = "";
      }
    } else {
      row[key] = newValue;
    }

    if (!row.weeklyPreventive || typeof row.weeklyPreventive !== "object") {
      row.weeklyPreventive = createEmptyWeeklyData();
    }

    updated[rowIndex] = row;
    onChange(updated);
  };

  const updateWeekValue = (rowIndex, monthKey, weekIndex, field, value) => {
    if (disabled) return;

    const updated = [...rows];
    const row = { ...updated[rowIndex] };
    const weekly = normalizeWeeklyData(row.weeklyPreventive);

    weekly[monthKey][weekIndex] = {
      ...weekly[monthKey][weekIndex],
      [field]: value,
    };

    row.weeklyPreventive = weekly;
    updated[rowIndex] = row;

    onChange(updated);
  };

  const updateRemark = (rowIndex, newValue) => {
    if (disabled) return;
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], remark: newValue };
    onChange(updated);
  };

  const updateHeaderWeekDate = (monthKey, weekIndex, dateStr) => {
    if (disabled) return;

    const currentDates =
      headerWeekDates[monthKey] || Array(WEEKS_PER_MONTH).fill("");

    const updatedWeekDates = {
      ...headerWeekDates,
      [monthKey]: currentDates.map((d, i) => (i === weekIndex ? dateStr : d)),
    };

    setHeaderWeekDates(updatedWeekDates);

    if (onWeekDatesChange) onWeekDatesChange(updatedWeekDates);
  };

  /* -------------------- Field renderer (left columns) -------------------- */
  const renderField = (column, row, rowIndex) => {
    const {
      key,
      type,
      placeholder,
      options: colOptions,
      disabled: columnDisabled,
    } = column;

    const fieldValue = row[key] ?? "";
    const handleChange = (newValue) => updateRow(rowIndex, key, newValue);
    const isDisabled = disabled || columnDisabled;

    const commonProps = {
      disabled: isDisabled,
      className:
        "!w-full !rounded-lg !border-[#D1DBD7] !bg-white !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)] disabled:!cursor-not-allowed disabled:!bg-[#F3F6F4] disabled:!text-[#65746E]",
    };

    if (type === "select") {
      if (key === "equipmentInstrumentName") {
        // Bind by the unique equipmentDbId instead of the name
        const selectValue =
          row.equipmentDbId !== undefined &&
          row.equipmentDbId !== null &&
          row.equipmentDbId !== ""
            ? String(row.equipmentDbId)
            : undefined;

        return (
          <Select
            {...commonProps}
            value={selectValue}
            placeholder={equipmentLoading ? "Loading..." : placeholder}
            onChange={(id) => updateRow(rowIndex, "equipmentInstrumentName", id)}
            options={equipmentOptions}
            disabled={isDisabled || equipmentLoading}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            className="!w-full [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#D1DBD7] [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[12px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[#9AA6A1] hover:[&_.ant-select-selector]:!border-[#A8B9B2] [&.ant-select-focused_.ant-select-selector]:!border-[#4E7585]"
          />
        );
      }

      return (
        <Select
          {...commonProps}
          value={fieldValue || undefined}
          placeholder={placeholder}
          onChange={handleChange}
          options={colOptions}
          className="!w-full [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#D1DBD7] [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[12px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[#9AA6A1] hover:[&_.ant-select-selector]:!border-[#A8B9B2] [&.ant-select-focused_.ant-select-selector]:!border-[#4E7585]"
        />
      );
    }

    if (type === "date") {
      return (
        <DatePicker
          {...commonProps}
          value={fieldValue ? dayjs(fieldValue) : null}
          placeholder={placeholder}
          onChange={(date) =>
            handleChange(date ? date.format("YYYY-MM-DD") : "")
          }
          format="DD/MM/YYYY"
          className="!h-10 !w-full !rounded-lg !border-[#D1DBD7] !bg-white !text-[12px] !font-medium !text-[#263B35] !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585]"
        />
      );
    }

    if (type === "textarea") {
      return (
        <TextArea
          {...commonProps}
          value={fieldValue}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          rows={2}
          className="!min-h-[40px] !w-full !resize-none !rounded-lg !border-[#D1DBD7] !bg-white !px-3 !py-2 !text-[12px] !font-medium !leading-5 !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)] disabled:!bg-[#F3F6F4]"
        />
      );
    }

    return (
      <Input
        {...commonProps}
        value={fieldValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className="!h-10 !w-full !rounded-lg !border-[#D1DBD7] !bg-white !px-3 !text-[12px] !font-medium !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)] disabled:!cursor-not-allowed disabled:!bg-[#F3F6F4] disabled:!text-[#65746E]"
      />
    );
  };

  const visibleColumns = columns.filter((column) => column.hidden !== true);
  const showChildColumn = typeof onViewChild === "function";

  const leftColSpan = 4;

  /* -------------------- Render -------------------- */
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
      {/* Header */}
      <div className="flex min-h-[68px] items-center justify-between gap-5 border-b border-[#D7E0DC] bg-[#F7F9F8] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D5E0DF] bg-white text-[#4E7585] shadow-[0_2px_7px_rgba(38,53,46,0.05)]">
            <Table2 size={17} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#263B35]">
              {name}
            </h3>
            {description && (
              <p className="mt-0.5 truncate text-[11px] font-medium text-[#899690]">
                {description}
              </p>
            )}
          </div>
        </div>

        {showAddButton && (
          <button
            type="button"
            onClick={addRow}
            disabled={
              disabled || (maxRows !== undefined && rows.length >= maxRows)
            }
            className="group flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#2B5577] px-3.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(43,85,119,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#234766] hover:shadow-[0_7px_16px_rgba(43,85,119,0.25)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus
              size={14}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
            {addButtonLabel}
          </button>
        )}
      </div>

      <CustomScrollContainer
        maxHeight="520px"
        direction="both"
        className="w-full rounded-b-xl"
      >
        <table className="w-full min-w-[6800px] border-collapse">
          <thead className="sticky top-0 z-[5]">
            {/* Row 1 */}
            <tr className="bg-[#EEF3F1]">
              <th
                colSpan={3}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3 py-2 text-left text-[11px] font-bold text-[#43564F]"
              >
                For the Year of&nbsp;
                <span className="text-[#2B5577]">{year}</span>
              </th>
              <th className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3 py-2 text-left text-[11px] font-bold text-[#43564F]">
                MONTH &rarr;
              </th>
              {MONTHS.map((month) => (
                <th
                  key={month.key}
                  colSpan={WEEKS_PER_MONTH * 2}
                  className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-2 py-2 text-center text-[12px] font-bold text-[#2F4940]"
                >
                  {month.label}
                </th>
              ))}
              <th
                rowSpan={4}
                style={{ minWidth: 240 }}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
              >
                Remark
              </th>
              {showChildColumn && (
                <th
                  rowSpan={4}
                  className="w-[70px] border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]"
                >
                  {viewChildLabel}
                </th>
              )}
              <th
                rowSpan={4}
                className="w-[62px] border-b border-[#D5DFDB] bg-[#EEF3F1] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]"
              >
                Action
              </th>
            </tr>

            {/* Row 2 */}
            <tr className="bg-[#EEF3F1]">
              <th
                rowSpan={3}
                className="sticky left-0 z-[10] w-[56px] border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]"
              >
                Sr. No
              </th>
              <th
                style={{ minWidth: 240 }}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
              >
                Block
              </th>
              <th
                style={{ minWidth: 180 }}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
              >
                {blockValue}
              </th>
              <th className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3 py-2 text-left text-[11px] font-bold text-[#43564F]">
                WEEK &rarr;
              </th>

              {MONTHS.map((month) =>
                Array.from({ length: WEEKS_PER_MONTH }).map((_, weekIdx) => (
                  <th
                    key={`${month.key}-week-${weekIdx}`}
                    colSpan={2}
                    className="border-b border-r border-[#D5DFDB] bg-[#E7EFEC] px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.03em] text-[#63736C]"
                  >
                    {weekIdx + 1}
                  </th>
                ))
              )}
            </tr>

            {/* Row 3 */}
            <tr className="bg-[#EEF3F1]">
              <th
                style={{ minWidth: 240 }}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
              >
                Department
              </th>
              <th
                style={{ minWidth: 180 }}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
              >
                {departmentValue}
              </th>
              <th className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3 py-2 text-left text-[11px] font-bold text-[#43564F]">
                DATE &rarr;
              </th>
              {MONTHS.map((month) =>
                Array.from({ length: WEEKS_PER_MONTH }).map((_, weekIdx) => (
                  <th
                    key={`${month.key}-date-${weekIdx}`}
                    colSpan={2}
                    className="border-b border-r border-[#D5DFDB] bg-[#E7EFEC] px-1 py-1.5 text-center"
                  >
                    <DatePicker
                      value={
                        headerWeekDates?.[month.key]?.[weekIdx]
                          ? dayjs(headerWeekDates[month.key][weekIdx])
                          : null
                      }
                      onChange={(date) =>
                        updateHeaderWeekDate(
                          month.key,
                          weekIdx,
                          date ? date.format("YYYY-MM-DD") : ""
                        )
                      }
                      format="DD/MM/YYYY"
                      allowClear
                      disabled={disabled}
                      className="!h-8 !w-full !rounded-md !border-[#D1DBD7] !bg-white !text-[10px] !font-medium !text-[#263B35] !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585]"
                    />
                  </th>
                ))
              )}
            </tr>

            {/* Row 4 */}
            <tr className="bg-[#EEF3F1]">
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  style={{ minWidth: column.minWidth || 180 }}
                  className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {column.key === "location" && "↓"}

                    {column.key === "equipmentInstrumentName" && (
                      <RequiredAsterisk message="Equipment Name is required. Please select an equipment item to continue." />
                    )}
                  </div>
                </th>
              ))}
              {MONTHS.map((month) =>
                Array.from({ length: WEEKS_PER_MONTH }).map((_, weekIdx) => (
                  <React.Fragment key={`${month.key}-pa-${weekIdx}`}>
                    <th className="border-b border-r border-[#D5DFDB] bg-[#E1EBE7] px-1 py-2 text-center text-[9px] font-bold text-[#63736C]">
                      P
                    </th>
                    <th className="border-b border-r border-[#D5DFDB] bg-[#E1EBE7] px-1 py-2 text-center text-[9px] font-bold text-[#63736C]">
                      A
                    </th>
                  </React.Fragment>
                ))
              )}
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => {
                return (
                  <tr
                    key={rowIndex}
                    className="group bg-white transition-colors duration-150 hover:bg-[#FAFCFB]"
                  >
                    <td className="sticky left-0 z-[4] border-b border-r border-[#E0E7E4] bg-white px-3 py-3 text-center align-top group-hover:bg-[#FAFCFB]">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#EDF2F0] px-1.5 text-[10px] font-bold text-[#60716A]">
                        {String(rowIndex + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className="border-b border-r border-[#E0E7E4] px-3 py-2.5 align-top"
                      >
                        {renderField(column, row, rowIndex)}
                      </td>
                    ))}

                    {MONTHS.map((month) =>
                      Array.from({ length: WEEKS_PER_MONTH }).map(
                        (_, weekIdx) => {
                          const weekData =
                            row.weeklyPreventive?.[month.key]?.[weekIdx] || {
                              planned: "",
                              actual: "",
                            };

                          const dateStr = headerWeekDates?.[month.key]?.[weekIdx];
                          const enabled = !!dateStr;

                          const plannedValue = toFieldString(weekData.planned);
                          const actualValue = toFieldString(weekData.actual);

                          return (
                            <React.Fragment key={`${month.key}-${weekIdx}-pa`}>
                              <td className="border-b border-r border-[#E0E7E4] px-1 py-2.5 text-center align-middle">
                                <Input
                                  value={plannedValue}
                                  disabled={disabled || !enabled}
                                  onChange={(e) =>
                                    updateWeekValue(
                                      rowIndex,
                                      month.key,
                                      weekIdx,
                                      "planned",
                                      e.target.value
                                    )
                                  }
                                  className="!h-8 !w-full !rounded-md !border-[#D1DBD7] !bg-white !text-[10px] !font-medium !text-[#263B35] !shadow-none !px-1 !text-center hover:!border-[#A8B9B2] focus:!border-[#4E7585] disabled:!cursor-not-allowed disabled:!bg-[#F3F6F4] disabled:!text-[#9AA6A1]"
                                />
                              </td>
                              <td className="border-b border-r border-[#E0E7E4] px-1 py-2.5 text-center align-middle">
                                <Input
                                  value={actualValue}
                                  disabled={disabled || !enabled}
                                  onChange={(e) =>
                                    updateWeekValue(
                                      rowIndex,
                                      month.key,
                                      weekIdx,
                                      "actual",
                                      e.target.value
                                    )
                                  }
                                  className="!h-8 !w-full !rounded-md !border-[#D1DBD7] !bg-white !text-[10px] !font-medium !text-[#263B35] !shadow-none !px-1 !text-center hover:!border-[#A8B9B2] focus:!border-[#4E7585] disabled:!cursor-not-allowed disabled:!bg-[#F3F6F4] disabled:!text-[#9AA6A1]"
                                />
                              </td>
                            </React.Fragment>
                          );
                        }
                      )
                    )}

                    <td className="border-b border-r border-[#E0E7E4] px-3 py-2.5 align-top">
                      <TextArea
                        value={row.remark ?? ""}
                        placeholder="Enter remark"
                        onChange={(e) => updateRemark(rowIndex, e.target.value)}
                        disabled={disabled}
                        rows={2}
                        className="!min-h-[40px] !w-full !resize-none !rounded-lg !border-[#D1DBD7] !bg-white !px-3 !py-2 !text-[12px] !font-medium !leading-5 !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)] disabled:!bg-[#F3F6F4]"
                      />
                    </td>

                    {showChildColumn && (
                      <td className="border-b border-r border-[#E0E7E4] px-2 py-2.5 text-center align-top">
                        <button
                          type="button"
                          onClick={() => {
                            if (!canCreateChild) return;
                            onViewChild(
                              rowIndex,
                              row,
                              getRowBiggestFrequency(row)
                            );
                          }}
                          disabled={!canCreateChild}
                          className={`inline-flex h-8 items-center justify-center rounded-md px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4E7585] focus:ring-offset-1 ${
                            canCreateChild
                              ? "bg-[#3d606d] hover:bg-[#2B5577] hover:shadow-md active:scale-95"
                              : "cursor-not-allowed bg-[#B8C2BE] opacity-50"
                          }`}
                          aria-label="Create child preventive record"
                          title={
                            canCreateChild
                              ? "Create child preventive record"
                              : "Child creation is available only to Initiator at Close Done stage"
                          }
                        >
                          {viewChildLabel}
                        </button>
                      </td>
                    )}

                    <td className="border-b border-[#E0E7E4] px-2 py-2.5 text-center align-top">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(rowIndex)}
                        disabled={disabled || rows.length <= minRows}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#9AA6A1] transition-all duration-200 hover:bg-[#FFF1F1] hover:text-[#DF5B5B] active:scale-90 disabled:cursor-not-allowed disabled:opacity-25"
                        aria-label="Delete row"
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={
                    leftColSpan +
                    MONTHS.length * WEEKS_PER_MONTH * 2 +
                    1 +
                    (showChildColumn ? 1 : 0) +
                    1
                  }
                  className="h-[80px] border-b border-[#E0E7E4] px-5 text-center text-[11px] font-medium text-[#899690]"
                >
                  No preventive rows added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CustomScrollContainer>

      {/* Footer */}
      <div className="flex min-h-[40px] items-center justify-between border-t border-[#E0E7E4] bg-[#FAFBFA] px-4">
        <span className="text-[10px] font-medium text-[#899690]">
          {rows.length} {rows.length === 1 ? "row" : "rows"}
        </span>
        {maxRows !== undefined && (
          <span className="text-[10px] font-medium text-[#899690]">
            {rows.length} / {maxRows} rows
          </span>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <UserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Row"
        description="Please confirm this action before continuing."
        width="max-w-[420px]"
      >
        <div className="space-y-5">
          <p className="text-[13px] leading-6 text-[#596760]">
            Are you sure you want to delete this row? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 border-t border-[#E8ECEA] pt-4">
            <button
              type="button"
              onClick={handleCancelDelete}
              className="h-9 rounded-lg border border-[#D5DEDA] bg-white px-4 text-[12px] font-semibold text-[#596760] transition-all duration-200 hover:bg-[#F6F8F7] hover:text-[#263B35] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="h-9 rounded-lg bg-[#F52F3E] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(245,47,62,0.20)] transition-all duration-200 hover:bg-[#E52635] hover:shadow-[0_6px_15px_rgba(245,47,62,0.28)] active:scale-[0.98]"
            >
              Delete Row
            </button>
          </div>
        </div>
      </UserModal>
    </div>
  );
};

export default PreventiveGrid;