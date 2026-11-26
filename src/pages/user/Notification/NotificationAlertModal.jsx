import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    ArrowRight,
    Bell,
    BellRing,
    CheckCircle2,
    Clock3,
    Inbox,
    MailOpen,
    RefreshCw,
    ShieldCheck,
    X,
} from "lucide-react";
import { getRecordNotifications } from "../../../services/usersApi/workflowCommonApi";
import { resolveNotificationRoute } from "../../../utils/notificationRoutes";
import NotificationCard, {
    NotificationSkeleton,
    NotificationStyles,
} from "./NotificationCard";

const SESSION_KEY = "vgxp_notification_modal_shown";

const NotificationAlertModal = ({
    enabled = true,
    status = "pending",
    limit = 5,
    viewAllRoute = "/user/notification-list",
}) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const markShown = useCallback(() => {
        try {
            sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
            /* storage unavailable */
        }
    }, []);

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = { page: 1, per_page: limit };
            if (status && status !== "all") params.status = status;

            const response = await getRecordNotifications(params);

            const result = response?.data?.data;
            const rawList = Array.isArray(result?.data) ? result.data : [];
            const serverTotal = Number(result?.total) || rawList.length;

            let finalList = rawList;
            let finalTotal = serverTotal;

            if (status && status !== "all") {
                const target = status.toLowerCase();
                const filtered = rawList.filter(
                    (item) => (item.status || "").toLowerCase() === target
                );
                const backendFiltered =
                    filtered.length === rawList.length || rawList.length === 0;
                finalTotal = backendFiltered ? serverTotal : filtered.length;
                finalList = filtered;
            }

            setNotifications(finalList);
            setTotalCount(finalTotal);

            if (finalList.length > 0) {
                setOpen(true);
            } else {
                markShown();
            }
        } catch (err) {
            console.error("Notification alert fetch error:", err);
            setError(
                err?.response?.data?.message ||
                    "Unable to load notifications right now."
            );
            markShown();
        } finally {
            setLoading(false);
        }
    }, [limit, status, markShown]);

    useEffect(() => {
        if (!enabled) return;
        let alreadyShown = false;
        try {
            alreadyShown = sessionStorage.getItem(SESSION_KEY) === "1";
        } catch {
            /* storage unavailable */
        }
        if (alreadyShown) return;
        loadNotifications();
    }, [enabled, loadNotifications]);

    /* animate out, then run `after` */
    const closeThen = useCallback(
        (after) => {
            markShown();
            setClosing(true);
            window.setTimeout(() => {
                setOpen(false);
                setClosing(false);
                after?.();
            }, 200);
        },
        [markShown]
    );

    const handleClose = useCallback(() => closeThen(), [closeThen]);

    const handleViewAll = useCallback(
        () => closeThen(() => navigate(viewAllRoute)),
        [closeThen, navigate, viewAllRoute]
    );

    const handleOpenRecord = useCallback(
        (item) => {
            const route = resolveNotificationRoute(item) || viewAllRoute;
            closeThen(() => navigate(route));
        },
        [closeThen, navigate, viewAllRoute]
    );

    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, handleClose]);

    if (!open) return null;

    const hiddenCount = Math.max(0, totalCount - notifications.length);
    const pendingCount = notifications.filter(
        (i) => (i.status || "").toLowerCase() === "pending"
    ).length;
    const completedCount = notifications.length - pendingCount;
    const unreadCount = notifications.filter((i) => !i.read_at).length;
    const isPendingMode = (status || "").toLowerCase() === "pending";

    return (
        <div
            className={`fixed inset-0 z-[1000] flex items-center justify-center px-3 py-4 transition-opacity duration-200 sm:px-6 sm:py-6 ${
                closing ? "opacity-0" : "opacity-100"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-alert-title"
        >
            <NotificationStyles />

            <div
                className="notif-fade-in absolute inset-0 bg-[#0F231D]/55 backdrop-blur-[5px]"
                onClick={handleClose}
            />

            <div
                className={`relative z-10 flex max-h-[min(82vh,640px)] w-full max-w-[600px] flex-col overflow-hidden rounded-[18px] border border-[#D5DED8] bg-white shadow-[0_24px_60px_-14px_rgba(15,35,29,0.5)] transition-transform duration-200 ${
                    closing ? "scale-[0.97]" : "notif-modal-in"
                }`}
            >
                {/* HEADER */}
                <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#1F4B42] via-[#255A4F] to-[#2F6B5C] px-4 py-3.5 sm:px-5">
                    <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                            backgroundSize: "16px 16px",
                        }}
                    />
                    <div className="relative flex items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
                            <BellRing size={19} strokeWidth={1.9} className="notif-bell" />
                            {totalCount > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#255A4F] bg-[#E2B25C] px-1 text-[9px] font-bold text-[#3A2A0A]">
                                    {totalCount > 99 ? "99+" : totalCount}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3
                                id="notification-alert-title"
                                className="truncate text-[15px] font-bold leading-tight tracking-[-0.2px] text-white"
                            >
                                {totalCount > 0
                                    ? `You have ${totalCount} ${isPendingMode ? "pending " : ""}notification${totalCount > 1 ? "s" : ""}`
                                    : "Notifications"}
                            </h3>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-white/70">
                                Click any card to open the record
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                            <button
                                type="button"
                                onClick={loadNotifications}
                                disabled={loading}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 transition duration-300 hover:rotate-90 hover:bg-white/15 hover:text-white"
                                title="Close (Esc)"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* quick summary */}
                    {notifications.length > 0 && (
                        <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
                            {[
                                { label: "Pending", value: pendingCount, icon: Clock3 },
                                { label: "Completed", value: completedCount, icon: CheckCircle2 },
                                { label: "Unread", value: unreadCount, icon: MailOpen },
                            ].map(({ label, value, icon: Icon }) => (
                                <span
                                    key={label}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold text-white/80"
                                >
                                    <Icon size={12} className="text-[#BFE0CD]" />
                                    <span className="font-bold text-white">{value}</span>
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* BODY */}
                <div className="notif-scroll min-h-[160px] flex-1 overflow-y-auto overscroll-contain bg-[#F6F9F7] py-3 pl-3 pr-1.5">
                    {loading && <NotificationSkeleton count={3} />}

                    {!loading && error && (
                        <div className="notif-fade-in flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F0D6D0] bg-[#FCF0ED] text-[#B45F50]">
                                <AlertCircle size={24} />
                            </div>
                            <p className="text-[14px] font-bold text-[#354540]">Something went wrong</p>
                            <p className="mt-1 max-w-sm text-[12px] leading-5 text-[#89938F]">{error}</p>
                            <button
                                type="button"
                                onClick={loadNotifications}
                                className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#24564E] px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#19463F]"
                            >
                                <RefreshCw size={13} /> Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && notifications.length === 0 && (
                        <div className="notif-fade-in flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#D7E5DA] bg-gradient-to-br from-white to-[#E8F1EA] text-[#6C8B7D]">
                                <Inbox size={30} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-[15px] font-bold text-[#354F44]">You're all caught up</h4>
                            <p className="mt-1 max-w-xs text-[12px] leading-5 text-[#89938F]">
                                No pending notifications right now.
                            </p>
                        </div>
                    )}

                    {!loading && !error && notifications.length > 0 && (
                        <div className="space-y-2">
                            {notifications.map((item, index) => (
                                <NotificationCard
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    variant="compact"
                                    onOpen={handleOpenRecord}
                                />
                            ))}

                            {hiddenCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleViewAll}
                                    className="group flex w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#C9D9CF] bg-white/70 px-4 py-2.5 transition hover:border-[#8EAD9B] hover:bg-white"
                                >
                                    <Bell size={13} className="text-[#7B8D83]" />
                                    <span className="text-[12px] font-medium text-[#64776D]">
                                        and <span className="font-bold text-[#3E6852]">{hiddenCount}</span>{" "}
                                        more notification{hiddenCount > 1 ? "s" : ""} waiting for you
                                    </span>
                                    <ArrowRight size={13} className="text-[#3E6852] transition-transform group-hover:translate-x-1" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E5EAE5] bg-white px-4 py-2.5 sm:px-5">
                    <div className="min-w-0">
                        <button
                            type="button"
                            onClick={handleViewAll}
                            className="group inline-flex items-center gap-1 text-[12px] font-semibold text-[#3E7460] transition hover:text-[#24564E]"
                        >
                            View all
                            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                        </button>
                        {/* <p className="mt-0.5 flex items-center gap-1 text-[9px] font-medium tracking-wide text-[#A0ACA5]">
                            <ShieldCheck size={9} /> VidyaGxP • Notification Alert
                        </p> */}
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex h-[34px] shrink-0 items-center justify-center gap-1.5 rounded-[9px] bg-gradient-to-r from-[#24564E] to-[#2F6B5C] px-5 text-[12px] font-bold text-white shadow-[0_5px_14px_-6px_rgba(36,86,78,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-6px_rgba(36,86,78,0.6)]"
                    >
                        <CheckCircle2 size={13} />
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationAlertModal;
