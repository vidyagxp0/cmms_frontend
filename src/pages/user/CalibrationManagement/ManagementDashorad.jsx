import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Eye } from "lucide-react";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import DataTable from "../../../components/common/DataTable/DataTable";

import {
    getAllRecords,
    getCalibrationSingleReport,
    getCalibrationChildSingleReport,
} from "../../../services/usersApi/calibrationApi";

import { useNavigate } from "react-router-dom";

import {
    getAllCalibrationManagementRecords,
} from "../../../services/usersApi/dashboardAllApi";

const ManagementDashboard = () => {
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Backend pagination state
    const [pagination, setPagination] =
        useState({
            currentPage: 1,
            lastPage: 1,
            perPage: 10,
            total: 0,
        });

    // ================================================================
    // FETCH RECORDS
    // FUNCTIONALITY UNCHANGED
    // ================================================================
    const fetchRecords = async (
        page = 1,
        perPage = 10
    ) => {
        try {
            setLoading(true);

            const response =
                await getAllCalibrationManagementRecords(
                    {
                        page,
                        per_page: perPage,
                    }
                );

            const paginationData =
                response?.data?.data;

            const recordsData =
                paginationData?.data || [];

            setRecords(
                Array.isArray(recordsData)
                    ? recordsData
                    : []
            );

            setPagination({
                currentPage:
                    paginationData?.current_page ||
                    page,

                lastPage:
                    paginationData?.last_page ||
                    1,

                perPage:
                    paginationData?.per_page ||
                    perPage,

                total:
                    paginationData?.total || 0,
            });
        } catch (error) {
            console.error(
                "Failed to fetch engineering records:",
                error
            );

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
    };

    useEffect(() => {
        fetchRecords(1, 10);
    }, []);

    // ================================================================
    // VIEW REPORT
    // FUNCTIONALITY UNCHANGED
    // ================================================================
    const handleViewReport = async (
        recordId
    ) => {
        const reportWindow =
            window.open("", "_blank");

        try {
            if (!reportWindow) {
                alert(
                    "Please allow pop-ups to view the report."
                );
                return;
            }

            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Loading Report...</title>

                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        html,
                        body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                        }

                        body {
                            overflow: hidden;
                            font-family: Arial, sans-serif;
                        }

                        .loader {
                            position: fixed;
                            inset: 0;
                            z-index: 9999;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: white;
                        }

                        .loader-content {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }

                        .logo {
                            margin-bottom: 24px;
                            height: 56px;
                            width: auto;
                            object-fit: contain;
                        }

                        .spinner {
                            width: 32px;
                            height: 32px;
                            border: 2px solid #e2e8f0;
                            border-top-color: #F28C00;
                            border-radius: 50%;
                            animation: spin 0.8s linear infinite;
                        }

                        .text {
                            margin-top: 16px;
                            font-size: 12px;
                            font-weight: 500;
                            color: #94a3b8;
                        }

                        @keyframes spin {
                            from {
                                transform: rotate(0deg);
                            }

                            to {
                                transform: rotate(360deg);
                            }
                        }
                    </style>
                </head>

                <body>
                    <div class="loader">
                        <div class="loader-content">
                            <img
                                src="/vidyagxp_logo.png"
                                alt="VidyaGxP"
                                class="logo"
                            />

                            <div class="spinner"></div>

                            <p class="text">
                                Loading your workspace...
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `);

            reportWindow.document.close();

            const response =
                await getCalibrationChildSingleReport(
                    recordId
                );

            const blob = new Blob(
                [response.data],
                {
                    type: "application/pdf",
                }
            );

            const pdfUrl =
                window.URL.createObjectURL(
                    blob
                );

            reportWindow.location.href =
                pdfUrl;

            setTimeout(() => {
                window.URL.revokeObjectURL(
                    pdfUrl
                );
            }, 10000);
        } catch (error) {
            console.error(
                "Failed to open calibration report:",
                error
            );

            if (
                reportWindow &&
                !reportWindow.closed
            ) {
                reportWindow.document.open();

                reportWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Report Error</title>

                        <style>
                            body {
                                margin: 0;
                                height: 100vh;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-family: Arial, sans-serif;
                                background: white;
                            }

                            .error {
                                text-align: center;
                            }

                            .error-title {
                                font-size: 16px;
                                font-weight: 600;
                                color: #b91c1c;
                            }

                            .error-message {
                                margin-top: 8px;
                                font-size: 12px;
                                color: #94a3b8;
                            }
                        </style>
                    </head>

                    <body>
                        <div class="error">
                            <div class="error-title">
                                Failed to generate report
                            </div>

                            <div class="error-message">
                                Please close this tab and try again.
                            </div>
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
    // FUNCTIONALITY UNCHANGED
    // ================================================================
    const getProcessValue = (
        record,
        key
    ) => {
        const processData =
            record?.process_data;

        if (Array.isArray(processData)) {
            const field =
                processData.find(
                    (item) =>
                        item?.key === key
                );

            return (
                field?.value ?? "-"
            );
        }

        if (
            processData &&
            typeof processData ===
                "object"
        ) {
            if (
                processData[key] !==
                undefined
            ) {
                return (
                    processData[key] ??
                    "-"
                );
            }

            const field =
                Object.values(
                    processData
                ).find(
                    (item) =>
                        item?.key === key
                );

            return (
                field?.value ?? "-"
            );
        }

        return "-";
    };

    // ================================================================
    // TABLE COLUMNS
    // ================================================================
    const columns = useMemo(
        () => [
            /* =========================================================
               ID
            ========================================================== */
            {
                accessorKey: "id",

                header: "ID",

                cell: ({
                    row,
                    getValue,
                }) => {
                    const record =
                        row.original;

                    const handleClick =
                        () => {
                            if (
                                !record?.id
                            ) {
                                return;
                            }

                            if (
                                record.is_child ===
                                1
                            ) {
                                // Child record
                                navigate(
                                    `/user/calibration-management-panel/${5}/${record.id}`
                                );
                            } else {
                                // Parent / standard record
                                navigate(
                                    `/user/calibration-planner-panel/${record.id}`
                                );
                            }
                        };

                    return (
                        <button
                            type="button"
                            onClick={
                                handleClick
                            }
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
                            title="View record details"
                        >
                            <span>
                                #{getValue() || "-"}
                            </span>
                        </button>
                    );
                },
            },

            /* =========================================================
               RECORD NUMBER
            ========================================================== */
            {
                id: "recordNumber",

                header: "Record Number",

                accessorFn: (row) =>
                    row?.record_number ||
                    getProcessValue(
                        row,
                        "recordNumber"
                    ),

                cell: ({
                    getValue,
                }) => (
                    <span
                        className="
                            text-[11.5px]
                            font-bold
                            tracking-[-0.01em]
                            text-[#475A55]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            /* =========================================================
               PROCESS
            ========================================================== */
            {
                id: "process",

                header: "Process",

                accessorFn: (row) =>
                    row?.process?.name ||
                    "-",

                cell: ({
                    getValue,
                }) => (
                    <span
                        className="
                            inline-flex
                            max-w-full
                            items-center
                            rounded-full
                            border
                            border-[#D9E3DE]
                            bg-[#F1F5F3]
                            px-2.5
                            py-1
                            text-[10px]
                            font-bold
                            tracking-[0.02em]
                            text-[#56766D]
                        "
                        title={
                            getValue() || "-"
                        }
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            /* =========================================================
               SHORT DESCRIPTION
            ========================================================== */
            {
                accessorKey:
                    "short_description",

                header:
                    "Short Description",

                cell: ({
                    getValue,
                }) => (
                    <div className="max-w-[280px]">
                        <p
                            className="
                                truncate
                                text-[11.5px]
                                font-semibold
                                text-[#53635E]
                            "
                            title={
                                getValue() ||
                                "-"
                            }
                        >
                            {getValue() ||
                                "-"}
                        </p>
                    </div>
                ),
            },

            /* =========================================================
               INITIATOR
            ========================================================== */
            {
                id: "initiator",

                header: "Initiator",

                accessorFn: (row) =>
                    row?.initiator?.name ||
                    getProcessValue(
                        row,
                        "initiator"
                    ) ||
                    "-",

                cell: ({
                    getValue,
                }) => (
                    <span
                        className="
                            text-[11.5px]
                            font-medium
                            text-[#687773]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            /* =========================================================
               DEPARTMENT
            ========================================================== */
            {
                id: "department",

                header: "Department",

                accessorFn: (row) =>
                    row?.department?.name ||
                    getProcessValue(
                        row,
                        "initiationDepartment"
                    ) ||
                    "-",

                cell: ({
                    getValue,
                }) => (
                    <span
                        className="
                            inline-flex
                            max-w-full
                            items-center
                            rounded-full
                            border
                            border-[#E0E5E2]
                            bg-[#F6F7F5]
                            px-2.5
                            py-1
                            text-[10px]
                            font-bold
                            text-[#65736E]
                        "
                        title={
                            getValue() || "-"
                        }
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            /* =========================================================
               STAGE
            ========================================================== */
            {
                id: "stage",

                header: "Stage",

                accessorFn: (row) =>
                    row?.stage?.name ||
                    "-",

                cell: ({ getValue }) => {
                    const stage = String(
                        getValue() || "-"
                    ).trim();

                    const isClosedDone =
                        stage.toLowerCase() === "closed - done";

                    return (
                        <span
                            className={`
                                inline-flex
                                items-center
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                ${
                                    isClosedDone
                                        ? `
                                            border-[#B83E43]
                                            bg-[#F8E8E8]
                                            text-[#B83E43]
                                        `
                                        : `
                                            border-[#CFE1D9]
                                            bg-[#EEF5F2]
                                            text-[#56766D]
                                        `
                                }
                            `}
                        >
                            {stage}
                        </span>
                    );
                },
            },

            /* =========================================================
               INITIATED
            ========================================================== */
            {
                id: "dateOfInitiation",

                header: "Initiated",

                accessorFn: (row) =>
                    getProcessValue(
                        row,
                        "dateOfInitiation"
                    ),

                cell: ({
                    getValue,
                }) => (
                    <span
                        className="
                            whitespace-nowrap
                            font-mono
                            text-[10.5px]
                            font-semibold
                            text-[#5F7770]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            /* =========================================================
               ACTION
            ========================================================== */
            {
                id: "actions",

                header: "Action",

                enableSorting: false,

                cell: ({
                    row,
                }) => (
                    <button
                        type="button"
                        onClick={() =>
                            handleViewReport(
                                row.original?.id
                            )
                        }
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
                        title="View Calibration Management Report"
                    >
                        <Eye
                            size={14}
                            strokeWidth={1.9}
                        />

                        <span>
                            View Report
                        </span>
                    </button>
                ),
            },
        ],
        [navigate]
    );

    return (
        <div
            className="
                flex
                h-full
                min-h-0
                flex-col
                overflow-hidden
                bg-[var(--color-background)]
            "
        >
            {/* =====================================================
                DARK SECONDARY ACTION BAR
            ====================================================== */}
            <DashboardActionBar
                navigationRoute="/user/create-record"
                sourceRoute="/user/calibration-management-dashboard"
                sourceType="calibration-management"
                showCreateButton={false}
            />

            {/* =====================================================
                FULL-WIDTH HIGH-DENSITY TABLE

                Deliberately keeps the outer canvas extremely thin
                so the maximum number of records remain visible.
            ====================================================== */}
            <main
                className="
                    min-h-0
                    flex-1
                    overflow-hidden
                    px-1
                    pb-1
                    pt-[58px]
                    sm:px-1.5
                    sm:pb-1.5
                "
            >
                <div
                    className="
                        h-full
                        min-h-0
                        overflow-hidden
                        rounded-[16px]
                    "
                >
                    <DataTable
                        data={records}
                        columns={columns}
                        loading={loading}
                        searchable
                        searchPlaceholder="Search calibration management records..."
                        pagination
                        pageSize={
                            pagination.perPage
                        }
                        pageSizeOptions={[
                            10,
                            20,
                            50,
                        ]}
                        sortable
                        showColumnVisibility
                        hoverable

                        /* Backend pagination */
                        manualPagination
                        pageCount={
                            pagination.lastPage
                        }
                        totalRows={
                            pagination.total
                        }

                        onPaginationChange={({
                            pageIndex,
                            pageSize,
                        }) => {
                            const nextPage =
                                pageIndex + 1;

                            fetchRecords(
                                nextPage,
                                pageSize
                            );
                        }}

                        emptyTitle="No calibration management records found"
                        emptyDescription="
                            Calibration management records will appear here
                            once they are created.
                        "
                    />
                </div>
            </main>
        </div>
    );
};

export default ManagementDashboard;