import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Eye, Wrench, ArrowUpRight } from "lucide-react";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import {
    getAllFieldInstruments,
    getFieldInstrumentReport,
} from "../../../services/usersApi/equipmentApi";
import DataTable from "../../../components/common/DataTable/DataTable";
import { useAuthStore } from "../../../store/authStore";


/* report window templates */
const REPORT_LOADER_HTML = `
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
`;

const REPORT_ERROR_HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Report Error</title>
    <style>
        body {
            margin: 0; height: 100vh;
            display: flex; align-items: center; justify-content: center;
            font-family: Arial, sans-serif; background: white;
        }
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
`;

const FieldInstrumetsDashboard = () => {
    const navigate = useNavigate();

    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.loading);

    const showCreateButton =
        !authLoading && user?.roles?.includes("Initiator");


    // ================================================================
    // BACKEND PAGINATION
    // ================================================================
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });

    // ================================================================
    // FETCH FIELD INSTRUMENTS
    // ================================================================
    const fetchFieldInstruments = async (page = 1, perPage = 10) => {
        try {
            setLoading(true);

            const response = await getAllFieldInstruments({
                page,
                per_page: perPage,
            });

            const paginationData = response?.data?.data;
            const equipmentData = paginationData?.data || [];

            setEquipment(Array.isArray(equipmentData) ? equipmentData : []);

            setPagination({
                currentPage: paginationData?.current_page || page,
                lastPage: paginationData?.last_page || 1,
                perPage: paginationData?.per_page || perPage,
                total: paginationData?.total || 0,
            });
        } catch (error) {
            console.error("Failed to fetch field instruments:", error);
            setEquipment([]);
            setPagination({
                currentPage: 1,
                lastPage: 1,
                perPage,
                total: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    // ================================================================
    // INITIAL LOAD
    // ================================================================
    useEffect(() => {
        fetchFieldInstruments(1, 10);
    }, []);


    /* view field instrument report */
    const handleViewReport = async (instrumentId) => {
        if (!instrumentId) return;

        const reportWindow = window.open("", "_blank");

        if (!reportWindow) {
            alert("Please allow pop-ups to view the report.");
            return;
        }

        try {
            reportWindow.document.write(REPORT_LOADER_HTML);
            reportWindow.document.close();

            const response = await getFieldInstrumentReport(instrumentId);
            const blob = new Blob([response.data], {
                type: "application/pdf",
            });

            const pdfUrl = window.URL.createObjectURL(blob);
            reportWindow.location.href = pdfUrl;

            setTimeout(() => {
                window.URL.revokeObjectURL(pdfUrl);
            }, 10000);
        } catch (error) {
            console.error("Failed to open field instrument report:", error);

            if (reportWindow && !reportWindow.closed) {
                reportWindow.document.open();
                reportWindow.document.write(REPORT_ERROR_HTML);
                reportWindow.document.close();
            }
        }
    };

    // ================================================================
    // TABLE COLUMNS
    // ================================================================
    const columns = useMemo(
        () => [
            // INSTRUMENT ID NO.
            {
                accessorKey: "instrument_id_no",
                header: "Instrument ID",
                cell: ({ row, getValue }) => {
                    const value = getValue();
                    return (
                        <button
                            type="button"
                            onClick={() => {
                                if (!row.original?.id) return;
                                navigate(
                                    `/user/field-instruments-panel/${row.original.id}`
                                );
                            }}
                            className="
                                group
                                inline-flex
                                cursor-pointer
                                items-center
                                gap-1.5
                                rounded-[9px]
                                border
                                border-[#D5E0DB]
                                bg-[#F0F5F2]
                                px-2.5
                                py-1.5
                                font-mono
                                text-[10.5px]
                                font-bold
                                tracking-[0.03em]
                                text-[#536D64]
                                shadow-[0_1px_4px_rgba(36,50,56,0.035)]
                                transition-all
                                duration-200
                                hover:border-[#B7CAC2]
                                hover:bg-[#E5EEEA]
                                hover:text-[#405F55]
                                hover:shadow-[0_3px_8px_rgba(86,118,109,0.08)]
                                focus:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-[var(--color-primary-muted)]
                                focus-visible:ring-offset-1
                            "
                            title="View field instrument details"
                        >
                            <span>{value || "-"}</span>
                            <ArrowUpRight
                                size={11}
                                strokeWidth={2}
                                className="
                                    opacity-0
                                    transition-opacity
                                    duration-200
                                    group-hover:opacity-100
                                "
                            />
                        </button>
                    );
                },
            },

            // EQUIPMENT NAME
            {
                accessorKey: "equipment_name",
                header: "Equipment",
                cell: ({ row }) => {
                    const name = row.original?.equipment_name || "-";
                    return (
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-[9px]
                                    border
                                    border-[#D5E0DB]
                                    bg-[#F1F5F3]
                                    text-[#56766D]
                                "
                            >
                                <Wrench size={14} strokeWidth={1.9} />
                            </div>
                            <div className="min-w-0">
                                <p
                                    className="
                                        truncate
                                        text-[12px]
                                        font-bold
                                        tracking-[-0.01em]
                                        text-[var(--color-text-primary)]
                                    "
                                    title={name}
                                >
                                    {name}
                                </p>
                            </div>
                        </div>
                    );
                },
            },

            // INSTRUMENT NAME
            {
                accessorKey: "instrument_name",
                header: "Instrument",
                cell: ({ getValue }) => (
                    <span className="text-[11.5px] font-semibold text-[#566560]">
                        {getValue() || "-"}
                    </span>
                ),
            },

            // CATEGORY
            {
                accessorKey: "category",
                header: "Category",
                cell: ({ getValue }) => {
                    const value = getValue();
                    return (
                        <span
                            className="
                                inline-flex
                                max-w-full
                                items-center
                                rounded-full
                                border
                                border-[#DDE4E0]
                                bg-[#F6F8F6]
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                tracking-[0.025em]
                                text-[#61716C]
                            "
                            title={value || "-"}
                        >
                            {value || "-"}
                        </span>
                    );
                },
            },

            // MAKE
            {
                accessorKey: "make",
                header: "Make",
                cell: ({ getValue }) => (
                    <span className="text-[11.5px] font-semibold text-[#566560]">
                        {getValue() || "-"}
                    </span>
                ),
            },

            // SR. NO. / MODEL NO.
            {
                accessorKey: "sr_no_model_no",
                header: "Sr. No. / Model No.",
                cell: ({ getValue }) => (
                    <span
                        className="
                            inline-flex
                            rounded-[8px]
                            bg-[#F7F8F6]
                            px-2
                            py-1
                            font-mono
                            text-[10.5px]
                            font-semibold
                            tracking-[0.02em]
                            text-[#52625E]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            // CREATED
            {
                accessorKey: "created_at",
                header: "Created",
                cell: ({ getValue }) => {
                    const value = getValue();
                    if (!value) {
                        return (
                            <span className="text-[11px] text-[#98A19E]">
                                -
                            </span>
                        );
                    }
                    const date = new Date(value);
                    if (Number.isNaN(date.getTime())) {
                        return (
                            <span className="text-[11px] text-[#687571]">
                                {value}
                            </span>
                        );
                    }
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="whitespace-nowrap text-[10.5px] font-bold text-[#4D625B]">
                                {date.toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                            <span className="whitespace-nowrap font-mono text-[9.5px] font-medium text-[#8A9691]">
                                {date.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: false,
                                })}
                            </span>
                        </div>
                    );
                },
            },

            // STAGE
            {
                accessorKey: "stage.name",
                header: "Stage",
                cell: ({ row }) => {
                    const stageName = row.original?.stage?.name || row.original?.stage || "-";
                    const isClosed = typeof stageName === 'string' && stageName.toLowerCase().includes("closed");
                    
                    return (
                        <span
                            className={`
                                inline-flex
                                max-w-full
                                items-center
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                tracking-[0.025em]
                                ${
                                    isClosed
                                        ? "border-[#D5E0DB] bg-[#F0F5F2] text-[#536D64]" 
                                        : "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
                                }
                            `}
                            title={stageName}
                        >
                            {stageName}
                        </span>
                    );
                },
            },

            // ACTION
            {
                id: "actions",
                header: "Action",
                enableSorting: false,
                cell: ({ row }) => (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleViewReport(row.original?.id);
                        }}
                        className="
                            inline-flex
                            cursor-pointer
                            items-center
                            gap-2
                            rounded-[9px]
                            border
                            border-[#C9D9D3]
                            bg-[#EEF4F1]
                            px-3
                            py-1.5
                            text-[10.5px]
                            font-bold
                            text-[#56766D]
                            shadow-[0_1px_4px_rgba(86,118,109,0.045)]
                            transition-all
                            duration-200
                            hover:border-[#AFC5BC]
                            hover:bg-[#E2ECE8]
                            hover:text-[#48685F]
                            hover:shadow-[0_3px_9px_rgba(86,118,109,0.09)]
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[var(--color-primary-muted)]
                            focus-visible:ring-offset-1
                        "
                        title="View field instrument report"
                    >
                        <Eye size={14} strokeWidth={1.9} />
                        <span>View Report</span>
                    </button>
                ),
            },
        ],
        [navigate]
    );

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {/* ACTION BAR */}
            <DashboardActionBar
                title="Field Instruments Dashboard"
                buttonName="Create Record"
                navigationRoute="/user/create-field-instruments"
                sourceRoute="/user/field-instruments-dashboard"
                sourceType="equipment"
                showCreateButton={showCreateButton}
            />

            {/* MAIN CONTENT */}
            <main className="min-h-0 flex-1 overflow-hidden px-0 pb-0 pt-[58px]">
                <section className="h-full min-h-0 overflow-hidden bg-transparent">
                    <div className="h-full min-h-0 overflow-hidden">
                        <DataTable
                            data={equipment}
                            columns={columns}
                            loading={loading}
                            searchable
                            searchPlaceholder="Search field instruments..."
                            pagination
                            pageSize={pagination.perPage}
                            pageSizeOptions={[10, 20, 50]}
                            sortable
                            showColumnVisibility
                            hoverable
                            manualPagination
                            pageCount={pagination.lastPage}
                            totalRows={pagination.total}
                            onPaginationChange={({ pageIndex, pageSize }) => {
                                const nextPage = pageIndex + 1;
                                fetchFieldInstruments(nextPage, pageSize);
                            }}
                            emptyTitle="No field instruments found"
                            emptyDescription="Field instrument records will appear here once they are created."
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FieldInstrumetsDashboard;