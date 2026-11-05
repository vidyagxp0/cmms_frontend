
import React, { useEffect, useMemo, useState } from "react";
import {
    Bell,
    Search,
    CheckCircle2,
    Clock3,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Inbox,
    CalendarDays,
    UserRound,
    FileText,
    ShieldCheck,
    ArrowUpRight,
    BellRing,
} from "lucide-react";
import { getRecordNotifications } from "../../../services/usersApi/workflowCommonApi";


const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 10,
    });

    const fetchNotifications = async (currentPage = page, filter = activeFilter) => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page: currentPage,
                per_page: 10,
            };

            if (filter !== "all") {
                params.status = filter;
            }

            const response = await getRecordNotifications(params);
            const result = response?.data?.data;

            setNotifications(result?.data || []);

            setPagination({
                currentPage: result?.current_page || 1,
                lastPage: result?.last_page || 1,
                total: result?.total || 0,
                perPage: result?.per_page || 10,
            });
        } catch (err) {
            console.error("Notification fetch error:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load notifications. Please try again."
            );

            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(page, activeFilter);
    }, [page, activeFilter]);

    const filteredNotifications = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) return notifications;

        return notifications.filter((item) =>
            [
                item.title,
                item.message,
                item.role_name,
                item.status,
                item.record_id,
                item.process_id,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(searchValue)
                )
        );
    }, [notifications, search]);

    const pendingCount = notifications.filter(
        (item) => item.status === "pending"
    ).length;

    const completedCount = notifications.filter(
        (item) => item.status === "completed"
    ).length;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setPage(1);
        setSearch("");
    };

    const handleRefresh = () => {
        fetchNotifications(page, activeFilter);
    };

    const handlePrevious = () => {
        if (page > 1) setPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (page < pagination.lastPage) {
            setPage((prev) => prev + 1);
        }
    };

    const tabs = [
        { label: "All Notifications", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F4EF] via-[#F0F3EE] to-[#E9F0EB] px-4 pb-8 pt-5 sm:px-6 sm:pt-6 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#C9DBD0] bg-gradient-to-br from-white to-[#E2EEE6] text-[#376B59] shadow-[0_4px_12px_rgba(47,94,74,0.09)]">
                        <BellRing size={21} strokeWidth={1.8} />
                        {pagination.total > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#F1F2EC] bg-[#A47D45] px-1 text-[8px] font-bold text-white">
                                {pagination.total > 99 ? "99+" : pagination.total}
                            </span>
                        )}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[22px] font-bold tracking-[-0.7px] text-[#203C35]">
                                Notifications
                            </h1>
                            <span className="rounded-full border border-[#D2E0D6] bg-[#E8F1EA] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#527663]">
                                Activity Center
                            </span>
                        </div>

                        <p className="mt-1 text-[11px] font-medium text-[#82908A]">
                            Stay updated with your assigned activities
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex h-[38px] items-center justify-center gap-2 self-start rounded-[10px] border border-[#C9D9CF] bg-white/80 px-4 text-[11px] font-semibold text-[#416B60] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8EAD9B] hover:bg-[#EAF2EC] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                >
                    <RefreshCw
                        size={14}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                {/* TOTAL */}
                <div className="group relative overflow-hidden rounded-2xl border border-[#D5E0D9] bg-gradient-to-br from-white to-[#EAF2ED] p-5 shadow-[0_5px_18px_rgba(36,79,69,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(36,79,69,0.12)]">
                    <div className="absolute -right-7 -top-9 h-28 w-28 rounded-full bg-[#D7E8DC]/50 blur-2xl transition-all group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-[#71847A]">
                                Total Notifications
                            </p>
                            <h2 className="mt-2 text-[29px] font-bold tracking-tight text-[#254E40]">
                                {pagination.total}
                            </h2>
                            <p className="mt-1 text-[10px] text-[#91A097]">
                                All assigned notifications
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D2E4D8] bg-white/80 text-[#477866] shadow-sm">
                            <Bell size={21} />
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#5D9478] to-transparent" />
                </div>

                {/* PENDING */}
                <div className="group relative overflow-hidden rounded-2xl border border-[#E9DCC5] bg-gradient-to-br from-white to-[#F8F0E2] p-5 shadow-[0_5px_18px_rgba(164,125,69,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(164,125,69,0.12)]">
                    <div className="absolute -right-7 -top-9 h-28 w-28 rounded-full bg-[#F0DFC0]/60 blur-2xl transition-all group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-[#947D5B]">
                                Pending on This Page
                            </p>
                            <h2 className="mt-2 text-[29px] font-bold tracking-tight text-[#98703D]">
                                {pendingCount}
                            </h2>
                            <p className="mt-1 text-[10px] text-[#AE9B7E]">
                                Awaiting action
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#EBDDC4] bg-white/80 text-[#A47D45] shadow-sm">
                            <Clock3 size={21} />
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#C49A5B] to-transparent" />
                </div>

                {/* COMPLETED */}
                <div className="group relative overflow-hidden rounded-2xl border border-[#CFE0D5] bg-gradient-to-br from-white to-[#E8F2EB] p-5 shadow-[0_5px_18px_rgba(71,115,94,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(71,115,94,0.12)]">
                    <div className="absolute -right-7 -top-9 h-28 w-28 rounded-full bg-[#D4E8D9]/60 blur-2xl transition-all group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-[#668071]">
                                Completed on This Page
                            </p>
                            <h2 className="mt-2 text-[29px] font-bold tracking-tight text-[#47735E]">
                                {completedCount}
                            </h2>
                            <p className="mt-1 text-[10px] text-[#8AA092]">
                                Successfully completed
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#CFE0D5] bg-white/80 text-[#47735E] shadow-sm">
                            <CheckCircle2 size={21} />
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#65977A] to-transparent" />
                </div>
            </div>

            {/* NOTIFICATION PANEL */}
            <div className="overflow-hidden rounded-2xl border border-[#D5DED8] bg-white/90 shadow-[0_8px_30px_rgba(35,67,56,0.07)] backdrop-blur-sm">

                {/* PANEL HEADER */}
                <div className="border-b border-[#E5EAE5] bg-gradient-to-r from-white to-[#F4F7F3] px-4 py-4 sm:px-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                        {/* FILTER TABS */}
                        <div className="flex flex-wrap items-center gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => handleFilterChange(tab.value)}
                                    className={`relative rounded-[9px] border px-3.5 py-2 text-[11px] font-semibold transition-all duration-200 ${
                                        activeFilter === tab.value
                                            ? "border-[#315E54] bg-[#24564E] text-white shadow-[0_3px_8px_rgba(36,86,78,0.18)]"
                                            : "border-[#D9E0DA] bg-white text-[#6C7C73] hover:border-[#AFC4B9] hover:bg-[#EDF3F0] hover:text-[#315E54]"
                                    }`}
                                >
                                    {tab.label}
                                    {activeFilter === tab.value && (
                                        <span className="absolute -bottom-[1px] left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#BBD9C6]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* SEARCH */}
                        <div className="relative w-full lg:max-w-[290px]">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#899A91]"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search notifications..."
                                className="h-[38px] w-full rounded-[9px] border border-[#D9E1DA] bg-white pl-9 pr-3 text-[11px] text-[#354540] outline-none transition placeholder:text-[#A1AAA6] focus:border-[#7E9F91] focus:ring-2 focus:ring-[#DCE8E1]"
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE HEADER */}
                <div className="hidden grid-cols-[minmax(0,1fr)_155px_145px] gap-4 border-b border-[#DCE5DE] bg-[#EAF1EC] px-5 py-3 md:grid">
                    <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#61766B]">
                        Notification Details
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#61766B]">
                        Assigned Role
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#61766B]">
                        Status
                    </p>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2EC] text-[#477866]">
                            <RefreshCw size={22} className="animate-spin" />
                        </div>
                        <p className="text-[12px] font-semibold text-[#64786D]">
                            Loading notifications...
                        </p>
                        <p className="text-[10px] text-[#9AA69F]">
                            Please wait while we fetch your updates
                        </p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F0D6D0] bg-[#FCF0ED] text-[#B45F50]">
                            <Bell size={23} />
                        </div>

                        <p className="text-[14px] font-bold text-[#354540]">
                            Something went wrong
                        </p>

                        <p className="mt-1 max-w-md text-[11px] text-[#89938F]">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="mt-4 inline-flex items-center gap-2 rounded-[9px] bg-[#24564E] px-5 py-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#19463F] hover:shadow-md"
                        >
                            <RefreshCw size={13} />
                            Try Again
                        </button>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !error && filteredNotifications.length === 0 && (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                        <div className="relative mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-[#D7E5DA] bg-gradient-to-br from-white to-[#E8F1EA] text-[#6C8B7D] shadow-sm">
                            {search ? (
                                <Search size={28} strokeWidth={1.5} />
                            ) : (
                                <Inbox size={30} strokeWidth={1.5} />
                            )}
                        </div>

                        <h3 className="text-[15px] font-bold text-[#354F44]">
                            {search
                                ? "No matching notifications"
                                : "You're all caught up"}
                        </h3>

                        <p className="mt-1 max-w-sm text-[11px] leading-5 text-[#89938F]">
                            {search
                                ? "Try searching with a different record number or notification title."
                                : "There are no notifications available in this category."}
                        </p>

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="mt-3 text-[11px] font-semibold text-[#3E7460] hover:underline"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {/* NOTIFICATION LIST */}
                {!loading && !error && filteredNotifications.length > 0 && (
                    <div className="divide-y divide-[#E8ECE7]">
                        {filteredNotifications.map((item) => {
                            const isPending = item.status === "pending";

                            return (
                                <div
                                    key={item.id}
                                    className="group grid grid-cols-1 gap-3 border-l-[3px] border-l-transparent px-4 py-5 transition-all duration-200 hover:border-l-[#477568] hover:bg-gradient-to-r hover:from-[#EDF4EF] hover:to-white sm:px-5 md:grid-cols-[minmax(0,1fr)_155px_145px] md:items-center md:gap-4"
                                >
                                    {/* NOTIFICATION DETAILS */}
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div
                                            className={`mt-0.5 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px] border ${
                                                isPending
                                                    ? "border-[#EBDDC4] bg-gradient-to-br from-[#FBF5E9] to-[#F2E7D3] text-[#A47D45]"
                                                    : "border-[#D0E3D5] bg-gradient-to-br from-[#F1F8F2] to-[#E0EEE3] text-[#4D7860]"
                                            }`}
                                        >
                                            {isPending ? (
                                                <Bell size={18} />
                                            ) : (
                                                <CheckCircle2 size={19} />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="break-words text-[12px] font-bold leading-5 text-[#29483E] transition-colors group-hover:text-[#24564E]">
                                                    {item.title || "Notification"}
                                                </h3>

                                                <span className="rounded-[5px] border border-[#DCE3DC] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#78877F]">
                                                    #{item.id}
                                                </span>
                                            </div>

                                            <p className="mt-1 break-words text-[11px] leading-[18px] text-[#78877F]">
                                                {item.message || "No additional details available."}
                                            </p>

                                            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#89958E]">
                                                    <FileText size={11} className="text-[#729184]" />
                                                    Record #{item.record_id}
                                                </span>

                                                <span className="inline-flex items-center gap-1.5 text-[10px] text-[#89958E]">
                                                    <CalendarDays size={11} className="text-[#729184]" />
                                                    {formatDate(item.created_at)}
                                                </span>
                                            </div>

                                            {/* MOBILE ROLE AND STATUS */}
                                            <div className="mt-3 flex flex-wrap items-center gap-2 md:hidden">
                                                <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#DCE3DC] bg-white px-2.5 py-1.5 text-[10px] font-medium text-[#64766C]">
                                                    <ShieldCheck size={11} />
                                                    {item.role_name || "Assigned Role"}
                                                </span>

                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-[7px] border px-2.5 py-1.5 text-[10px] font-semibold ${
                                                        isPending
                                                            ? "border-[#E6D5B8] bg-[#FBF4E8] text-[#98703D]"
                                                            : "border-[#C9DFD0] bg-[#EDF6EF] text-[#4E795E]"
                                                    }`}
                                                >
                                                    {isPending ? (
                                                        <Clock3 size={11} />
                                                    ) : (
                                                        <CheckCircle2 size={11} />
                                                    )}
                                                    {isPending ? "Pending" : "Completed"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROLE */}
                                    <div className="hidden min-w-0 md:block">
                                        <div className="inline-flex max-w-full items-center gap-1.5 rounded-[8px] border border-[#DCE3DC] bg-[#FAFCFA] px-2.5 py-2 transition-colors group-hover:border-[#C4D9CB] group-hover:bg-white">
                                            <UserRound size={12} className="shrink-0 text-[#789087]" />
                                            <span className="truncate text-[10px] font-semibold text-[#586B64]">
                                                {item.role_name || "Assigned Role"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* STATUS */}
                                    <div className="hidden md:block">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[10px] font-bold ${
                                                isPending
                                                    ? "border-[#E6D5B8] bg-[#FBF4E8] text-[#98703D]"
                                                    : "border-[#C9DFD0] bg-[#EDF6EF] text-[#4E795E]"
                                            }`}
                                        >
                                            {isPending ? (
                                                <Clock3 size={12} />
                                            ) : (
                                                <CheckCircle2 size={12} />
                                            )}
                                            {isPending ? "Pending" : "Completed"}
                                        </span>

                                        {item.completed_at && (
                                            <p className="mt-1.5 text-[9px] font-medium text-[#89938F]">
                                                {formatDate(item.completed_at)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION FOOTER */}
                {!loading && !error && (
                    <div className="flex flex-col gap-3 border-t border-[#E1E7E1] bg-gradient-to-r from-[#F8F9F5] to-[#F1F5F0] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-[10px] font-medium text-[#849087]">
                            Showing{" "}
                            <span className="font-bold text-[#354F44]">
                                {pagination.total === 0
                                    ? 0
                                    : (pagination.currentPage - 1) * pagination.perPage + 1}
                            </span>
                            {" "}to{" "}
                            <span className="font-bold text-[#354F44]">
                                {Math.min(
                                    pagination.currentPage * pagination.perPage,
                                    pagination.total
                                )}
                            </span>
                            {" "}of{" "}
                            <span className="font-bold text-[#354F44]">
                                {pagination.total}
                            </span>
                            {" "}notifications
                        </p>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <span className="text-[10px] font-medium text-[#849087]">
                                Page {pagination.currentPage} of {pagination.lastPage}
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    disabled={page <= 1}
                                    className="flex h-[31px] w-[31px] items-center justify-center rounded-[8px] border border-[#D9E2DA] bg-white text-[#64736D] shadow-sm transition hover:border-[#9FBAA8] hover:bg-[#EAF2EC] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={15} />
                                </button>

                                <span className="flex h-[31px] min-w-[34px] items-center justify-center rounded-[8px] border border-[#BFD3C8] bg-[#E5EEE8] px-2 text-[11px] font-bold text-[#315E54]">
                                    {page}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={page >= pagination.lastPage}
                                    className="flex h-[31px] w-[31px] items-center justify-center rounded-[8px] border border-[#D9E2DA] bg-white text-[#64736D] shadow-sm transition hover:border-[#9FBAA8] hover:bg-[#EAF2EC] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM NOTE */}
            <div className="mt-4 flex items-center justify-center gap-2 text-center">
                <ShieldCheck size={12} className="text-[#8AA294]" />
                <p className="text-[9px] font-medium tracking-wide text-[#9AA69F]">
                    VidyaGxP • Notification Activity Center
                </p>
            </div>
        </div>
    );
};

export default NotificationList;
