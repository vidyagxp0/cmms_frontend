import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import CreateEquipmentModal from "./CreateEquipmentModal";
import { getAllEquipment } from "../../../services/usersApi/equipmentApi";
import DataTable from "../../../components/common/DataTable/DataTable";
import { Eye } from "lucide-react";

const EquipDashboard = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    console.log(isCreateModalOpen,"isCreateModalOpen<<<")
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    // Backend pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });

    const fetchEquipment = async (page = 1, perPage = 10) => {
        try {
            setLoading(true);
            const response = await getAllEquipment({
                page,
                per_page: perPage,
            });

            console.log("Equipment API Response:", response);

            const paginationData = response?.data?.data;
            const equipmentData = paginationData?.data || [];

            setEquipment(
                Array.isArray(equipmentData) ? equipmentData : []
            );

            setPagination({
                currentPage: paginationData?.current_page || page,
                lastPage: paginationData?.last_page || 1,
                perPage: paginationData?.per_page || perPage,
                total: paginationData?.total || 0,
            });
        } catch (error) {
            console.error("Failed to fetch equipment:", error);
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
            {
                accessorKey: "equipment_id",
                header: "Equipment ID",
                cell: ({ row, getValue }) => {
                    const value = getValue();

                    return (
                        <button
                            type="button"
                            onClick={() => {
                                if (!row.original?.id) return;

                                navigate(
                                    `/user/equipment-panel/${row.original.id}`
                                );
                            }}
                            className="
                                inline-flex cursor-pointer
                                rounded-md border
                                border-indigo-100
                                bg-indigo-50/70
                                px-2 py-1.5
                                font-mono text-[11px]
                                font-semibold tracking-wide
                                text-gray-500
                                shadow-sm
                                transition-all duration-200
                                hover:border-indigo-200
                                hover:bg-indigo-100
                                hover:text-indigo-800
                                hover:shadow
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-500/20
                            "
                            title="View equipment details"
                        >
                            {value || "-"}
                        </button>
                    );
                },
            },
            {
                accessorKey: "name",
                header: "Equipment",
                cell: ({ row }) => {
                    const name = row.original?.name || "-";

                    return (
                        <div className="flex items-center gap-3">
                            <div className="min-w-0">
                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                    "
                                >
                                    {name}
                                </p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "equipment_type",
                header: "Type",
                cell: ({ getValue }) => {
                    const value = getValue();

                    return (
                        <span
                            className="
                                px-2.5 py-1
                                text-[11px]
                                font-semibold
                                tracking-wide
                                text-slate-600
                            "
                        >
                            {value || "-"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "make",
                header: "Make",
                cell: ({ getValue }) => (
                    <span
                        className="
                            text-sm
                            font-medium
                            text-slate-600
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "model",
                header: "Model",
                cell: ({ getValue }) => (
                    <span
                        className="
                            inline-flex
                            rounded-md
                            px-2 py-1
                            text-sm
                            font-semibold
                            tracking-wide
                            text-slate-700
                        "
                    >
                        {getValue() || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "created_at",
                header: "Created",
                cell: ({ getValue }) => {
                    const value = getValue();

                    if (!value) {
                        return (
                            <span className="text-slate-400">-</span>
                        );
                    }

                    const date = new Date(value);

                    if (Number.isNaN(date.getTime())) {
                        return (
                            <span className="text-sm text-slate-500">
                                {value}
                            </span>
                        );
                    }

                    return (
                        <div className="flex flex-col gap-0.5">
                            <span
                                className="
                                    whitespace-nowrap
                                    text-xs
                                    font-semibold
                                    text-[#456B6B]
                                "
                            >
                                {date.toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>

                            <span
                                className="
                                    whitespace-nowrap
                                    text-[11px]
                                    font-medium
                                    text-[#7A9997]
                                "
                            >
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
            {
                id: "actions",
                header: "Action",
                enableSorting: false,
                cell: ({ row }) => (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            alert("Report coming soon");
                        }}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-[#B8DCD7]
                            bg-[#E7F4F2]
                            px-3 py-1.5
                            text-xs
                            font-semibold
                            text-[#185B61]
                            shadow-sm
                            transition-all duration-200
                            hover:border-[#159A8C]
                            hover:bg-[#D2ECE8]
                            hover:text-[#087F73]
                            hover:shadow
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#159A8C]/20
                        "
                        title="View equipment report"
                    >
                        <Eye size={14} strokeWidth={2} />
                        <span>View Report</span>
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
                bg-[#F7F9F8]
            "
        >
           <div className="shrink-0">
                <DashboardActionBar
                    title="Equipment Dashboard"
                    buttonName="Create Record"
                    navigationRoute="/user/create-equipment"
                    sourceRoute="/user/equipment-dashboard"
                    sourceType="equipment"
                />
            </div>
            <main
                className="
                    mt-8
                    min-h-0
                    flex-1
                    overflow-hidden
                    pb-4
                    pt-3
                "
            >
                <DataTable
                    data={equipment}
                    columns={columns}
                    loading={loading}
                    searchable
                    searchPlaceholder="Search equipment..."
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
                    onPaginationChange={({ pageIndex, pageSize }) => {
                        const nextPage = pageIndex + 1;
                        fetchEquipment(nextPage, pageSize);
                    }}
                    emptyTitle="No equipment found"
                    emptyDescription="
                        Equipment records will appear here
                        once they are created.
                    "
                />
            </main>

            <CreateEquipmentModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchEquipment}
            />
        </div>
    );
};

export default EquipDashboard;