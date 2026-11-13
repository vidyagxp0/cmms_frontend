import React, { useCallback, useMemo, useState } from "react";
import { Plus, Trash2, Table2 } from "lucide-react";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import UserModal from "../../../components/common/UserModal/UserModal";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";

dayjs.extend(customParseFormat);

const generateRowId = () =>
  `mir_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/* Robust dayjs parser (mirrors the parent's helper) */
const toDayjs = (val) => {
  if (!val) return null;
  if (dayjs.isDayjs(val)) return val.isValid() ? val : null;
  if (val instanceof Date) {
    const d = dayjs(val);
    return d.isValid() ? d : null;
  }
  if (typeof val === "string") {
    const t = val.trim();
    if (!t) return null;
    const g = dayjs(t);
    if (g.isValid()) return g;
    const dmy = dayjs(t, "DD/MM/YYYY", true);
    return dmy.isValid() ? dmy : null;
  }
  const d = dayjs(val);
  return d.isValid() ? d : null;
};

const MasterInstrumentsGrid = ({
  name = "Master Instruments Details",
  description = "",
  masterData = [],
  value = [],
  onChange,
  disabled = false,
  allowAdd = true,
  allowDelete = true,
  addButtonLabel = "Add Parameter",
  minRows = 0,
  maxRows,
}) => {
  const rows = Array.isArray(value) ? value : [];
  const [deleteIndex, setDeleteIndex] = useState(null);

  /* Dropdown options — display instrument_name, store id as value */
/* Dropdown options — display "Name (ID No.)", store id as value */
const instrumentOptions = useMemo(
  () =>
    (masterData || []).map((item) => {
      const name = item.instrument_name || `Instrument ${item.id}`;
      const idNo = item.instrument_id_no;
      return {
        value: String(item.id),
        label: idNo ? `${name} (${idNo})` : name,
        // extra field so the filter can also match on ID
        searchText: `${name} ${idNo || ""}`.toLowerCase(),
      };
    }),
  [masterData]
);

  const masterById = useMemo(() => {
    const m = {};
    (masterData || []).forEach((it) => {
      m[String(it.id)] = it;
    });
    return m;
  }, [masterData]);

  /* Legacy rows may store instrument_name in `name` instead of the id.
     Build a name → item map so the dropdown still resolves correctly. */
  const masterByName = useMemo(() => {
    const m = {};
    (masterData || []).forEach((it) => {
      if (it.instrument_name) m[it.instrument_name] = it;
    });
    return m;
  }, [masterData]);

  const resolveSelectValue = useCallback(
    (row) => {
      if (!row || !row.name) return undefined;
      const str = String(row.name);
      if (masterById[str]) return str;
      const found = masterByName[str];
      return found ? String(found.id) : undefined;
    },
    [masterById, masterByName]
  );

  const addRow = () => {
    if (disabled) return;
    if (maxRows !== undefined && rows.length >= maxRows) return;
    onChange([
      ...rows,
      {
        _rowId: generateRowId(),
        name: "",
        IdNo: "",
        accuracy: "",
        range: "",
        calibrationdoneDATE: null,
        calibrationNextDueDate: null,
      },
    ]);
  };

  /* Select instrument → auto-fill IdNo, accuracy, range */
  const updateRowField = useCallback(
    (rowIndex, key, newValue) => {
      if (disabled) return;
      const updated = [...rows];
      const row = { ...updated[rowIndex] };

      if (key === "name") {
        const item = masterById[String(newValue)];
        row.name = newValue;
        if (item) {
          row.IdNo = item.instrument_id_no || "";
          row.accuracy = item.accuracy || "";
          row.range = item.instrument_range || "";
        } else {
          row.IdNo = "";
          row.accuracy = "";
          row.range = "";
        }
      } else {
        row[key] = newValue;
      }

      updated[rowIndex] = row;
      onChange(updated);
    },
    [disabled, masterById, onChange, rows]
  );

  const handleDeleteClick = (idx) => {
    if (disabled || rows.length <= minRows) return;
    setDeleteIndex(idx);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;
    onChange(rows.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  const cancelDelete = () => setDeleteIndex(null);

  const totalCols = 8;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
      {/* Header */}
      <div className="flex min-h-[64px] items-center justify-between gap-5 border-b border-[#D7E0DC] bg-[#F7F9F8] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D5E0DF] bg-white text-[#4E7585] shadow-[0_2px_7px_rgba(38,53,46,0.05)]">
            <Table2 size={17} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#263B35]">
              {name}
            </h3>
            {description ? (
              <p className="mt-0.5 truncate text-[11px] font-medium text-[#899690]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {allowAdd && (
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
        maxHeight="480px"
        direction="both"
        className="w-full rounded-b-xl"
      >
        <table className="w-full min-w-[max-content] border-collapse border border-[#D5DFDB]">
          <thead className="sticky top-0 z-[5]">
            <tr className="bg-[#EEF3F1]">
              <th className="w-[60px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
                SR. No.
              </th>
              <th
                style={{ minWidth: 220 }}
                className="border border-[#D5DFDB] px-2 py-2 text-left text-[10px] font-bold uppercase text-[#43564F]"
              >
                Name
              </th>
              <th
                style={{ minWidth: 170 }}
                className="border border-[#D5DFDB] px-2 py-2 text-left text-[10px] font-bold uppercase text-[#43564F]"
              >
                ID NO.
              </th>
              <th
                style={{ minWidth: 140 }}
                className="border border-[#D5DFDB] px-2 py-2 text-left text-[10px] font-bold uppercase text-[#43564F]"
              >
                Accuracy
              </th>
              <th
                style={{ minWidth: 140 }}
                className="border border-[#D5DFDB] px-2 py-2 text-left text-[10px] font-bold uppercase text-[#43564F]"
              >
                Range
              </th>
              <th
                style={{ minWidth: 170 }}
                className="border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]"
              >
                Calibration Done Date
              </th>
              <th
                style={{ minWidth: 190 }}
                className="border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]"
              >
                Calibration Next Due Date
              </th>
              <th className="w-[70px] border border-[#D5DFDB] px-2 py-2 text-center text-[10px] font-bold uppercase text-[#43564F]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={totalCols}
                  className="h-[80px] border border-[#D5DFDB] px-5 text-center text-[11px] font-medium text-[#899690]"
                >
                  No master instruments added yet.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={row._rowId || row.row_id || `idx_${rowIndex}`}
                  className="bg-white transition-colors duration-150 hover:bg-[#FAFCFB]"
                >
                  <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center text-[11px] font-medium text-[#263B35]">
                      {rowIndex + 1}.
                    </span>
                  </td>

                  <td className="border border-[#D5DFDB] p-0 align-middle">
                    <Select
                      value={resolveSelectValue(row)}
                      placeholder="Select instrument"
                      options={instrumentOptions}
                      onChange={(val) =>
                        updateRowField(rowIndex, "name", val)
                      }
                      disabled={disabled}
                     showSearch
                    optionFilterProp="searchText"
                    filterOption={(input, option) =>
                    (option?.searchText ?? "").includes(input.toLowerCase())
                    }
                      className="!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!border-transparent [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!px-2 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[#9AA6A1]"
                    />
                  </td>

                  <td className="border border-[#D5DFDB] p-0 align-middle">
                    <Input
                      value={row.IdNo || ""}
                      disabled
                      className="!h-8 !w-full !rounded-none !border-transparent !bg-transparent !px-2 !text-[11px] !font-medium !text-[#263B35] !shadow-none disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
                    />
                  </td>

                  <td className="border border-[#D5DFDB] p-0 align-middle">
                    <Input
                      value={row.accuracy || ""}
                      disabled
                      className="!h-8 !w-full !rounded-none !border-transparent !bg-transparent !px-2 !text-[11px] !font-medium !text-[#263B35] !shadow-none disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
                    />
                  </td>

                  <td className="border border-[#D5DFDB] p-0 align-middle">
                    <Input
                      value={row.range || ""}
                      disabled
                      className="!h-8 !w-full !rounded-none !border-transparent !bg-transparent !px-2 !text-[11px] !font-medium !text-[#263B35] !shadow-none disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
                    />
                  </td>

                  <td className="border border-[#D5DFDB] p-0 align-middle">
                    <DatePicker
                      value={toDayjs(row.calibrationdoneDATE)}
                      format="DD/MM/YYYY"
                      disabled
                      variant="borderless"
                      placeholder="DD/MM/YYYY"
                      className="!h-8 !w-full !px-1 !text-[10px] !font-medium !text-[#263B35] disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
                    />
                  </td>

                  <td className="border border-[#D5DFDB] p-0 align-middle">
                    <DatePicker
                      value={toDayjs(row.calibrationNextDueDate)}
                      format="DD/MM/YYYY"
                      variant="borderless"
                      placeholder="DD/MM/YYYY"
                      onChange={(date) =>
                        updateRowField(
                          rowIndex,
                          "calibrationNextDueDate",
                          date || null
                        )
                      }
                      disabled={disabled}
                      className="!h-8 !w-full !px-1 !text-[10px] !font-medium !text-[#263B35] hover:bg-[#F3F6F4] cursor-pointer disabled:!cursor-not-allowed disabled:!bg-[#F9FAF9] disabled:!text-[#263B35]"
                    />
                  </td>

                  <td className="border border-[#D5DFDB] px-2 py-1 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(rowIndex)}
                      disabled={
                        disabled ||
                        !allowDelete ||
                        rows.length <= minRows
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#9AA6A1] transition-all duration-200 hover:bg-[#FFF1F1] hover:text-[#DF5B5B] active:scale-90 disabled:cursor-not-allowed disabled:opacity-25"
                      aria-label="Delete row"
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                  </td>
                </tr>
              ))
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
        isOpen={deleteIndex !== null}
        onClose={cancelDelete}
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
              onClick={cancelDelete}
              className="h-9 rounded-lg border border-[#D5DEDA] bg-white px-4 text-[12px] font-semibold text-[#596760] transition-all duration-200 hover:bg-[#F6F8F7] hover:text-[#263B35] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
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

export default MasterInstrumentsGrid;