import React, { useState } from "react";
import { Plus, Trash2, Table2 } from "lucide-react";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import UserModal from "../../../components/common/UserModal/UserModal";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";
import { updateCalibration } from "../../../services/usersApi/calibrationApi";
import "../../../components/ui/disabledFields.css";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";

const { TextArea } = Input;

const InstrumentCalibrationGrid = ({
  value = [],
  onChange,
  equipmentOptions = [],
  equipmentMap = {},
  equipmentLoading = false,
  name = "Field Instrument Calibration Addendum",
  description = "",
  addButtonLabel = "Add Row",
  minRows = 0,
  maxRows,
  recordId,
  disabled = false,
  showAddButton = false,
}) => {
  // Added descriptive placeholders so users know what to type
  const mainColumns = [
    { key: "equipmentName", title: "Equipment Name", type: "select", placeholder: "Select equipment",  minWidth: 160 },
    { key: "instrumentName", title: "Instrument Name", type: "text", placeholder: "Enter name",  minWidth: 150 },
    { key: "instrumentId", title: "Instrument ID No.", type: "text", placeholder: "Auto-filled",  minWidth: 140, disabled: true },
    { key: "make", title: "Make", type: "text", placeholder: "Enter make", minWidth: 100 },
    { key: "modelNo", title: "Sr. No./ Model No.", type: "text", placeholder: "Enter Sr. No.", minWidth: 130 },
    { key: "leastCount", title: "Least Count", type: "text", placeholder: "Enter count", minWidth: 100 },
    { key: "location", title: "Location", type: "text", placeholder: "Auto-filled", minWidth: 150, disabled: true },
    { key: "accuracy", title: "Accuracy", type: "text", placeholder: "Enter accuracy", minWidth: 100 },
    { key: "instrumentRange", title: "Instrument Range", type: "text", placeholder: "Enter range", minWidth: 120 },
    { key: "operatingRange", title: "Operating Range", type: "text", placeholder: "Enter range", minWidth: 120 },
    { key: "calibrationTestPoint", title: "Calibration test point", type: "text", placeholder: "Enter point", minWidth: 140 },
    { key: "category", title: "Category", type: "select", placeholder: "Select", minWidth: 100, options: [{ value: "critical", label: "Critical" }, { value: "non-critical", label: "Non-Critical" }, { value: "indicative", label: "Indicative" }] },
  ];

  const rows = Array.isArray(value) ? value : [];
  const [deleteRowIndex, setDeleteRowIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const addRow = () => {
    if (disabled) return;
    if (maxRows !== undefined && rows.length >= maxRows) return;
    const newRow = {};
    
    // Initialize main columns
    mainColumns.forEach((column) => { newRow[column.key] = ""; });
    
    // Initialize the 2 specific date fields and remarks
    newRow.calibrationNextDueDate = "";
    newRow.calibrationDoneDate = "";
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
      if (selectedId) await updateCalibration(selectedId, payload);
      onChange(updatedRows);
      setDeleteRowIndex(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete row:", error);
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

    // Auto-populate all fields when an Equipment is selected
    if (key === "equipmentName") {
      const equipmentId = newValue;
      if (equipmentId && equipmentMap[equipmentId]) {
        const eq = equipmentMap[equipmentId];
        
        row.instrumentName = eq.instrument_name || "";
        row.instrumentId = eq.instrument_id_no || eq.equipment_id || "";
        row.make = eq.make || "";
        row.modelNo = eq.sr_no_model_no || "";
        row.leastCount = eq.least_count || "";
        row.location = eq.location || "";
        row.accuracy = eq.accuracy || "";
        row.instrumentRange = eq.instrument_range || "";
        row.operatingRange = eq.operating_range || "";
        row.calibrationTestPoint = eq.calibration_test_points || "";
        
        // Map category safely to the values expected by the dropdown (critical, non-critical, indicative)
        if (eq.category) {
          const catLower = eq.category.toLowerCase();
          if (catLower.includes("non")) {
            row.category = "non-critical";
          } else if (catLower.includes("critical")) {
            row.category = "critical";
          } else if (catLower.includes("indicative")) {
            row.category = "indicative";
          } else {
            row.category = eq.category;
          }
        } else {
          row.category = "";
        }

      } else {
        // Clear all fields if equipment selection is cleared
        row.instrumentName = "";
        row.instrumentId = "";
        row.make = "";
        row.modelNo = "";
        row.leastCount = "";
        row.location = "";
        row.accuracy = "";
        row.instrumentRange = "";
        row.operatingRange = "";
        row.calibrationTestPoint = "";
        row.category = "";
      }
    }

    updated[rowIndex] = row;
    onChange(updated);
  };

  const renderField = (column, row, rowIndex) => {
    const { key, type, placeholder, options: colOptions, disabled: columnDisabled } = column;
    const fieldValue = row[key] ?? "";
    const handleChange = (newValue) => updateRow(rowIndex, key, newValue);
    const isDisabled = disabled || columnDisabled;
    
    const commonProps = {
      disabled: isDisabled,
      className: "!w-full !rounded-none !shadow-none disabled:!cursor-not-allowed disabled:!bg-transparent disabled:!text-[#65746E]",
    };

    if (type === "select") {
      return (
        <Select
          {...commonProps}
          value={fieldValue || undefined}
          placeholder={equipmentLoading ? "Loading..." : placeholder}
          onChange={handleChange}
          options={key === "equipmentName" ? equipmentOptions : colOptions}
          disabled={isDisabled || (key === "equipmentName" && equipmentLoading)}
          showSearch={key === "equipmentName"}
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          className="!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!border-transparent [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!px-2 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[#9AA6A1]"
        />
      );
    }

    return (
      <Input
        {...commonProps}
        value={fieldValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className="!h-8 !w-full !rounded-none !border-transparent !bg-transparent !px-2 !text-[11px] !font-medium !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!bg-white"
      />
    );
  };

  const renderDateField = (row, key, rowIndex) => {
    const val = row[key];
    return (
      <DatePicker
        value={val ? dayjs(val) : null}
        onChange={(date) => updateRow(rowIndex, key, date ? date.format("YYYY-MM-DD") : "")}
        format="DD-MM-YYYY"
        variant="borderless"
        className="!h-8 !w-full !px-2 !text-[11px] !font-medium !text-[#263B35] hover:bg-[#F3F6F4] cursor-pointer"
        disabled={disabled}
        placeholder="DD/MM/YYYY"
      />
    );
  };

  // Total columns = 1 (Sr No) + 12 (Main) + 2 (Dates) + 1 (Remarks) + 1 (Action) = 17
  const totalColumns = 17;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
      <div className="flex min-h-[60px] items-center justify-between gap-5 border-b border-[#D7E0DC] bg-[#F7F9F8] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D5E0DF] bg-white text-[#4E7585] shadow-[0_2px_7px_rgba(38,53,46,0.05)]">
            <Table2 size={17} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#263B35]">{name}</h3>
            {description && <p className="mt-0.5 truncate text-[11px] font-medium text-[#899690]">{description}</p>}
          </div>
        </div>
        {showAddButton && (
          <button
            type="button"
            onClick={addRow}
            disabled={disabled || (maxRows !== undefined && rows.length >= maxRows)}
            className="group flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#2B5577] px-3.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(43,85,119,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#234766] hover:shadow-[0_7px_16px_rgba(43,85,119,0.25)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus size={14} strokeWidth={2} className="transition-transform duration-200 group-hover:rotate-90" />
            {addButtonLabel}
          </button>
        )}
      </div>

      <CustomScrollContainer maxHeight="600px" direction="both" className="w-full rounded-b-xl">
        <table className="w-full min-w-[max-content] border-collapse border border-[#D5DFDB]">
          <thead className="sticky top-0 z-[5]">
            <tr className="bg-[#EEF3F1]">
              <th className="w-[50px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Sr. No.</th>
              
              {mainColumns.map((column) => (
                <th 
                  key={column.key} 
                  style={{ minWidth: column.minWidth || 120 }} 
                  className="border border-[#D5DFDB] px-2 py-2 text-left align-middle text-[10px] font-bold text-[#43564F]"
                >
                  <div className="flex items-center gap-1">
                {column.title}
                {column.key === "equipmentName" && (
                  <RequiredAsterisk
                    message="Equipment Name is required. Please select an equipment item to continue."
                  />
                )}

                {column.key !== "equipmentName" && column.required && (
                  <span className="text-red-500">*</span>
                )}
              </div>
                </th>
              ))}
              
          <th className="w-[180px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
            <div className="flex items-center justify-center gap-1">
              Calibration Next Due Date
              <RequiredAsterisk
                message="Calibration Next Due Date is required. Please select the next due date."
              />
            </div>
          </th>
              <th className="w-[140px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Calibration Done Date</th>
              
              <th className="w-[150px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Remarks</th>
              <th className="w-[60px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="bg-white transition-colors duration-150 hover:bg-[#FAFCFB]">
                  {/* Sr. No. */}
                  <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle min-h-[40px]">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center text-[11px] font-medium text-[#263B35]">{rowIndex + 1}.</span>
                  </td>
                  
                  {/* Main Columns */}
                  {mainColumns.map((column) => (
                    <td key={column.key} className="border border-[#D5DFDB] p-0 align-middle min-h-[40px]">
                      {renderField(column, row, rowIndex)}
                    </td>
                  ))}

                  {/* The 2 date columns */}
                  <td className="border border-[#D5DFDB] p-0 align-middle min-h-[40px]">
                    {renderDateField(row, "calibrationNextDueDate", rowIndex)}
                  </td>
                  <td className="border border-[#D5DFDB] p-0 align-middle min-h-[40px]">
                    {renderDateField(row, "calibrationDoneDate", rowIndex)}
                  </td>

                  {/* Remarks */}
                  <td className="border border-[#D5DFDB] p-0 align-middle min-h-[40px]">
                    <TextArea
                      value={row.remark ?? ""}
                      onChange={(e) => updateRow(rowIndex, "remark", e.target.value)}
                      rows={2}
                      placeholder="Enter remarks"
                      className="!h-full !min-h-[40px] !w-full !resize-none !rounded-none !border-transparent !bg-transparent !px-2 !py-1.5 !text-[11px] !font-medium !leading-5 !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!bg-white"
                      disabled={disabled}
                    />
                  </td>

                  {/* Delete Action */}
                  <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle min-h-[40px]">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(rowIndex)}
                      disabled={disabled || rows.length <= minRows}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#9AA6A1] transition-all duration-200 hover:bg-[#FFF1F1] hover:text-[#DF5B5B] active:scale-90 disabled:cursor-not-allowed disabled:opacity-25"
                      aria-label="Delete row"
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={totalColumns} className="h-[80px] border border-[#D5DFDB] px-5 text-center text-[11px] font-medium text-[#899690]">
                  No rows added yet. Click "Add Row" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CustomScrollContainer>

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
    </div>
  );
};

export default InstrumentCalibrationGrid;