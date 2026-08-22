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
    const [showColumns, setShowColumns] = useState(false);

    const visibleColumns = table
        .getAllLeafColumns()
        .filter((column) => column.getCanHide());

    const hasFilter = Boolean(globalFilter);

    return (
        <div
            className="
                flex
                min-h-[62px]
                shrink-0
                items-center
                justify-between
                gap-3
                border-b
                border-slate-100
                bg-white
                px-5
                py-3
            "
        >
            {/* Search */}
            <div className="flex min-w-0 items-center gap-2">
                {searchable && (
                    <div className="relative">
                        <Search
                            size={15}
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <input
                            value={globalFilter ?? ""}
                            onChange={(event) =>
                                setGlobalFilter(
                                    event.target.value
                                )
                            }
                            placeholder={searchPlaceholder}
                            className="
                                h-9
                                w-[260px]
                                rounded-lg
                                border
                                border-slate-200
                                bg-slate-50/50
                                pl-9
                                pr-9
                                text-xs
                                font-medium
                                text-slate-700
                                outline-none
                                transition-all
                                placeholder:text-slate-400
                                hover:border-slate-300
                                focus:border-indigo-300
                                focus:bg-white
                                focus:ring-4
                                focus:ring-indigo-500/10
                            "
                        />

                        {globalFilter && (
                            <button
                                type="button"
                                onClick={() =>
                                    setGlobalFilter("")
                                }
                                className="
                                    absolute
                                    right-2.5
                                    top-1/2
                                    flex
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    text-slate-400
                                    transition
                                    hover:text-slate-600
                                "
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                )}

                {hasFilter && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="
                            flex
                            h-9
                            items-center
                            gap-1.5
                            rounded-lg
                            px-2.5
                            text-xs
                            font-medium
                            text-slate-400
                            transition
                            hover:bg-slate-50
                            hover:text-slate-600
                        "
                    >
                        <RotateCcw size={13} />
                        Clear
                    </button>
                )}
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-2">
                {showColumnVisibility &&
                    visibleColumns.length > 0 && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowColumns(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                className="
                                    flex
                                    h-9
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    text-xs
                                    font-semibold
                                    text-slate-500
                                    transition-all
                                    hover:border-slate-300
                                    hover:bg-slate-50
                                    hover:text-slate-700
                                "
                            >
                                <Columns3 size={14} />

                                <span>Columns</span>

                                <ChevronDown
                                    size={13}
                                    className={`
                                        transition-transform
                                        ${
                                            showColumns
                                                ? "rotate-180"
                                                : ""
                                        }
                                    `}
                                />
                            </button>

                            {showColumns && (
                                <>
                                    <div
                                        className="
                                            fixed
                                            inset-0
                                            z-40
                                        "
                                        onClick={() =>
                                            setShowColumns(false)
                                        }
                                    />

                                    <div
                                        className="
                                            absolute
                                            right-0
                                            top-11
                                            z-50
                                            w-56
                                            overflow-hidden
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            p-2
                                            shadow-[0_15px_40px_rgba(15,23,42,0.14)]
                                        "
                                    >
                                        <p
                                            className="
                                                px-2
                                                py-2
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.08em]
                                                text-slate-400
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
                                                        rounded-lg
                                                        px-2
                                                        py-2
                                                        text-xs
                                                        font-medium
                                                        text-slate-600
                                                        transition
                                                        hover:bg-slate-50
                                                    "
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={column.getIsVisible()}
                                                        onChange={column.getToggleVisibilityHandler()}
                                                        className="
                                                            h-3.5
                                                            w-3.5
                                                            rounded
                                                            border-slate-300
                                                            accent-indigo-600
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