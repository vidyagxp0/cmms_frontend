import { useEffect, useMemo, useState } from "react";
import {
    Bell,
    BellRing,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Inbox,
    LogOut,
    MailOpen,
    RefreshCw,
    Search,
    ShieldCheck,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRecordNotifications } from "../../../services/usersApi/workflowCommonApi";
import { resolveNotificationRoute } from "../../../utils/notificationRoutes";
import NotificationCard, {
    NotificationSkeleton,
    NotificationStyles,
} from "./NotificationCard";
import { dayLabel } from "./notificationUtils";

const TABS = [
    { label: "All", value: "all", icon: Bell },
    { label: "Pending", value: "pending", icon: Clock3 },
    { label: "Completed", value: "completed", icon: CheckCircle2 },
];

/* Compact page-number list: 1 … 4 5 6 … 12 */
const buildPages = (current, last) => {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
    const pages = new Set([1, last, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
    const out = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) out.push("…" + p);
        out.push(p);
    });
    return out;
};

const StatCard = ({ label, value, hint, icon: Icon, tone, delay }) => {
    const tones = {
        green: {
            wrap: "border-[#D5E0D9] from-white to-[#EAF2ED]",
            glow: "bg-[#D7E8DC]/60",
            label: "text-[#71847A]",
            value: "text-[#254E40]",
            icon: "border-[#D2E4D8] text-[#477866]",
            bar: "from-[#5D9478]",
        },
        amber: {
            wrap: "border-[#E9DCC5] from-white to-[#F8F0E2]",
            glow: "bg-[#F0DFC0]/70",
            label: "text-[#947D5B]",
            value: "text-[#98703D]",
            icon: "border-[#EBDDC4] text-[#A47D45]",
            bar: "from-[#C49A5B]",
        },
        teal: {
            wrap: "border-[#CFE0D5] from-white to-[#E8F2EB]",
            glow: "bg-[#D4E8D9]/70",
            label: "text-[#668071]",
            value: "text-[#47735E]",
            icon: "border-[#CFE0D5] text-[#47735E]",
            bar: "from-[#65977A]",
        },
        indigo: {
            wrap: "border-[#D6DDF0] from-white to-[#ECF0FA]",
            glow: "bg-[#D6DFF4]/70",
            label: "text-[#6B7896]",
            value: "text-[#3C5A99]",
            icon: "border-[#D3DCF0] text-[#3C5A99]",
            bar: "from-[#6F88C4]",
        },
    }[tone];

    return (
        <div
            style={{ animationDelay: `${delay}ms` }}
            className={`notif-card-in group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_5px_18px_rgba(36,79,69,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(36,79,69,0.12)] ${tones.wrap}`}
        >
            <div className={`absolute -right-7 -top-9 h-28 w-28 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125 ${tones.glow}`} />
            <div className="relative flex items-center justify-between">
                <div>
                    <p className={`text-[11px] font-semibold ${tones.label}`}>{label}</p>
                    <h2 className={`mt-2 text-[29px] font-bold leading-none tracking-tight ${tones.value}`}>
                        {value}
                    </h2>
                    <p className="mt-2 text-[10px] text-[#91A097]">{hint}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-white/85 shadow-sm transition-transform duration-300 group-hover:rotate-6 ${tones.icon}`}>
                    <Icon size={21} />
                </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r to-transparent ${tones.bar}`} />
        </div>
    );
};

const NotificationList = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 10,
    });

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const params = { page, per_page: 10 };
                if (activeFilter !== "all") params.status = activeFilter;

                const response = await getRecordNotifications(params);
                if (cancelled) return;
                const result = response?.data?.data;

                setNotifications(result?.data || []);
                setPagination({
                    currentPage: result?.current_page || 1,
                    lastPage: result?.last_page || 1,
                    total: result?.total || 0,
                    perPage: result?.per_page || 10,
                });
            } catch (err) {
                if (cancelled) return;
                console.error("Notification fetch error:", err);
                setError(
                    err?.response?.data?.message ||
                        "Unable to load notifications. Please try again."
                );
                setNotifications([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [page, activeFilter, reloadKey]);

    const filteredNotifications = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return notifications;
        return notifications.filter((item) =>
            [
                item.title,
                item.message,
                item.role_name,
                item.status,
                item.record_id,
                item.process_id,
                item.process?.name,
            ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [notifications, search]);

    /* group by day, preserving API order */
    const groups = useMemo(() => {
        const map = new Map();
        filteredNotifications.forEach((item, index) => {
            const key = dayLabel(item.created_at);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push({ item, index });
        });
        return [...map.entries()];
    }, [filteredNotifications]);

    const pendingCount = notifications.filter((i) => i.status === "pending").length;
    const completedCount = notifications.filter((i) => i.status === "completed").length;
    const unreadCount = notifications.filter((i) => !i.read_at).length;

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setPage(1);
        setSearch("");
    };

    const handleRefresh = () => setReloadKey((k) => k + 1);
    const handleExit = () => navigate("/user/engineering-dashboard");

    const handleOpenRecord = (item) => {
        const route = resolveNotificationRoute(item);
        if (route) navigate(route);
    };

    const goTo = (p) => {
        if (p >= 1 && p <= pagination.lastPage && p !== page) {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const from = pagination.total === 0 ? 0 : (pagination.currentPage - 1) * pagination.perPage + 1;
    const to = Math.min(pagination.currentPage * pagination.perPage, pagination.total);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F4EF] via-[#F0F3EE] to-[#E9F0EB] px-4 pb-10 pt-5 sm:px-6 sm:pt-6 lg:px-8">
            <NotificationStyles />

            {/* HERO HEADER */}
            <div className="notif-card-in relative mb-6 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1F4B42] via-[#255A4F] to-[#2F6B5C] px-5 py-6 shadow-[0_18px_40px_-18px_rgba(20,60,50,0.55)] sm:px-7">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#7FC4A0]/20 blur-3xl" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                        backgroundSize: "18px 18px",
                    }}
                />

                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
                            <BellRing size={25} strokeWidth={1.8} className="notif-bell" />
                            {pagination.total > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-[#255A4F] bg-[#E2B25C] px-1 text-[10px] font-bold text-[#3A2A0A] shadow">
                                    {pagination.total > 99 ? "99+" : pagination.total}
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-[23px] font-bold tracking-[-0.6px] text-white">
                                    Notifications
                                </h1>
                                <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-white/85">
                                    Activity Center
                                </span>
                            </div>
                            <p className="mt-1 text-[12px] font-medium text-white/70">
                                Every workflow update on your records — click any card to open it
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-white/25 bg-white/10 px-4 text-[11.5px] font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={handleExit}
                            className="inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-white px-4 text-[11.5px] font-bold text-[#24564E] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <LogOut size={14} />
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Notifications" value={pagination.total} hint="Across all pages" icon={Bell} tone="green" delay={40} />
                <StatCard label="Pending on This Page" value={pendingCount} hint="Awaiting your action" icon={Clock3} tone="amber" delay={90} />
                <StatCard label="Completed on This Page" value={completedCount} hint="No action needed" icon={CheckCircle2} tone="teal" delay={140} />
                <StatCard label="Unread on This Page" value={unreadCount} hint="New since last visit" icon={MailOpen} tone="indigo" delay={190} />
            </div>

            {/* PANEL */}
            <div className="overflow-hidden rounded-2xl border border-[#D5DED8] bg-white/80 shadow-[0_8px_30px_rgba(35,67,56,0.07)] backdrop-blur-sm">
                {/* TOOLBAR */}
                <div className="sticky top-0 z-10 border-b border-[#E5EAE5] bg-white/95 px-4 py-3.5 backdrop-blur sm:px-5">
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                        <div className="inline-flex w-full rounded-[12px] border border-[#DDE5DF] bg-[#F2F6F3] p-1 sm:w-auto">
                            {TABS.map((tab) => {
                                const active = activeFilter === tab.value;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => handleFilterChange(tab.value)}
                                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-4 py-2 text-[11.5px] font-semibold transition-all duration-300 sm:flex-none ${
                                            active
                                                ? "bg-[#24564E] text-white shadow-[0_4px_10px_-2px_rgba(36,86,78,0.4)]"
                                                : "text-[#6C7C73] hover:bg-white hover:text-[#315E54]"
                                        }`}
                                    >
                                        <Icon size={13} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative w-full lg:max-w-[320px]">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#899A91]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search record no, module, stage…"
                                className="h-[40px] w-full rounded-[10px] border border-[#D9E1DA] bg-white pl-9 pr-9 text-[12px] text-[#354540] outline-none transition placeholder:text-[#A1AAA6] focus:border-[#7E9F91] focus:ring-4 focus:ring-[#DCE8E1]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#8A9A92] hover:bg-[#EEF3F0] hover:text-[#3E6852]"
                                    title="Clear"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="bg-[#F8FAF8]/60 px-3 py-4 sm:px-5 sm:py-5">
                    {loading && <NotificationSkeleton count={5} />}

                    {!loading && error && (
                        <div className="notif-fade-in flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F0D6D0] bg-[#FCF0ED] text-[#B45F50]">
                                <Bell size={23} />
                            </div>
                            <p className="text-[14px] font-bold text-[#354540]">Something went wrong</p>
                            <p className="mt-1 max-w-md text-[11.5px] text-[#89938F]">{error}</p>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#24564E] px-5 py-2.5 text-[11.5px] font-semibold text-white shadow-sm transition hover:bg-[#19463F] hover:shadow-md"
                            >
                                <RefreshCw size={13} /> Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredNotifications.length === 0 && (
                        <div className="notif-fade-in flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 animate-ping rounded-[24px] bg-[#CFE3D6] opacity-30" />
                                <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-[#D7E5DA] bg-gradient-to-br from-white to-[#E8F1EA] text-[#6C8B7D] shadow-sm">
                                    {search ? <Search size={28} strokeWidth={1.5} /> : <Inbox size={30} strokeWidth={1.5} />}
                                </div>
                            </div>
                            <h3 className="text-[16px] font-bold text-[#354F44]">
                                {search ? "No matching notifications" : "You're all caught up"}
                            </h3>
                            <p className="mt-1 max-w-sm text-[11.5px] leading-5 text-[#89938F]">
                                {search
                                    ? "Try a different record number, module or stage name."
                                    : "There are no notifications in this category."}
                            </p>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="mt-3 text-[11.5px] font-semibold text-[#3E7460] hover:underline"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}

                    {!loading && !error && groups.length > 0 && (
                        <div className="space-y-6">
                            {groups.map(([label, items]) => (
                                <section key={label}>
                                    <div className="mb-3 flex items-center gap-3 px-1">
                                        <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#5E7D6E]">
                                            {label}
                                        </span>
                                        <span className="rounded-full bg-[#E4EEE8] px-2 py-[1px] text-[10px] font-bold text-[#3E6852]">
                                            {items.length}
                                        </span>
                                        <span className="h-px flex-1 bg-gradient-to-r from-[#D9E4DD] to-transparent" />
                                    </div>
                                    <div className="space-y-3">
                                        {items.map(({ item, index }) => (
                                            <NotificationCard
                                                key={item.id}
                                                item={item}
                                                index={index}
                                                onOpen={handleOpenRecord}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {!loading && !error && (
                    <div className="flex flex-col gap-3 border-t border-[#E1E7E1] bg-gradient-to-r from-[#F8F9F5] to-[#F1F5F0] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-[11px] font-medium text-[#849087]">
                            Showing <span className="font-bold text-[#354F44]">{from}</span>–
                            <span className="font-bold text-[#354F44]">{to}</span> of{" "}
                            <span className="font-bold text-[#354F44]">{pagination.total}</span> notifications
                        </p>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => goTo(page - 1)}
                                disabled={page <= 1}
                                className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px] border border-[#D9E2DA] bg-white text-[#64736D] shadow-sm transition hover:border-[#9FBAA8] hover:bg-[#EAF2EC] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Previous"
                            >
                                <ChevronLeft size={15} />
                            </button>

                            {buildPages(page, pagination.lastPage).map((p) =>
                                typeof p === "string" ? (
                                    <span key={p} className="px-1 text-[11px] text-[#9AA69F]">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => goTo(p)}
                                        className={`flex h-[32px] min-w-[32px] items-center justify-center rounded-[9px] border px-2 text-[11.5px] font-bold transition-all duration-200 ${
                                            p === page
                                                ? "border-[#24564E] bg-[#24564E] text-white shadow-[0_4px_10px_-3px_rgba(36,86,78,0.45)]"
                                                : "border-[#D9E2DA] bg-white text-[#5A6E64] hover:border-[#9FBAA8] hover:bg-[#EAF2EC]"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                onClick={() => goTo(page + 1)}
                                disabled={page >= pagination.lastPage}
                                className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px] border border-[#D9E2DA] bg-white text-[#64736D] shadow-sm transition hover:border-[#9FBAA8] hover:bg-[#EAF2EC] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Next"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* <div className="mt-4 flex items-center justify-center gap-2 text-center">
                <ShieldCheck size={12} className="text-[#8AA294]" />
                <p className="text-[9.5px] font-medium tracking-wide text-[#9AA69F]">
                    VidyaGxP • Notification Activity Center
                </p>
            </div> */}
        </div>
    );
};

export default NotificationList;
