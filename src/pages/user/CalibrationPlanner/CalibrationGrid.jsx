import React, { useState } from "react";
import { Plus, Trash2, Table2, CalendarDays, ExternalLink } from "lucide-react";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import UserModal from "../../../components/common/UserModal/UserModal";

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
  MONTHS.forEach(({ key }) => { monthlyData[key] = { schedulerDate: "", calibrationDate: "" }; });
  return monthlyData;
};

const normalizeMonthlyData = (monthlyData) => {
  const normalized = createEmptyMonthlyData();
  if (!monthlyData || typeof monthlyData !== "object") return normalized;
  MONTHS.forEach(({ key }) => {
    normalized[key] = {
      schedulerDate: monthlyData?.[key]?.schedulerDate || "",
      calibrationDate: monthlyData?.[key]?.calibrationDate || "",
    };
  });
  return normalized;
};

const CalibrationGrid = ({
  value = [],
  onChange,
  equipmentOptions = [],
  equipmentMap = {},
  equipmentLoading = false,
  name = "Calibration Planner",
  description = "",
  addButtonLabel = "Add Row",
  minRows = 0,
  maxRows,
  onViewChild, // <-- NEW: callback for "Child" button
  viewChildLabel = "Child", // optional label
}) => {
  const columns = [
    { key: "equipmentInstrumentName", title: "Equipment / Instrument Name", type: "select", placeholder: "Select equipment", required: true, minWidth: 220 },
    { key: "equipmentInstrumentId", title: "Equipment / Instrument ID", type: "text", placeholder: "Enter equipment / instrument ID", required: true, minWidth: 200, disabled: true },
    { key: "department", title: "Department", type: "text", placeholder: "Enter department", minWidth: 180 },
    { key: "location", title: "Location", type: "text", placeholder: "Enter location", minWidth: 180 },
    { key: "makeModel", title: "Make & Model", type: "text", placeholder: "Enter make & model", minWidth: 200, disabled: true },
    { key: "range", title: "Range", type: "text", placeholder: "Enter range", minWidth: 160 },
    { key: "leastCount", title: "Least Count", type: "text", placeholder: "Enter least count", minWidth: 160 },
    { key: "accuracy", title: "Accuracy", type: "text", placeholder: "Enter accuracy", minWidth: 160 },
    { key: "cNc", title: "C / NC", type: "select", placeholder: "Select", minWidth: 130, options: [{ value: "C", label: "C" }, { value: "NC", label: "NC" }] },
    { key: "calibrationFrequency", title: "Calibration Frequency", type: "select", placeholder: "Select frequency", minWidth: 190, options: [{ value: "monthly", label: "Monthly" }, { value: "quarterly", label: "Quarterly" }, { value: "half-yearly", label: "Half Yearly" }, { value: "yearly", label: "Yearly" }] },
    { key: "previousCalibrationDate", title: "Previous / Calibration Date", type: "date", placeholder: "Select date", minWidth: 190 },
    { key: "nextCalibrationDate", title: "Next Calibration Date", type: "date", placeholder: "Select date", minWidth: 180 },
    { key: "alert", title: "Alert", type: "select", placeholder: "Select alert", minWidth: 140, options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
    { key: "remark", title: "Remark", type: "textarea", placeholder: "Enter remark", minWidth: 240 },
  ];

  const rows = Array.isArray(value) ? value : [];
  const [deleteRowIndex, setDeleteRowIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showMonthlyCalendar = rows.some((row) => !!row?.calibrationFrequency);

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
    if (maxRows !== undefined && rows.length >= maxRows) return;
    const newRow = {};
    columns.forEach((column) => { newRow[column.key] = ""; });
    newRow.monthlyCalibration = createEmptyMonthlyData();
    newRow.calibrationFrequencyStartDate = "";
    onChange([...rows, newRow]);
  };

  const handleDeleteRow = (rowIndex) => {
    if (rows.length <= minRows) return;
    setDeleteRowIndex(rowIndex);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteRowIndex === null || rows.length <= minRows) return;
    const updatedRows = rows.filter((_, index) => index !== deleteRowIndex);
    onChange(updatedRows);
    setDeleteRowIndex(null);
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteRowIndex(null);
    setIsDeleteModalOpen(false);
  };

  const updateRow = (rowIndex, key, newValue) => {
    const updated = [...rows];
    const row = { ...updated[rowIndex] };
    row[key] = newValue;
    if (key === "calibrationFrequency") {
      row.calibrationFrequencyStartDate = newValue ? dayjs().format("YYYY-MM-DD") : "";
    }
    if (key === "equipmentInstrumentName") {
      const equipmentId = newValue;
      if (equipmentId && equipmentMap[equipmentId]) {
        const equipment = equipmentMap[equipmentId];
        row.equipmentInstrumentId = equipment.equipment_id || "";
        row.makeModel = `${equipment.make || ""} ${equipment.model || ""}`.trim();
      } else {
        row.equipmentInstrumentId = "";
        row.makeModel = "";
      }
    }
    if (!row.monthlyCalibration || typeof row.monthlyCalibration !== "object") {
      row.monthlyCalibration = createEmptyMonthlyData();
    }
    updated[rowIndex] = row;
    onChange(updated);
  };

  // const updateMonthlyDate = (rowIndex, monthKey, dateType, newValue) => {
  //   const updated = [...rows];
  //   const row = { ...updated[rowIndex] };
  //   const monthlyCalibration = normalizeMonthlyData(row.monthlyCalibration);
  //   monthlyCalibration[monthKey] = { ...monthlyCalibration[monthKey], [dateType]: newValue };
  //   row.monthlyCalibration = monthlyCalibration;
  //   updated[rowIndex] = row;
  //   onChange(updated);
  // };

  const updateMonthlyDate = (rowIndex, monthKey, dateType, newValue) => {
  const updated = [...rows];
  const row = { ...updated[rowIndex] };
  const monthlyCalibration = normalizeMonthlyData(row.monthlyCalibration);

  // Update the current month's field
  monthlyCalibration[monthKey] = {
    ...monthlyCalibration[monthKey],
    [dateType]: newValue,
  };

  // If we are setting a Scheduler Date and it's not empty, auto‑fill subsequent months
  if (dateType === "schedulerDate" && newValue) {
    const currentMonthIndex = MONTHS.findIndex((m) => m.key === monthKey);
    if (currentMonthIndex !== -1) {
      const baseDate = dayjs(newValue);
      if (baseDate.isValid()) {
        for (let i = currentMonthIndex + 1; i < MONTHS.length; i++) {
          const nextMonthKey = MONTHS[i].key;
          const diffMonths = i - currentMonthIndex;
          const nextDate = baseDate.add(diffMonths, "month").format("YYYY-MM-DD");
          monthlyCalibration[nextMonthKey] = {
            ...monthlyCalibration[nextMonthKey],
            schedulerDate: nextDate,
          };
        }
      }
    }
  }

  row.monthlyCalibration = monthlyCalibration;
  updated[rowIndex] = row;
  onChange(updated);
};

  const renderField = (column, row, rowIndex) => {
    const { key, type, placeholder, options: colOptions, disabled } = column;
    const fieldValue = row[key] ?? "";
    const handleChange = (newValue) => updateRow(rowIndex, key, newValue);
    const commonProps = { disabled, className: "!w-full !rounded-lg !border-[#D1DBD7] !bg-white !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)] disabled:!cursor-not-allowed disabled:!bg-[#F3F6F4] disabled:!text-[#65746E]" };

    if (type === "select") {
      if (key === "equipmentInstrumentName") {
        return (
          <Select
            {...commonProps}
            value={fieldValue || undefined}
            placeholder={equipmentLoading ? "Loading..." : placeholder}
            onChange={handleChange}
            options={equipmentOptions}
            disabled={disabled || equipmentLoading}
            showSearch
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
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
          onChange={(date) => handleChange(date ? date.format("YYYY-MM-DD") : "")}
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
    const monthlyData = normalizeMonthlyData(row.monthlyCalibration);
    const dateValue = monthlyData?.[monthKey]?.[dateType] || "";
    const enabled = isMonthEnabled(row.calibrationFrequency, monthKey, row.calibrationFrequencyStartDate);
    return (
      <DatePicker
        value={dateValue ? dayjs(dateValue) : null}
        disabled={!enabled}
        placeholder={enabled ? "Select date" : "Disabled"}
        onChange={(date) => {
          if (!enabled) return;
          updateMonthlyDate(rowIndex, monthKey, dateType, date ? date.format("YYYY-MM-DD") : "");
        }}
        format="DD/MM/YYYY"
        allowClear
        className={`!h-9 !w-full !rounded-md !text-[10px] !font-medium !shadow-none ${enabled ? "!border-[#D1DBD7] !bg-white !text-[#263B35] hover:!border-[#A8B9B2] focus:!border-[#4E7585]" : "!cursor-not-allowed !border-[#E1E7E4] !bg-[#F0F3F1] !text-[#9AA6A1]"}`}
      />
    );
  };

  const visibleColumns = columns.filter((column) => column.hidden !== true);
  const frequencyIndex = visibleColumns.findIndex((column) => column.key === "calibrationFrequency");
  const columnsBeforeMonths = visibleColumns.filter((_, index) => index <= frequencyIndex);
  const columnsAfterMonths = visibleColumns.filter((_, index) => index > frequencyIndex);

  // Determine if we should show the "Child" column
  const showChildColumn = typeof onViewChild === "function";

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
      <div className="flex min-h-[68px] items-center justify-between gap-5 border-b border-[#D7E0DC] bg-[#F7F9F8] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D5E0DF] bg-white text-[#4E7585] shadow-[0_2px_7px_rgba(38,53,46,0.05)]">
            <Table2 size={17} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#263B35]">{name}</h3>
            {description && <p className="mt-0.5 truncate text-[11px] font-medium text-[#899690]">{description}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={addRow}
          disabled={maxRows !== undefined && rows.length >= maxRows}
          className="group flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#2B5577] px-3.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(43,85,119,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#234766] hover:shadow-[0_7px_16px_rgba(43,85,119,0.25)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus size={14} strokeWidth={2} className="transition-transform duration-200 group-hover:rotate-90" />
          {addButtonLabel}
        </button>
      </div>

      <div className="grid-scroll w-full max-h-[520px] overflow-auto rounded-b-xl">
        <table className="w-full min-w-[4300px] border-collapse">
          <thead className="sticky top-0 z-[5]">
            <tr className="bg-[#EEF3F1]">
              <th className="sticky left-0 z-[10] w-[56px] border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]">S.No</th>
              {columnsBeforeMonths.map((column) => (
                <th key={column.key} style={{ minWidth: column.minWidth || 180 }} className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]">
                  <div className="flex items-center gap-1">{column.title}{column.required && <span className="text-red-500">*</span>}</div>
                </th>
              ))}
              {showMonthlyCalendar && MONTHS.map((month) => (
                <th key={month.key} style={{ minWidth: 300, width: 300 }} className="border-b border-r border-[#D5DFDB] bg-[#E7EFEC] p-0 text-center align-middle">
                  <div className="flex min-h-[48px] items-center justify-center border-b border-[#D5DFDB] bg-[#E1EBE7] px-3">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#2F4940]">
                      <CalendarDays size={14} strokeWidth={1.8} />
                      {month.label}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="border-r border-[#D5DFDB] px-2 py-2.5 text-center text-[9px] font-bold uppercase tracking-[0.03em] text-[#63736C]">Scheduler Date</div>
                    <div className="px-2 py-2.5 text-center text-[9px] font-bold uppercase tracking-[0.03em] text-[#63736C]">Calibration Date</div>
                  </div>
                </th>
              ))}
              {columnsAfterMonths.map((column) => (
                <th key={column.key} style={{ minWidth: column.minWidth || 180 }} className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]">
                  <div className="flex items-center gap-1">{column.title}{column.required && <span className="text-red-500">*</span>}</div>
                </th>
              ))}

              {/* Child column (conditional) */}
              {showChildColumn && (
                <th className="w-[70px] border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]">
                  {viewChildLabel}
                </th>
              )}

              <th className="w-[62px] border-b border-[#D5DFDB] bg-[#EEF3F1] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group bg-white transition-colors duration-150 hover:bg-[#FAFCFB]">
                  <td className="sticky left-0 z-[4] border-b border-r border-[#E0E7E4] bg-white px-3 py-3 text-center align-top group-hover:bg-[#FAFCFB]">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#EDF2F0] px-1.5 text-[10px] font-bold text-[#60716A]">{String(rowIndex + 1).padStart(2, "0")}</span>
                  </td>
                  {columnsBeforeMonths.map((column) => (
                    <td key={column.key} className="border-b border-r border-[#E0E7E4] px-3 py-2.5 align-top">{renderField(column, row, rowIndex)}</td>
                  ))}
                  {showMonthlyCalendar && MONTHS.map((month) => {
                    const monthEnabled = isMonthEnabled(row.calibrationFrequency, month.key, row.calibrationFrequencyStartDate);
                    return (
                      <td key={month.key} style={{ minWidth: 300 }} className={`border-b border-r border-[#E0E7E4] p-2 align-top ${monthEnabled ? "bg-[#FCFDFC]" : "bg-[#F5F7F6]"}`}>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="min-w-0">{renderMonthlyDatePicker(row, rowIndex, month.key, "schedulerDate")}</div>
                          <div className="min-w-0">{renderMonthlyDatePicker(row, rowIndex, month.key, "calibrationDate")}</div>
                        </div>
                      </td>
                    );
                  })}
                  {columnsAfterMonths.map((column) => (
                    <td key={column.key} className="border-b border-r border-[#E0E7E4] px-3 py-2.5 align-top">{renderField(column, row, rowIndex)}</td>
                  ))}

                  {/* Child button column */}
                  {showChildColumn && (
<td className="border-b border-r border-[#E0E7E4] px-2 py-2.5 text-center align-top">
  <button
    type="button"
    onClick={() => onViewChild(rowIndex, row)}
    className="inline-flex h-8 items-center justify-center rounded-md bg-[#3d606d] px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#2B5577] hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#4E7585] focus:ring-offset-1"
    aria-label="Create child calibration"
    title="Create child calibration"
  >
    Child
  </button>
</td>

                  )}

                  <td className="border-b border-[#E0E7E4] px-2 py-2.5 text-center align-top">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(rowIndex)}
                      disabled={rows.length <= minRows}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#9AA6A1] transition-all duration-200 hover:bg-[#FFF1F1] hover:text-[#DF5B5B] active:scale-90 disabled:cursor-not-allowed disabled:opacity-25"
                      aria-label="Delete row"
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    1 +
                    columnsBeforeMonths.length +
                    (showMonthlyCalendar ? MONTHS.length : 0) +
                    columnsAfterMonths.length +
                    (showChildColumn ? 1 : 0) +
                    1 // Action column
                  }
                  className="h-[80px] border-b border-[#E0E7E4] px-5 text-center text-[11px] font-medium text-[#899690]"
                >
                  No calibration rows added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex min-h-[40px] items-center justify-between border-t border-[#E0E7E4] bg-[#FAFBFA] px-4">
        <span className="text-[10px] font-medium text-[#899690]">{rows.length} {rows.length === 1 ? "row" : "rows"}</span>
        {maxRows !== undefined && <span className="text-[10px] font-medium text-[#899690]">{rows.length} / {maxRows} rows</span>}
      </div>

      <UserModal isOpen={isDeleteModalOpen} onClose={handleCancelDelete} title="Delete Row" description="Please confirm this action before continuing." width="max-w-[420px]">
        <div className="space-y-5">
          <p className="text-[13px] leading-6 text-[#596760]">Are you sure you want to delete this row? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 border-t border-[#E8ECEA] pt-4">
            <button type="button" onClick={handleCancelDelete} className="h-9 rounded-lg border border-[#D5DEDA] bg-white px-4 text-[12px] font-semibold text-[#596760] transition-all duration-200 hover:bg-[#F6F8F7] hover:text-[#263B35] active:scale-[0.98]">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} className="h-9 rounded-lg bg-[#F52F3E] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(245,47,62,0.20)] transition-all duration-200 hover:bg-[#E52635] hover:shadow-[0_6px_15px_rgba(245,47,62,0.28)] active:scale-[0.98]">Delete Row</button>
          </div>
        </div>
      </UserModal>

      <style>{`
        .grid-scroll { scrollbar-width: thin; scrollbar-color: #8FA8A0 #EEF3F1; }
        .grid-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .grid-scroll::-webkit-scrollbar-track { background: #EEF3F1; border-radius: 999px; }
        .grid-scroll::-webkit-scrollbar-thumb { background: #8FA8A0; border-radius: 999px; border: 1px solid #EEF3F1; }
        .grid-scroll::-webkit-scrollbar-thumb:hover { background: #66877C; }
        .grid-scroll::-webkit-scrollbar-corner { background: #EEF3F1; }
      `}</style>
    </div>
  );
};

export default CalibrationGrid;