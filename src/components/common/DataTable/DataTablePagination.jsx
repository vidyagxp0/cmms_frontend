import React from "react";

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

const DataTablePagination = ({
    table,
    pageSizeOptions = [10, 20, 50],
}) => {
    const pageIndex = table.getState().pagination.pageIndex;

    const pageSize = table.getState().pagination.pageSize;

    const totalRows = table.getFilteredRowModel().rows.length;

    const firstRow =
        totalRows === 0 ? 0 : pageIndex * pageSize + 1;

    const lastRow = Math.min(
        (pageIndex + 1) * pageSize,
        totalRows
    );

    return (
        <div
            className="
                flex
                min-h-[62px]
                shrink-0
                items-center
                justify-between
                gap-4
                border-t
                border-slate-100
                bg-white
                px-5
                py-3
            "
        >
            {/* Result count */}
            <div className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-600">
                    {firstRow}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-600">
                    {lastRow}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600">
                    {totalRows}
                </span>{" "}
                results
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {/* Page size */}
                <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-slate-400 sm:block">
                        Rows
                    </span>

                    <select
                        value={pageSize}
                        onChange={(event) => {
                            table.setPageSize(
                                Number(event.target.value)
                            );
                        }}
                        className="
                            h-9
                            cursor-pointer
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-2.5
                            text-xs
                            font-semibold
                            text-slate-600
                            outline-none
                            transition
                            hover:border-slate-300
                            focus:border-indigo-300
                        "
                    >
                        {pageSizeOptions.map((size) => (
                            <option
                                key={size}
                                value={size}
                            >
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-1">
                    <PaginationButton
                        disabled={
                            !table.getCanPreviousPage()
                        }
                        onClick={() =>
                            table.setPageIndex(0)
                        }
                    >
                        <ChevronsLeft size={14} />
                    </PaginationButton>

                    <PaginationButton
                        disabled={
                            !table.getCanPreviousPage()
                        }
                        onClick={() =>
                            table.previousPage()
                        }
                    >
                        <ChevronLeft size={14} />
                    </PaginationButton>

                    <div
                        className="
                            flex
                            h-9
                            min-w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-indigo-50
                            px-3
                            text-xs
                            font-bold
                            text-indigo-600
                        "
                    >
                        {pageIndex + 1}
                    </div>

                    <PaginationButton
                        disabled={!table.getCanNextPage()}
                        onClick={() =>
                            table.nextPage()
                        }
                    >
                        <ChevronRight size={14} />
                    </PaginationButton>

                    <PaginationButton
                        disabled={!table.getCanNextPage()}
                        onClick={() =>
                            table.setPageIndex(
                                table.getPageCount() - 1
                            )
                        }
                    >
                        <ChevronsRight size={14} />
                    </PaginationButton>
                </div>
            </div>
        </div>
    );
};

const PaginationButton = ({
    children,
    disabled,
    onClick,
}) => {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition-all
                hover:bg-slate-50
                hover:text-slate-600
                disabled:cursor-not-allowed
                disabled:opacity-30
            "
        >
            {children}
        </button>
    );
};

export default DataTablePagination;