import React, { useMemo, useState } from "react";

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Inbox,
} from "lucide-react";

import DataTableToolbar from "./DataTableToolbar";
import DataTablePagination from "./DataTablePagination";
import DataTableSkeleton from "./DataTableSkeleton";

const DataTable = ({
    data = [],
    columns = [],
    loading = false,

    searchable = true,
    searchPlaceholder = "Search...",

    pagination = true,
    pageSize = 10,
    pageSizeOptions = [10, 20, 50],

    sortable = true,
    showColumnVisibility = true,
    selectable = false,
    hoverable = true,
    striped = false,

    emptyTitle = "No data found",
    emptyDescription = "There are no records to display.",

    toolbar = true,
    toolbarActions = null,

    onRowClick,
    getRowId,
    className = "",

    initialSorting = [],
    initialColumnVisibility = {},

    // Server-side pagination
    manualPagination = false,
    pageCount,
    totalRows,
    onPaginationChange,
}) => {
    const [sorting, setSorting] =
        useState(initialSorting);

    const [globalFilter, setGlobalFilter] =
        useState("");

    const [columnVisibility, setColumnVisibility] =
        useState(initialColumnVisibility);

    const [rowSelection, setRowSelection] =
        useState({});

    const [paginationState, setPaginationState] =
        useState({
            pageIndex: 0,
            pageSize,
        });

    /* ============================================================
       SELECTION COLUMN
       FUNCTIONALITY UNCHANGED
    ============================================================ */
    const selectionColumn = useMemo(() => {
        if (!selectable) return [];

        return [
            {
                id: "select",
                size: 48,
                enableSorting: false,

                header: ({ table }) => (
                    <div className="flex justify-center">
                        <input
                            type="checkbox"
                            checked={table.getIsAllPageRowsSelected()}
                            ref={(input) => {
                                if (input) {
                                    input.indeterminate =
                                        table.getIsSomePageRowsSelected();
                                }
                            }}
                            onChange={table.getToggleAllPageRowsSelectedHandler()}
                            className="
                                h-4
                                w-4
                                cursor-pointer
                                rounded
                                border-[var(--color-border-strong)]
                                accent-[var(--color-primary)]
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[var(--color-primary-muted)]
                                focus:ring-offset-1
                            "
                        />
                    </div>
                ),

                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <input
                            type="checkbox"
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            onChange={row.getToggleSelectedHandler()}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            className="
                                h-4
                                w-4
                                cursor-pointer
                                rounded
                                border-[var(--color-border-strong)]
                                accent-[var(--color-primary)]
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[var(--color-primary-muted)]
                                focus:ring-offset-1
                                disabled:cursor-not-allowed
                            "
                        />
                    </div>
                ),
            },
        ];
    }, [selectable]);

    const tableColumns = useMemo(
        () => [...selectionColumn, ...columns],
        [selectionColumn, columns]
    );

    /* ============================================================
       TABLE CONFIGURATION
       FUNCTIONALITY UNCHANGED
    ============================================================ */
    const table = useReactTable({
        data,
        columns: tableColumns,

        state: {
            sorting,
            globalFilter,
            columnVisibility,
            rowSelection,
            pagination: paginationState,
        },

        enableSorting: sortable,
        enableRowSelection: selectable,

        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,

        onPaginationChange: (updater) => {
            setPaginationState((current) => {
                const next =
                    typeof updater === "function"
                        ? updater(current)
                        : updater;

                if (
                    manualPagination &&
                    typeof onPaginationChange ===
                        "function"
                ) {
                    onPaginationChange(next);
                }

                return next;
            });
        },

        manualPagination,

        ...(manualPagination &&
        pageCount !== undefined
            ? {
                  pageCount,
              }
            : {}),

        getCoreRowModel:
            getCoreRowModel(),

        getSortedRowModel:
            getSortedRowModel(),

        getFilteredRowModel:
            getFilteredRowModel(),

        getPaginationRowModel:
            manualPagination || !pagination
                ? undefined
                : getPaginationRowModel(),

        getRowId,

        defaultColumn: {
            minSize: 80,
            maxSize: 800,
        },
    });

    const rows = table.getRowModel().rows;

    /* ============================================================
       CLEAR FILTERS
       FUNCTIONALITY UNCHANGED
    ============================================================ */
    const handleClearFilters = () => {
        setGlobalFilter("");
        setSorting([]);

        if (manualPagination) {
            const firstPage = {
                pageIndex: 0,
                pageSize: paginationState.pageSize,
            };

            setPaginationState(firstPage);

            if (
                typeof onPaginationChange ===
                "function"
            ) {
                onPaginationChange(firstPage);
            }
        }
    };

    /* ============================================================
       LOADING STATE
    ============================================================ */
    if (loading) {
        return (
            <div
                className={`
                    flex
                    h-full
                    min-h-0
                    flex-col
                    overflow-hidden
                    rounded-[18px]
                    border
                    border-[var(--color-border)]
                    bg-[var(--color-surface)]
                    shadow-[0_5px_20px_rgba(36,50,56,0.055)]
                    ${className}
                `}
            >
                {toolbar && (
                    <div className="shrink-0 border-b border-[var(--color-border-soft)]">
                        <DataTableToolbar
                            table={table}
                            searchable={searchable}
                            searchPlaceholder={searchPlaceholder}
                            showColumnVisibility={
                                showColumnVisibility
                            }
                            toolbarActions={
                                toolbarActions
                            }
                            globalFilter={
                                globalFilter
                            }
                            setGlobalFilter={
                                setGlobalFilter
                            }
                            onClearFilters={
                                handleClearFilters
                            }
                        />
                    </div>
                )}

                <div className="min-h-0 flex-1 bg-[var(--color-surface)]">
                    <DataTableSkeleton
                        columns={columns.length}
                        rows={pageSize}
                    />
                </div>
            </div>
        );
    }

    /* ============================================================
       MAIN TABLE
    ============================================================ */
    return (
        <div
            className={`
                flex
                h-full
                min-h-0
                flex-col
                overflow-hidden
                rounded-[18px]
                border
                border-[var(--color-border)]
                bg-[var(--color-surface)]
                shadow-[0_5px_20px_rgba(36,50,56,0.055)]
                ${className}
            `}
        >
            {/* =====================================================
                TOOLBAR
            ====================================================== */}
            {toolbar && (
                <div
                    className="
                        shrink-0
                        border-b
                        border-[var(--color-border-soft)]
                        bg-[var(--color-surface)]
                    "
                >
                    <DataTableToolbar
                        table={table}
                        searchable={searchable}
                        searchPlaceholder={searchPlaceholder}
                        showColumnVisibility={
                            showColumnVisibility
                        }
                        toolbarActions={
                            toolbarActions
                        }
                        globalFilter={
                            globalFilter
                        }
                        setGlobalFilter={
                            setGlobalFilter
                        }
                        onClearFilters={
                            handleClearFilters
                        }
                    />
                </div>
            )}

            {/* =====================================================
                TABLE SCROLL AREA
            ====================================================== */}
            <div
                className="
                    min-h-0
                    flex-1
                    overflow-x-auto
                    overflow-y-auto
                    custom-scrollbar
                    bg-[var(--color-surface)]
                "
            >
                <table className="w-full min-w-[900px] border-collapse">

                    {/* =================================================
                        HEADER
                    ================================================== */}
                    <thead className="sticky top-0 z-20">
                        {table
                            .getHeaderGroups()
                            .map(
                                (
                                    headerGroup
                                ) => (
                                    <tr
                                        key={
                                            headerGroup.id
                                        }
                                        className="
                                            border-b
                                            border-[var(--color-border-strong)]
                                            bg-[#E7EFEB]
                                        "
                                    >
                                        {headerGroup.headers.map(
                                            (
                                                header
                                            ) => {
                                                const canSort =
                                                    header.column.getCanSort();

                                                const sorted =
                                                    header.column.getIsSorted();

                                                return (
                                                    <th
                                                        key={
                                                            header.id
                                                        }
                                                        colSpan={
                                                            header.colSpan
                                                        }
                                                        style={{
                                                            width:
                                                                header.getSize() !==
                                                                150
                                                                    ? header.getSize()
                                                                    : undefined,
                                                        }}
                                                        className="
                                                            sticky
                                                            top-0
                                                            z-20
                                                            whitespace-nowrap
                                                            border-r
                                                            border-[#D5DFDB]
                                                            bg-[#E7EFEB]
                                                            px-4
                                                            py-3.5
                                                            text-left
                                                            align-middle
                                                            last:border-r-0
                                                        "
                                                    >
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                onClick={
                                                                    canSort
                                                                        ? header.column.getToggleSortingHandler()
                                                                        : undefined
                                                                }
                                                                className={`
                                                                    flex
                                                                    items-center
                                                                    gap-2.5
                                                                    text-[10px]
                                                                    font-bold
                                                                    uppercase
                                                                    tracking-[0.09em]
                                                                    text-[#536C63]

                                                                    ${
                                                                        canSort
                                                                            ? "cursor-pointer select-none"
                                                                            : ""
                                                                    }
                                                                `}
                                                            >
                                                                {/* HEADER LABEL */}
                                                                <span>
                                                                    {flexRender(
                                                                        header
                                                                            .column
                                                                            .columnDef
                                                                            .header,
                                                                        header.getContext()
                                                                    )}
                                                                </span>

                                                                {/* SORT CONTROL */}
                                                                {canSort && (
                                                                    <span
                                                                        className={`
                                                                            ml-auto
                                                                            flex
                                                                            h-[27px]
                                                                            w-[27px]
                                                                            shrink-0
                                                                            items-center
                                                                            justify-center
                                                                            rounded-[8px]
                                                                            border
                                                                            transition-all
                                                                            duration-200

                                                                            ${
                                                                                sorted
                                                                                    ? `
                                                                                        border-[#B9CCC4]
                                                                                        bg-[#DCE7E2]
                                                                                        text-[#56766D]
                                                                                        shadow-[0_1px_4px_rgba(86,118,109,0.05)]
                                                                                    `
                                                                                    : `
                                                                                        border-[#D8E1DD]
                                                                                        bg-[#F6F8F6]
                                                                                        text-[#8A9994]
                                                                                        hover:border-[#C4D2CC]
                                                                                        hover:bg-white
                                                                                        hover:text-[#56766D]
                                                                                    `
                                                                            }
                                                                        `}
                                                                    >
                                                                        {sorted ===
                                                                        "asc" ? (
                                                                            <ArrowUp
                                                                                size={
                                                                                    12
                                                                                }
                                                                                strokeWidth={
                                                                                    2.2
                                                                                }
                                                                            />
                                                                        ) : sorted ===
                                                                          "desc" ? (
                                                                            <ArrowDown
                                                                                size={
                                                                                    12
                                                                                }
                                                                                strokeWidth={
                                                                                    2.2
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <ArrowUpDown
                                                                                size={
                                                                                    12
                                                                                }
                                                                                strokeWidth={
                                                                                    1.9
                                                                                }
                                                                            />
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </th>
                                                );
                                            }
                                        )}
                                    </tr>
                                )
                            )}
                    </thead>

                    {/* =================================================
                        BODY
                    ================================================== */}
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() =>
                                        onRowClick?.(
                                            row.original,
                                            row
                                        )
                                    }
                                    className={`
                                        group
                                        border-b
                                        border-[#E8ECE9]
                                        transition-all
                                        duration-200
                                        last:border-b-0

                                        ${
                                            row.getIsSelected()
                                                ? `
                                                    bg-[#E8F0ED]
                                                    shadow-[inset_3px_0_0_var(--color-primary)]
                                                `
                                                : striped
                                                ? row.index % 2 ===
                                                  0
                                                    ? "bg-white"
                                                    : "bg-[#FAFBF9]"
                                                : "bg-white"
                                        }

                                        ${
                                            hoverable
                                                ? `
                                                    hover:bg-[#F3F7F5]
                                                    hover:shadow-[inset_3px_0_0_#56766D]
                                                `
                                                : ""
                                        }

                                        ${
                                            onRowClick
                                                ? "cursor-pointer"
                                                : ""
                                        }
                                    `}
                                >
                                    {row
                                        .getVisibleCells()
                                        .map(
                                            (
                                                cell
                                            ) => (
                                                <td
                                                    key={
                                                        cell.id
                                                    }
                                                    className="
                                                        whitespace-nowrap
                                                        px-4
                                                        py-3.5
                                                        align-middle
                                                        text-[11.5px]
                                                        font-medium
                                                        text-[#566560]
                                                        transition-colors
                                                        duration-200
                                                        group-hover:text-[#40534D]
                                                    "
                                                >
                                                    {flexRender(
                                                        cell
                                                            .column
                                                            .columnDef
                                                            .cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            )
                                        )}
                                </tr>
                            ))
                        ) : (
                            /* =========================================
                               EMPTY STATE
                            ========================================== */
                            <tr>
                                <td
                                    colSpan={
                                        table.getVisibleLeafColumns()
                                            .length
                                    }
                                >
                                    <div
                                        className="
                                            flex
                                            min-h-[300px]
                                            flex-col
                                            items-center
                                            justify-center
                                            px-6
                                            text-center
                                        "
                                    >
                                        {/* EMPTY ICON */}
                                        <div
                                            className="
                                                relative
                                                mb-4
                                                flex
                                                h-[58px]
                                                w-[58px]
                                                items-center
                                                justify-center
                                                rounded-[15px]
                                                border
                                                border-[#D4E0DB]
                                                bg-[#EEF4F1]
                                                text-[#718983]
                                            "
                                        >
                                            <Inbox
                                                size={25}
                                                strokeWidth={
                                                    1.65
                                                }
                                            />

                                            <span
                                                className="
                                                    absolute
                                                    bottom-[-2px]
                                                    right-[7px]
                                                    h-[6px]
                                                    w-[6px]
                                                    rounded-full
                                                    bg-[#A47D45]
                                                "
                                            />
                                        </div>

                                        {/* TITLE */}
                                        <h3
                                            className="
                                                text-[13px]
                                                font-bold
                                                tracking-[-0.01em]
                                                text-[var(--color-text-primary)]
                                            "
                                        >
                                            {emptyTitle}
                                        </h3>

                                        {/* DESCRIPTION */}
                                        <p
                                            className="
                                                mt-1
                                                max-w-sm
                                                text-[10.5px]
                                                font-medium
                                                leading-5
                                                text-[var(--color-text-muted)]
                                            "
                                        >
                                            {
                                                emptyDescription
                                            }
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =====================================================
                PAGINATION
            ====================================================== */}
            {pagination && (
                <div
                    className="
                        shrink-0
                        border-t
                        border-[var(--color-border-soft)]
                        bg-[var(--color-surface)]
                    "
                >
                    <DataTablePagination
                        table={table}
                        pageSizeOptions={
                            pageSizeOptions
                        }
                        totalRows={
                            manualPagination
                                ? totalRows
                                : undefined
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default DataTable;