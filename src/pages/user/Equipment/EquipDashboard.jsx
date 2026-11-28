import React, { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Eye, Wrench, Search, Filter, FileBadge } from "lucide-react";
import SrNoLink from "../../../components/common/SrNoLink/SrNoLink";
import { Input, Select, Button } from "antd";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import {
    getAllEquipment,
    getInstrumentReport,
} from "../../../services/usersApi/equipmentApi";
import DataTable from "../../../components/common/DataTable/DataTable";
import { useAuthStore } from "../../../store/authStore";
import { getMasterCertificateReport } from "../../../services/usersApi/dashboardAllApi";

/* ───────────────────────── Report window templates ───────────────────────── */

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

/* ───────────────────────── Filter option constants ───────────────────────── */

const CATEGORY_OPTIONS = [
    { label: "Critical",     value: "critical"     },
    { label: "Non Critical", value: "non critical" },
    { label: "Indicative",   value: "indicative"   },
];

const STAGE_OPTIONS = [
    { label: "Opened",             value: "Opened" },
    { label: "HOD Review",         value: "HOD Review" },
    { label: "QA Approval",        value: "QA Approval" },
    { label: "Closed - Done",      value: "Closed - Done" },
    { label: "Closed - Cancelled", value: "Closed - Cancelled" },
];

const CATEGORY_LABEL_MAP = {
    C:  "Critical",
    NC: "Non Critical",
    I:  "Indicative",
};

const EquipDashboard = () => {
    const navigate = useNavigate();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    // FILTER STATE
    // ================================================================
    const [searchTerm, setSearchTerm]           = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter]   = useState("");
    const [statusFilter, setStatusFilter]       = useState("");

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // ================================================================
    // FETCH EQUIPMENT
    // ================================================================
    // Guards against out-of-order responses (fast typing / filter changes).
    const latestRequestRef = useRef(0);

    const fetchEquipment = useCallback(async (page = 1, perPage = 10, filters = {}) => {
        const requestId = ++latestRequestRef.current;
        try {
            setLoading(true);

            const params = { page, per_page: perPage };
            if (filters.search)     params.search     = filters.search;
            if (filters.category)   params.category   = filters.category;
            if (filters.status)     params.status     = filters.status;

            const response = await getAllEquipment(params);
            if (requestId !== latestRequestRef.current) return; // a newer request superseded this one

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
            if (requestId !== latestRequestRef.current) return;
            console.error("Failed to fetch instruments:", error);
            setEquipment([]);
            setPagination({
                currentPage: 1,
                lastPage: 1,
                perPage,
                total: 0,
            });
        } finally {
            if (requestId === latestRequestRef.current) setLoading(false);
        }
    }, []);

    // Trigger fetch on filters change
    useEffect(() => {
        fetchEquipment(1, pagination.perPage, {
            search:     debouncedSearch,
            category:   categoryFilter,
            status:     statusFilter,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, categoryFilter, statusFilter, fetchEquipment]);

    // ================================================================
    // VIEW REPORT
    // ================================================================
    const handleViewReport = useCallback(async (instrumentId) => {
        if (!instrumentId) return;

        const reportWindow = window.open("", "_blank");

        if (!reportWindow) {
            alert("Please allow pop-ups to view the report.");
            return;
        }

        try {
            reportWindow.document.write(REPORT_LOADER_HTML);
            reportWindow.document.close();

            const response = await getInstrumentReport(instrumentId);
            const blob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = window.URL.createObjectURL(blob);

            reportWindow.location.href = pdfUrl;

            setTimeout(() => {
                window.URL.revokeObjectURL(pdfUrl);
            }, 10000);
        } catch (error) {
            console.error("Failed to open instrument report:", error);
            if (reportWindow && !reportWindow.closed) {
                reportWindow.document.open();
                reportWindow.document.write(REPORT_ERROR_HTML);
                reportWindow.document.close();
            }
        }
    }, []);


    // ================================================================
// VIEW CERTIFICATE
// ================================================================
const handleViewCertificate = useCallback(async (instrumentId) => {
    if (!instrumentId) return;

    const certificateWindow = window.open("", "_blank");

    if (!certificateWindow) {
        alert("Please allow pop-ups to view the certificate.");
        return;
    }

    try {
        certificateWindow.document.write(
            REPORT_LOADER_HTML.replace(
                "Loading your workspace...",
                "Loading your certificate..."
            )
        );

        certificateWindow.document.close();

        // STEP 1: Get certificate attachment list
        const response = await getMasterCertificateReport(instrumentId);

        const attachments =
            response?.data?.data?.attachments ??
            response?.data?.attachments ??
            [];

        if (certificateWindow.closed) return;

        // STEP 2: Check if certificate exists
        if (!Array.isArray(attachments) || attachments.length === 0) {
            certificateWindow.document.open();

            certificateWindow.document.write(
                REPORT_ERROR_HTML
                    .replace(
                        "Failed to generate report",
                        "No Certificate Found"
                    )
                    .replace(
                        "Please close this tab and try again.",
                        "No certificate attachment is available for this instrument."
                    )
            );

            certificateWindow.document.close();
            return;
        }

        // STEP 3: Fetch and open actual certificate
        const openCertificate = async (attachment) => {
            if (!attachment?.file_name) {
                throw new Error("Certificate file name is missing.");
            }

            const fileResponse = await getMasterCertificateReport(
                instrumentId,
                attachment.file_name
            );

            if (certificateWindow.closed) return;

            const contentType =
                fileResponse.headers?.["content-type"] ||
                attachment.mime_type ||
                "application/octet-stream";

            if (contentType.includes("application/json")) {
                throw new Error("Server returned JSON instead of a file.");
            }

            const blob = new Blob([fileResponse.data], {
                type: contentType,
            });

            const fileUrl = window.URL.createObjectURL(blob);

            certificateWindow.location.href = fileUrl;

            setTimeout(() => {
                window.URL.revokeObjectURL(fileUrl);
            }, 60000);
        };

        // STEP 4: Directly open if only one certificate exists
        if (attachments.length === 1) {
            await openCertificate(attachments[0]);
            return;
        }

        // STEP 5: Show certificate list if multiple files exist
        certificateWindow.document.open();

        certificateWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Instrument Certificates</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 40px 20px;
                        font-family: Arial, sans-serif;
                        background: #F7F9F8;
                        color: #263B35;
                    }

                    .container {
                        max-width: 700px;
                        margin: auto;
                    }

                    h2 {
                        font-size: 22px;
                        margin-bottom: 8px;
                    }

                    .subtitle {
                        font-size: 13px;
                        color: #899690;
                        margin-bottom: 24px;
                    }

                    .certificate {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                        padding: 18px;
                        margin-bottom: 12px;
                        border: 1px solid #D5E0DB;
                        border-radius: 10px;
                        background: white;
                    }

                    .file-name {
                        font-size: 14px;
                        font-weight: 600;
                        overflow-wrap: anywhere;
                    }

                    .file-type {
                        font-size: 11px;
                        color: #899690;
                        margin-top: 6px;
                    }

                    button {
                        flex-shrink: 0;
                        border: none;
                        border-radius: 7px;
                        padding: 10px 16px;
                        background: #2B5577;
                        color: white;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                    }

                    button:hover {
                        background: #234766;
                    }

                    button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Instrument Certificates</h2>
                    <p class="subtitle">
                        Select a certificate to view its attachment.
                    </p>
                    <div id="certificate-list"></div>
                </div>
            </body>
            </html>
        `);
        certificateWindow.document.close();
        const doc = certificateWindow.document;
        const listContainer = doc.getElementById("certificate-list");
        attachments.forEach((attachment) => {
            const card = doc.createElement("div");
            card.className = "certificate";
            const details = doc.createElement("div");
            const fileName = doc.createElement("div");
            fileName.className = "file-name";
            fileName.textContent =
                attachment.original_name ||
                attachment.file_name ||
                "Certificate";
            const fileType = doc.createElement("div");
            fileType.className = "file-type";
            fileType.textContent =
                attachment.extension?.toUpperCase() ||
                attachment.mime_type ||
                "Attachment";
            const viewButton = doc.createElement("button");
            viewButton.textContent = "View Certificate";
            viewButton.onclick = async () => {
                try {
                    viewButton.disabled = true;
                    viewButton.textContent = "Loading...";
                    await openCertificate(attachment);
                } catch (error) {
                    console.error(
                        "Failed to open certificate:",
                        error
                    );
                    viewButton.disabled = false;
                    viewButton.textContent = "Try Again";
                    certificateWindow.alert(
                        "Failed to open certificate attachment."
                    );
                }
            };
            details.appendChild(fileName);
            details.appendChild(fileType);
            card.appendChild(details);
            card.appendChild(viewButton);
            listContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to open master certificate:", error);
        if (!certificateWindow.closed) {
            certificateWindow.document.open();
            certificateWindow.document.write(
                REPORT_ERROR_HTML.replace(
                    "Failed to generate report",
                    "Failed to load certificate"
                )
            );
            certificateWindow.document.close();
        }
    }
}, []);

    // ================================================================
    // TABLE COLUMNS
    // ================================================================
    // Sr. No. shown to users instead of the database ID. Continues across pages
    // (page 2 starts at perPage + 1). Navigation still uses record.id.
    const serialOffset =
        ((Number(pagination.currentPage) || 1) - 1) * (Number(pagination.perPage) || 0);

    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "Sr. No.",
                enableSorting: false,
                cell: ({ row }) => {
                    const record = row.original;
                    const handleClick = () => {
                        if (!record?.id) return;
                        navigate(`/user/equipment-panel/${record.id}`);
                    };

                    return (
                        <SrNoLink value={serialOffset + row.index + 1} onClick={handleClick} />
                    );
                },
            },
            {
                accessorKey: "instrument_id_no",
                header: "Instrument ID",
                cell: ({ getValue }) => {
                    const value = getValue();
                    return (
                        <span className="inline-flex items-center rounded-[9px] border border-[#E3E8E5] bg-[#F7F9F8] px-2.5 py-1.5 font-mono text-[10.5px] font-bold tracking-[0.03em] text-[#536D64]">
                            {value || "-"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "instrument_name",
                header: "Instrument",
                cell: ({ row }) => {
                    const name = row.original?.instrument_name || "-";
                    return (
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#D5E0DB] bg-[#F1F5F3] text-[#56766D]">
                                <Wrench size={14} strokeWidth={1.9} />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-[12px] font-bold tracking-[-0.01em] text-[var(--color-text-primary)]" title={name}>
                                    {name}
                                </p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "category",
                header: "Category",
                cell: ({ getValue }) => {
                    const raw = getValue();
                    const label = CATEGORY_LABEL_MAP[raw] || raw || "-";
                    return (
                        <span className="inline-flex max-w-full items-center rounded-full border border-[#DDE4E0] bg-[#F6F8F6] px-2.5 py-1 text-[10px] font-bold tracking-[0.025em] text-[#61716C]" title={label}>
                            {label}
                        </span>
                    );
                },
            },
            {
                accessorKey: "make",
                header: "Make",
                cell: ({ getValue }) => (
                    <span className="text-[11.5px] font-semibold text-[#566560]">
                        {getValue() || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "sr_no_model_no",
                header: "Sr. No. / Model No.",
                cell: ({ getValue }) => (
                    <span className="inline-flex rounded-[8px] bg-[#F7F8F6] px-2 py-1 font-mono text-[10.5px] font-semibold tracking-[0.02em] text-[#52625E]">
                        {getValue() || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "created_at",
                header: "Created",
                cell: ({ getValue }) => {
                    const value = getValue();
                    if (!value) return <span className="text-[11px] text-[#98A19E]">-</span>;
                    const date = new Date(value);
                    if (Number.isNaN(date.getTime())) return <span className="text-[11px] text-[#687571]">{value}</span>;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="whitespace-nowrap text-[10.5px] font-bold text-[#4D625B]">
                                {date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                            <span className="whitespace-nowrap font-mono text-[9.5px] font-medium text-[#8A9691]">
                                {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "stage.name",
                header: "Stage",
                cell: ({ row }) => {
                    const stageName = row.original?.stage?.name || "-";
                    const isClosed = stageName.toLowerCase().includes("closed");
                    return (
                        <span
                            className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.025em] ${
                                isClosed ? "border-[#D5E0DB] bg-[#F0F5F2] text-[#536D64]" : "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
                            }`}
                            title={stageName}
                        >
                            {stageName}
                        </span>
                    );
                },
            },
            // {
            //     id: "actions",
            //     header: "Action",
            //     enableSorting: false,
            //     cell: ({ row }) => (
            //         <button
            //             type="button"
            //             onClick={(event) => {
            //                 event.stopPropagation();
            //                 handleViewReport(row.original?.id);
            //             }}
            //             className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border border-[#C9D9D3] bg-[#EEF4F1] px-3 py-1.5 text-[10.5px] font-bold text-[#56766D] shadow-[0_1px_4px_rgba(86,118,109,0.045)] transition-all duration-200 hover:border-[#AFC5BC] hover:bg-[#E2ECE8] hover:text-[#48685F] hover:shadow-[0_3px_9px_rgba(86,118,109,0.09)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-muted)] focus-visible:ring-offset-1"
            //             title="View instrument report"
            //         >
            //             <Eye size={14} strokeWidth={1.9} />
            //             <span>View Report</span>
            //         </button>

                    
            //     ),
            // },

  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => (
        <div className="flex items-center gap-2 whitespace-nowrap">

            {/* View Report */}
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    handleViewReport(row.original?.id);
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border border-[#C9D9D3] bg-[#EEF4F1] px-3 py-1.5 text-[10.5px] font-bold text-[#56766D] shadow-[0_1px_4px_rgba(86,118,109,0.045)] transition-all duration-200 hover:border-[#AFC5BC] hover:bg-[#E2ECE8] hover:text-[#48685F] hover:shadow-[0_3px_9px_rgba(86,118,109,0.09)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-muted)] focus-visible:ring-offset-1"
                title="View instrument report"
            >
                <Eye size={14} strokeWidth={1.9} />
                <span>View Report</span>
            </button>

            {/* View Certificate */}
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    handleViewCertificate(row.original?.id);
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-[10.5px] font-bold text-[#2563EB] shadow-[0_1px_4px_rgba(37,99,235,0.045)] transition-all duration-200 hover:border-[#93C5FD] hover:bg-[#DBEAFE] hover:text-[#1D4ED8] hover:shadow-[0_3px_9px_rgba(37,99,235,0.09)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1"
                title="View master certificate"
            >
                <FileBadge size={14} strokeWidth={1.9} />
                <span>View Certificate</span>
            </button>

        </div>
    ),
},

        ],
        [navigate, handleViewReport, handleViewCertificate, serialOffset]
    );

    // Active filters check
    const hasActiveFilters =
        Boolean(searchTerm) ||
        Boolean(categoryFilter) ||
        Boolean(statusFilter);

    const clearFilters = () => {
        setSearchTerm("");
        setCategoryFilter("");
        setStatusFilter("");
    };

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
            <DashboardActionBar
                title="Instrument Dashboard"
                buttonName="Create Record"
                navigationRoute="/user/create-equipment"
                sourceRoute="/user/equipment-dashboard"
                sourceType="equipment"
                showCreateButton={showCreateButton}
            />

            <main className="min-h-0 flex-1 overflow-hidden px-0 pb-0 pt-[58px]">
                <section className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">

                    {/* ───────────── EXISTING COMPACT FILTER BAR ───────────── */}
                    <div className="flex shrink-0 flex-nowrap items-center gap-2 px-4 py-3 border-b border-gray-100 bg-[#FAFBFA] overflow-x-auto">

                        <Input
                            size="small"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<Search size={13} className="text-gray-400" />}
                            allowClear
                            style={{
                                width: "140px",
                                minWidth: "300px",
                                maxWidth: "300px",
                                flex: "0 0 140px",
                                height: "30px",
                                fontSize: "12px",
                            }}
                        />

                        <Select
                            size="middle"
                            placeholder="Stage"
                            value={statusFilter || undefined}
                            onChange={(val) => setStatusFilter(val || "")}
                            options={STAGE_OPTIONS}
                            allowClear
                            className="w-36 text-sm font-medium shadow-sm"
                            popupClassName="rounded-lg"
                        />

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
                            data={equipment}
                            columns={columns}
                            loading={loading}

                            toolbar={false}
                            searchable={false}

                            className="!rounded-none !border-0 !shadow-none !h-full"

                            pagination
                            pageSize={pagination.perPage}
                            pageSizeOptions={[10, 20, 50]}
                            sortable
                            hoverable

                            manualPagination
                            pageCount={pagination.lastPage}
                            totalRows={pagination.total}
                            onPaginationChange={({ pageIndex, pageSize }) => {
                                const pageSizeChanged = pageSize !== pagination.perPage;
                                const nextPage = pageSizeChanged ? 1 : pageIndex + 1;

                                fetchEquipment(nextPage, pageSize, {
                                    search:     debouncedSearch,
                                    category:   categoryFilter,
                                    status:     statusFilter,
                                });
                            }}
                            emptyTitle="No instruments found"
                            emptyDescription="Try changing filters or create a new instrument record."
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EquipDashboard;