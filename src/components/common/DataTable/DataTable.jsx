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
    const [sorting, setSorting] = useState(initialSorting);

    const [globalFilter, setGlobalFilter] = useState("");

    const [columnVisibility, setColumnVisibility] = useState(
        initialColumnVisibility
    );

    const [rowSelection, setRowSelection] = useState({});

    const [paginationState, setPaginationState] = useState({
        pageIndex: 0,
        pageSize,
    });

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
                                h-4 w-4 cursor-pointer rounded
                                border-slate-300 accent-[#159A8C]
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
                                h-4 w-4 cursor-pointer rounded
                                border-slate-300 accent-[#159A8C]
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
                    typeof onPaginationChange === "function"
                ) {
                    onPaginationChange(next);
                }

                return next;
            });
        },

        /*
         * IMPORTANT:
         *
         * manualPagination = true
         * means backend already returned only the
         * records for the requested page.
         */
        manualPagination,

        ...(manualPagination && pageCount !== undefined
            ? {
                  pageCount,
              }
            : {}),

        getCoreRowModel: getCoreRowModel(),

        getSortedRowModel: getSortedRowModel(),

        getFilteredRowModel: getFilteredRowModel(),

        /*
         * Client-side pagination is used only when
         * manualPagination is false.
         */
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

    const handleClearFilters = () => {
        setGlobalFilter("");
        setSorting([]);

        if (manualPagination) {
            const firstPage = {
                pageIndex: 0,
                pageSize: paginationState.pageSize,
            };

            setPaginationState(firstPage);

            if (typeof onPaginationChange === "function") {
                onPaginationChange(firstPage);
            }
        }
    };

    if (loading) {
        return (
            <div
                className={`
                    flex h-full min-h-0 flex-col overflow-hidden rounded-2xl
                    border border-slate-200/80 bg-white
                    shadow-[0_4px_25px_rgba(15,23,42,0.05)]
                    ${className}
                `}
            >
                {toolbar && (
                    <DataTableToolbar
                        table={table}
                        searchable={searchable}
                        searchPlaceholder={searchPlaceholder}
                        showColumnVisibility={showColumnVisibility}
                        toolbarActions={toolbarActions}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        onClearFilters={handleClearFilters}
                    />
                )}

                <div className="min-h-0 flex-1">
                    <DataTableSkeleton
                        columns={columns.length}
                        rows={pageSize}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className={`
                flex h-full min-h-0 flex-col overflow-hidden rounded-2xl
                border border-slate-200/80 bg-white
                shadow-[0_4px_25px_rgba(15,23,42,0.05)]
                ${className}
            `}
        >
            {toolbar && (
                <div className="shrink-0">
                    <DataTableToolbar
                        table={table}
                        searchable={searchable}
                        searchPlaceholder={searchPlaceholder}
                        showColumnVisibility={showColumnVisibility}
                        toolbarActions={toolbarActions}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        onClearFilters={handleClearFilters}
                    />
                </div>
            )}

            {/* Table internal scroll */}
            <div
                className="
                    overflow-y-auto overflow-x-auto
                    scrollbar-thin scrollbar-track-transparent
                    scrollbar-thumb-slate-200
                    hover:scrollbar-thumb-slate-300
                "
                style={{
                    height: "280px",
                }}
            >
                <table className="w-full min-w-[900px] border-collapse">
                    <thead className="sticky top-0 z-20">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                                key={headerGroup.id}
                                className="
                                    border-b border-[#B8DCD7]
                                    bg-[#dcf0f3]
                                "
                            >
                                {headerGroup.headers.map((header) => {
                                    const canSort =
                                        header.column.getCanSort();

                                    const sorted =
                                        header.column.getIsSorted();

                                    return (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{
                                                width:
                                                    header.getSize() !== 150
                                                        ? header.getSize()
                                                        : undefined,
                                            }}
                                            className="
                                                whitespace-nowrap
                                                border-r border-[#CFE6E2]
                                                px-5 py-3.5
                                                text-left align-middle
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
                                                        flex items-center gap-3
                                                        text-[11px] font-bold
                                                        uppercase
                                                        tracking-[0.08em]
                                                        text-[#185B61]
                                                        ${
                                                            canSort
                                                                ? "cursor-pointer select-none"
                                                                : ""
                                                        }
                                                    `}
                                                >
                                                    <span>
                                                        {flexRender(
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext()
                                                        )}
                                                    </span>

                                                    {canSort && (
                                                        <span
                                                            className={`
                                                                ml-auto flex
                                                                h-7 w-7
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-lg
                                                                border
                                                                transition-all
                                                                duration-200
                                                                ${
                                                                    sorted
                                                                        ? `
                                                                            border-[#A7D6D0]
                                                                            bg-[#D2ECE8]
                                                                            text-[#087F73]
                                                                        `
                                                                        : `
                                                                            border-[#C8E0DD]
                                                                            bg-white/80
                                                                            text-[#75A29D]
                                                                        `
                                                                }
                                                            `}
                                                        >
                                                            {sorted ===
                                                            "asc" ? (
                                                                <ArrowUp
                                                                    size={13}
                                                                />
                                                            ) : sorted ===
                                                              "desc" ? (
                                                                <ArrowDown
                                                                    size={13}
                                                                />
                                                            ) : (
                                                                <ArrowUpDown
                                                                    size={13}
                                                                />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>

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
                                        border-b border-[#D9EAE7]
                                        transition-all duration-200
                                        last:border-b-0

                                        ${
                                            row.getIsSelected()
                                                ? "bg-[#D7EEEA] shadow-[inset_3px_0_0_#159A8C]"
                                                : row.index % 2 === 0
                                                ? "bg-white"
                                                : "bg-[#F5FAF9]"
                                        }

                                        ${
                                            hoverable
                                                ? "hover:bg-[#EAF6F3] hover:shadow-[inset_3px_0_0_#159A8C]"
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
                                        .map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="
                                                    whitespace-nowrap
                                                    px-5 py-3.5
                                                    text-sm font-medium
                                                    align-middle
                                                    text-[#456B6B]
                                                    transition-colors
                                                    duration-200
                                                    group-hover:text-[#185B61]
                                                "
                                            >
                                                {flexRender(
                                                    cell.column
                                                        .columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        table.getVisibleLeafColumns()
                                            .length
                                    }
                                >
                                    <div
                                        className="
                                            flex min-h-[300px]
                                            flex-col items-center
                                            justify-center
                                            px-6 text-center
                                        "
                                    >
                                        <div
                                            className="
                                                mb-4 flex h-14 w-14
                                                items-center justify-center
                                                rounded-2xl
                                                bg-[#E7F4F2]
                                                text-[#75A29D]
                                            "
                                        >
                                            <Inbox
                                                size={25}
                                                strokeWidth={1.7}
                                            />
                                        </div>

                                        <h3
                                            className="
                                                text-sm font-semibold
                                                text-slate-700
                                            "
                                        >
                                            {emptyTitle}
                                        </h3>

                                        <p
                                            className="
                                                mt-1 max-w-sm text-xs
                                                text-slate-400
                                            "
                                        >
                                            {emptyDescription}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="shrink-0">
                    <DataTablePagination
                        table={table}
                        pageSizeOptions={pageSizeOptions}
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