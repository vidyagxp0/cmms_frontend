import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    BellRing,
    Clock3,
    CheckCircle2,
    X,
    RefreshCw,
    Inbox,
    FileText,
    CalendarDays,
    ArrowRight,
    ShieldCheck,
    UserRound,
    Layers,
    AlertCircle,
    ExternalLink,
} from "lucide-react";
import { getRecordNotifications } from "../../../services/usersApi/workflowCommonApi";

const SESSION_KEY = "vgxp_notification_modal_shown";

/* ───────── Date helpers ───────── */
const formatDateTime = (date) => {
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

const timeAgo = (date) => {
    if (!date) return "-";
    const diffSec = Math.max(0, Math.floor((new Date() - new Date(date)) / 1000));
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

/* ═════════════════════════════════════════════════════════════════
   ROUTE RESOLVER
   Maps a notification → the correct `/user/...` panel route.
   Uses message text to detect the module, then builds the URL.

   Order matters — match more specific phrases first.
═════════════════════════════════════════════════════════════════ */
const resolveNotificationRoute = (item) => {
    if (!item) return null;

    const recordId = item.record_id;
    if (!recordId) return null;

    const text = `${item.title || ""} ${item.message || ""}`.toLowerCase();

    // Master data records — record_type based
    if (item.record_type?.includes("Equipment")) {
        return `/user/equipment-panel/${recordId}`;
    }

    // Unplanned calibration child FIRST (before parent calibration)
    if (text.includes("unplanned calibration")) {
        // child record detection — message usually mentions "Calibration Child"
        if (text.includes("child") || text.includes("management")) {
            return `/user/unplanned-calibration-management-panel/${recordId}`;
        }
        return `/user/unplanned-calibration-panel/${recordId}`;
    }

    if (text.includes("addendum calibration")) {
        return `/user/addendum-calibration-management-panel/${recordId}`;
    }
    if (text.includes("addendum preventive")) {
        return `/user/addendum-preventive-planner-panel/${recordId}`;
    }
    if (text.includes("preventive maintenance")) {
        // Planner vs execution
        if (text.includes("planner")) {
            return `/user/preventive-maintenance-planner-panel/${recordId}`;
        }
        return `/user/preventive-maintenance-panel/${recordId}`;
    }
    if (text.includes("field instrument calibration")) {
        return `/user/field-instrument-calibration-addendum-panel/${recordId}`;
    }
    if (text.includes("field instrument")) {
        return `/user/field-instruments-planner-panel/${recordId}`;
    }
    if (text.includes("spare instrument")) {
        return `/user/spare-instrument-calibration-master-panel/${recordId}`;
    }
    if (text.includes("equipment master")) {
        return `/user/equipment-master-panel/${recordId}`;
    }

    // Calibration — management/child first, then planner
    if (text.includes("calibration management") || text.includes("calibration child")) {
        return `/user/calibration-management-panel/${recordId}`;
    }
    if (text.includes("calibration planner") || text.includes("calibration")) {
        return `/user/calibration-planner-panel/${recordId}`;
    }

    return null;
};

/* Extract friendly module label for display */
const resolveModuleLabel = (item) => {
    const text = `${item.title || ""} ${item.message || ""}`.toLowerCase();

    if (text.includes("unplanned calibration")) return "Unplanned Calibration";
    if (text.includes("addendum calibration")) return "Addendum Calibration";
    if (text.includes("addendum preventive")) return "Addendum Preventive";
    if (text.includes("preventive maintenance")) return "Preventive Maintenance";
    if (text.includes("field instrument calibration")) return "FI Calibration";
    if (text.includes("field instrument")) return "Field Instrument";
    if (text.includes("spare instrument")) return "Spare Instrument";
    if (text.includes("equipment master")) return "Equipment Master";
    if (text.includes("calibration")) return "Calibration Planner";
    if (text.includes("equipment")) return "Equipment";
    return null;
};

const NotificationAlertModal = ({
    enabled = true,
    status = "pending",
    limit = 5,
    viewAllRoute = "/user/notification-list",
}) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const markShown = useCallback(() => {
        try {
            sessionStorage.setItem(SESSION_KEY, "1");
        } catch (_) {}
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
        } catch (_) {}
        if (alreadyShown) return;
        loadNotifications();
    }, [enabled, loadNotifications]);

    const handleClose = useCallback(() => {
        setOpen(false);
        markShown();
    }, [markShown]);

    const handleViewAll = useCallback(() => {
        setOpen(false);
        markShown();
        navigate(viewAllRoute);
    }, [markShown, navigate, viewAllRoute]);

    /* ── NEW: navigate to the record ── */
    const handleOpenRecord = useCallback(
        (item) => {
            const route = resolveNotificationRoute(item);
            setOpen(false);
            markShown();
            if (route) {
                navigate(route);
            } else {
                // fallback: send to full notification list
                navigate(viewAllRoute);
            }
        },
        [markShown, navigate, viewAllRoute]
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

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center px-3 py-4 sm:px-6 sm:py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-alert-title"
        >
            <div
                className="absolute inset-0 bg-[#0F231D]/55 backdrop-blur-[4px]"
                onClick={handleClose}
            />

            <div className="relative z-10 flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-[20px] border border-[#D5DED8] bg-white shadow-[0_28px_70px_-14px_rgba(15,35,29,0.45)]">

                {/* HEADER */}
                <div className="relative overflow-hidden border-b border-[#DDE6E0] bg-gradient-to-br from-[#1F4B42] via-[#255A4F] to-[#2C6456] px-5 py-5 sm:px-6">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-start gap-3.5 sm:gap-4">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner ring-1 ring-white/20">
                            <BellRing size={22} strokeWidth={1.9} />
                            {totalCount > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-[#255A4F] bg-[#E2B25C] px-1 text-[10px] font-bold text-[#3A2A0A] shadow">
                                    {totalCount > 99 ? "99+" : totalCount}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[17px] font-bold leading-tight tracking-[-0.3px] text-white sm:text-[18px]">
                                {totalCount > 0
                                    ? `You have ${totalCount} pending notification${totalCount > 1 ? "s" : ""}`
                                    : "Notifications"}
                            </h3>
                            <p className="mt-1 text-[12px] font-medium leading-4 text-white/75">
                                Tap any item to jump straight to the record
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={loadNotifications}
                                disabled={loading}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/12 hover:text-white"
                                title="Close"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-6 py-10">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2EC] text-[#477866]">
                                <RefreshCw size={24} className="animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-[13px] font-semibold text-[#3C544B]">
                                    Loading notifications…
                                </p>
                                <p className="mt-1 text-[11px] text-[#8B9993]">
                                    Please wait while we fetch your updates
                                </p>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
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
                        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
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
                        <>
                            <ul className="divide-y divide-[#EDF1EC]">
                                {notifications.map((item) => {
                                    const isPending =
                                        (item.status || "").toLowerCase() === "pending";
                                    const isUnread = !item.read_at;
                                    const targetRoute = resolveNotificationRoute(item);
                                    const moduleLabel = resolveModuleLabel(item);
                                    const clickable = Boolean(targetRoute);

                                    return (
                                        <li key={item.id} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenRecord(item)}
                                                className={`group relative flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors sm:px-6 ${
                                                    clickable
                                                        ? "cursor-pointer hover:bg-[#F6FAF7] focus:bg-[#F6FAF7] focus:outline-none"
                                                        : "cursor-default"
                                                }`}
                                                title={
                                                    clickable
                                                        ? "Open record"
                                                        : "Open notifications list"
                                                }
                                            >
                                                {isUnread && (
                                                    <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#4A8A70] to-[#6AAE8E]" />
                                                )}

                                                {/* icon */}
                                                <div
                                                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border ${
                                                        isPending
                                                            ? "border-[#EBDDC4] bg-gradient-to-br from-[#FBF4E8] to-[#F6EAD1] text-[#A47D45]"
                                                            : "border-[#CFE0D5] bg-gradient-to-br from-[#EFF7F1] to-[#DCEDE2] text-[#4E795E]"
                                                    }`}
                                                >
                                                    {isPending ? (
                                                        <Clock3 size={19} />
                                                    ) : (
                                                        <CheckCircle2 size={20} />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <h4
                                                            className="min-w-0 flex-1 text-[13px] font-bold leading-[18px] text-[#233F36] group-hover:text-[#1A5343]"
                                                            title={item.title || "Notification"}
                                                        >
                                                            <span className="line-clamp-2">
                                                                {item.title || "Notification"}
                                                            </span>
                                                        </h4>

                                                        <span
                                                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.05em] ${
                                                                isPending
                                                                    ? "border-[#E6D5B8] bg-[#FBF4E8] text-[#8B6630]"
                                                                    : "border-[#C9DFD0] bg-[#EDF6EF] text-[#3E6852]"
                                                            }`}
                                                        >
                                                            {isPending ? (
                                                                <Clock3 size={10} />
                                                            ) : (
                                                                <CheckCircle2 size={10} />
                                                            )}
                                                            {isPending ? "Pending" : "Done"}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-[18px] text-[#687A72]">
                                                        {item.message || "No additional details available."}
                                                    </p>

                                                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                                        {moduleLabel && (
                                                            <span className="inline-flex items-center gap-1 rounded-md border border-[#DCE3DC] bg-[#EEF5F2] px-2 py-1 text-[10.5px] font-bold text-[#3E6852]">
                                                                <Layers size={11} />
                                                                {moduleLabel}
                                                            </span>
                                                        )}
                                                        {item.record_id && (
                                                            <span className="inline-flex items-center gap-1 rounded-md border border-[#DCE3DC] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#5A6E64]">
                                                                <FileText size={11} className="text-[#789184]" />
                                                                Record #{item.record_id}
                                                            </span>
                                                        )}
                                                        {item.role_name && (
                                                            <span className="inline-flex items-center gap-1 rounded-md border border-[#DCE3DC] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#5A6E64]">
                                                                <UserRound size={11} className="text-[#789184]" />
                                                                {item.role_name}
                                                            </span>
                                                        )}
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-md border border-[#DCE3DC] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#5A6E64]"
                                                            title={formatDateTime(item.created_at)}
                                                        >
                                                            <CalendarDays size={11} className="text-[#789184]" />
                                                            {timeAgo(item.created_at)}
                                                        </span>
                                                    </div>

                                                    {!isPending && item.completed_at && (
                                                        <p className="mt-2 text-[10.5px] font-medium text-[#8B9993]">
                                                            Completed{" "}
                                                            <span className="text-[#5A6E64]">
                                                                {timeAgo(item.completed_at)}
                                                            </span>{" "}
                                                            · {formatDateTime(item.completed_at)}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* hover affordance arrow */}
                                                {clickable && (
                                                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#A0AEA7] opacity-0 transition-all duration-200 group-hover:bg-[#E4F0E8] group-hover:text-[#3E6852] group-hover:opacity-100">
                                                        <ExternalLink size={13} />
                                                    </div>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            {hiddenCount > 0 && (
                                <div className="flex items-center justify-center gap-2 border-t border-[#EDF1EC] bg-[#F7FAF6] px-5 py-3">
                                    <Bell size={12} className="text-[#7B8D83]" />
                                    <p className="text-[11.5px] font-medium text-[#64776D]">
                                        and{" "}
                                        <span className="font-bold text-[#3E6852]">{hiddenCount}</span>{" "}
                                        more notification{hiddenCount > 1 ? "s" : ""} waiting for you
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex flex-col gap-3 border-t border-[#E5EAE5] bg-[#F7F9F5] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <button
                        type="button"
                        onClick={handleViewAll}
                        className="inline-flex items-center gap-1.5 self-start text-[12px] font-semibold text-[#3E7460] transition hover:text-[#24564E] hover:underline"
                    >
                        View all notifications
                        <ArrowRight size={13} />
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex h-[38px] w-full items-center justify-center rounded-[10px] bg-[#24564E] px-5 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#1B453E] hover:shadow-md sm:w-auto"
                    >
                        Got it
                    </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 border-t border-[#E8ECE7] bg-white py-2">
                    <ShieldCheck size={10} className="text-[#8AA294]" />
                    <p className="text-[9.5px] font-medium tracking-wide text-[#9AA69F]">
                        VidyaGxP • Notification Alert
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotificationAlertModal;