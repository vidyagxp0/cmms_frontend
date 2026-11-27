import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Table2, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input, Select, DatePicker, Checkbox } from "antd";
import dayjs from "dayjs";
import UserModal from "../../../components/common/UserModal/UserModal";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";
import { updateCalibration } from "../../../services/usersApi/calibrationApi";
import "../../../components/ui/disabledFields.css";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";
import { toast } from "sonner";

const { TextArea } = Input;

/* ── NEW: pagination constant ── */
const DEFAULT_PAGE_SIZE = 20;

/* ── NEW: page loader ── */
const PageLoader = ({ visible }) => {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-b-xl bg-white/70"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E0E7E4] bg-white px-5 py-3 shadow-[0_6px_20px_rgba(38,53,46,0.12)]">
        <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-[#D5DFDB] border-t-[#2B5577]" />
        <p className="text-[11px] font-semibold tracking-wide text-[#596760]">
          Loading page…
        </p>
      </div>
    </div>
  );
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
  onViewChild,
  viewChildLabel = "Child",
  recordId,
  disabled = false,
  canCreateChild = false,
  showAddButton = true,
  pageSize = DEFAULT_PAGE_SIZE, // NEW
  // Rows are auto-filled from the instrument master API: lock the columns
  // whose values come from that API so they can't be edited by hand.
  lockApiFields = false,
  // Lock the "Calibration Done on" / "Next Calibration Done on" pickers.
  disableDoneDates = false,
  // Lock the "Next Planned date" picker.
  disableNextPlannedDate = false,
}) => {
  const columns = [
    { key: "equipmentInstrumentName", title: "Instrument Name.", type: "select", placeholder: "Select instrument", required: true, minWidth: 180 },
    { key: "equipmentInstrumentId", title: "Instrument ID No.", type: "text", placeholder: "", required: true, minWidth: 150, disabled: true },
    { key: "make", title: "Make", type: "text", placeholder: "", minWidth: 120, disabled: true },
    { key: "model", title: "Sr. No / Model No", type: "text", placeholder: "", minWidth: 140, disabled: true },
    { key: "location", title: "Location", type: "text", placeholder: "", minWidth: 140, disabled: true },
    { key: "leastCount", title: "Least Count", type: "text", placeholder: "", minWidth: 120, disabled: true },
    { key: "accuracy", title: "Accuracy", type: "text", placeholder: "", minWidth: 120, disabled: true },
    { key: "instrumentrange", title: "Instrument Range", type: "text", placeholder: "", minWidth: 160, disabled: true },
    { key: "operatingrange", title: "Operating Range", type: "text", placeholder: "", minWidth: 160, disabled: true },
    { key: "calibrationTestPoints", title: "Calibration test points", type: "text", placeholder: "", minWidth: 160, disabled: true },
    { key: "category", title: "Category", type: "select", placeholder: "Select", minWidth: 110, options: [{ value: "critical", label: "Critical" }, { value: "non-critical", label: "Non-Critical" }, { value: "indicative", label: "Indicative" }] },

    // ✅ EXISTING — UNTOUCHED
    { key: "plannedDate", title: "Planned date / Calibration Done on", type: "dualDate", minWidth: 320 },

    // ✅ EXISTING — UNTOUCHED
    { key: "nextPlannedDate", title: "Next Planned date / Next Calibration Done on", type: "dualDateNext", minWidth: 340 },

    { key: "remark", title: "Remarks", type: "textarea", placeholder: "Enter remarks", minWidth: 200 },
  ];

  const rows = Array.isArray(value) ? value : [];
  const [searchTerm, setSearchTerm] = useState("");

  // const [deleteRowIndex, setDeleteRowIndex] = useState(null);
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [selectedId, setSelectedId] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);
const [rowsToDelete, setRowsToDelete] = useState([]);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

const deletingRef = useRef(false);

const canSelectRows = !disabled && !equipmentLoading && !isDeleting;

// const isAllSelected =
//   rows.length > 0 && selectedRows.length === rows.length;

// const isIndeterminate =
//   selectedRows.length > 0 && selectedRows.length < rows.length;

  /* ─────────────────────────────────────────────────────────
     NEW: PAGINATION STATE
     ───────────────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const changeIdRef = useRef(0);

  // const totalRows = rows.length;
  // const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  // const safePage = Math.min(Math.max(1, currentPage), totalPages);
  // const startIndex = (safePage - 1) * pageSize;
  // const endIndex = Math.min(startIndex + pageSize, totalRows);

  // const visibleRows = useMemo(
  //   () =>
  //     rows.slice(startIndex, endIndex).map((row, i) => ({
  //       row,
  //       index: startIndex + i,
  //     })),
  //   [rows, startIndex, endIndex]
  // );

  /* ── Instrument Search Filter ── */

const normalizedSearch = searchTerm.trim().toLowerCase();

const instrumentLabelMap = useMemo(() => {
  return new Map(
    equipmentOptions.map((option) => [
      String(option.value),
      option.label,
    ])
  );
}, [equipmentOptions]);

const filteredRows = useMemo(() => {
  return rows
    .map((row, index) => ({
      row,
      index,
    }))
    .filter(({ row }) => {
      if (!normalizedSearch) return true;

      const rawInstrumentName =
        row?.equipmentInstrumentName ?? "";

      const equipment =
        equipmentMap[String(rawInstrumentName)];

      // Resolve actual instrument name from master data
      const instrumentName = String(
        instrumentLabelMap.get(String(rawInstrumentName)) ||
          equipment?.instrument_name ||
          equipment?.equipment_name ||
          rawInstrumentName
      ).toLowerCase();

      const instrumentId = String(
        row?.equipmentInstrumentId ?? ""
      ).toLowerCase();

      return (
        instrumentName.includes(normalizedSearch) ||
        instrumentId.includes(normalizedSearch)
      );
    });
}, [
  rows,
  normalizedSearch,
  equipmentMap,
  instrumentLabelMap,
]);

/* ── Filtered Row Selection ── */

const filteredRowIndexes = useMemo(
  () => filteredRows.map(({ index }) => index),
  [filteredRows]
);

const selectedRowSet = useMemo(
  () => new Set(selectedRows),
  [selectedRows]
);

const selectedFilteredCount = filteredRowIndexes.filter(
  (index) => selectedRowSet.has(index)
).length;

const isAllSelected =
  filteredRows.length > 0 &&
  selectedFilteredCount === filteredRows.length;

const isIndeterminate =
  selectedFilteredCount > 0 &&
  selectedFilteredCount < filteredRows.length;

/* ── Pagination ── */
const totalRows = filteredRows.length;
const totalPages = Math.max(
  1,
  Math.ceil(totalRows / pageSize)
);

const safePage = Math.min(
  Math.max(1, currentPage),
  totalPages
);

const startIndex = (safePage - 1) * pageSize;
const endIndex = Math.min(
  startIndex + pageSize,
  totalRows
);

const visibleRows = useMemo(
  () => filteredRows.slice(startIndex, endIndex),
  [filteredRows, startIndex, endIndex]
);

/* ── Search Change Handler ── */

const handleSearchChange = useCallback((e) => {
  setSearchTerm(e.target.value);
  // Cancel pending pagination animation
  changeIdRef.current += 1;
  setIsPageChanging(false);
  setCurrentPage(1);
  // Prevent accidental deletion of hidden selected rows
  setSelectedRows([]);
}, []);

  const pageOptions = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, i) => ({
        value: i + 1,
        label: String(i + 1),
      })),
    [totalPages]
  );

  useEffect(() => {
    if (rows.length === 0 && currentPage !== 1) setCurrentPage(1);
  }, [rows.length, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  /* ─────────────────────────────────────────────────────────
     NEW: PAGE CHANGE — two-phase paint so the loader is
     always visible before the heavy render starts. Token
     guard makes rapid clicks safe (last click wins).
     ───────────────────────────────────────────────────────── */
  const goToPage = useCallback(
    (page) => {
      const clamped = Math.min(Math.max(1, page), totalPages);
      if (clamped === safePage) return;

      const id = ++changeIdRef.current;
      setIsPageChanging(true);

      requestAnimationFrame(() => {
        if (changeIdRef.current !== id) return;
        requestAnimationFrame(() => {
          if (changeIdRef.current !== id) return;

          setCurrentPage(clamped);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (changeIdRef.current === id) setIsPageChanging(false);
            });
          });
        });
      });
    },
    [safePage, totalPages]
  );


  const handleSelectRow = (rowIndex, checked) => {
  if (!canSelectRows) return;

  setSelectedRows((prev) =>
    checked
      ? [...new Set([...prev, rowIndex])]
      : prev.filter((index) => index !== rowIndex)
  );
};

const handleSelectAll = (checked) => {
  if (!canSelectRows) return;

  setSelectedRows(
    checked ? [...filteredRowIndexes] : []
  );
};

const handleClearSelection = () => {
  setSelectedRows([]);
};

// Clear selection when the row collection changes.
useEffect(() => {
  setSelectedRows([]);
  setRowsToDelete([]);
  setIsDeleteModalOpen(false);
}, [value, recordId, disabled]);

  const addRow = () => {
    if (disabled) return;
    if (maxRows !== undefined && rows.length >= maxRows) return;
    const newRow = {};
    columns.forEach((column) => { newRow[column.key] = ""; });
    newRow.calibrationDoneDate = "";
    newRow.nextCalibrationDoneDate = ""; // ✅ EXISTING

    const newRows = [...rows, newRow];
    const newPage = Math.max(1, Math.ceil(newRows.length / pageSize));

    onChange(newRows);

    // NEW: jump to the page that contains the new row
    if (newPage !== safePage) goToPage(newPage);
  };

// Individual row deletion
const handleDeleteRow = (rowIndex) => {
  if (!canSelectRows) return;
  if (rows.length <= minRows) return;

  setRowsToDelete([rowIndex]);
  setIsDeleteModalOpen(true);
};

// Bulk row deletion
const handleDeleteSelected = () => {
  if (!canSelectRows || selectedRows.length === 0) return;

  if (rows.length - selectedRows.length < minRows) {
    toast.error(`At least ${minRows} rows must remain.`);
    return;
  }
  setRowsToDelete([...selectedRows]);
  setIsDeleteModalOpen(true);
};

// Common delete confirmation
const handleConfirmDelete = async () => {
  if (
    disabled ||
    equipmentLoading ||
    deletingRef.current ||
    rowsToDelete.length === 0
  ) {
    return;
  }
  const deleteIndexes = new Set(rowsToDelete);
  const updatedRows = rows.filter(
    (_, index) => !deleteIndexes.has(index)
  );

  if (updatedRows.length < minRows) {
    toast.error(`At least ${minRows} rows must remain.`);
    return;
  }

  const deletedCount = rows.length - updatedRows.length;
  if (!deletedCount) return;
  try {
    deletingRef.current = true;
    setIsDeleting(true);
    const payload = {
      gridData: updatedRows,
    };
    // Only one API request for all selected rows
    if (recordId) {
      await updateCalibration(recordId, payload);
    }
    onChange(updatedRows);
    setSelectedRows([]);
    setRowsToDelete([]);
    setIsDeleteModalOpen(false);

    toast.success(
      `${deletedCount} ${
        deletedCount === 1 ? "row" : "rows"
      } deleted successfully.`
    );
  } catch (error) {
    console.error("Failed to delete calibration rows:", error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to delete selected rows."
    );
  } finally {
    deletingRef.current = false;
    setIsDeleting(false);
  }
};

const handleCancelDelete = () => {
  if (deletingRef.current) return;

  setRowsToDelete([]);
  setIsDeleteModalOpen(false);
};

  const updateRow = (rowIndex, key, newValue) => {
    if (disabled || deletingRef.current) return;
    const updated = [...rows];
    const row = { ...updated[rowIndex] };
    row[key] = newValue;

    if (key === "equipmentInstrumentName") {
      const equipmentId = newValue;
      if (equipmentId && equipmentMap[equipmentId]) {
        const eq = equipmentMap[equipmentId];
        row.equipmentInstrumentId = eq.instrument_id_no || eq.equipment_id || "";
        row.make = eq.make || "";
        row.model = eq.sr_no_model_no || eq.model || "";
        row.location = eq.location || "";
        row.leastCount = eq.least_count || "";
        row.accuracy = eq.accuracy || "";
        row.instrumentrange = eq.instrument_range || "";
        row.operatingrange = eq.operating_range || "";
        row.calibrationTestPoints = eq.calibration_test_points || "";
      } else {
        row.equipmentInstrumentId = "";
        row.make = "";
        row.model = "";
        row.location = "";
        row.leastCount = "";
        row.accuracy = "";
        row.instrumentrange = "";
        row.operatingrange = "";
        row.calibrationTestPoints = "";
      }
    }

    // ✅ EXISTING behaviour — untouched
    if (key === "plannedDate") {
      if (
        newValue &&
        row.calibrationDoneDate &&
        dayjs(row.calibrationDoneDate).isBefore(dayjs(newValue), "day")
      ) {
        row.calibrationDoneDate = "";
      }
    }

    // ✅ EXISTING behaviour — untouched
    if (key === "nextPlannedDate") {
      if (
        newValue &&
        row.nextCalibrationDoneDate &&
        dayjs(row.nextCalibrationDoneDate).isBefore(dayjs(newValue), "day")
      ) {
        row.nextCalibrationDoneDate = "";
      }
    }

    updated[rowIndex] = row;
    onChange(updated);
  };

  const renderField = (column, row, rowIndex) => {
    const { key, type, placeholder, options: colOptions, disabled: columnDisabled } = column;
    const fieldValue = row[key] ?? "";
    const handleChange = (newValue) => updateRow(rowIndex, key, newValue);
    // Instrument Name always comes from the API; Category is locked only
    // when the API supplied a value, so a blank one can still be filled in.
    const isApiLocked =
      lockApiFields &&
      (key === "equipmentInstrumentName" || (key === "category" && fieldValue !== ""));
    const isDisabled = disabled || isDeleting || columnDisabled || isApiLocked;
    const isDoneDateDisabled = disabled || isDeleting || disableDoneDates;

    const commonProps = {
      disabled: isDisabled,
      className: "!w-full !rounded-none !border-transparent !bg-transparent !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-none disabled:!cursor-not-allowed disabled:!bg-transparent disabled:!text-[#65746E]",
    };

    if (type === "select") {
      return (
        <Select
          {...commonProps}
          value={fieldValue || undefined}
          placeholder={equipmentLoading ? "Loading..." : placeholder}
          onChange={handleChange}
          options={key === "equipmentInstrumentName" ? equipmentOptions : colOptions}
          disabled={isDisabled || (key === "equipmentInstrumentName" && equipmentLoading)}
          showSearch={key === "equipmentInstrumentName"}
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          className="!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!border-transparent [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!px-2 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[#9AA6A1]"
        />
      );
    }

    // ✅ EXISTING — UNTOUCHED
    if (type === "dualDate") {
      const plannedDayjs = row.plannedDate ? dayjs(row.plannedDate) : null;

      return (
        <div className="flex flex-row gap-1.5 p-1">
          <DatePicker
            value={plannedDayjs}
            placeholder="Plan date"
            onChange={(date) => updateRow(rowIndex, "plannedDate", date ? date.format("YYYY-MM-DD") : "")}
            format="DD-MM-YYYY"
            className="!h-8 !w-[140px] !rounded !border-[#D1DBD7] !bg-white !px-2 !text-[10px] !font-medium !text-[#263B35] !shadow-none"
            disabled={isDisabled}
          />
          <DatePicker
            value={row.calibrationDoneDate ? dayjs(row.calibrationDoneDate) : null}
            placeholder="Done on"
            onChange={(date) => updateRow(rowIndex, "calibrationDoneDate", date ? date.format("YYYY-MM-DD") : "")}
            format="DD-MM-YYYY"
            className="!h-8 !w-[140px] !rounded !border-[#D1DBD7] !bg-white !px-2 !text-[10px] !font-medium !text-[#263B35] !shadow-none"
            disabled={isDoneDateDisabled}
            disabledDate={(current) => {
              if (!plannedDayjs) return false;
              return current && current.isBefore(plannedDayjs, "day");
            }}
            defaultPickerValue={plannedDayjs || undefined}
          />
        </div>
      );
    }

    // ✅ EXISTING — UNTOUCHED
    if (type === "dualDateNext") {
      const nextPlannedDayjs = row.nextPlannedDate ? dayjs(row.nextPlannedDate) : null;

      return (
        <div className="flex flex-row gap-1.5 p-1">
          <DatePicker
            value={nextPlannedDayjs}
            placeholder="Next plan date"
            onChange={(date) => updateRow(rowIndex, "nextPlannedDate", date ? date.format("YYYY-MM-DD") : "")}
            format="DD-MM-YYYY"
            className="!h-8 !w-[150px] !rounded !border-[#D1DBD7] !bg-white !px-2 !text-[10px] !font-medium !text-[#263B35] !shadow-none"
            disabled={isDisabled || disableNextPlannedDate}
          />
          <DatePicker
            value={row.nextCalibrationDoneDate ? dayjs(row.nextCalibrationDoneDate) : null}
            placeholder="Next done on"
            onChange={(date) => updateRow(rowIndex, "nextCalibrationDoneDate", date ? date.format("YYYY-MM-DD") : "")}
            format="DD-MM-YYYY"
            className="!h-8 !w-[150px] !rounded !border-[#D1DBD7] !bg-white !px-2 !text-[10px] !font-medium !text-[#263B35] !shadow-none"
            disabled={isDoneDateDisabled}
            disabledDate={(current) => {
              if (!nextPlannedDayjs) return false;
              return current && current.isBefore(nextPlannedDayjs, "day");
            }}
            defaultPickerValue={nextPlannedDayjs || undefined}
          />
        </div>
      );
    }

    if (type === "date") {
      return (
        <DatePicker
          {...commonProps}
          value={fieldValue ? dayjs(fieldValue) : null}
          placeholder={placeholder}
          onChange={(date) => handleChange(date ? date.format("YYYY-MM-DD") : "")}
          format="DD-MM-YYYY"
          className="!h-8 !w-full !rounded-none !border-transparent !bg-transparent !px-2 !text-[11px] !font-medium !text-[#263B35] !shadow-none"
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
          rows={1}
          className="!min-h-[32px] !w-full !resize-none !rounded-none !border-transparent !bg-transparent !px-2 !py-1.5 !text-[11px] !font-medium !leading-5 !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1]"
        />
      );
    }

    return (
      <Input
        {...commonProps}
        value={fieldValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className="!h-8 !w-full !rounded-none !border-transparent !bg-transparent !px-2 !text-[11px] !font-medium !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1]"
      />
    );
  };

  const showChildColumn = typeof onViewChild === "function";
  // const today = dayjs().startOf("day");
  const totalColumns = columns.length + 2 + (showChildColumn ? 1 : 0) + (!disabled ? 1 : 0);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
      <div className="flex min-h-[68px] items-center justify-between gap-5 border-b border-[#D7E0DC] bg-[#F7F9F8] px-5">
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
        {/* {showAddButton && (
          <button
            type="button"
            onClick={addRow}
            disabled={disabled || equipmentLoading || (maxRows !== undefined && rows.length >= maxRows)}
            className="group flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#2B5577] px-3.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(43,85,119,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#234766] hover:shadow-[0_7px_16px_rgba(43,85,119,0.25)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus size={14} strokeWidth={2} className="transition-transform duration-200 group-hover:rotate-90" />
            {addButtonLabel}
          </button>
        )} */}


{/* Instrument Search Filter */}
<div className="ml-auto w-full max-w-[300px]">
  <Input
    value={searchTerm}
    onChange={handleSearchChange}
    placeholder="Search Instrument Name or ID No..."
    aria-label="Search Instrument Name or ID No"
    allowClear
    disabled={equipmentLoading || isDeleting || isDeleteModalOpen}
    prefix={
      <Search
        size={15}
        strokeWidth={1.8}
        className="mr-1 text-[#899690]"
      />
    }
    className="
      !h-9
      !w-full
      !rounded-lg
      !border-[#D5DEDA]
      !bg-white
      !px-3
      !text-[11px]
      !font-medium
      !text-[#263B35]
      !shadow-none
      hover:!border-[#A8B9B2]
      focus-within:!border-[#4E7585]
      [&_.ant-input]:!text-[11px]
      [&_.ant-input]:!bg-transparent
      [&_.ant-input]:placeholder:!text-[#9AA6A1]
      [&_.ant-input-clear-icon]:!text-[#899690]
    "
  />
</div>

        <div className="flex shrink-0 items-center gap-2">
  {!disabled && selectedRows.length > 0 && (
    <>
      <span className="rounded-md bg-[#EAF0F4] px-2.5 py-1.5 text-[11px] font-semibold text-[#2B5577]">
        {selectedRows.length} selected
      </span>

      <button
        type="button"
        onClick={handleClearSelection}
        disabled={isDeleting}
        className="px-2 text-[11px] font-medium text-[#65746E] hover:text-[#263B35] disabled:opacity-40"
      >
        Clear
      </button>

      <button
        type="button"
        onClick={handleDeleteSelected}
        disabled={isDeleting || equipmentLoading}
        className="flex h-9 items-center gap-1.5 rounded-lg bg-[#F52F3E] px-3.5 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-[#E52635] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}

        Delete Selected ({selectedRows.length})
      </button>
    </>
  )}

  {showAddButton && (
    <button
      type="button"
      onClick={addRow}
      disabled={
        disabled ||
        isDeleting ||
        equipmentLoading ||
        (maxRows !== undefined && rows.length >= maxRows)
      }
      className="group flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#2B5577] px-3.5 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-[#234766] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Plus size={14} strokeWidth={2} />
      {addButtonLabel}
    </button>
  )}
</div>
      </div>

      {/* NEW: relative wrapper for the loader overlay */}
      <div className="relative">
        <CustomScrollContainer maxHeight="520px" direction="both" className="w-full rounded-b-xl">
          <table className="w-full min-w-[max-content] border-collapse border border-[#D5DFDB]">
            <thead className="sticky top-0 z-[5]">
              <tr className="bg-[#EEF3F1]">
                {!disabled && (
                  <th className="w-[44px] min-w-[44px] border border-[#D5DFDB] px-2 py-2 text-center">
                 <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  disabled={!canSelectRows || filteredRows.length === 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label={
                    normalizedSearch
                      ? "Select all matching instrument rows"
                      : "Select all rows across all pages"
                  }
                />
                  </th>
                )}
                <th className="w-[50px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Sr. No</th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ minWidth: column.minWidth || 120 }}
                    className="border border-[#D5DFDB] px-2 py-2 text-left align-middle text-[10px] font-bold text-[#43564F]"
                  >
                    <div className="flex items-center gap-1">
                      {column.title.replace(/\.$/, "")}
                      {column.key === "equipmentInstrumentName" && (
                        <RequiredAsterisk
                          message="Instrument Name is required. Please select an instrument to proceed."
                        />
                      )}
                    </div>
                  </th>
                ))}
                {showChildColumn && (
                  <th className="w-[70px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">{viewChildLabel}</th>
                )}
                <th className="w-[60px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">Action</th>
              </tr>
            </thead>

            {/* NEW: key={safePage} remounts tbody per page → CSS fade */}
            <tbody
              key={safePage}
              style={{ animation: "calibrationPageFade 160ms ease-out" }}
            >
              {equipmentLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="bg-white">
                    {!disabled && <td className="border border-[#D5DFDB] px-2 py-2"><div className="mx-auto h-4 w-4 animate-pulse rounded bg-[#E5EBE8]" /></td>}
                    <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
                      <div className="mx-auto h-4 w-5 animate-pulse rounded bg-[#E5EBE8]" />
                    </td>
                    {columns.map((column, colIdx) => (
                      <td key={column.key} className="border border-[#D5DFDB] px-2 py-2 align-middle">
                        <div
                          className="h-4 animate-pulse rounded bg-[#E5EBE8]"
                          style={{ width: `${55 + ((idx * 13 + colIdx * 17) % 45)}%` }}
                        />
                      </td>
                    ))}
                    {showChildColumn && (
                      <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
                        <div className="mx-auto h-4 w-10 animate-pulse rounded bg-[#E5EBE8]" />
                      </td>
                    )}
                    <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
                      <div className="mx-auto h-4 w-4 animate-pulse rounded bg-[#E5EBE8]" />
                    </td>
                  </tr>
                ))
              ) : visibleRows.length > 0 ? (
                // NEW: iterate visibleRows — rowIndex stays the real index
                visibleRows.map(({ row, index: rowIndex }) => {
                  // const rowPlannedDate = row.plannedDate ? dayjs(row.plannedDate).startOf("day") : null;
                  // let isWithinDateWindow = false;
                  // let windowStart = null;
                  // let windowEnd = null;

                  // if (rowPlannedDate) {
                  //   windowStart = rowPlannedDate.subtract(30, "day").startOf("day");
                  //   windowEnd = rowPlannedDate.endOf("day");

                  //   isWithinDateWindow =
                  //     !today.isBefore(windowStart) && !today.isAfter(windowEnd);
                  // }

                  // const childButtonEnabled = canCreateChild && isWithinDateWindow;

                  // let childButtonTitle = "Create child calibration";
                  // if (!canCreateChild) {
                  //   childButtonTitle =
                  //     "Child creation is available only to Executor at Close Done stage.";
                  // } else if (!rowPlannedDate) {
                  //   childButtonTitle =
                  //     "Please select a Planned date in this row to enable child creation.";
                  // } else if (!isWithinDateWindow) {
                  //   childButtonTitle = `Child can only be created between ${windowStart.format(
                  //     "DD-MM-YYYY"
                  //   )} and ${windowEnd.format("DD-MM-YYYY")} (30 days before the planned date up to the planned date).`;
                  // }

                  // Backend-driven child creation validation
                  const isFirstChildCreated =
                    row.is_first_child_created === true;

                  const isSecondChildCreated =
                    row.is_second_child_created === true;

                  const childCount = Number(row.child_count ?? 0);

                  const hasReachedChildLimit =
                    childCount >= 2 ||
                    (isFirstChildCreated && isSecondChildCreated);

                  // First child permission
                  const canCreateFirstChild =
                    row.can_create_first_child === true &&
                    !isFirstChildCreated &&
                    !hasReachedChildLimit;

                  // Second child permission
                  const canCreateSecondChild =
                    row.can_create_second_child === true &&
                    !isSecondChildCreated &&
                    !hasReachedChildLimit;

                  // Existing Close Done and Executor validation preserved
                  const childButtonEnabled =
                    canCreateChild &&
                    !isDeleting &&
                    (canCreateFirstChild || canCreateSecondChild);

                  // Dynamic tooltip
                  let childButtonTitle = "Create child calibration";

                  if (!canCreateChild) {
                    childButtonTitle =
                      "Child creation is available only to Executor at Close Done stage.";
                  } else if (hasReachedChildLimit) {
                    childButtonTitle =
                      "Maximum limit reached. Both child records have already been created.";
                  } else if (canCreateFirstChild) {
                    childButtonTitle = "Create first child calibration";
                  } else if (canCreateSecondChild) {
                    childButtonTitle = "Create second child calibration";
                  } else {
                    childButtonTitle =
                      "Child creation is currently not available for this row.";
                  }

                  return (
                    <tr key={rowIndex} className={`group transition-colors duration-150 ${selectedRows.includes(rowIndex) ? "bg-[#EDF5FA] hover:bg-[#E4EFF7]" : "bg-white hover:bg-[#FAFCFB]"}`}>
                      {!disabled && (
                        <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle">
                          <Checkbox checked={selectedRows.includes(rowIndex)} disabled={!canSelectRows}
                            onChange={(e) => handleSelectRow(rowIndex, e.target.checked)}
                            aria-label={`Select row ${rowIndex + 1}`} />
                        </td>
                      )}
                      <td className="border border-[#D5DFDB] px-2 py-1 text-center align-top">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center text-[11px] font-medium text-[#263B35]">{rowIndex + 1}.</span>
                      </td>
                      {columns.map((column) => (
                        <td key={column.key} className="border border-[#D5DFDB] p-0 align-top">
                          {renderField(column, row, rowIndex)}
                        </td>
                      ))}
                      {showChildColumn && (
                      <td className="border border-[#D5DFDB] px-2 py-1 text-center align-top">
                        <span
                          className="inline-flex"
                          title={childButtonTitle}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (!childButtonEnabled) return;

                              onViewChild(rowIndex, row);
                            }}
                            disabled={!childButtonEnabled}
                            className={`inline-flex h-7 items-center justify-center rounded px-3 text-[11px] font-medium text-white shadow-sm transition-all duration-200 focus:outline-none ${
                              childButtonEnabled
                                ? "bg-[#3d606d] hover:bg-[#2B5577] active:scale-95"
                                : "cursor-not-allowed bg-[#B8C2BE] opacity-50"
                            }`}
                            aria-label={childButtonTitle}
                          >
                            Child
                          </button>
                        </span>
                      </td>
                    )}
                      <td className="border border-[#D5DFDB] px-2 py-1 text-center align-top">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(rowIndex)}
                          disabled={!canSelectRows || rows.length <= minRows}
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
                    No calibration rows added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CustomScrollContainer>

        {/* NEW: loader overlay */}
        <PageLoader visible={isPageChanging} />
      </div>

      {/* ── NEW: Centered pagination bar with dropdown selector ── */}
      {!equipmentLoading && totalPages > 1 && (
        <div className="flex flex-col items-center gap-1.5 border-t border-[#E0E7E4] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D5DEDA] bg-white text-[#4E7585] transition-all duration-150 hover:bg-[#F0F4F2] hover:text-[#2B5577] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} strokeWidth={2} />
            </button>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#596760]">
              <span>Page</span>

              <Select
                value={safePage}
                onChange={(val) => goToPage(Number(val))}
                options={pageOptions}
                listHeight={220}
                showSearch
                optionFilterProp="label"
                virtual
                popupMatchSelectWidth={false}
                className="!w-[76px] [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!border-[#D5DEDA] [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!px-2 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-item]:!leading-[30px] [&_.ant-select-selection-search-input]:!h-8 [&_.ant-select-arrow]:!text-[#4E7585] [&_.ant-select-arrow]:!text-[10px]"
                popupClassName="[&_.ant-select-item-option]:!text-[11px] [&_.ant-select-item-option]:!py-1 [&_.ant-select-item-option-selected]:!bg-[#EAF0F4] [&_.ant-select-item-option-selected]:!text-[#2B5577] [&_.ant-select-item-option-selected]:!font-semibold [&_.ant-select-item-option-active]:!bg-[#F0F4F2]"
              />

              <span>
                of <span className="font-semibold text-[#263B35]">{totalPages}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D5DEDA] bg-white text-[#4E7585] transition-all duration-150 hover:bg-[#F0F4F2] hover:text-[#2B5577] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={15} strokeWidth={2} />
            </button>
          </div>

          <span className="text-[11px] font-medium text-[#899690]">
            {isPageChanging ? (
              <>Loading page <span className="font-semibold text-[#263B35]">{safePage}</span>…</>
            ) : (
              <>Showing <span className="font-semibold text-[#263B35]">{startIndex + 1}–{endIndex}</span> of <span className="font-semibold text-[#263B35]">{totalRows}</span> rows</>
            )}
          </span>
        </div>
      )}

      {/* Footer (original) */}
      <div className="flex min-h-[40px] items-center justify-between border-t border-[#E0E7E4] bg-[#FAFBFA] px-4">
        <span className="text-[10px] font-medium text-[#899690]">
          {equipmentLoading
            ? "Fetching instruments…"
            : `${rows.length} ${rows.length === 1 ? "row" : "rows"}`}
        </span>
        {maxRows !== undefined && !equipmentLoading && (
          <span className="text-[10px] font-medium text-[#899690]">{rows.length} / {maxRows} rows</span>
        )}
      </div>

      <UserModal isOpen={isDeleteModalOpen} onClose={handleCancelDelete} title={rowsToDelete.length > 1 ? "Delete Selected Rows" : "Delete Row"} description="Please confirm this action before continuing." width="max-w-[420px]">
        <div className="space-y-5">
          <p className="text-[13px] leading-6 text-[#596760]">Are you sure you want to delete {rowsToDelete.length === 1 ? "this row" : `these ${rowsToDelete.length} selected rows`}? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 border-t border-[#E8ECEA] pt-4">
            <button type="button" onClick={handleCancelDelete} disabled={isDeleting} className="h-9 rounded-lg border border-[#D5DEDA] bg-white px-4 text-[12px] font-semibold text-[#596760] transition-all duration-200 hover:bg-[#F6F8F7] hover:text-[#263B35] active:scale-[0.98]">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="inline-flex items-center gap-2 h-9 rounded-lg bg-[#F52F3E] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(245,47,62,0.20)] transition-all duration-200 hover:bg-[#E52635] hover:shadow-[0_6px_15px_rgba(245,47,62,0.28)] active:scale-[0.98]">{isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : `Delete ${rowsToDelete.length} ${rowsToDelete.length === 1 ? "Row" : "Rows"}`}</button>
          </div>
        </div>
      </UserModal>

      {/* NEW: scoped keyframes for page fade */}
      <style>{`
        @keyframes calibrationPageFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CalibrationGrid;