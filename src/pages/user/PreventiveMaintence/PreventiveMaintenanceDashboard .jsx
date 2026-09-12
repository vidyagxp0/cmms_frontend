import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import DataTable from "../../../components/common/DataTable/DataTable";

import {
    getCalibrationSingleReport,
} from "../../../services/usersApi/calibrationApi";

import {
    getAllPreventiveManagementRecords,
} from "../../../services/usersApi/dashboardAllApi";

const PreventiveMaintenanceDashboard = () => {
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // BACKEND PAGINATION
    // =========================================================
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });

    // =========================================================
    // FETCH RECORDS
    // =========================================================
    const fetchRecords = async (
        page = 1,
        perPage = 10
    ) => {
        try {
            setLoading(true);

            const response =
                await getAllPreventiveManagementRecords({
                    page,
                    per_page: perPage,
                });

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
                    paginationData?.total ||
                    0,
            });
        } catch (error) {
            console.error(
                "Failed to fetch preventive maintenance records:",
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

    // =========================================================
    // VIEW REPORT
    // =========================================================
    const handleViewReport = async (recordId) => {
        const reportWindow = window.open(
            "",
            "_blank"
        );

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
                            background: #FBFCFA;
                        }

                        .loader {
                            position: fixed;
                            inset: 0;
                            z-index: 9999;

                            display: flex;
                            align-items: center;
                            justify-content: center;

                            background: #FBFCFA;
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

                            border: 2px solid #D9E4DF;
                            border-top-color: #244F4A;

                            border-radius: 50%;

                            animation:
                                spin 0.8s linear infinite;
                        }

                        .text {
                            margin-top: 16px;

                            font-size: 12px;
                            font-weight: 500;

                            color: #7A8B84;
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
                await getCalibrationSingleReport(
                    recordId
                );

            const blob = new Blob(
                [response.data],
                {
                    type: "application/pdf",
                }
            );

            const pdfUrl =
                window.URL.createObjectURL(blob);

            reportWindow.location.href = pdfUrl;

            setTimeout(() => {
                window.URL.revokeObjectURL(
                    pdfUrl
                );
            }, 10000);
        } catch (error) {
            console.error(
                "Failed to open preventive maintenance report:",
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

                                font-family:
                                    Arial, sans-serif;

                                background: #FBFCFA;
                            }

                            .error {
                                text-align: center;
                            }

                            .error-title {
                                font-size: 16px;
                                font-weight: 600;
                                color: #B83E43;
                            }

                            .error-message {
                                margin-top: 8px;
                                font-size: 12px;
                                color: #7A8B84;
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

    // =========================================================
    // PROCESS DATA HELPER
    // =========================================================
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
            typeof processData === "object"
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

    // =========================================================
    // TABLE COLUMNS
    // =========================================================
    const columns = useMemo(
        () => [
            // =====================================================
            // ID
            // =====================================================
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

                            navigate(
                                `/user/preventive-maintenance-panel/4/${record.id}`
                            );
                        };

                    return (
                        <button
                            type="button"
                            onClick={
                                handleClick
                            }
                            className="
                                inline-flex
                                cursor-pointer
                                items-center
                                rounded-[8px]
                                border
                                border-[#D3E1DB]
                                bg-[#F1F5F2]
                                px-2
                                py-1.5
                                font-[var(--font-display)]
                                text-[10px]
                                font-bold
                                tracking-[-0.01em]
                                text-[#56766D]
                                transition-all
                                duration-200
                                hover:border-[#B9CEC5]
                                hover:bg-[#E8F0EC]
                                hover:text-[#244F4A]
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[#6E9487]/20
                            "
                            title="View record details"
                        >
                            #
                            {getValue() || "-"}
                        </button>
                    );
                },
            },

            // =====================================================
            // RECORD NUMBER
            // =====================================================
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
                            font-[var(--font-display)]
                            text-[11px]
                            font-bold
                            tracking-[-0.01em]
                            text-[#344A43]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            // =====================================================
            // PROCESS
            // =====================================================
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
                            items-center
                            rounded-full
                            border
                            border-[#C9DCD4]
                            bg-[#EEF4F1]
                            px-2.5
                            py-1
                            font-[var(--font-display)]
                            text-[10px]
                            font-bold
                            tracking-[-0.01em]
                            text-[#56766D]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            // =====================================================
            // SHORT DESCRIPTION
            // =====================================================
            {
                accessorKey:
                    "short_description",

                header:
                    "Short Description",

                cell: ({
                    getValue,
                }) => (
                    <div className="max-w-[260px]">
                        <p
                            className="
                                truncate
                                font-[var(--font-display)]
                                text-[11px]
                                font-bold
                                tracking-[-0.01em]
                                text-[#344A43]
                            "
                        >
                            {getValue() || "-"}
                        </p>
                    </div>
                ),
            },

            // =====================================================
            // INITIATOR
            // =====================================================
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
                            font-[var(--font-display)]
                            text-[11px]
                            font-semibold
                            tracking-[-0.01em]
                            text-[#5E7169]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            // =====================================================
            // DEPARTMENT
            // =====================================================
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
                            items-center
                            rounded-full
                            border
                            border-[#D7E0DC]
                            bg-[#F2F5F3]
                            px-2.5
                            py-1
                            font-[var(--font-display)]
                            text-[10px]
                            font-bold
                            tracking-[-0.01em]
                            text-[#65766F]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            // =====================================================
            // STAGE
            // =====================================================
            {
                id: "stage",

                header: "Stage",

                accessorFn: (row) =>
                    row?.stage?.name ||
                    "-",

                cell: ({
                    getValue,
                }) => {
                    const stage =
                        String(
                            getValue() ||
                                "-"
                        ).trim();

                    const normalizedStage =
                        stage.toLowerCase();

                    const isClosedDone =
                        normalizedStage ===
                        "closed - done";

                    return (
                        <span
                            className={`
                                inline-flex
                                items-center
                                rounded-full
                                border
                                px-2.5
                                py-1
                                font-[var(--font-display)]
                                text-[10px]
                                font-bold
                                tracking-[-0.01em]

                                ${
                                    isClosedDone
                                        ? `
                                            border-[#B83E43]
                                            bg-[#F8E8E8]
                                            text-[#B83E43]
                                        `
                                        : `
                                            border-[#C9DCD4]
                                            bg-[#EAF3EE]
                                            text-[#4F7568]
                                        `
                                }
                            `}
                        >
                            {stage}
                        </span>
                    );
                },
            },

            // =====================================================
            // INITIATED
            // =====================================================
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
                            font-[var(--font-display)]
                            text-[10px]
                            font-bold
                            tracking-[-0.01em]
                            text-[#56766D]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            // =====================================================
            // ACTION
            // =====================================================
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
                            items-center
                            gap-2
                            rounded-[9px]
                            border
                            border-[#CADBD5]
                            bg-[#F1F5F2]
                            px-3
                            py-1.5
                            font-[var(--font-display)]
                            text-[10px]
                            font-bold
                            tracking-[-0.01em]
                            text-[#4F7568]
                            transition-all
                            duration-200
                            hover:border-[#AFC9BF]
                            hover:bg-[#E7F0EC]
                            hover:text-[#244F4A]
                            hover:shadow-[0_3px_8px_rgba(36,79,74,0.08)]
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#6E9487]/20
                            active:scale-[0.98]
                        "
                        title="View preventive maintenance report"
                    >
                        <Eye
                            size={13}
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

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div
            className="
                flex
                h-full
                min-h-0
                flex-col
                overflow-hidden
            "
        >
            {/* =================================================
                DASHBOARD ACTION BAR
            ================================================== */}
            <DashboardActionBar
                title="Preventive Maintenance Dashboard"
                buttonName="Create Record"
                navigationRoute="/user/create-record"
                sourceRoute="/user/preventive-maintenance-dashboard"
                sourceType="preventive"
                showCreateButton={false}
            />

            {/* =================================================
                TABLE AREA
                SAME DASHBOARD SPACING STANDARD
            ================================================== */}
            <main
                className="
                    min-h-0
                    flex-1
                    overflow-hidden
                    px-0
                    pb-0
                    pt-[58px]
                "
            >
                <div
                    className="
                        h-full
                        min-h-0
                        overflow-hidden
                    "
                >
                    <DataTable
                        data={records}
                        columns={columns}
                        loading={loading}
                        searchable
                        searchPlaceholder="Search preventive records..."
                        pagination
                        pageSize={pagination.perPage}
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

                        emptyTitle="No preventive records found"
                        emptyDescription="
                            Preventive records will appear here
                            once they are created.
                        "
                    />
                </div>
            </main>
        </div>
    );
};

export default PreventiveMaintenanceDashboard;