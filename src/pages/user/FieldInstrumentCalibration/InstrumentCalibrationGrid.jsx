import React, { useState } from "react";
import { Plus, Trash2, Table2, Loader2 } from "lucide-react";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import UserModal from "../../../components/common/UserModal/UserModal";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";
import { updateCalibration } from "../../../services/usersApi/calibrationApi";
import "../../../components/ui/disabledFields.css";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";

const { TextArea } = Input;

// 👇 map any category string coming from the API to the dropdown's option value
const normalizeCategory = (raw) => {
  if (raw === undefined || raw === null) return "";
  const s = String(raw).trim().toLowerCase();
  if (!s) return "";
  if (["nc", "non-critical", "non critical", "noncritical"].includes(s)) return "non-critical";
  if (["c", "critical"].includes(s)) return "critical";
  if (["i", "indicative", "ind"].includes(s)) return "indicative";
  return raw;
};

const InstrumentCalibrationGrid = ({
  value = [],
  onChange,
  name = "Field Instrument Calibration Addendum",
  description = "",
  addButtonLabel = "Add Row",
  minRows = 0,
  maxRows,
  recordId,
  disabled = false,
  showAddButton = false,
  equipmentOptions = [],
  equipmentMap = {},
  equipmentLoading = false,
  onViewChild,
  canCreateChild = false,
  viewChildLabel = "Child",
}) => {
  const mainColumns = [
    { key: "equipmentName", title: "Equipment Name", type: "equipment-select", placeholder: "Select equipment", minWidth: 200 },
    { key: "instrumentName", title: "Instrument Name", type: "text", placeholder: "Enter name", minWidth: 150 },
    { key: "instrumentId", title: "Instrument ID No.", type: "text", placeholder: "Enter ID", minWidth: 140 },
    { key: "make", title: "Make", type: "text", placeholder: "Enter make", minWidth: 100 },
    { key: "modelNo", title: "Sr. No./ Model No.", type: "text", placeholder: "Enter Sr. No.", minWidth: 130 },
    { key: "leastCount", title: "Least Count", type: "text", placeholder: "Enter count", minWidth: 100 },
    { key: "location", title: "Location", type: "text", placeholder: "Enter location", minWidth: 150 },
    { key: "accuracy", title: "Accuracy", type: "text", placeholder: "Enter accuracy", minWidth: 100 },
    { key: "instrumentRange", title: "Instrument Range", type: "text", placeholder: "Enter range", minWidth: 120 },
    { key: "operatingRange", title: "Operating Range", type: "text", placeholder: "Enter range", minWidth: 120 },
    { key: "calibrationTestPoint", title: "Calibration test point", type: "text", placeholder: "Enter point", minWidth: 140 },
    { key: "category", title: "Category", type: "select", placeholder: "Select", minWidth: 100, options: [{ value: "critical", label: "Critical" }, { value: "non-critical", label: "Non-Critical" }, { value: "indicative", label: "Indicative" }] },
  ];

  const API_POPULATED_COLUMNS = [
    "instrumentName", "instrumentId", "make", "modelNo",
    "leastCount", "location", "accuracy", "instrumentRange",
    "operatingRange", "calibrationTestPoint", "category",
  ];

  const rows = Array.isArray(value) ? value : [];
  const [deleteRowIndex, setDeleteRowIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const addRow = () => {
    if (disabled) return;
    if (maxRows !== undefined && rows.length >= maxRows) return;
    const newRow = {};
    mainColumns.forEach((column) => { newRow[column.key] = ""; });
    newRow.equipmentDbId = "";
    newRow.calibrationNextDueDate = "";
    newRow.calibrationDoneDate = "";
    newRow.remark = "";
    newRow.row_id = rows.length + 1;
    newRow.isEquipmentLocked = false;
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
      const updatedRows = rows
        .filter((_, index) => index !== deleteRowIndex)
        .map((row, index) => ({ ...row, row_id: index + 1 }));
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
    updated[rowIndex] = row;
    onChange(updated);
  };

  const handleEquipmentSelect = (rowIndex, equipmentId) => {
    if (disabled) return;
    const equipment = equipmentMap[String(equipmentId)];
    const updated = [...rows];
    const row = { ...updated[rowIndex] };

    if (equipment) {
      const name =
        equipment.equipment_name ||
        equipment.instrument_name ||
        equipment.instrumentName ||
        equipment.name ||
        "";

      row.equipmentDbId        = String(equipment.id);
      row.equipmentName        = name;
      row.instrumentName       = equipment.instrument_name || equipment.instrumentName || equipment.equipment_name || equipment.name || "";
      row.instrumentId         = equipment.instrument_id_no || equipment.equipment_id || equipment.field_instrument_id || equipment.instrument_id || "";
      row.make                 = equipment.make || equipment.manufacturer || "";
      row.modelNo              = equipment.sr_no_model_no || equipment.model || equipment.model_no || "";
      row.leastCount           = equipment.least_count || equipment.leastCount || "";
      row.location             = equipment.location || equipment.area || "";
      row.accuracy             = equipment.accuracy || "";
      row.instrumentRange      = equipment.instrument_range || equipment.instrumentrange || equipment.range || "";
      row.operatingRange       = equipment.operating_range || equipment.operatingrange || "";
      row.calibrationTestPoint =
        equipment.calibration_test_points ||
        equipment.calibration_test_point  ||
        equipment.calibrationTestPoints   ||
        "";
      row.category             = normalizeCategory(equipment.category) || row.category || "";
      row.isEquipmentLocked    = true;
    } else {
      row.equipmentDbId = "";
      row.equipmentName = "";
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
      row.isEquipmentLocked = false;
    }

    updated[rowIndex] = row;
    onChange(updated);
  };

  const renderField = (column, row, rowIndex) => {
    const { key, type, placeholder, options: colOptions } = column;
    const fieldValue = row[key] ?? "";

    const isRowFromApi = row.isFromApi === true;
    const isEquipmentLocked = row.isEquipmentLocked === true;
    const isApiColumn = API_POPULATED_COLUMNS.includes(key);
    const isLockedByEquipment = isEquipmentLocked && isApiColumn && key !== "equipmentName";
    const isDisabled = disabled || (isRowFromApi && isApiColumn) || isLockedByEquipment;

    if (type === "equipment-select") {
      const selectValue =
        row.equipmentDbId !== undefined && row.equipmentDbId !== null && row.equipmentDbId !== ""
          ? String(row.equipmentDbId)
          : (equipmentOptions.find((opt) => opt.label === row.equipmentName)?.value || undefined);

      return (
        <Select
          value={selectValue}
          placeholder={equipmentLoading ? "Loading..." : placeholder}
          onChange={(id) => handleEquipmentSelect(rowIndex, id)}
          options={equipmentOptions}
          disabled={isDisabled || equipmentLoading}
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          className="!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!border-transparent [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!px-2 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[#9AA6A1] disabled:[&_.ant-select-selector]:!bg-[#F9FAF9]"
        />
      );
    }

    if (type === "select") {
      return (
        <Select
          value={fieldValue || undefined}
          placeholder={placeholder}
          onChange={(v) => updateRow(rowIndex, key, v)}
          options={colOptions}
          disabled={isDisabled}
          className="!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!border-transparent [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!px-2 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[#9AA6A1]"
        />
      );
    }

    return (
      <Input
        value={fieldValue}
        placeholder={placeholder}
        onChange={(e) => updateRow(rowIndex, key, e.target.value)}
        disabled={isDisabled}
        className="!h-8 !w-full !rounded-none !border-transparent !bg-transparent !px-2 !text-[11px] !font-medium !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!bg-white disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
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
        className="!h-8 !w-full !px-2 !text-[11px] !font-medium !text-[#263B35] hover:bg-[#F3F6F4] cursor-pointer disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
        disabled={disabled}
        placeholder="DD/MM/YYYY"
      />
    );
  };

  // 👇 NEW — Child button state derived from Calibration Next Due Date
  //    Window = [ Next Due − 30 days (00:00) , Next Due (23:59:59) ]
  //    Uses today's date (local, start of day) for the comparison.
  const getChildButtonState = (row) => {
    // 1. No due date → prompt user to fill it
    if (!row.calibrationNextDueDate) {
      return {
        enabled: false,
        title: "Please select a Calibration Next Due Date in this row to enable child creation.",
      };
    }

    // 2. Parse the due date (stored as YYYY-MM-DD in state; dayjs handles it)
    const nextDue = dayjs(row.calibrationNextDueDate);
    if (!nextDue.isValid()) {
      return {
        enabled: false,
        title: "Invalid Calibration Next Due Date — please re-select the date.",
      };
    }

    const nextDueStart = nextDue.startOf("day");
    const windowStart = nextDueStart.subtract(30, "day").startOf("day");
    const windowEnd = nextDueStart.endOf("day");

    // 3. Today must be within [windowStart, windowEnd] inclusive
    const todayStart = dayjs().startOf("day");
    const isWithinWindow =
      !todayStart.isBefore(windowStart) && !todayStart.isAfter(windowEnd);

    // 4. Role / stage gate
    if (!canCreateChild) {
      return {
        enabled: false,
        title: "Child creation is available only to Initiator at Close Done stage.",
      };
    }

    // 5. Date-window gate
    if (!isWithinWindow) {
      return {
        enabled: false,
        title: `Child can only be created between ${windowStart.format(
          "DD-MM-YYYY"
        )} and ${windowEnd.format("DD-MM-YYYY")} (30 days before the next due date up to the next due date).`,
      };
    }

    return {
      enabled: true,
      title: `Create child calibration (window: ${windowStart.format(
        "DD-MM-YYYY"
      )} → ${windowEnd.format("DD-MM-YYYY")})`,
    };
  };

  const showChildColumn = typeof onViewChild === "function";
  const totalColumns = 17 + (showChildColumn ? 1 : 0);

  const renderSkeletonRows = () =>
    Array.from({ length: 3 }).map((_, idx) => (
      <tr key={`skel-${idx}`} className="bg-white">
        <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
          <div className="mx-auto h-4 w-5 animate-pulse rounded bg-[#E5EBE8]" />
        </td>
        {mainColumns.map((c) => (
          <td key={c.key} className="border border-[#D5DFDB] px-2 py-2 align-middle">
            <div
              className="h-4 animate-pulse rounded bg-[#E5EBE8]"
              style={{ width: `${55 + ((idx * 13) % 45)}%` }}
            />
          </td>
        ))}
        <td className="border border-[#D5DFDB] px-2 py-2 align-middle">
          <div className="mx-auto h-6 w-24 animate-pulse rounded bg-[#E5EBE8]" />
        </td>
        <td className="border border-[#D5DFDB] px-2 py-2 align-middle">
          <div className="mx-auto h-6 w-20 animate-pulse rounded bg-[#E5EBE8]" />
        </td>
        <td className="border border-[#D5DFDB] px-2 py-2 align-middle">
          <div className="h-6 w-full animate-pulse rounded bg-[#E5EBE8]" />
        </td>
        {showChildColumn && (
          <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
            <div className="mx-auto h-4 w-10 animate-pulse rounded bg-[#E5EBE8]" />
          </td>
        )}
        <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
          <div className="mx-auto h-4 w-4 animate-pulse rounded bg-[#E5EBE8]" />
        </td>
      </tr>
    ));

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
      <div className="flex min-h-[60px] items-center justify-between gap-5 border-b border-[#D7E0DC] bg-[#F7F9F8] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D5E0DF] bg-white text-[#4E7585] shadow-[0_2px_7px_rgba(38,53,46,0.05)]">
            {equipmentLoading ? (
              <Loader2 size={17} strokeWidth={1.8} className="animate-spin" />
            ) : (
              <Table2 size={17} strokeWidth={1.8} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#263B35]">{name}</h3>
            {equipmentLoading ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[#4E7585]">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#4E7585]" />
                Loading instruments…
              </p>
            ) : description ? (
              <p className="mt-0.5 truncate text-[11px] font-medium text-[#899690]">{description}</p>
            ) : null}
          </div>
        </div>
        {showAddButton && (
          <button
            type="button"
            onClick={addRow}
            disabled={disabled || equipmentLoading || (maxRows !== undefined && rows.length >= maxRows)}
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
                      <RequiredAsterisk message="Equipment Name is required. Please select an equipment." />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-[180px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
                <div className="flex items-center justify-center gap-1">
                  Calibration Next Due Date
                  <RequiredAsterisk message="Calibration Next Due Date is required. Please select the next due date." />
                </div>
              </th>
              <th className="w-[140px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Calibration Done Date</th>
              <th className="w-[150px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Remarks</th>
              {showChildColumn && (
                <th className="w-[70px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
                  {viewChildLabel}
                </th>
              )}
              <th className="w-[60px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Action</th>
            </tr>
          </thead>
          <tbody>
            {equipmentLoading ? (
              renderSkeletonRows()
            ) : rows.length > 0 ? (
              rows.map((row, rowIndex) => {
                const { enabled: childButtonEnabled, title: childButtonTitle } =
                  getChildButtonState(row);

                return (
                  <tr key={rowIndex} className="bg-white transition-colors duration-150 hover:bg-[#FAFCFB]">
                    <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle min-h-[40px]">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center text-[11px] font-medium text-[#263B35]">
                        {row.row_id ?? rowIndex + 1}.
                      </span>
                    </td>

                    {mainColumns.map((column) => (
                      <td key={column.key} className="border border-[#D5DFDB] p-0 align-middle min-h-[40px]">
                        {renderField(column, row, rowIndex)}
                      </td>
                    ))}

                    <td className="border border-[#D5DFDB] p-0 align-middle min-h-[40px]">
                      {renderDateField(row, "calibrationNextDueDate", rowIndex)}
                    </td>
                    <td className="border border-[#D5DFDB] p-0 align-middle min-h-[40px]">
                      {renderDateField(row, "calibrationDoneDate", rowIndex)}
                    </td>

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

                    {showChildColumn && (
                      <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle min-h-[40px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (!childButtonEnabled) return;
                            onViewChild(rowIndex, { ...row, row_id: row.row_id ?? rowIndex + 1 });
                          }}
                          disabled={!childButtonEnabled}
                          className={`inline-flex h-7 items-center justify-center rounded px-3 text-[11px] font-medium text-white shadow-sm transition-all duration-200 focus:outline-none ${
                            childButtonEnabled
                              ? "bg-[#3d606d] hover:bg-[#2B5577] active:scale-95"
                              : "cursor-not-allowed bg-[#B8C2BE] opacity-50"
                          }`}
                          aria-label="Create child calibration"
                          title={childButtonTitle}
                        >
                          Child
                        </button>
                      </td>
                    )}

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
                );
              })
            ) : (
              <tr>
                <td colSpan={totalColumns} className="h-[80px] border border-[#D5DFDB] px-5 text-center text-[11px] font-medium text-[#899690]">
                  No rows added yet. Select Instrument Type &amp; Department to auto-load equipment, or click &quot;Add Row&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CustomScrollContainer>

      <div className="flex min-h-[40px] items-center justify-between border-t border-[#E0E7E4] bg-[#FAFBFA] px-4">
        <span className="text-[10px] font-medium text-[#899690]">
          {equipmentLoading ? "Fetching instruments…" : `${rows.length} ${rows.length === 1 ? "row" : "rows"}`}
        </span>
        {maxRows !== undefined && !equipmentLoading && (
          <span className="text-[10px] font-medium text-[#899690]">{rows.length} / {maxRows} rows</span>
        )}
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