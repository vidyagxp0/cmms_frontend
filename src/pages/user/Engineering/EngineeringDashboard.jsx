import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Eye, Search, Filter } from "lucide-react";
import { Input, Select, Button, DatePicker } from "antd";
import dayjs from "dayjs"; 
import { useNavigate } from "react-router-dom";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import DataTable from "../../../components/common/DataTable/DataTable";
import {
    getCalibrationSingleReport,
} from "../../../services/usersApi/calibrationApi";
import { getAllCalibrationPlannerRecords } from "../../../services/usersApi/dashboardAllApi";
import { useAuthStore } from "../../../store/authStore";

const { RangePicker } = DatePicker;

// 🔥 STATIC STAGES FROM IMAGE
const STAGE_OPTIONS = [
    { label: "Opened", value: "Opened" },
    { label: "Reviewed By HOD/Designee (Engineering)", value: "Reviewed By HOD/Designee (Engineering)" },
    { label: "Reviewed By User Department", value: "Reviewed By User Department" },
    { label: "Pending QA Approval", value: "Pending QA Approval" },
    { label: "Closed - Done", value: "Closed - Done" },
    { label: "Close - Cancelled", value: "Close - Cancelled" },
];

const EngineeringDashboard = () => {
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.loading);

    const showCreateButton =
        !authLoading && user?.roles?.includes("Initiator");

    // Backend pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });

    // ================================================================
    // FILTER STATE
    // ================================================================
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateRange, setDateRange] = useState(null); // [start_date, end_date]

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // ================================================================
    // FETCH ENGINEERING RECORDS
    // ================================================================
    const fetchRecords = useCallback(async (page = 1, perPage = 10, filters = {}) => {
        try {
            setLoading(true);

            const params = { page, per_page: perPage };
            if (filters.search)     params.search     = filters.search;
            if (filters.status)     params.status     = filters.status;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date)   params.end_date   = filters.end_date;

            const response = await getAllCalibrationPlannerRecords(params);

            const paginationData = response?.data?.data;
            const recordsData = paginationData?.data || [];

            setRecords(Array.isArray(recordsData) ? recordsData : []);

            setPagination({
                currentPage: paginationData?.current_page || page,
                lastPage: paginationData?.last_page || 1,
                perPage: paginationData?.per_page || perPage,
                total: paginationData?.total || 0,
            });
        } catch (error) {
            console.error("Failed to fetch engineering records:", error);
            setRecords([]);
            setPagination({
                currentPage: 1,
                lastPage: 1,
                perPage,
                total: 0,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Trigger fetch on filters change
    useEffect(() => {
        fetchRecords(1, pagination.perPage, {
            search: debouncedSearch,
            status: statusFilter,
            start_date: dateRange?.[0] || "",
            end_date: dateRange?.[1] || "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, statusFilter, dateRange, fetchRecords]);

    // ================================================================
    // VIEW REPORT
    // ================================================================
    const handleViewReport = async (recordId) => {
        const reportWindow = window.open("", "_blank");

        try {
            if (!reportWindow) {
                alert("Please allow pop-ups to view the report.");
                return;
            }

            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Loading Report...</title>
                    <style>
                        * { box-sizing: border-box; }
                        html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
                        body { overflow: hidden; font-family: Arial, sans-serif; }
                        .loader {
                            position: fixed; inset: 0; z-index: 9999;
                            display: flex; align-items: center; justify-content: center;
                            background: white;
                        }
                        .loader-content { display: flex; flex-direction: column; align-items: center; }
                        .logo { margin-bottom: 24px; height: 56px; width: auto; object-fit: contain; }
                        .spinner {
                            width: 32px; height: 32px;
                            border: 2px solid #e2e8f0; border-top-color: #F28C00;
                            border-radius: 50%; animation: spin 0.8s linear infinite;
                        }
                        .text { margin-top: 16px; font-size: 12px; font-weight: 500; color: #94a3b8; }
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    </style>
                </head>
                <body>
                    <div class="loader">
                        <div class="loader-content">
                            <img src="/vidyagxp_logo.png" alt="VidyaGxP" class="logo" />
                            <div class="spinner"></div>
                            <p class="text">Loading your workspace...</p>
                        </div>
                    </div>
                </body>
                </html>
            `);

            reportWindow.document.close();

            const response = await getCalibrationSingleReport(recordId);
            const blob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = window.URL.createObjectURL(blob);

            reportWindow.location.href = pdfUrl;

            setTimeout(() => {
                window.URL.revokeObjectURL(pdfUrl);
            }, 10000);
        } catch (error) {
            console.error("Failed to open calibration report:", error);

            if (reportWindow && !reportWindow.closed) {
                reportWindow.document.open();
                reportWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Report Error</title>
                        <style>
                            body { margin: 0; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif; background: white; }
                            .error { text-align: center; }
                            .error-title { font-size: 16px; font-weight: 600; color: #b91c1c; }
                            .error-message { margin-top: 8px; font-size: 12px; color: #94a3b8; }
                        </style>
                    </head>
                    <body>
                        <div class="error">
                            <div class="error-title">Failed to generate report</div>
                            <div class="error-message">Please close this tab and try again.</div>
                        </div>
                    </body>
                    </html>
                `);
                reportWindow.document.close();
            }
        }
    };

    // ================================================================
    // PROCESS VALUE HELPER
    // ================================================================
    const getProcessValue = (record, key) => {
        const processData = record?.process_data;

        if (Array.isArray(processData)) {
            const field = processData.find((item) => item?.key === key);
            return field?.value ?? "-";
        }

        if (processData && typeof processData === "object") {
            if (processData[key] !== undefined) {
                return processData[key] ?? "-";
            }
            const field = Object.values(processData).find((item) => item?.key === key);
            return field?.value ?? "-";
        }

        return "-";
    };

    // ================================================================
    // TABLE COLUMNS
    // ================================================================
    const columns = useMemo(
        () => [
            // ID
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row, getValue }) => {
                    const record = row.original;
                    const handleClick = () => {
                        if (!record?.id) return;
                        if (record.is_child === 1) {
                            navigate(`/user/calibration-management-panel/${5}/${record.id}`);
                        } else {
                            navigate(`/user/calibration-planner-panel/${record.id}`);
                        }
                    };

                    return (
                        <button
                            type="button"
                            onClick={handleClick}
                            className="group inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border border-[#D5E0DB] bg-[#F0F5F2] px-2.5 py-1.5 font-mono text-[10.5px] font-bold tracking-[0.03em] text-[#536D64] shadow-[0_1px_4px_rgba(36,50,56,0.035)] transition-all duration-200 hover:border-[#B7CAC2] hover:bg-[#E5EEEA] hover:text-[#405F55] hover:shadow-[0_3px_8px_rgba(86,118,109,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-muted)] focus-visible:ring-offset-1"
                            title="View record details"
                        >
                            <span>#{getValue() || "-"}</span>
                        </button>
                    );
                },
            },

            // RECORD NUMBER
            {
                id: "recordNumber",
                header: "Record Number",
                accessorFn: (row) => row?.record_number || getProcessValue(row, "recordNumber"),
                cell: ({ getValue }) => (
                    <span className="text-[11.5px] font-bold tracking-[-0.01em] text-[#475A55]">
                        {getValue() || "-"}
                    </span>
                ),
            },

            // PROCESS
            {
                id: "process",
                header: "Process",
                accessorFn: (row) => row?.process?.name || "-",
                cell: ({ getValue }) => (
                    <span
                        className="inline-flex max-w-full items-center rounded-full border border-[#D9E3DE] bg-[#F1F5F3] px-2.5 py-1 text-[10px] font-bold tracking-[0.02em] text-[#56766D]"
                        title={getValue() || "-"}
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            // SHORT DESCRIPTION
            {
                accessorKey: "short_description",
                header: "Short Description",
                cell: ({ getValue }) => (
                    <div className="max-w-[260px]">
                        <p
                            className="truncate text-[11.5px] font-semibold text-[#53635E]"
                            title={getValue() || "-"}
                        >
                            {getValue() || "-"}
                        </p>
                    </div>
                ),
            },

            // INITIATOR
            {
                id: "initiator",
                header: "Initiator",
                accessorFn: (row) => row?.initiator?.name || getProcessValue(row, "initiator") || "-",
                cell: ({ getValue }) => (
                    <span className="text-[11.5px] font-medium text-[#687773]">
                        {getValue() || "-"}
                    </span>
                ),
            },

            // DEPARTMENT
            {
                id: "department",
                header: "Department",
                accessorFn: (row) => row?.department?.name || getProcessValue(row, "initiationDepartment") || "-",
                cell: ({ getValue }) => (
                    <span
                        className="inline-flex max-w-full items-center rounded-full border border-[#E0E5E2] bg-[#F6F7F5] px-2.5 py-1 text-[10px] font-bold text-[#65736E]"
                        title={getValue() || "-"}
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            // STAGE
            {
                id: "stage",
                header: "Stage",
                accessorFn: (row) => row?.stage?.name || "-",
                cell: ({ getValue }) => {
                    const stage = String(getValue() || "-").trim();
                    const isClosedDone = stage.toLowerCase() === "closed - done";

                    return (
                        <span
                            className={`
                                inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold
                                ${
                                    isClosedDone
                                        ? "border-[#B83E43] bg-[#F8E8E8] text-[#B83E43]"
                                        : "border-[#CFE1D9] bg-[#EEF5F2] text-[#56766D]"
                                }
                            `}
                        >
                            {stage}
                        </span>
                    );
                },
            },

            // INITIATED
            {
                id: "dateOfInitiation",
                header: "Initiated",
                accessorFn: (row) => getProcessValue(row, "dateOfInitiation"),
                cell: ({ getValue }) => (
                    <span className="whitespace-nowrap font-mono text-[10.5px] font-semibold text-[#5F7770]">
                        {getValue() || "-"}
                    </span>
                ),
            },

            // ACTION
            {
                id: "actions",
                header: "Action",
                enableSorting: false,
                cell: ({ row }) => (
                    <button
                        type="button"
                        onClick={() => handleViewReport(row.original?.id)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border border-[#C9D9D3] bg-[#EEF4F1] px-3 py-1.5 text-[10.5px] font-bold text-[#56766D] shadow-[0_1px_4px_rgba(86,118,109,0.045)] transition-all duration-200 hover:border-[#AFC5BC] hover:bg-[#E2ECE8] hover:text-[#48685F] hover:shadow-[0_3px_9px_rgba(86,118,109,0.09)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-muted)] focus-visible:ring-offset-1"
                        title="View engineering record"
                    >
                        <Eye size={14} strokeWidth={1.9} />
                        <span>View Report</span>
                    </button>
                ),
            },
        ],
        [navigate]
    );

    const hasActiveFilters = Boolean(searchTerm) || Boolean(statusFilter) || Boolean(dateRange);
    
    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
        setDateRange(null);
    };

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
            {/* DARK SECONDARY ACTION BAR */}
            <DashboardActionBar
                title="Engineering Dashboard"
                buttonName="Create Record"
                navigationRoute="/user/create-record"
                sourceRoute="/user/engineering-dashboard"
                sourceType="engineering"
                showCreateButton={showCreateButton}
            />

            {/* MAIN CONTENT */}
            <main className="min-h-0 flex-1 overflow-hidden px-0 pb-0 pt-[58px]">
                <section className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
                    
                    {/* ───────────── SIDE-BY-SIDE COMPACT FILTER BAR ───────────── */}
                    <div className="flex shrink-0 flex-nowrap items-center gap-2 px-4 py-3 border-b border-gray-100 bg-[#FAFBFA] overflow-x-auto">
                        
                        {/* Search Input - Strict Fixed Width */}
                        <Input
                            size="small"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<Search size={13} className="text-gray-400" />}
                            allowClear
                            style={{
                                width: "140px",
                                minWidth: "140px",
                                maxWidth: "140px",
                                flex: "0 0 140px",
                                height: "30px",
                                fontSize: "12px",
                            }}
                        />

                        {/* Status Select - Widened to fit long stages */}
                        <Select
                            size="middle"
                            placeholder="Stage"
                            value={statusFilter || undefined}
                            onChange={(val) => setStatusFilter(val || "")}
                            options={STAGE_OPTIONS}
                            allowClear
                            className="w-72 text-sm font-medium shadow-sm"
                            popupClassName="rounded-lg"
                        />

                        {/* Date Range Picker */}
                        <RangePicker
                            size="middle"
                            value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                            onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) {
                                    setDateRange([
                                        dates[0].format("YYYY-MM-DD"),
                                        dates[1].format("YYYY-MM-DD")
                                    ]);
                                } else {
                                    setDateRange(null);
                                }
                            }}
                            className="w-56 text-sm font-medium shadow-sm rounded-lg"
                        />

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <Button
                                size="middle"
                                icon={<Filter size={14} className="mr-1" />}
                                onClick={clearFilters}
                                className="rounded-lg font-semibold text-gray-600 shadow-sm hover:text-gray-900 border-gray-200"
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* TABLE WRAPPER */}
                    <div className="min-h-0 flex-1 overflow-hidden w-full bg-white">
                        <DataTable
                            data={records}
                            columns={columns}
                            loading={loading}
                            
                            /* Removes the gap & internal toolbar */
                            toolbar={false}
                            searchable={false}
                            
                            /* Makes the table completely flat and stretches to edges */
                            className="!rounded-none !border-0 !shadow-none !h-full"
                            
                            pagination
                            pageSize={pagination.perPage}
                            pageSizeOptions={[10, 20, 50]}
                            sortable
                            hoverable
                            
                            /* Backend pagination */
                            manualPagination
                            pageCount={pagination.lastPage}
                            totalRows={pagination.total}
                            onPaginationChange={({ pageIndex, pageSize }) => {
                                const pageSizeChanged = pageSize !== pagination.perPage;
                                const nextPage = pageSizeChanged ? 1 : pageIndex + 1;

                                fetchRecords(nextPage, pageSize, {
                                    search: debouncedSearch,
                                    status: statusFilter,
                                    start_date: dateRange?.[0] || "",
                                    end_date: dateRange?.[1] || "",
                                });
                            }}
                            emptyTitle="No engineering records found"
                            emptyDescription="Try changing filters or create a new record."
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EngineeringDashboard;