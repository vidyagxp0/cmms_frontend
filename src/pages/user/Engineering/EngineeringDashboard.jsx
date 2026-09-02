import React, { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import DataTable from "../../../components/common/DataTable/DataTable";
import { getAllRecords, getCalibrationSingleReport } from "../../../services/usersApi/calibrationApi";
import { useNavigate } from "react-router-dom";

const EngineeringDashboard = () => {
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Backend pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });

    const fetchRecords = async (page = 1, perPage = 10) => {
        try {
            setLoading(true);

            const response = await getAllRecords({
                page,
                per_page: perPage,
            });

            console.log("Engineering Records API Response:", response);

            const paginationData = response?.data?.data;
            const recordsData = paginationData?.data || [];

            setRecords(
                Array.isArray(recordsData) ? recordsData : []
            );

            setPagination({
                currentPage: paginationData?.current_page || page,
                lastPage: paginationData?.last_page || 1,
                perPage: paginationData?.per_page || perPage,
                total: paginationData?.total || 0,
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

            const response = await getCalibrationSingleReport(recordId);

            const blob = new Blob(
                [response.data],
                {
                    type: "application/pdf",
                }
            );

            const pdfUrl = window.URL.createObjectURL(blob);

            reportWindow.location.href = pdfUrl;

            setTimeout(() => {
                window.URL.revokeObjectURL(pdfUrl);
            }, 10000);

        } catch (error) {
            console.error(
                "Failed to open calibration report:",
                error
            );

            if (reportWindow && !reportWindow.closed) {
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

const getProcessValue = (record, key) => {
    const processData = record?.process_data;
    if (Array.isArray(processData)) {
        const field = processData.find(
            (item) => item?.key === key
        );
        return field?.value ?? "-";
    }
    if (processData && typeof processData === "object") {
        if (processData[key] !== undefined) {
            return processData[key] ?? "-";
        }
        const field = Object.values(processData).find(
            (item) => item?.key === key
        );
        return field?.value ?? "-";
    }
    return "-";
};
    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({row, getValue }) => (
                    <button
                        type="button"
                        onClick={() => {
                        if (!row.original?.id) return;

                        navigate(
                            `/user/calibration-planner-panel/${row.original.id}`
                        );
                    }}
                        className="
                            inline-flex cursor-pointer rounded-md border
                            border-indigo-100 bg-indigo-50/70 px-2 py-1.5
                            font-mono text-[11px] font-semibold tracking-wide
                            text-gray-500 shadow-sm transition-all duration-200
                            hover:border-indigo-200 hover:bg-indigo-100
                            hover:text-indigo-800 hover:shadow
                            focus:outline-none focus:ring-2
                            focus:ring-indigo-500/20
                        "
                        title="View record details"
                    >
                        #{getValue() || "-"}
                    </button>
                ),
            },

                {
                id: "recordNumber",
                header: "Record Number",
                accessorFn: (row) =>
                    row?.record_number ||
                    getProcessValue(row, "recordNumber"),

                cell: ({ getValue }) => (
                    <span className="text-sm font-semibold text-slate-700">
                        {getValue() || "-"}
                    </span>
                ),
            },
            {
                id: "process",
                header: "Process",
                accessorFn: (row) =>
                    row?.process?.name || "-",
                cell: ({ getValue }) => (
                    <span
                        className="
                            inline-flex rounded-md bg-indigo-50
                            px-2.5 py-1 text-xs font-semibold
                            text-indigo-700
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            {
                accessorKey: "short_description",
                header: "Short Description",
                cell: ({ getValue }) => (
                    <div className="max-w-[260px]">
                        <p className="truncate text-sm font-semibold text-slate-700">
                            {getValue() || "-"}
                        </p>
                    </div>
                ),
            },

            // {
            //     id: "siteLocation",
            //     header: "Site / Location",
            //     accessorFn: (row) =>
            //         getProcessValue(
            //             row,
            //             "siteLocationCode"
            //         ),
            //     cell: ({ getValue }) => (
            //         <span className="text-sm font-medium text-slate-600">
            //             {getValue() || "-"}
            //         </span>
            //     ),
            // },

            {
                id: "initiator",
                header: "Initiator",
                accessorFn: (row) =>
                    row?.initiator?.name ||
                    getProcessValue(row, "initiator") ||
                    "-",
                cell: ({ getValue }) => (
                    <span className="text-sm font-medium text-slate-600">
                        {getValue() || "-"}
                    </span>
                ),
            },

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
                cell: ({ getValue }) => (
                    <span
                        className="
                            inline-flex rounded-md bg-slate-100
                            px-2.5 py-1 text-xs font-semibold
                            text-slate-600
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            {
                id: "stage",
                header: "Stage",
                accessorFn: (row) =>
                    row?.stage?.name || "-",
                cell: ({ getValue }) => (
                    <span
                        className="
                            inline-flex rounded-full bg-emerald-50
                            px-2.5 py-1 text-[11px] font-semibold
                            text-emerald-700
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            {
                id: "dateOfInitiation",
                header: "Initiated",
                accessorFn: (row) =>
                    getProcessValue(
                        row,
                        "dateOfInitiation"
                    ),
                cell: ({ getValue }) => (
                    <span className="whitespace-nowrap text-xs font-semibold text-[#456B6B]">
                        {getValue() || "-"}
                    </span>
                ),
            },

            // {
            //     id: "dueDate",
            //     header: "Due Date",
            //     accessorFn: (row) =>
            //         getProcessValue(row, "dueDate"),
            //     cell: ({ getValue }) => (
            //         <span className="whitespace-nowrap text-xs font-medium text-slate-600">
            //             {getValue() || "-"}
            //         </span>
            //     ),
            // },

            {
                id: "actions",
                header: "Action",
                enableSorting: false,
                cell: ({ row }) => (
                    <button
                        type="button"
                        onClick={() => handleViewReport(row.original?.id)}
                        className="
                            inline-flex items-center gap-2 rounded-lg
                            border border-[#B8DCD7] bg-[#E7F4F2]
                            px-3 py-1.5 text-xs font-semibold
                            text-[#185B61] shadow-sm
                            transition-all duration-200
                            hover:border-[#159A8C]
                            hover:bg-[#D2ECE8]
                            hover:text-[#087F73]
                            hover:shadow
                            focus:outline-none focus:ring-2
                            focus:ring-[#159A8C]/20
                        "
                        title="View engineering record"
                    >
                        <Eye size={14} strokeWidth={2} />
                        <span>View Report</span>
                    </button>
                ),
            },
        ],
        []
    );

    return (
        <div
            className="
                flex h-full min-h-0 flex-col overflow-hidden
                bg-[#F4F8F7]
            "
        >
            <div className="shrink-0">
                <DashboardActionBar
                    title="Engineering Dashboard"
                    buttonName="Create Record"
                    navigationRoute="/user/create-record"
                    sourceRoute="/user/engineering-dashboard"
                    sourceType="engineering"
                />
            </div>

            <main
                className="
                    mt-8 min-h-0 flex-1 overflow-hidden
                      pt-3
                "
            >
                <DataTable
                    data={records}
                    columns={columns}
                    loading={loading}
                    searchable
                    searchPlaceholder="Search engineering records..."
                    pagination
                    pageSize={pagination.perPage}
                    pageSizeOptions={[10, 20, 50]}
                    sortable
                    showColumnVisibility
                    hoverable
                    /* Backend pagination */
                    manualPagination
                    pageCount={pagination.lastPage}
                    totalRows={pagination.total}
                    onPaginationChange={({
                        pageIndex,
                        pageSize,
                    }) => {
                        const nextPage = pageIndex + 1;
                        fetchRecords(nextPage, pageSize);
                    }}
                    emptyTitle="No engineering records found"
                    emptyDescription="
                        Engineering records will appear here
                        once they are created.
                    "
                />
            </main>
        </div>
    );
};

export default EngineeringDashboard;