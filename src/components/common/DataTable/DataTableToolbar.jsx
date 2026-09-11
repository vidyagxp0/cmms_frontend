import React, { useState } from "react";

import {
    Columns3,
    RotateCcw,
    Search,
    ChevronDown,
    X,
} from "lucide-react";

const DataTableToolbar = ({
    table,
    searchable,
    searchPlaceholder,
    showColumnVisibility,
    toolbarActions,
    globalFilter,
    setGlobalFilter,
    onClearFilters,
}) => {
    const [showColumns, setShowColumns] =
        useState(false);

    const visibleColumns = table
        .getAllLeafColumns()
        .filter((column) =>
            column.getCanHide()
        );

    const hasFilter = Boolean(globalFilter);

    return (
        <div
            className="
                flex
                min-h-[62px]
                shrink-0
                flex-wrap
                items-center
                justify-between
                gap-3
                border-b
                border-[var(--color-border-soft)]
                bg-[var(--color-surface)]
                px-4
                py-3
                sm:px-5
            "
        >
            {/* =====================================================
                LEFT : SEARCH / FILTER
            ====================================================== */}
            <div
                className="
                    flex
                    min-w-0
                    flex-1
                    flex-wrap
                    items-center
                    gap-2
                "
            >
                {searchable && (
                    <div className="relative">
                        {/* SEARCH ICON */}
                        <Search
                            size={15}
                            strokeWidth={1.8}
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-[#8C9894]
                            "
                        />

                        {/* SEARCH INPUT */}
                        <input
                            value={
                                globalFilter ?? ""
                            }
                            onChange={(event) =>
                                setGlobalFilter(
                                    event.target.value
                                )
                            }
                            placeholder={
                                searchPlaceholder
                            }
                            className="
                                h-[38px]
                                w-[250px]
                                rounded-[10px]
                                border
                                border-[var(--color-border)]
                                bg-[var(--color-surface-soft)]
                                pl-9
                                pr-9
                                text-[11px]
                                font-medium
                                text-[var(--color-text-primary)]
                                outline-none
                                transition-all
                                duration-200
                                placeholder:text-[#9AA5A1]
                                hover:border-[#C4CEC9]
                                hover:bg-white
                                focus:border-[#9FBAB0]
                                focus:bg-white
                                focus:shadow-[0_0_0_3px_rgba(86,118,109,0.07)]
                            "
                        />

                        {/* CLEAR SEARCH */}
                        {globalFilter && (
                            <button
                                type="button"
                                onClick={() =>
                                    setGlobalFilter("")
                                }
                                aria-label="Clear search"
                                className="
                                    absolute
                                    right-2.5
                                    top-1/2
                                    flex
                                    h-6
                                    w-6
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-[6px]
                                    text-[#8B9692]
                                    transition-all
                                    duration-150
                                    hover:bg-[var(--color-primary-soft)]
                                    hover:text-[var(--color-primary)]
                                    focus:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-[var(--color-primary-muted)]
                                "
                            >
                                <X
                                    size={13}
                                    strokeWidth={1.9}
                                />
                            </button>
                        )}
                    </div>
                )}

                {/* CLEAR FILTERS */}
                {hasFilter && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="
                            inline-flex
                            h-[38px]
                            items-center
                            gap-1.5
                            rounded-[9px]
                            border
                            border-transparent
                            px-2.5
                            text-[10.5px]
                            font-semibold
                            text-[#7B8783]
                            transition-all
                            duration-200
                            hover:border-[var(--color-border-soft)]
                            hover:bg-[var(--color-surface-muted)]
                            hover:text-[var(--color-text-primary)]
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[var(--color-primary-muted)]
                        "
                    >
                        <RotateCcw
                            size={13}
                            strokeWidth={1.8}
                        />

                        Clear
                    </button>
                )}
            </div>

            {/* =====================================================
                RIGHT : ACTIONS
            ====================================================== */}
            <div
                className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                "
            >
                {showColumnVisibility &&
                    visibleColumns.length > 0 && (
                        <div className="relative">
                            {/* =================================================
                                COLUMN VISIBILITY BUTTON

                                Existing button remains intentionally
                                commented out, matching the current
                                implementation.
                            ================================================== */}

                            {showColumns && (
                                <>
                                    {/* BACKDROP */}
                                    <div
                                        className="
                                            fixed
                                            inset-0
                                            z-40
                                        "
                                        onClick={() =>
                                            setShowColumns(
                                                false
                                            )
                                        }
                                    />

                                    {/* COLUMN MENU */}
                                    <div
                                        className="
                                            absolute
                                            right-0
                                            top-11
                                            z-50
                                            w-56
                                            overflow-hidden
                                            rounded-[13px]
                                            border
                                            border-[var(--color-border)]
                                            bg-white
                                            p-2
                                            shadow-[0_16px_38px_rgba(36,50,56,0.12)]
                                        "
                                    >
                                        <p
                                            className="
                                                px-2
                                                py-2
                                                text-[9.5px]
                                                font-bold
                                                uppercase
                                                tracking-[0.09em]
                                                text-[var(--color-text-muted)]
                                            "
                                        >
                                            Table Columns
                                        </p>

                                        {visibleColumns.map(
                                            (column) => (
                                                <label
                                                    key={
                                                        column.id
                                                    }
                                                    className="
                                                        flex
                                                        cursor-pointer
                                                        items-center
                                                        gap-2.5
                                                        rounded-[9px]
                                                        px-2
                                                        py-2
                                                        text-[10.5px]
                                                        font-medium
                                                        text-[#66736F]
                                                        transition-all
                                                        duration-150
                                                        hover:bg-[var(--color-surface-muted)]
                                                        hover:text-[var(--color-text-primary)]
                                                    "
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={column.getIsVisible()}
                                                        onChange={column.getToggleVisibilityHandler()}
                                                        className="
                                                            h-[14px]
                                                            w-[14px]
                                                            cursor-pointer
                                                            rounded
                                                            border-[var(--color-border-strong)]
                                                            accent-[var(--color-primary)]
                                                            focus:outline-none
                                                            focus:ring-2
                                                            focus:ring-[var(--color-primary-muted)]
                                                        "
                                                    />

                                                    <span className="truncate">
                                                        {typeof column
                                                            .columnDef
                                                            .header ===
                                                        "string"
                                                            ? column
                                                                  .columnDef
                                                                  .header
                                                            : column.id}
                                                    </span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                {toolbarActions}
            </div>
        </div>
    );
};

export default DataTableToolbar;