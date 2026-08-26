import React, { useCallback, useMemo, useState } from "react";
import { Plus, Trash2, Table2, GripVertical } from "lucide-react";
import { Input, InputNumber, Select, DatePicker } from "antd";
import UserModal from "../UserModal/UserModal";

const { TextArea } = Input;

const UserDynamicGrid = ({
    name = "Grid",
    description,
    columns = [],
    value = [],
    onChange,
    allowAdd = true,
    allowDelete = true,
    addButtonLabel = "Add Row",
    minRows = 0,
    maxRows,
    emptyTitle = "No data added yet",
    rowKey = "_rowId",
    className = "",
}) => {
    const rows = Array.isArray(value) ? value : [];
    const [deleteRowIndex, setDeleteRowIndex] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const createRow = useCallback(() => {
        const row = {
            [rowKey]: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };

        columns.forEach((column) => {
            row[column.key] = column.defaultValue !== undefined ? column.defaultValue : "";
        });

        return row;
    }, [columns, rowKey]);

    const handleAddRow = () => {
        if (maxRows !== undefined && rows.length >= maxRows) return;
        const newRow = createRow();
        onChange?.([...rows, newRow]);
    };

    const handleDeleteRow = (rowIndex) => {
        if (rows.length <= minRows) return;
        setDeleteRowIndex(rowIndex);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deleteRowIndex === null || rows.length <= minRows) return;

        const updatedRows = rows.filter((_, index) => index !== deleteRowIndex);
        onChange?.(updatedRows);
        setDeleteRowIndex(null);
        setIsDeleteModalOpen(false);
    };

    const handleCancelDelete = () => {
        setDeleteRowIndex(null);
        setIsDeleteModalOpen(false);
    };

    const handleCellChange = (rowIndex, columnKey, newValue) => {
        const updatedRows = rows.map((row, index) => {
            if (index !== rowIndex) return row;
            return { ...row, [columnKey]: newValue };
        });

        onChange?.(updatedRows);
    };

    const isColumnVisible = (column, row, rowIndex) => {
        if (typeof column.visible === "function") {
            return column.visible({ row, rowIndex });
        }

        if (column.visible === false) return false;
        return true;
    };

    const isColumnDisabled = (column, row, rowIndex) => {
        if (typeof column.disabled === "function") {
            return column.disabled({ row, rowIndex });
        }

        return Boolean(column.disabled);
    };

    const renderField = (column, row, rowIndex) => {
        const fieldValue = row[column.key];
        const disabled = isColumnDisabled(column, row, rowIndex);

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
            return (
                <DatePicker
                    value={fieldValue || null}
                    disabled={disabled}
                    format={column.format || "DD-MMM-YYYY"}
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

                {allowAdd && (
                    <button
                        type="button"
                        onClick={handleAddRow}
                        disabled={maxRows !== undefined && rows.length >= maxRows}
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

            <div className="grid-scroll w-full max-h-[520px] overflow-auto rounded-b-xl">
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
                                    <div className="flex items-center gap-1">
                                        {column.title}
                                        {column.required && (
                                            <span className="text-red-500">*</span>
                                        )}
                                    </div>
                                </th>
                            ))}

                            {allowDelete && (
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

                                    {allowDelete && (
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
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        visibleColumns.length +
                                        1 +
                                        (allowDelete ? 1 : 0)
                                    }
                                    className="h-[20px] border-b border-[#E0E7E4] px-5"
                                />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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