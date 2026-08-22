import React, { useEffect, useState } from "react";
import {
    Users,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { getUserMonitoring } from "../../../services/adminApis/userMonitoringApi";
import Dropdown from "../../../components/ui/Dropdown";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const UserMonitoring = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
    });

    useEffect(() => {
        fetchLogs();
    }, [page, search, status, fromDate, toDate]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                per_page: perPage,
            };

            if (search) {
                params.search = search;
            }

            if (status) {
                params.status = status;
            }

            if (fromDate) {
                params.from_date = fromDate;
            }

            if (toDate) {
                params.to_date = toDate;
            }

            const response = await getUserMonitoring(params);
            const data = response?.data?.data;

            setLogs(data?.data || []);

            setPagination({
                current_page: data?.current_page || 1,
                last_page: data?.last_page || 1,
                total: data?.total || 0,
                from: data?.from || 0,
                to: data?.to || 0,
            });
        } catch (err) {
            console.error("Error fetching user activity logs:", err);

            setError("Failed to load user monitoring data.");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setFromDate("");
        setToDate("");
        setPage(1);
    };

    const hasFilters = search || status || fromDate || toDate;

    const getStatusStyle = (status) => {
        switch (status) {
            case "Active":
                return "border-[#BFE0CC] bg-[#EDF8F1] text-[#17734C]";

            case "Inactive":
                return "border-[#E5CCCC] bg-[#FEF3F3] text-[#B33A3A]";

            default:
                return "border-[#D6E8DE] bg-[#F5FAF7] text-[#3E5A4D]";
        }
    };

    return (
        <div className="w-full">
            {/* PAGE HEADER */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#B8D9C8] bg-[#EEF8F2]">
                            <Users
                                size={18}
                                strokeWidth={2}
                                className="text-[#17734C]"
                            />
                        </span>

                        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                            User Monitoring
                        </h1>
                    </div>

                    <p className="pl-[46px] text-[12.5px] text-[#5C7A6C]">
                        Track user logins, logouts, and current session status.
                    </p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="mb-4 w-full rounded-2xl border border-[#CBE3D6] bg-white p-4 shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter
                            size={15}
                            className="text-[#17734C]"
                        />

                        <span className="text-[12px] font-semibold text-[#152C20]">
                            Filters
                        </span>
                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-[#B33A3A] transition-colors hover:text-[#8F2E2E]"
                        >
                            <X size={13} />
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {/* SEARCH */}
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA79B]"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search by user..."
                            className="h-[46px] w-full rounded-[10px] border border-[#CBE3D6] bg-[#F9FCFA] pl-9 pr-3 text-[12px] text-[#152C20] outline-none transition-all placeholder:text-[#94A79E] focus:border-[#79B89A] focus:bg-white focus:ring-2 focus:ring-[#1F8A5F]/[0.07]"
                        />
                    </div>

                    {/* STATUS */}
                    <Dropdown
                        value={status}
                        options={[
                            {
                                value: "Active",
                                label: "Active",
                            },
                            {
                                value: "Inactive",
                                label: "Inactive",
                            },
                        ]}
                        placeholder="All Status"
                        onChange={(value) => {
                            setStatus(value);
                            setPage(1);
                        }}
                    />

                    {/* FROM DATE */}
                    <div>
                        <DatePicker
                            value={fromDate ? dayjs(fromDate) : null}
                            onChange={(date) => {
                                setFromDate(
                                    date ? date.format("YYYY-MM-DD") : ""
                                );
                                setPage(1);
                            }}
                            format="DD-MM-YYYY"
                            placeholder="From Date"
                            allowClear
                            className="!h-[46px] !w-full !rounded-[10px] !border-[#CBE3D6] !bg-[#F9FCFA] !px-3 !text-[12px]"
                        />
                    </div>

                    {/* TO DATE */}
                    <div>
                        <DatePicker
                            value={toDate ? dayjs(toDate) : null}
                            onChange={(date) => {
                                setToDate(
                                    date ? date.format("YYYY-MM-DD") : ""
                                );
                                setPage(1);
                            }}
                            format="DD-MM-YYYY"
                            placeholder="To Date"
                            allowClear
                            className="!h-[46px] !w-full !rounded-[10px] !border-[#CBE3D6] !bg-[#F9FCFA] !px-3 !text-[12px]"
                        />
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="w-full overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
                {loading ? (
                    <div className="w-full overflow-x-auto">
                        <Skeleton
                            variant="table"
                            rows={10}
                            columns={5}
                        />
                    </div>
                ) : error ? (
                    <div className="flex min-h-[300px] items-center justify-center px-6 py-12 text-center">
                        <p className="text-[12px] font-medium text-[#C43D3D]">
                            {error}
                        </p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex min-h-[300px] items-center justify-center px-6 py-12 text-center">
                        <p className="text-[12px] text-[#8FA79B]">
                            No user activity records found.
                        </p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-[#F3F9F5]">
                                    <th className="w-[80px] border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        S.No
                                    </th>

                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        User Name
                                    </th>

                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Login Time
                                    </th>

                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Logout Time
                                    </th>

                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#E3F0E8]">
                                {logs.map((log, index) => (
                                    <tr
                                        key={`${log.user_name}-${log.login_time}-${index}`}
                                        className="transition-colors duration-150 hover:bg-[#F6FBF8]"
                                    >
                                        <td className="px-5 py-4 text-[12.5px] font-medium text-[#5C7A6C]">
                                            {String(
                                                pagination.from + index
                                            ).padStart(2, "0")}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-[12px] font-semibold text-[#152C20]">
                                            {log.user_name}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-[11.5px] text-[#5C7A6C]">
                                            {log.login_time || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-[11.5px] text-[#5C7A6C]">
                                            {log.logout_time || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${getStatusStyle(
                                                    log.status
                                                )}`}
                                            >
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* FOOTER / PAGINATION */}
            {!loading && !error && logs.length > 0 && (
                <div className="mt-3 flex items-center justify-between px-1">
                    <p className="text-[11.5px] text-[#8FA79B]">
                        Showing{" "}
                        <span className="font-semibold text-[#5C7A6C]">
                            {pagination.from}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-[#5C7A6C]">
                            {pagination.to}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-[#5C7A6C]">
                            {pagination.total}
                        </span>{" "}
                        records
                    </p>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={pagination.current_page === 1}
                            onClick={() =>
                                setPage(pagination.current_page - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all hover:bg-[#F1F9F4] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={15} />
                        </button>

                        <div className="flex h-8 min-w-8 items-center justify-center rounded-[8px] border border-[#176B49] bg-[#17734C] px-2 text-[11px] font-semibold text-white">
                            {pagination.current_page}
                        </div>

                        <button
                            type="button"
                            disabled={
                                pagination.current_page ===
                                pagination.last_page
                            }
                            onClick={() =>
                                setPage(pagination.current_page + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all hover:bg-[#F1F9F4] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMonitoring;
