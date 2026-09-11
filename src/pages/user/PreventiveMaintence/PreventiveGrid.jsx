import React, { useEffect, useState } from "react";
import { Plus, Trash2, Table2, CalendarDays } from "lucide-react";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import UserModal from "../../../components/common/UserModal/UserModal";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";
import { updatePreventive } from "../../../services/usersApi/preventive";
import "../../../components/ui/disabledFields.css";

dayjs.extend(customParseFormat);
const { TextArea } = Input;

const MONTHS = [
  { key: "Jan", label: "Jan" },
  { key: "Feb", label: "Feb" },
  { key: "Mar", label: "Mar" },
  { key: "Apr", label: "Apr" },
  { key: "May", label: "May" },
  { key: "Jun", label: "Jun" },
  { key: "Jul", label: "Jul" },
  { key: "Aug", label: "Aug" },
  { key: "Sep", label: "Sep" },
  { key: "Oct", label: "Oct" },
  { key: "Nov", label: "Nov" },
  { key: "Dec", label: "Dec" },
];

const createEmptyMonthlyData = () => {
  const monthlyData = {};
  MONTHS.forEach(({ key }) => {
    monthlyData[key] = { plannedDate: "", executeDate: "" };
  });
  return monthlyData;
};

const normalizeMonthlyData = (monthlyData) => {
  const normalized = createEmptyMonthlyData();
  if (!monthlyData || typeof monthlyData !== "object") return normalized;
  MONTHS.forEach(({ key }) => {
    normalized[key] = {
      plannedDate: monthlyData?.[key]?.plannedDate || "",
      executeDate: monthlyData?.[key]?.executeDate || "",
    };
  });
  return normalized;
};

const FREQUENCY_MONTHS = {
  monthly: 1,
  quarterly: 3,
  "half-yearly": 6,
  yearly: 12,
};
const getFrequencyMonths = (frequency) => FREQUENCY_MONTHS[frequency] || 0;

const getPlannedDates = (monthlyPreventive) => {
  if (!monthlyPreventive || typeof monthlyPreventive !== "object") return [];
  return MONTHS.map(({ key }) => {
    const value = monthlyPreventive?.[key]?.plannedDate;
    if (!value) return null;
    const date = dayjs(value);
    if (!date.isValid()) return null;
    return { monthKey: key, date };
  })
    .filter(Boolean)
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());
};

const isSameOrBefore = (dateA, dateB, unit = "millisecond") =>
  dateA.isSame(dateB, unit) || dateA.isBefore(dateB, unit);

const calculatePreventiveDates = (
  frequency,
  monthlyPreventive,
  existingPreviousDate = "",
  existingNextDate = ""
) => {
  const frequencyMonths = getFrequencyMonths(frequency);
  if (!frequencyMonths)
    return {
      previousPreventiveDate: existingPreviousDate || "",
      nextPreventiveDate: existingNextDate || "",
    };
  const plannedDates = getPlannedDates(monthlyPreventive);
  if (plannedDates.length === 0)
    return { previousPreventiveDate: "", nextPreventiveDate: "" };
  const baseDate = plannedDates[0].date;
  if (!baseDate.isValid())
    return { previousPreventiveDate: "", nextPreventiveDate: "" };
  const today = dayjs().startOf("day");
  if (today.isBefore(baseDate, "day")) {
    const nextDate = baseDate.add(frequencyMonths, "month");
    return {
      previousPreventiveDate: baseDate.format("YYYY-MM-DD"),
      nextPreventiveDate: nextDate.format("YYYY-MM-DD"),
    };
  }
  let currentDate = baseDate;
  let safetyCounter = 0;
  while (
    isSameOrBefore(currentDate.add(frequencyMonths, "month"), today, "day") &&
    safetyCounter < 120
  ) {
    currentDate = currentDate.add(frequencyMonths, "month");
    safetyCounter += 1;
  }
  const nextDate = currentDate.add(frequencyMonths, "month");
  return {
    previousPreventiveDate: currentDate.format("YYYY-MM-DD"),
    nextPreventiveDate: nextDate.format("YYYY-MM-DD"),
  };
};

const updateCalculatedPreventiveDates = (row) => {
  if (!row || !row.preventiveFrequency) return row;
  const result = calculatePreventiveDates(
    row.preventiveFrequency,
    row.monthlyPreventive,
    row.previousPreventiveDate,
    row.nextPreventiveDate
  );
  const previousChanged =
    (row.previousPreventiveDate || "") !==
    (result.previousPreventiveDate || "");
  const nextChanged =
    (row.nextPreventiveDate || "") !== (result.nextPreventiveDate || "");
  if (!previousChanged && !nextChanged) return row;
  return {
    ...row,
    previousPreventiveDate: result.previousPreventiveDate,
    nextPreventiveDate: result.nextPreventiveDate,
  };
};

const CHILD_WINDOW_DAYS = 7;

const isWithinChildWindow = (dateValue) => {
  if (!dateValue) return false;
  const target = dayjs(dateValue).startOf("day");
  if (!target.isValid()) return false;
  const today = dayjs().startOf("day");
  const diffDays = Math.abs(today.diff(target, "day"));
  return diffDays <= CHILD_WINDOW_DAYS;
};

const isChildDateWindowOpen = (row) => {
  if (!row) return false;
  return (
    isWithinChildWindow(row.previousPreventiveDate) ||
    isWithinChildWindow(row.nextPreventiveDate)
  );
};

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
      placeholder: "Auto-filled",
      minWidth: 180,
      disabled: true,
    },
    { key: "block", title: "Block", type: "text", placeholder: "Enter block", minWidth: 160 },
    { key: "department", title: "Department", type: "text", placeholder: "Enter department", minWidth: 180 },
    { key: "location", title: "Location", type: "text", placeholder: "Enter location", minWidth: 180 },
    {
      key: "preventiveFrequency",
      title: "Preventive Frequency",
      type: "select",
      placeholder: "Select frequency",
      minWidth: 190,
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "half-yearly", label: "Half Yearly" },
        { value: "yearly", label: "Yearly" },
      ],
    },
  ];

  const rows = Array.isArray(value) ? value : [];
  const [deleteRowIndex, setDeleteRowIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const showMonthlyCalendar = true;

  const isMonthEnabled = (frequency, monthKey, frequencyStartDate) => {
    if (!frequency) return false;
    const startDate = frequencyStartDate ? dayjs(frequencyStartDate) : dayjs();
    if (!startDate.isValid()) return false;
    const monthIndex = MONTHS.findIndex(({ key }) => key === monthKey);
    if (monthIndex < 0) return false;
    const startYear = startDate.year();
    const currentYear = dayjs().year();
    if (startYear < currentYear) return true;
    if (startYear > currentYear) return false;
    return monthIndex >= startDate.month();
  };

  const addRow = () => {
    if (disabled) return;
    if (maxRows !== undefined && rows.length >= maxRows) return;
    const newRow = {};
    columns.forEach((column) => {
      newRow[column.key] = "";
    });
    newRow.monthlyPreventive = createEmptyMonthlyData();
    newRow.preventiveFrequencyStartDate = "";
    newRow.remark = "";
    newRow.previousPreventiveDate = "";
    newRow.nextPreventiveDate = "";
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

  const updateRow = (rowIndex, key, newValue) => {
    if (disabled) return;
    const updated = [...rows];
    const row = { ...updated[rowIndex] };
    row[key] = newValue;

    if (key === "preventiveFrequency") {
      row.preventiveFrequencyStartDate = newValue
        ? dayjs().format("YYYY-MM-DD")
        : "";
      if (!newValue) {
        row.previousPreventiveDate = "";
        row.nextPreventiveDate = "";
        row.monthlyPreventive = createEmptyMonthlyData();
        updated[rowIndex] = row;
        onChange(updated);
        return;
      }
      row.monthlyPreventive = normalizeMonthlyData(row.monthlyPreventive);
      const calculated = calculatePreventiveDates(
        newValue,
        row.monthlyPreventive,
        row.previousPreventiveDate,
        row.nextPreventiveDate
      );
      row.previousPreventiveDate = calculated.previousPreventiveDate;
      row.nextPreventiveDate = calculated.nextPreventiveDate;
    }

    if (key === "equipmentInstrumentName") {
      const equipmentId = newValue;
      if (equipmentId && equipmentMap[equipmentId]) {
        const equipment = equipmentMap[equipmentId];
        row.equipmentInstrumentId = equipment.equipment_id || "";
        row.make = equipment.make || "";
        row.model = equipment.model || "";
      } else {
        row.equipmentInstrumentId = "";
        row.make = "";
        row.model = "";
      }
    }

    if (!row.monthlyPreventive || typeof row.monthlyPreventive !== "object") {
      row.monthlyPreventive = createEmptyMonthlyData();
    }

    updated[rowIndex] = row;
    onChange(updated);
  };

  const updateMonthlyDate = (rowIndex, monthKey, dateType, newValue) => {
    if (disabled) return;
    const updated = [...rows];
    const row = { ...updated[rowIndex] };
    const monthlyPreventive = normalizeMonthlyData(row.monthlyPreventive);

    monthlyPreventive[monthKey] = {
      ...monthlyPreventive[monthKey],
      [dateType]: newValue,
    };

    if (dateType === "plannedDate") {
      const currentMonthIndex = MONTHS.findIndex(
        (month) => month.key === monthKey
      );
      if (!newValue) {
        if (currentMonthIndex !== -1) {
          for (let i = currentMonthIndex + 1; i < MONTHS.length; i++) {
            const nextMonthKey = MONTHS[i].key;
            monthlyPreventive[nextMonthKey] = {
              ...monthlyPreventive[nextMonthKey],
              plannedDate: "",
            };
          }
        }
      }
      if (newValue && currentMonthIndex !== -1) {
        const baseDate = dayjs(newValue);
        if (baseDate.isValid()) {
          const frequencyMonths =
            getFrequencyMonths(row.preventiveFrequency) || 1;
          for (let i = currentMonthIndex + 1; i < MONTHS.length; i++) {
            const nextMonthKey = MONTHS[i].key;
            const diffMonths = i - currentMonthIndex;
            if (frequencyMonths === 1) {
              const nextDate = baseDate
                .add(diffMonths, "month")
                .format("YYYY-MM-DD");
              monthlyPreventive[nextMonthKey] = {
                ...monthlyPreventive[nextMonthKey],
                plannedDate: nextDate,
              };
            } else {
              if (diffMonths % frequencyMonths === 0) {
                const nextDate = baseDate
                  .add(diffMonths, "month")
                  .format("YYYY-MM-DD");
                monthlyPreventive[nextMonthKey] = {
                  ...monthlyPreventive[nextMonthKey],
                  plannedDate: nextDate,
                };
              }
            }
          }
          if (!row.previousPreventiveDate) {
            row.previousPreventiveDate = baseDate.format("YYYY-MM-DD");
            row.nextPreventiveDate = baseDate
              .add(frequencyMonths, "month")
              .format("YYYY-MM-DD");
          }
        }
      }
    }

    row.monthlyPreventive = monthlyPreventive;
    if (row.preventiveFrequency) {
      const calculated = calculatePreventiveDates(
        row.preventiveFrequency,
        row.monthlyPreventive,
        row.previousPreventiveDate,
        row.nextPreventiveDate
      );
      row.previousPreventiveDate = calculated.previousPreventiveDate;
      row.nextPreventiveDate = calculated.nextPreventiveDate;
    }

    updated[rowIndex] = row;
    onChange(updated);
  };

  const updateRemark = (rowIndex, newValue) => {
    if (disabled) return;
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], remark: newValue };
    onChange(updated);
  };

  useEffect(() => {
    if (!rows.length) return;
    let hasChanges = false;
    const updatedRows = rows.map((row) => {
      const updatedRow = updateCalculatedPreventiveDates(row);
      if (updatedRow !== row) hasChanges = true;
      return updatedRow;
    });
    if (hasChanges) onChange(updatedRows);

    const intervalId = setInterval(() => {
      const currentRows = Array.isArray(value) ? value : [];
      if (!currentRows.length) return;
      let changed = false;
      const recalculatedRows = currentRows.map((row) => {
        const updatedRow = updateCalculatedPreventiveDates(row);
        if (updatedRow !== row) changed = true;
        return updatedRow;
      });
      if (changed) onChange(recalculatedRows);
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [rows.length]);

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
        return (
          <Select
            {...commonProps}
            value={fieldValue || undefined}
            placeholder={equipmentLoading ? "Loading..." : placeholder}
            onChange={handleChange}
            options={equipmentOptions}
            disabled={isDisabled || equipmentLoading}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
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

  const renderMonthlyDatePicker = (row, rowIndex, monthKey, dateType) => {
    const monthlyData = normalizeMonthlyData(row.monthlyPreventive);
    const dateValue = monthlyData?.[monthKey]?.[dateType] || "";
    const enabled = isMonthEnabled(
      row.preventiveFrequency,
      monthKey,
      row.preventiveFrequencyStartDate
    );
    const isDisabled = disabled || !enabled;
    return (
      <DatePicker
        value={dateValue ? dayjs(dateValue) : null}
        disabled={isDisabled}
        placeholder={enabled ? "Select date" : "Disabled"}
        onChange={(date) => {
          if (!enabled || disabled) return;
          updateMonthlyDate(
            rowIndex,
            monthKey,
            dateType,
            date ? date.format("YYYY-MM-DD") : ""
          );
        }}
        format="DD/MM/YYYY"
        allowClear
        className={`!h-9 !w-full !rounded-md !text-[10px] !font-medium !shadow-none ${
          enabled && !disabled
            ? "!border-[#D1DBD7] !bg-white !text-[#263B35] hover:!border-[#A8B9B2] focus:!border-[#4E7585]"
            : "!cursor-not-allowed !border-[#E1E7E4] !bg-[#F0F3F1] !text-[#9AA6A1]"
        }`}
      />
    );
  };

  const renderPreventiveDatePicker = (row, rowIndex, key) => {
    const fieldValue = row[key] ?? "";
    const handleChange = (newValue) => updateRow(rowIndex, key, newValue);
    return (
      <DatePicker
        value={fieldValue ? dayjs(fieldValue) : null}
        disabled={disabled}
        placeholder="Select date"
        onChange={(date) =>
          handleChange(date ? date.format("YYYY-MM-DD") : "")
        }
        format="DD/MM/YYYY"
        allowClear
        className="!h-10 !w-full !rounded-lg !border-[#D1DBD7] !bg-white !text-[12px] !font-medium !text-[#263B35] !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585]"
      />
    );
  };

  const visibleColumns = columns.filter((column) => column.hidden !== true);
  const showChildColumn = typeof onViewChild === "function";

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
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
        <table className="w-full min-w-[5200px] border-collapse">
          <thead className="sticky top-0 z-[5]">
            <tr className="bg-[#EEF3F1]">
              <th className="sticky left-0 z-[10] w-[56px] border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]">
                S.No
              </th>

              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  style={{ minWidth: column.minWidth || 180 }}
                  className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {column.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </div>
                </th>
              ))}

              {showMonthlyCalendar &&
                MONTHS.map((month) => (
                  <th
                    key={month.key}
                    style={{ minWidth: 300, width: 300 }}
                    className="border-b border-r border-[#D5DFDB] bg-[#E7EFEC] p-0 text-center align-middle"
                  >
                    <div className="flex min-h-[48px] items-center justify-center border-b border-[#D5DFDB] bg-[#E1EBE7] px-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#2F4940]">
                        <CalendarDays size={14} strokeWidth={1.8} />
                        {month.label}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="border-r border-[#D5DFDB] px-2 py-2.5 text-center text-[9px] font-bold uppercase tracking-[0.03em] text-[#63736C]">
                        Planned Date
                      </div>
                      <div className="px-2 py-2.5 text-center text-[9px] font-bold uppercase tracking-[0.03em] text-[#63736C]">
                        Execute Date
                      </div>
                    </div>
                  </th>
                ))}

              <th
                style={{ minWidth: 200 }}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
              >
                Previous Preventive Date
              </th>

              <th
                style={{ minWidth: 200 }}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
              >
                Next Preventive Date
              </th>

              <th
                style={{ minWidth: 240 }}
                className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
              >
                Remark
              </th>

              {showChildColumn && (
                <th className="w-[70px] border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]">
                  {viewChildLabel}
                </th>
              )}

              <th className="w-[62px] border-b border-[#D5DFDB] bg-[#EEF3F1] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => {
                const childDateWindowOpen = isChildDateWindowOpen(row);
                const childButtonEnabled =
                  canCreateChild && childDateWindowOpen;

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

                    {showMonthlyCalendar &&
                      MONTHS.map((month) => {
                        const monthEnabled = isMonthEnabled(
                          row.preventiveFrequency,
                          month.key,
                          row.preventiveFrequencyStartDate
                        );
                        return (
                          <td
                            key={month.key}
                            style={{ minWidth: 300 }}
                            className={`border-b border-r border-[#E0E7E4] p-2 align-top ${
                              monthEnabled ? "bg-[#FCFDFC]" : "bg-[#F5F7F6]"
                            }`}
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div className="min-w-0">
                                {renderMonthlyDatePicker(
                                  row,
                                  rowIndex,
                                  month.key,
                                  "plannedDate"
                                )}
                              </div>
                              <div className="min-w-0">
                                {renderMonthlyDatePicker(
                                  row,
                                  rowIndex,
                                  month.key,
                                  "executeDate"
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}

                    <td className="border-b border-r border-[#E0E7E4] px-3 py-2.5 align-top">
                      {renderPreventiveDatePicker(
                        row,
                        rowIndex,
                        "previousPreventiveDate"
                      )}
                    </td>

                    <td className="border-b border-r border-[#E0E7E4] px-3 py-2.5 align-top">
                      {renderPreventiveDatePicker(
                        row,
                        rowIndex,
                        "nextPreventiveDate"
                      )}
                    </td>

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
                            if (!childButtonEnabled) return;
                            onViewChild(rowIndex, row);
                          }}
                          disabled={!childButtonEnabled}
                          className={`inline-flex h-8 items-center justify-center rounded-md px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4E7585] focus:ring-offset-1 ${
                            childButtonEnabled
                              ? "bg-[#3d606d] hover:bg-[#2B5577] hover:shadow-md active:scale-95"
                              : "cursor-not-allowed bg-[#B8C2BE] opacity-50"
                          }`}
                          aria-label="Create child preventive record"
                          title={
                            !canCreateChild
                              ? "Child creation is available only to Initiator at Close Done stage and before and after 7 days of the Previous Preventive Date or the Next Preventive Date"
                              : childDateWindowOpen
                              ? "Create child preventive record"
                              : `Child can be created only within ±${CHILD_WINDOW_DAYS} days of the Previous Preventive Date or the Next Preventive Date`
                          }
                        >
                          Child
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
                    1 +
                    visibleColumns.length +
                    (showMonthlyCalendar ? MONTHS.length : 0) +
                    2 +
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