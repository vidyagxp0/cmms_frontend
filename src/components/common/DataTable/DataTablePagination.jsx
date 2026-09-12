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
    const pageIndex =
        table.getState().pagination.pageIndex;

    const pageSize =
        table.getState().pagination.pageSize;

    const totalRows =
        table.getFilteredRowModel().rows.length;

    const firstRow =
        totalRows === 0
            ? 0
            : pageIndex * pageSize + 1;

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
                flex-wrap
                items-center
                justify-between
                gap-3
                border-t
                border-[var(--color-border-soft)]
                bg-[var(--color-surface)]
                px-4
                py-3
                sm:px-5
            "
        >
            {/* =====================================================
                RESULT COUNT
            ====================================================== */}
            <div
                className="
                    whitespace-nowrap
                    text-[10.5px]
                    font-medium
                    text-[var(--color-text-muted)]
                "
            >
                Showing{" "}
                <span className="font-bold text-[#61706C]">
                    {firstRow}
                </span>{" "}
                to{" "}
                <span className="font-bold text-[#61706C]">
                    {lastRow}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#61706C]">
                    {totalRows}
                </span>{" "}
                results
            </div>

            {/* =====================================================
                CONTROLS
            ====================================================== */}
            <div
                className="
                    flex
                    items-center
                    gap-3
                "
            >
                {/* =================================================
                    PAGE SIZE
                ================================================== */}
                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >
                    <span
                        className="
                            hidden
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.07em]
                            text-[var(--color-text-muted)]
                            sm:block
                        "
                    >
                        Rows
                    </span>

                    <div className="relative">
                        <select
                            value={pageSize}
                            onChange={(event) => {
                                table.setPageSize(
                                    Number(
                                        event.target
                                            .value
                                    )
                                );
                            }}
                            className="
                                h-[36px]
                                min-w-[62px]
                                cursor-pointer
                                appearance-none
                                rounded-[9px]
                                border
                                border-[var(--color-border)]
                                bg-[var(--color-surface-soft)]
                                py-1
                                pl-2.5
                                pr-7
                                text-[10.5px]
                                font-bold
                                text-[#5B6965]
                                outline-none
                                transition-all
                                duration-200
                                hover:border-[#C2CCC7]
                                hover:bg-white
                                focus:border-[#9FBAB0]
                                focus:bg-white
                                focus:shadow-[0_0_0_3px_rgba(86,118,109,0.06)]
                            "
                        >
                            {pageSizeOptions.map(
                                (size) => (
                                    <option
                                        key={size}
                                        value={size}
                                    >
                                        {size}
                                    </option>
                                )
                            )}
                        </select>

                        {/* SELECT CHEVRON */}
                        <span
                            className="
                                pointer-events-none
                                absolute
                                right-2.5
                                top-1/2
                                -translate-y-1/2
                                text-[8px]
                                text-[#7E8A86]
                            "
                        >
                            ▼
                        </span>
                    </div>
                </div>

                {/* =================================================
                    PAGINATION NAVIGATION
                ================================================== */}
                <div
                    className="
                        flex
                        items-center
                        gap-1
                    "
                >
                    <PaginationButton
                        disabled={
                            !table.getCanPreviousPage()
                        }
                        onClick={() =>
                            table.setPageIndex(0)
                        }
                        label="First page"
                    >
                        <ChevronsLeft
                            size={13}
                            strokeWidth={1.9}
                        />
                    </PaginationButton>

                    <PaginationButton
                        disabled={
                            !table.getCanPreviousPage()
                        }
                        onClick={() =>
                            table.previousPage()
                        }
                        label="Previous page"
                    >
                        <ChevronLeft
                            size={13}
                            strokeWidth={1.9}
                        />
                    </PaginationButton>

                    {/* CURRENT PAGE */}
                    <div
                        className="
                            flex
                            h-[36px]
                            min-w-[36px]
                            items-center
                            justify-center
                            rounded-[9px]
                            border
                            border-[#C7D8D2]
                            bg-[var(--color-primary-soft)]
                            px-2.5
                            text-[10.5px]
                            font-bold
                            text-[var(--color-primary-dark)]
                        "
                    >
                        {pageIndex + 1}
                    </div>

                    <PaginationButton
                        disabled={
                            !table.getCanNextPage()
                        }
                        onClick={() =>
                            table.nextPage()
                        }
                        label="Next page"
                    >
                        <ChevronRight
                            size={13}
                            strokeWidth={1.9}
                        />
                    </PaginationButton>

                    <PaginationButton
                        disabled={
                            !table.getCanNextPage()
                        }
                        onClick={() =>
                            table.setPageIndex(
                                table.getPageCount() - 1
                            )
                        }
                        label="Last page"
                    >
                        <ChevronsRight
                            size={13}
                            strokeWidth={1.9}
                        />
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
    label,
}) => {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            className="
                flex
                h-[36px]
                w-[34px]
                items-center
                justify-center
                rounded-[9px]
                border
                border-transparent
                text-[#87938F]
                transition-all
                duration-200
                hover:border-[var(--color-border-soft)]
                hover:bg-[var(--color-surface-muted)]
                hover:text-[var(--color-primary)]
                active:scale-[0.96]
                disabled:cursor-not-allowed
                disabled:opacity-25
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-primary-muted)]
                focus-visible:ring-offset-1
            "
        >
            {children}
        </button>
    );
};

export default DataTablePagination;