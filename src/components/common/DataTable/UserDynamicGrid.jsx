import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Plus, Trash2, Table2, Loader2 } from "lucide-react";
import {toast} from "sonner"
import { Input, InputNumber, Select, DatePicker, Switch } from "antd";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import UserModal from "../UserModal/UserModal";
import CustomScrollContainer from "../CustomScrollbar/CustomScrollContainer";
import SymbolicInput, { UNIT_MASTER, parseValueAndUnit } from "../SymbolicInput/SymbolicInput";
import { getAllPermissions } from "../../../services/usersApi/workflowCommonApi";
const { TextArea } = Input;
// Composite time formats; all other registered units use numeric subtraction.
const TIME_FORMATS = {
    "min:sec:1/100 sec": { multipliers: [6000, 100, 1], limits: [Infinity, 60, 100] },
    "Hr:min:sec:1/100 sec": { multipliers: [360000, 6000, 100, 1], limits: [Infinity, 60, 60, 100] },
    "Hr:min": { multipliers: [60, 1], limits: [Infinity, 60] },
};
const extractNumeric = (val) => {
    if (val == null) return null;
    const { rawValue, unit } = parseValueAndUnit(String(val));
    const raw = String(rawValue ?? "").trim();
    const symbol = String(unit || "").trim();
    const format = TIME_FORMATS[symbol];
    if (format) {
        const parts = raw.replace(/^[+-]/, "").split(/[.:]/);
        if (parts.length !== format.multipliers.length || parts.some(p => !/^\d+$/.test(p))) return null;
        const values = parts.map(Number);
        if (values.some((v, i) => !Number.isSafeInteger(v) || v >= format.limits[i])) return null;
        const total = values.reduce((sum, v, i) => sum + v * format.multipliers[i], 0);
        return Number.isSafeInteger(total) ? { value: raw.startsWith("-") ? -total : total, unit: symbol } : null;
    }
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? { value, unit: symbol } : null;
};
const formatTimeError = (value, unit) => {
    let remaining = Math.abs(value);
    const parts = TIME_FORMATS[unit].multipliers.map(multiplier => {
        const part = Math.floor(remaining / multiplier);
        remaining %= multiplier;
        return String(part).padStart(2, "0");
    });
    return `${value < 0 ? "-" : ""}${parts.join(".")}`;
};
const computeError = (masterVal, uucVal) => {
    const master = extractNumeric(masterVal);
    const uuc = extractNumeric(uucVal);
    if (!master || !uuc || master.unit !== uuc.unit) return "NA";
    const difference = uuc.value - master.value;
    if (!Number.isFinite(difference)) return "NA";
    if (TIME_FORMATS[master.unit]) {
        if (!Number.isSafeInteger(difference)) return "NA";
        return `${formatTimeError(difference, master.unit)} ${master.unit}`;
    }
    const rounded = Number(difference.toFixed(6));
    return master.unit ? `${rounded} ${master.unit}` : String(rounded);
};
// Independently select the active reading for each column.
const computeCalibrationError = (row, toggles) => {
    const master = toggles.masterInstrumentReadings
        ? row.masterInstrumentReadings2 : row.masterInstrumentReadings;
    const uuc = toggles.unitUnderCalibrationReading
        ? row.unitUnderCalibrationReading2 : row.unitUnderCalibrationReading;
    return computeError(master, uuc);
};
const isCalibrationReadingColumn = (key) =>
    key === "masterInstrumentReadings" || key === "unitUnderCalibrationReading";
// Header-controlled units (opt-in per column).
const getSavedSymbol = (fieldKey, rows) => {
    const units = new Set(rows.map(row => parseValueAndUnit(row[fieldKey] ?? "").unit).filter(Boolean));
    return { enabled: units.size > 0, unit: units.size === 1 ? [...units][0] : "", mixed: units.size > 1 };
};
const SYMBOL_OPTIONS = (Array.isArray(UNIT_MASTER) ? UNIT_MASTER :
    Object.entries(UNIT_MASTER).map(([discipline, units]) => ({ discipline, units })))
    .map(item => ({ label: item.discipline || item.label || item.name,
        options: (item.units || []).map(unit => ({ label: unit, value: unit })) }));

const GridSymbolicInput = ({ value, onCommit, ...rest }) => {
    const onCommitRef = useRef(onCommit);
    useEffect(() => {
        onCommitRef.current = onCommit;
    }, [onCommit]);
    const stableOnChange = useCallback((next) => {
        onCommitRef.current?.(next);
    }, []);
    return (
        <SymbolicInput
            value={value ?? ""}
            onChange={stableOnChange}
            {...rest}
        />
    );
};
const UserDynamicGrid = ({
    name = "Grid",
    description,
    columns = [],
    value = [],
    onChange,
    allowAdd = true,
    allowDelete = true,
    deleteRow,
    addButtonLabel = "Add Row",
    minRows = 0,
    maxRows,
    emptyTitle = "No data added yet",
    rowKey = "_rowId",
    className = "",
    checkPermission = true,
    disabled = false,
}) => {
    const rows = Array.isArray(value) ? value : [];
    const { recordId } = useParams();
    // Stable onChange ref so effects below can call it without re-subscribing
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);
    // ---- Permission state ----
    const [canPerformAction, setCanPerformAction] = useState(true);
    const [permissionsLoading, setPermissionsLoading] = useState(
        Boolean(checkPermission && recordId)
    );
    useEffect(() => {
        let isMounted = true;
        const fetchPermissions = async () => {
            if (!checkPermission || !recordId) {
                if (isMounted) {
                    setCanPerformAction(true);
                    setPermissionsLoading(false);
                }
                return;
            }
            try {
                setPermissionsLoading(true);
                const response = await getAllPermissions(recordId);
                const allowed =
                    response?.data?.data?.permission?.can_perform_action === true;
                if (isMounted) setCanPerformAction(allowed);
            } catch (error) {
                console.error("Failed to fetch grid permissions:", error);
                if (isMounted) setCanPerformAction(false);
            } finally {
                if (isMounted) setPermissionsLoading(false);
            }
        };
        fetchPermissions();
        return () => {
            isMounted = false;
        };
    }, [recordId, checkPermission]);
    const isReadOnly = disabled || permissionsLoading || !canPerformAction;
    const effectiveAllowAdd = allowAdd && !isReadOnly;
    const effectiveAllowDelete = allowDelete && !isReadOnly;
    // ---- Header symbol state ----
    const [columnSymbols, setColumnSymbols] = useState({});
    useEffect(() => { setColumnSymbols({}); }, [recordId]);
    const getColumnSymbol = (column, fieldKey = column.key) => columnSymbols[fieldKey] ?? getSavedSymbol(fieldKey, rows);
    const getActiveUnit = (column, fieldKey = column.key) => {
        const config = getColumnSymbol(column, fieldKey);
        return config.enabled ? config.unit : "";
    };
    const changeHeaderSymbol = (column, enabled, unit = "", fieldKey = column.key) => {
        if (isReadOnly) return;
        const keys = [fieldKey];
        // Enabling the selector alone must not modify existing readings.
        if (enabled && !unit) {
            setColumnSymbols(prev => ({ ...prev, [fieldKey]: { ...getColumnSymbol(column, fieldKey), enabled: true } }));
            return;
        }
        const changesExistingUnit = rows.some(row => keys.some(key => {
            const oldUnit = parseValueAndUnit(row[key] ?? "").unit;
            return oldUnit && oldUnit !== unit;
        }));
        // if (changesExistingUnit && !window.confirm("Change existing reading symbols? Numeric readings will not be converted.")) return;
        let changed = false;
        const updated = rows.map(row => {
            const next = { ...row };
            keys.forEach(key => {
                if (row[key] == null || row[key] === "") return;
                const parsed = parseValueAndUnit(row[key]);
                const raw = String(parsed.rawValue ?? "").trim();
                const value = raw && unit ? `${raw} ${unit}` : raw;
                if (value !== row[key]) { next[key] = value; changed = true; }
            });
            if (isCalibrationGrid) next.errorIn = computeCalibrationError(next, columnToggles);
            return next;
        });
        setColumnSymbols(prev => ({ ...prev, [fieldKey]: { enabled, unit, mixed: false } }));
        if (changed) onChange?.(updated);
    };
    const renderHeaderSymbol = column => {
        if (!column.headerSymbolic || !column.symbolic) return null;
        const split = column.toggleable && columnToggles[column.key] && column.splitFields;
        const fields = split ? column.splitFields : [{ key: column.key }];
        return (
            <div className={`mt-2 grid gap-2 ${split ? "grid-cols-2" : "grid-cols-1"}`}>
                {fields.map((field, index) => {
                    const config = getColumnSymbol(column, field.key);
                    return (
                        <div key={field.key} className="flex min-w-0 flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium">{split ? `Symbol ${index + 1}` : "Symbol"}</span>
                                <Switch size="small" checked={config.enabled} disabled={isReadOnly}
                                    onChange={checked => changeHeaderSymbol(column, checked, "", field.key)} />
                            </div>
                            {config.enabled && <Select size="small" showSearch optionFilterProp="label"
                                value={config.unit || undefined} placeholder="Select symbol" options={SYMBOL_OPTIONS}
                                disabled={isReadOnly} onChange={unit => changeHeaderSymbol(column, true, unit, field.key)}
                                className="!w-full" popupMatchSelectWidth={false} />}
                            {config.mixed && <span className="text-[10px] text-amber-600">Mixed existing units</span>}
                        </div>
                    );
                })}
            </div>
        );
    };
    const isCalibrationGrid = ["masterInstrumentReadings", "unitUnderCalibrationReading", "errorIn"]
        .every(key => columns.some(column => column.key === key));
    // Preserve explicit calibration split choices even when readings are empty.
    const calibrationSplitOverrides = useRef({});
    useEffect(() => { calibrationSplitOverrides.current = {}; }, [recordId]);
    // ---- Toggle state ----
    const [columnToggles, setColumnToggles] = useState(() => {
        const initial = {};
        columns.forEach(col => {
            if (col.toggleable && col.splitFields) {
                const hasSplitData = rows.some(row =>
                    col.splitFields.some(field =>
                        row[field.key] !== undefined && row[field.key] !== null && row[field.key] !== ''
                    )
                );
                initial[col.key] = hasSplitData;
            }
        });
        return initial;
    });
    useEffect(() => {
        setColumnToggles(prev => {
            const newToggles = { ...prev };
            columns.forEach(col => {
                // 👇 skip errorIn (managedToggle) — its toggle is driven below
                if (col.toggleable && col.splitFields && !col.managedToggle) {
                    const hasSplitData = rows.some(row =>
                        col.splitFields.some(field =>
                            row[field.key] !== undefined && row[field.key] !== null && row[field.key] !== ''
                        )
                    );
                    if (isCalibrationGrid && isCalibrationReadingColumn(col.key) &&
                        Object.prototype.hasOwnProperty.call(calibrationSplitOverrides.current, col.key)) {
                        newToggles[col.key] = calibrationSplitOverrides.current[col.key];
                        return;
                    }
                    if (newToggles[col.key] !== hasSplitData) {
                        newToggles[col.key] = hasSplitData;
                    }
                }
            });
            return Object.keys(newToggles).every(key => newToggles[key] === prev[key]) ? prev : newToggles;
        });
    }, [rows, columns, isCalibrationGrid, recordId]);
    useEffect(() => {
    if (!isCalibrationGrid || !rows.length || isReadOnly) return;
    let needsUpdate = false;
    const updated = rows.map((row) => {
        const newRow = { ...row };
        const nextError = computeCalibrationError(row, columnToggles);
        if ((row.errorIn ?? "") !== nextError) {
            newRow.errorIn = nextError;
            needsUpdate = true;
        }
        // Drop any legacy split-error values left over from earlier sessions
        if (newRow.errorIn1) {
            newRow.errorIn1 = "";
            needsUpdate = true;
        }
        if (newRow.errorIn2) {
            newRow.errorIn2 = "";
            needsUpdate = true;
        }
        return newRow;
    });
    if (needsUpdate) onChangeRef.current?.(updated);
}, [rows, columnToggles, isCalibrationGrid, isReadOnly]);
    // ---- Modal state ----
    const [toggleModalState, setToggleModalState] = useState({ open: false, columnKey: null });
    const [deleteRowIndex, setDeleteRowIndex] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);
    const deletingRef = useRef(false);
    // ---- Create a new row ----
    const createRow = useCallback(() => {
        const row = {
            [rowKey]: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        columns.forEach((column) => {
            if (column.toggleable && column.splitFields) {
                column.splitFields.forEach(field => {
                    row[field.key] = column.defaultValue !== undefined ? column.defaultValue : "";
                });
                // 👇 also initialize the single field for managed-toggle columns
                if (column.managedToggle) {
                    row[column.key] = column.defaultValue !== undefined ? column.defaultValue : "";
                }
            } else {
                row[column.key] = column.defaultValue !== undefined ? column.defaultValue : "";
            }
        });
        return row;
    }, [columns, rowKey]);
    const handleAddRow = () => {
        if (!effectiveAllowAdd) return;
        if (maxRows !== undefined && rows.length >= maxRows) return;
        const newRow = createRow();
        onChange?.([...rows, newRow]);
    };
    const handleDeleteRow = (rowIndex) => {
    if (!effectiveAllowDelete || deletingRef.current) return;
    if (rows.length <= minRows) return;
    setDeleteRowIndex(rowIndex);
    setIsDeleteModalOpen(true);
};

const handleConfirmDelete = async () => {
    if (
        deletingRef.current ||
        !effectiveAllowDelete ||
        deleteRowIndex === null ||
        deleteRowIndex >= rows.length ||
        rows.length <= minRows
    ) {
        return;
    }
    deletingRef.current = true;
    setIsDeleting(true);
    try {
        const updatedRows = rows.filter(
            (_, index) => index !== deleteRowIndex
        );
        // Wait until the delete API completes
        await deleteRow?.(updatedRows);
        // Update grid only after successful deletion
        onChange?.(updatedRows);
        setDeleteRowIndex(null);
        setIsDeleteModalOpen(false);
    } catch (error) {
        console.error("Failed to delete row:", error);
        toast.error(
            error?.response?.data?.message ||
            "Failed to delete row. Please try again."
        );
    } finally {
        deletingRef.current = false;
        setIsDeleting(false);
    }
};

const handleCancelDelete = () => {
    if (deletingRef.current) return;
    setDeleteRowIndex(null);
    setIsDeleteModalOpen(false);
};

    // ---- Cell change handlers (auto-compute errorIn) ----
    const handleCellChange = (rowIndex, columnKey, newValue) => {
        if (isReadOnly) return;
        const updatedRows = rows.map((row, index) => {
            if (index !== rowIndex) return row;
            const newRow = { ...row, [columnKey]: newValue };
            if (isCalibrationGrid && isCalibrationReadingColumn(columnKey)) {
                newRow.errorIn = computeCalibrationError(newRow, columnToggles);
            }
            return newRow;
        });
        onChange?.(updatedRows);
    };
const handleSplitChange = (rowIndex, fieldKey, newValue) => {
    if (isReadOnly) return;
    const updatedRows = rows.map((row, index) => {
        if (index !== rowIndex) return row;
        const newRow = { ...row, [fieldKey]: newValue };
        if (isCalibrationGrid && (
            fieldKey === "masterInstrumentReadings1" ||
            fieldKey === "masterInstrumentReadings2" ||
            fieldKey === "unitUnderCalibrationReading1" ||
            fieldKey === "unitUnderCalibrationReading2"
        )) {
            newRow.errorIn = computeCalibrationError(newRow, columnToggles);
        }
        return newRow;
    });
    onChange?.(updatedRows);
};
    // ---- Toggle switch handler with confirmation ----
    const handleToggleChange = (checked, columnKey) => {
    if (isReadOnly) return;
    if (!checked) {
        const col = columns.find((c) => c.key === columnKey);
        const hasData = rows.some((row) =>
            col.splitFields.some((field) => row[field.key] && row[field.key] !== "")
        );
        if (hasData) {
            setToggleModalState({ open: true, columnKey });
            return;
        }
    }
    if (isCalibrationGrid && isCalibrationReadingColumn(columnKey)) {
        calibrationSplitOverrides.current[columnKey] = checked;
    }
    // Effect above will recompute errorIn when this state changes
    setColumnToggles((prev) => ({ ...prev, [columnKey]: checked }));
};
const handleConfirmToggleOff = () => {
    const { columnKey } = toggleModalState;
    const col = columns.find((c) => c.key === columnKey);
    const updatedRows = rows.map((row) => {
        const newRow = { ...row };
        col.splitFields.forEach((field) => {
            newRow[field.key] = "";
        });
        return newRow;
    });
    if (isCalibrationGrid && isCalibrationReadingColumn(columnKey)) {
        calibrationSplitOverrides.current[columnKey] = false;
    }
    onChange?.(updatedRows);
    setColumnToggles((prev) => ({ ...prev, [columnKey]: false }));
    setToggleModalState({ open: false, columnKey: null });
};
    const handleCancelToggleOff = () => {
        setToggleModalState({ open: false, columnKey: null });
    };
    // ---- Visibility and disabled checks ----
    const isColumnVisible = (column, row, rowIndex) => {
        if (typeof column.visible === "function") {
            return column.visible({ row, rowIndex });
        }
        if (column.visible === false) return false;
        return true;
    };
    const isColumnDisabled = (column, row, rowIndex) => {
        if (isReadOnly || isDeleting) return true;
        if (typeof column.disabled === "function") {
            return column.disabled({ row, rowIndex });
        }
        return Boolean(column.disabled);
    };
    // ---- Render field ----
    const renderField = (column, row, rowIndex) => {
        const fieldValue = row[column.key];
        const disabled = isColumnDisabled(column, row, rowIndex);
        const toggleOn = column.toggleable && columnToggles[column.key];
        // ---- Toggle ON: render two inputs (each can be symbolic) ----
        if (toggleOn && column.splitFields) {
            return (
                <div className="flex gap-2">
                    {column.splitFields.map((field) => {
                        const val = row[field.key] ?? "";
                        const useSymbolic = field.symbolic ?? column.symbolic;
                        if (useSymbolic && (!column.headerSymbolic || getActiveUnit(column, field.key))) {
                            return (
                                <GridSymbolicInput
                                    key={field.key}
                                    value={val}
                                    fixedUnit={column.headerSymbolic ? getActiveUnit(column, field.key) : ""}
                                    disabled={disabled}
                                    placeholder={field.placeholder || `Enter ${field.key}`}
                                    defaultDiscipline={
                                        field.defaultDiscipline ||
                                        column.defaultDiscipline ||
                                        ""
                                    }
                                    onCommit={(next) =>
                                        handleSplitChange(rowIndex, field.key, next)
                                    }
                                />
                            );
                        }
                        return (
                            <Input
                                key={field.key}
                                value={val}
                                disabled={disabled}
                                readOnly={column.readOnly}
                                placeholder={field.placeholder || `Enter ${field.key}`}
                                onChange={(e) =>
                                    handleSplitChange(rowIndex, field.key, e.target.value)
                                }
                                className="!h-10 !w-full !rounded-lg !border-[#D1DBD7] !bg-white !px-3 !text-[12px] !font-medium !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)] disabled:!cursor-not-allowed disabled:!bg-[#F3F6F4] disabled:!text-[#65746E]"
                            />
                        );
                    })}
                </div>
            );
        }
        // ---- Normal rendering (single field) ----
        const handleChange = (newValue) => {
            handleCellChange(rowIndex, column.key, newValue);
        };
        if (column.render) {
            return column.render({
                value: fieldValue,
                row,
                rowIndex,
                disabled,
                onChange: handleChange,
            });
        }
        if (column.symbolic && (!column.headerSymbolic || getActiveUnit(column))) {
            return (
                <GridSymbolicInput
                    value={fieldValue ?? ""}
                    fixedUnit={column.headerSymbolic ? getActiveUnit(column) : ""}
                    disabled={disabled}
                    placeholder={column.placeholder || `Enter ${column.title.toLowerCase()}`}
                    defaultDiscipline={column.defaultDiscipline || ""}
                    onCommit={handleChange}
                />
            );
        }
        if (column.type === "text" || !column.type) {
            return (
                <Input
                    value={fieldValue}
                    disabled={disabled}
                    readOnly={column.readOnly}
                    placeholder={column.placeholder || `Enter ${column.title.toLowerCase()}`}
                    onChange={(event) => handleChange(event.target.value)}
                    className="!h-10 !w-full !rounded-lg !border-[#D1DBD7] !bg-white !px-3 !text-[12px] !font-medium !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)] disabled:!cursor-not-allowed disabled:!bg-[#F3F6F4] disabled:!text-[#65746E]"
                />
            );
        }
        if (column.type === "textarea") {
            return (
                <TextArea
                    value={fieldValue}
                    disabled={disabled}
                    readOnly={column.readOnly}
                    placeholder={column.placeholder || `Enter ${column.title.toLowerCase()}`}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    onChange={(event) => handleChange(event.target.value)}
                    className="!min-h-[40px] !w-full !resize-none !rounded-lg !border-[#D1DBD7] !bg-white !px-3 !py-2 !text-[12px] !font-medium !leading-5 !text-[#263B35] !shadow-none !placeholder:text-[#9AA6A1] hover:!border-[#A8B9B2] focus:!border-[#4E7585] focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)] disabled:!bg-[#F3F6F4]"
                />
            );
        }
        if (column.type === "number") {
            return (
                <InputNumber
                    value={fieldValue}
                    disabled={disabled}
                    min={column.min}
                    max={column.max}
                    step={column.step}
                    placeholder={column.placeholder}
                    onChange={handleChange}
                    className="!h-10 !w-full !rounded-lg !border-[#D1DBD7] !bg-white !text-[12px] !font-medium !text-[#263B35] !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585]"
                />
            );
        }
        if (column.type === "select") {
            return (
                <Select
                    value={fieldValue || undefined}
                    disabled={disabled}
                    placeholder={column.placeholder || `Select ${column.title.toLowerCase()}`}
                    options={column.options || []}
                    onChange={handleChange}
                    className="!w-full [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#D1DBD7] [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[12px] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-[#263B35] [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center [&_.ant-select-selection-placeholder]:!text-[#9AA6A1] hover:[&_.ant-select-selector]:!border-[#A8B9B2] [&.ant-select-focused_.ant-select-selector]:!border-[#4E7585]"
                />
            );
        }
        if (column.type === "date") {
            const dateValue = fieldValue ? dayjs(fieldValue) : null;
            return (
                <DatePicker
                    value={dateValue?.isValid() ? dateValue : null}
                    disabled={disabled}
                    format={column.format || "DD/MM/YYYY"}
                    placeholder={column.placeholder || "Select date"}
                    onChange={handleChange}
                    className="!h-10 !w-full !rounded-lg !border-[#D1DBD7] !bg-white !text-[12px] !font-medium !text-[#263B35] !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585]"
                />
            );
        }
        return null;
    };
    const visibleColumns = useMemo(
        () => columns.filter((column) => column.hidden !== true),
        [columns]
    );
    return (
        <div className={`w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)] ${className}`}>
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
                {effectiveAllowAdd && (
                    <button
                        type="button"
                        onClick={handleAddRow}
                        // disabled={maxRows !== undefined && rows.length >= maxRows}
                        disabled={
                            isDeleting ||
                            (maxRows !== undefined && rows.length >= maxRows)
                        }
                        className="group flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#2B5577] px-3.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(43,85,119,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#234766] hover:shadow-[0_7px_16px_rgba(43,85,119,0.25)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        <Plus size={14} strokeWidth={2} className="transition-transform duration-200 group-hover:rotate-90" />
                        {addButtonLabel}
                    </button>
                )}
            </div>
            <CustomScrollContainer maxHeight="520px" direction="both" className="w-full rounded-b-xl">
                <table className="w-full min-w-[900px] border-collapse">
                    <thead className="sticky top-0 z-[5]">
                        <tr className="bg-[#EEF3F1]">
                            <th className="sticky left-0 z-[7] w-[56px] border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]">
                                S.No
                            </th>
                            {visibleColumns.map((column) => (
                                <th
                                    key={column.key}
                                    style={{
                                        width: column.width,
                                        minWidth: column.minWidth || 180,
                                    }}
                                    className="border-b border-r border-[#D5DFDB] bg-[#EEF3F1] px-3.5 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.title}</span>
                                        {column.required && (
                                            <span className="text-red-500">*</span>
                                        )}
                                        {/* 👇 hide toggle for managedToggle columns (errorIn) */}
                                        {column.toggleable && !column.hideToggle && (
                                            <Switch
                                                size="small"
                                                checked={columnToggles[column.key] || false}
                                                disabled={isReadOnly}
                                                onChange={(checked) => handleToggleChange(checked, column.key)}
                                            />
                                        )}
                                    </div>
                                    {renderHeaderSymbol(column)}
                                </th>
                            ))}
                            {effectiveAllowDelete && (
                                <th className="w-[62px] border-b border-[#D5DFDB] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#63736C]">
                                    Action
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row, rowIndex) => (
                                <tr
                                    key={row[rowKey] || rowIndex}
                                    className="group bg-white transition-colors duration-150 hover:bg-[#FAFCFB]"
                                >
                                    <td className="sticky left-0 z-[1] border-b border-r border-[#E0E7E4] bg-white px-3 py-3 text-center align-top group-hover:bg-[#FAFCFB]">
                                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#EDF2F0] px-1.5 text-[10px] font-bold text-[#60716A]">
                                            {String(rowIndex + 1).padStart(2, "0")}
                                        </span>
                                    </td>
                                    {visibleColumns.map((column) => {
                                        if (!isColumnVisible(column, row, rowIndex)) {
                                            return (
                                                <td
                                                    key={column.key}
                                                    className="border-b border-r border-[#E0E7E4] bg-[#F8FAF9]"
                                                />
                                            );
                                        }
                                        return (
                                            <td
                                                key={column.key}
                                                className="border-b border-r border-[#E0E7E4] px-3 py-2.5 align-top"
                                            >
                                                {renderField(column, row, rowIndex)}
                                            </td>
                                        );
                                    })}
                                    {effectiveAllowDelete && (
                                        <td className="border-b border-[#E0E7E4] px-2 py-2.5 text-center align-top">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRow(rowIndex)}
                                                disabled={isDeleting || rows.length <= minRows}
                                                className={`
                                                    inline-flex h-8 w-8 items-center justify-center
                                                    rounded-lg transition-all duration-200
                                                    disabled:cursor-not-allowed
                                                    ${
                                                        isDeleting && deleteRowIndex === rowIndex
                                                            ? "bg-red-50 text-[#F52F3E]"
                                                            : "text-[#9AA6A1] hover:bg-[#FFF1F1] hover:text-[#DF5B5B] active:scale-90 disabled:opacity-25"
                                                    }
                                                `}
                                                aria-label={
                                                    isDeleting && deleteRowIndex === rowIndex
                                                        ? "Deleting row"
                                                        : "Delete row"
                                                }
                                            >
                                                {isDeleting && deleteRowIndex === rowIndex ? (
                                                    <Loader2
                                                        size={15}
                                                        strokeWidth={2}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Trash2 size={14} strokeWidth={1.8} />
                                                )}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        visibleColumns.length +
                                        1 +
                                        (effectiveAllowDelete ? 1 : 0)
                                    }
                                    className="h-[20px] border-b border-[#E0E7E4] px-5"
                                />
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
            {/* Delete Row Confirmation Modal */}
<UserModal
    isOpen={isDeleteModalOpen}
    onClose={handleCancelDelete}
    title="Delete Row"
    description={
        isDeleting
            ? "Please wait while the row is being deleted."
            : "Please confirm this action before continuing."
    }
    width="max-w-[420px]"
>
    <div className="space-y-5" aria-busy={isDeleting}>
        <p className="text-[13px] leading-6 text-[#596760]">
            Are you sure you want to delete this row?
            This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 border-t border-[#E8ECEA] pt-4">

            {/* Cancel Button */}
            <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="
                    h-9 rounded-lg border border-[#D5DEDA]
                    bg-white px-4 text-[12px] font-semibold
                    text-[#596760] transition-all duration-200
                    hover:bg-[#F6F8F7] hover:text-[#263B35]
                    active:scale-[0.98]
                    disabled:cursor-not-allowed disabled:opacity-50
                "
            >
                Cancel
            </button>

            {/* Delete Button */}
            <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="
                    inline-flex h-9 min-w-[115px]
                    items-center justify-center gap-2
                    rounded-lg bg-[#F52F3E] px-4
                    text-[12px] font-semibold text-white
                    shadow-[0_4px_12px_rgba(245,47,62,0.20)]
                    transition-all duration-200
                    hover:bg-[#E52635]
                    active:scale-[0.98]
                    disabled:cursor-not-allowed disabled:opacity-75
                "
            >
                {isDeleting ? (
                    <>
                        <Loader2
                            size={15}
                            strokeWidth={2.5}
                            className="animate-spin"
                        />
                        <span>Deleting...</span>
                    </>
                ) : (
                    "Delete Row"
                )}
            </button>
        </div>
    </div>
</UserModal>
            {/* Toggle OFF Confirmation Modal */}
            <UserModal
                isOpen={toggleModalState.open}
                onClose={handleCancelToggleOff}
                title="Disable Split View"
                description="Warning: This action will remove the extra data."
                width="max-w-[420px]"
            >
                <div className="space-y-5">
                    <p className="text-[13px] leading-6 text-[#596760]">
                        Turning off the split view will <strong>permanently remove</strong> all data from the extra fields for this column. Are you sure you want to continue?
                    </p>
                    <div className="flex justify-end gap-3 border-t border-[#E8ECEA] pt-4">
                        <button
                            type="button"
                            onClick={handleCancelToggleOff}
                            className="h-9 rounded-lg border border-[#D5DEDA] bg-white px-4 text-[12px] font-semibold text-[#596760] transition-all duration-200 hover:bg-[#F6F8F7] hover:text-[#263B35] active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmToggleOff}
                            className="h-9 rounded-lg bg-[#F52F3E] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(245,47,62,0.20)] transition-all duration-200 hover:bg-[#E52635] hover:shadow-[0_6px_15px_rgba(245,47,62,0.28)] active:scale-[0.98]"
                        >
                            Yes, Remove Data
                        </button>
                    </div>
                </div>
            </UserModal>
            <style>{`
                .grid-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #8FA8A0 #EEF3F1;
                }
                .grid-scroll::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .grid-scroll::-webkit-scrollbar-track {
                    background: #EEF3F1;
                    border-radius: 999px;
                }
                .grid-scroll::-webkit-scrollbar-thumb {
                    background: #8FA8A0;
                    border-radius: 999px;
                    border: 1px solid #EEF3F1;
                }
                .grid-scroll::-webkit-scrollbar-thumb:hover {
                    background: #66877C;
                }
                .grid-scroll::-webkit-scrollbar-corner {
                    background: #EEF3F1;
                }
            `}</style>
        </div>
    );
};
export default UserDynamicGrid;
