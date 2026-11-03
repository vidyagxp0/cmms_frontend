import React, { useState } from "react";
import { Plus, Trash2, Table2, Loader2 } from "lucide-react";
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
  { key: "jan", label: "January" },
  { key: "feb", label: "February" },
  { key: "mar", label: "March" },
  { key: "apr", label: "April" },
  { key: "may", label: "May" },
  { key: "jun", label: "June" },
  { key: "jul", label: "July" },
  { key: "aug", label: "August" },
  { key: "sep", label: "September" },
  { key: "oct", label: "October" },
  { key: "nov", label: "November" },
  { key: "dec", label: "December" },
];

/* -------------------- Weekly/Flat data helper -------------------- */
export const createEmptyWeeklyData = () => {
  const data = {};
  MONTHS.forEach(({ key }) => {
    data[`${key}_planned`] = "";
    data[`${key}_executed`] = "";
  });
  return data;
};

/* -------------------- Main component -------------------- */
const AddendumPreventivePlannerGrid = ({
  value = [],
  onChange,
  equipmentOptions = [],
  equipmentMap = {},
  equipmentLoading = false,
  name = "Addendum Preventive Information",
  description = "",
  addButtonLabel = "Add Row",
  minRows = 0,
  maxRows,
  recordId,
  disabled = false,
  showAddButton = true,
}) => {
  const mainColumns = [
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

  /* -------------------- Row actions -------------------- */
  const addRow = () => {
    if (disabled) return;
    if (maxRows !== undefined && rows.length >= maxRows) return;

    const newRow = {};
    mainColumns.forEach((column) => {
      newRow[column.key] = "";
    });
    newRow.equipmentDbId = "";
    newRow.make = "";
    newRow.model = "";

    MONTHS.forEach((m) => {
      newRow[`${m.key}_planned`] = "";
      newRow[`${m.key}_executed`] = "";
    });

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
      const equipment = equipmentMap[String(newValue)];

      if (equipment) {
        row.equipmentDbId = String(equipment.id);
        row.equipmentInstrumentName = equipment.equipment_name || equipment.instrument_name || "";
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

    updated[rowIndex] = row;
    onChange(updated);
  };

  const updateRemark = (rowIndex, newValue) => {
    if (disabled) return;
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], remark: newValue };
    onChange(updated);
  };

  /* -------------------- Field renderer -------------------- */
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

    const isRowFromApi = row.isFromApi === true;
    const apiColumns = ["equipmentInstrumentName", "equipmentInstrumentId", "location"];
    const isApiColumn = apiColumns.includes(key);

    const isDisabled = disabled || columnDisabled || (isRowFromApi && isApiColumn);

    const commonProps = {
      disabled: isDisabled,
      className:
        "!w-full !rounded-none !border-transparent !bg-transparent !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-none disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]",
    };

    if (type === "select") {
      if (key === "equipmentInstrumentName") {
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
            className="!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!border-transparent [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!px-2 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[#9AA6A1] disabled:[&_.ant-select-selector]:!bg-[#F9FAF9] disabled:[&_.ant-select-selection-item]:!text-[#263B35]"
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
        className="!h-8 !w-full !rounded-none !border-transparent !bg-transparent !px-2 !text-[11px] !font-medium !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
      />
    );
  };

  const renderDateField = (row, key, rowIndex) => {
    const val = row[key];

    return (
      <DatePicker
        value={val ? dayjs(val) : null}
        onChange={(date) => updateRow(rowIndex, key, date ? date.format("YYYY-MM-DD") : "")}
        format="DD/MM/YYYY"
        variant="borderless"
        className="!h-8 !w-full !px-1 !text-[10px] !font-medium !text-[#263B35] hover:bg-[#F3F6F4] cursor-pointer disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
        disabled={disabled}
        placeholder="DD/MM/YYYY"
      />
    );
  };

  const visibleColumns = mainColumns.filter((column) => column.hidden !== true);

  // Cols: Sr.No(1) + visibleColumns(N) + CalibrationDates(1) + Months(12) + Remark(1) + Action(1)
  const emptyColSpan = 1 + visibleColumns.length + 1 + MONTHS.length + 1 + 1;

  /* -------------------- Render -------------------- */
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
      {/* Header bar */}
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
            <h3 className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#263B35]">
              {name}
            </h3>
            {equipmentLoading ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[#4E7585]">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#4E7585]" />
                Loading instruments…
              </p>
            ) : description ? (
              <p className="mt-0.5 truncate text-[11px] font-medium text-[#899690]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {showAddButton && (
          <button
            type="button"
            onClick={addRow}
            disabled={
              disabled || equipmentLoading || (maxRows !== undefined && rows.length >= maxRows)
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
        <table className="w-full min-w-[max-content] border-collapse border border-[#D5DFDB]">
          <thead className="sticky top-0 z-[5]">
            <tr className="bg-[#EEF3F1]">
              <th className="w-[50px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
                SR. No.
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  style={{ minWidth: column.minWidth || 180 }}
                  className="border border-[#D5DFDB] px-2 py-2 text-left align-middle text-[10px] font-bold text-[#43564F]"
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {column.key === "equipmentInstrumentName" && (
                      <RequiredAsterisk message="Equipment Name is required. Please select an equipment item to continue." />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-[120px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
                CALIBRATION DATES
              </th>
              {MONTHS.map((month) => (
                <th key={month.key} className="w-[100px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold text-[#43564F]">
                  {month.label}
                </th>
              ))}
              <th className="w-[150px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
                Remark
              </th>
              <th className="w-[60px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {equipmentLoading ? (
              /* ─── SKELETON LOADER ROWS ─── */
              Array.from({ length: 3 }).map((_, idx) => (
                <React.Fragment key={`skeleton-${idx}`}>
                  {/* Skeleton Planned Row */}
                  <tr className="bg-white">
                    <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
                      <div className="mx-auto h-4 w-5 animate-pulse rounded bg-[#E5EBE8]" />
                    </td>
                    {visibleColumns.map((column) => (
                      <td key={column.key} className="border border-[#D5DFDB] px-2 py-2 align-middle">
                        <div
                          className="h-4 animate-pulse rounded bg-[#E5EBE8]"
                          style={{ width: `${55 + ((idx * 13) % 45)}%` }}
                        />
                      </td>
                    ))}
                    <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
                      <div className="mx-auto h-4 w-10 animate-pulse rounded bg-[#E5EBE8]" />
                    </td>
                    {MONTHS.map((month) => (
                      <td key={`${month.key}_skel_p`} className="border border-[#D5DFDB] px-1 py-2 align-middle">
                        <div className="h-6 w-full animate-pulse rounded bg-[#E5EBE8]" />
                      </td>
                    ))}
                    <td className="border border-[#D5DFDB] px-2 py-2 align-middle">
                      <div className="h-6 w-full animate-pulse rounded bg-[#E5EBE8]" />
                    </td>
                    <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
                      <div className="mx-auto h-4 w-4 animate-pulse rounded bg-[#E5EBE8]" />
                    </td>
                  </tr>
                  {/* Skeleton Executed Row */}
                  <tr className="bg-white">
                    <td className="border border-[#D5DFDB] px-2 py-2 text-center align-middle">
                      <div className="mx-auto h-4 w-8 animate-pulse rounded bg-[#E5EBE8]" />
                    </td>
                    {MONTHS.map((month) => (
                      <td key={`${month.key}_skel_e`} className="border border-[#D5DFDB] px-1 py-2 align-middle">
                        <div className="h-6 w-full animate-pulse rounded bg-[#E5EBE8]" />
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))
            ) : rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {/* Spacer between logical rows */}
                  {rowIndex > 0 && (
                    <tr aria-hidden="true">
                      <td colSpan={emptyColSpan} className="!h-3 !border-0 !p-0 !bg-[#F7FAF8]" />
                    </tr>
                  )}

                  {/* ── Row 1: Planned ── */}
                  <tr className="bg-white transition-colors duration-150 hover:bg-[#FAFCFB]">
                    <td rowSpan={2} className="border border-[#D5DFDB] px-2 py-1 text-center align-middle">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center text-[11px] font-medium text-[#263B35]">
                        {rowIndex + 1}.
                      </span>
                    </td>

                    {visibleColumns.map((column) => (
                      <td key={column.key} rowSpan={2} className="border border-[#D5DFDB] p-0 align-middle">
                        {renderField(column, row, rowIndex)}
                      </td>
                    ))}

                    {/* Row Label: Planned */}
                    <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle text-[11px] font-bold text-[#596760]">
                      Planned
                    </td>

                    {/* Months - Planned */}
                    {MONTHS.map((month) => (
                      <td key={`${month.key}_planned`} className="border border-[#D5DFDB] p-0 align-middle">
                        {renderDateField(row, `${month.key}_planned`, rowIndex)}
                      </td>
                    ))}

                    <td rowSpan={2} className="border border-[#D5DFDB] p-0 align-middle">
                      <TextArea
                        value={row.remark ?? ""}
                        onChange={(e) => updateRemark(rowIndex, e.target.value)}
                        rows={2}
                        className="!h-full !min-h-[64px] !w-full !resize-none !rounded-none !border-transparent !bg-transparent !px-2 !py-1.5 !text-[11px] !font-medium !leading-5 !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
                        disabled={disabled}
                        placeholder="Enter remark"
                      />
                    </td>

                    <td rowSpan={2} className="border border-[#D5DFDB] px-2 py-1 text-center align-middle">
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

                  {/* ── Row 2: Executed ── */}
                  <tr className="bg-white transition-colors duration-150 hover:bg-[#FAFCFB]">
                    {/* Row Label: Executed */}
                    <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle text-[11px] font-bold text-[#596760]">
                      Executed
                    </td>

                    {/* Months - Executed */}
                    {MONTHS.map((month) => (
                      <td key={`${month.key}_executed`} className="border border-[#D5DFDB] p-0 align-middle">
                        {renderDateField(row, `${month.key}_executed`, rowIndex)}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={emptyColSpan}
                  className="h-[80px] border border-[#D5DFDB] px-5 text-center text-[11px] font-medium text-[#899690]"
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
          {equipmentLoading
            ? "Fetching instruments…"
            : `${rows.length} ${rows.length === 1 ? "row" : "rows"}`}
        </span>
        {maxRows !== undefined && !equipmentLoading && (
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
            Are you sure you want to delete this row? This action cannot be undone.
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

export default AddendumPreventivePlannerGrid;