import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    Wrench,
    Database,
    ArrowUpRight,
} from "lucide-react";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import CreateEquipmentModal from "./CreateEquipmentModal";
import { getAllEquipment } from "../../../services/usersApi/equipmentApi";
import DataTable from "../../../components/common/DataTable/DataTable";

const EquipDashboard = () => {
    const navigate = useNavigate();

    const [isCreateModalOpen, setIsCreateModalOpen] =
        useState(false);

    const [equipment, setEquipment] = useState([]);

    const [loading, setLoading] = useState(true);

    // Backend pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });

    const fetchEquipment = async (
        page = 1,
        perPage = 10
    ) => {
        try {
            setLoading(true);

            const response =
                await getAllEquipment({
                    page,
                    per_page: perPage,
                });

            const paginationData =
                response?.data?.data;

            const equipmentData =
                paginationData?.data || [];

            setEquipment(
                Array.isArray(equipmentData)
                    ? equipmentData
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
                "Failed to fetch equipment:",
                error
            );

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

    useEffect(() => {
        fetchEquipment(1, 10);
    }, []);

    const columns = useMemo(
        () => [
            /* =====================================================
               EQUIPMENT ID
            ====================================================== */
            {
                accessorKey: "equipment_id",
                header: "Equipment ID",

                cell: ({ row, getValue }) => {
                    const value = getValue();

                    return (
                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    !row.original?.id
                                ) {
                                    return;
                                }

                                navigate(
                                    `/user/equipment-panel/${row.original.id}`
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
                            title="View equipment details"
                        >
                            <span>
                                {value || "-"}
                            </span>

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

            /* =====================================================
               EQUIPMENT
            ====================================================== */
            {
                accessorKey: "name",
                header: "Equipment",

                cell: ({ row }) => {
                    const name =
                        row.original?.name ||
                        "-";

                    return (
                        <div
                            className="
                                flex
                                min-w-0
                                items-center
                                gap-3
                            "
                        >
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
                                <Wrench
                                    size={14}
                                    strokeWidth={1.9}
                                />
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

                                <p
                                    className="
                                        mt-0.5
                                        text-[9.5px]
                                        font-medium
                                        uppercase
                                        tracking-[0.07em]
                                        text-[var(--color-text-muted)]
                                    "
                                >
                                    Asset
                                </p>
                            </div>
                        </div>
                    );
                },
            },

            /* =====================================================
               TYPE
            ====================================================== */
            {
                accessorKey:
                    "equipment_type",

                header: "Type",

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

            /* =====================================================
               MAKE
            ====================================================== */
            {
                accessorKey: "make",
                header: "Make",

                cell: ({ getValue }) => (
                    <span
                        className="
                            text-[11.5px]
                            font-semibold
                            text-[#566560]
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },

            /* =====================================================
               MODEL
            ====================================================== */
            {
                accessorKey: "model",
                header: "Model",

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

            /* =====================================================
               CREATED
            ====================================================== */
            {
                accessorKey: "created_at",
                header: "Created",

                cell: ({ getValue }) => {
                    const value = getValue();

                    if (!value) {
                        return (
                            <span
                                className="
                                    text-[11px]
                                    text-[#98A19E]
                                "
                            >
                                -
                            </span>
                        );
                    }

                    const date =
                        new Date(value);

                    if (
                        Number.isNaN(
                            date.getTime()
                        )
                    ) {
                        return (
                            <span
                                className="
                                    text-[11px]
                                    text-[#687571]
                                "
                            >
                                {value}
                            </span>
                        );
                    }

                    return (
                        <div
                            className="
                                flex
                                flex-col
                                gap-0.5
                            "
                        >
                            <span
                                className="
                                    whitespace-nowrap
                                    text-[10.5px]
                                    font-bold
                                    text-[#4D625B]
                                "
                            >
                                {date.toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }
                                )}
                            </span>

                            <span
                                className="
                                    whitespace-nowrap
                                    font-mono
                                    text-[9.5px]
                                    font-medium
                                    text-[#8A9691]
                                "
                            >
                                {date.toLocaleTimeString(
                                    "en-IN",
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: false,
                                    }
                                )}
                            </span>
                        </div>
                    );
                },
            },

            /* =====================================================
               ACTION
            ====================================================== */
            {
                id: "actions",
                header: "Action",
                enableSorting: false,

                cell: ({ row }) => (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();

                            alert(
                                "Report coming soon"
                            );
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
                        title="View equipment report"
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
                SECONDARY ACTION BAR
            ====================================================== */}
            <DashboardActionBar
                title="Equipment Dashboard"
                buttonName="Create Record"
                navigationRoute="/user/create-equipment"
                sourceRoute="/user/equipment-dashboard"
                sourceType="equipment"
            />

            {/* =====================================================
                MAIN CONTENT

                Fixed sub-header:
                top = 138px
                height = 54px
                therefore content needs only a small offset
                below it.
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
                <section
                    className="
                        flex
                        h-full
                        min-h-0
                        flex-col
                        overflow-hidden
                        rounded-[16px]
                        border
                        border-[var(--color-border)]
                        bg-[var(--color-surface)]
                        shadow-[0_5px_20px_rgba(36,50,56,0.055)]
                    "
                >
                    {/* =================================================
                        REGISTRY HEADER
                    ================================================== */}
                    

                    {/* =================================================
                        DATA TABLE
                    ================================================== */}
                    <div
                        className="
                            min-h-0
                            flex-1
                            overflow-hidden
                            bg-[var(--color-surface)]
                        "
                    >
                        <DataTable
                            data={equipment}
                            columns={columns}
                            loading={loading}
                            searchable
                            searchPlaceholder="Search equipment..."
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

                                fetchEquipment(
                                    nextPage,
                                    pageSize
                                );
                            }}

                            emptyTitle="No equipment found"
                            emptyDescription="
                                Equipment records will appear here
                                once they are created.
                            "
                        />
                    </div>
                </section>
            </main>

            {/* =====================================================
                CREATE EQUIPMENT MODAL
            ====================================================== */}
            <CreateEquipmentModal
                open={isCreateModalOpen}
                onClose={() =>
                    setIsCreateModalOpen(false)
                }
                onSuccess={fetchEquipment}
            />
        </div>
    );
};

export default EquipDashboard;