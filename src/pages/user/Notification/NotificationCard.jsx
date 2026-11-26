import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    ExternalLink,
    FileText,
    Layers,
    Mail,
    MailCheck,
    ShieldCheck,
    UserRound,
    XCircle,
} from "lucide-react";
import {
    formatDateTime,
    isCancelledStage,
    isClosedStage,
    moduleAccent,
    parseNotification,
    timeAgo,
} from "./notificationUtils";
import {
    resolveNotificationModuleLabel,
    resolveNotificationRoute,
} from "../../../utils/notificationRoutes";

/* Small pill showing a workflow stage */
const StagePill = ({ name, current = false }) => {
    if (!name) return null;
    const cancelled = isCancelledStage(name);
    const closed = isClosedStage(name);

    let cls = "border-[#DCE3DC] bg-white text-[#5F7168]";
    if (current && cancelled) cls = "border-[#E9C3C5] bg-[#FBECEC] text-[#A8393E]";
    else if (current && closed) cls = "border-[#BFDCCB] bg-[#E6F4EB] text-[#256B4C]";
    else if (current) cls = "border-[#C9D8F0] bg-[#EBF1FB] text-[#35558F]";

    return (
        <span
            className={`inline-flex max-w-full items-center gap-1 truncate rounded-full border px-2.5 py-[3px] text-[10.5px] font-semibold ${cls}`}
            title={name}
        >
            {current && cancelled && <XCircle size={11} className="shrink-0" />}
            {current && !cancelled && closed && <CheckCircle2 size={11} className="shrink-0" />}
            <span className="truncate">{name}</span>
        </span>
    );
};

const MetaChip = ({ icon: Icon, children, title }) => (
    <span
        title={title}
        className="inline-flex items-center gap-1.5 rounded-md border border-[#E1E7E2] bg-[#FAFCFA] px-2 py-1 text-[10.5px] font-medium text-[#5E6F67]"
    >
        <Icon size={11} className="shrink-0 text-[#7F978A]" />
        {children}
    </span>
);

/**
 * Detailed notification card.
 * variant: "list" (full page) | "compact" (modal)
 */
const NotificationCard = ({ item, onOpen, index = 0, variant = "list" }) => {
    const isPending = (item?.status || "").toLowerCase() === "pending";
    const isUnread = !item?.read_at;
    const route = resolveNotificationRoute(item);
    const moduleLabel = resolveNotificationModuleLabel(item);
    const accent = moduleAccent(item);
    const { recordNo, fromStage, toStage, actor, note } = parseNotification(item);
    const compact = variant === "compact";

    const handleKey = (e) => {
        if (route && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onOpen?.(item);
        }
    };

    return (
        <div
            role={route ? "button" : undefined}
            tabIndex={route ? 0 : undefined}
            onClick={() => route && onOpen?.(item)}
            onKeyDown={handleKey}
            title={route ? "Open record" : undefined}
            style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
            className={`notif-card-in group relative overflow-hidden rounded-[14px] border bg-white transition-all duration-300 ${
                route
                    ? "cursor-pointer hover:-translate-y-[2px] hover:border-[#B9D1C3] hover:shadow-[0_12px_28px_-10px_rgba(36,79,69,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9EC2AE]"
                    : ""
            } ${isUnread ? "border-[#D3E2D8] shadow-[0_3px_12px_rgba(36,79,69,0.07)]" : "border-[#E3E9E4] shadow-[0_1px_4px_rgba(36,79,69,0.04)]"}`}
        >
            {/* status accent stripe */}
            <span
                className={`absolute inset-y-0 left-0 w-[4px] ${
                    isPending
                        ? "bg-gradient-to-b from-[#E2B25C] to-[#C48A3A]"
                        : "bg-gradient-to-b from-[#4FA27A] to-[#2F7A59]"
                }`}
            />

            <div className={`flex items-start ${compact ? "gap-3 px-3.5 py-3 pl-4" : "gap-3.5 px-5 py-4 pl-6"}`}>
                {/* icon */}
                <div className="relative shrink-0">
                    <div
                        className={`flex items-center justify-center rounded-[12px] border transition-transform duration-300 group-hover:scale-105 ${
                            compact ? "h-9 w-9 [&>svg]:h-[17px] [&>svg]:w-[17px]" : "h-11 w-11"
                        } ${
                            isPending
                                ? "border-[#EBDDC4] bg-gradient-to-br from-[#FDF7EC] to-[#F5E7CC] text-[#A47D45]"
                                : "border-[#CFE0D5] bg-gradient-to-br from-[#F1F8F3] to-[#DCEDE2] text-[#3F7A5C]"
                        }`}
                    >
                        {isPending ? <Clock3 size={19} /> : <CheckCircle2 size={20} />}
                    </div>
                    {isUnread && (
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4FA27A] opacity-60" />
                            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-[#3E8F68]" />
                        </span>
                    )}
                </div>

                {/* body */}
                <div className="min-w-0 flex-1">
                    {/* top line: module + record no + status */}
                    <div className="flex flex-wrap items-center gap-2">
                        {moduleLabel && (
                            <span
                                className="inline-flex items-center gap-1 rounded-md border px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.04em]"
                                style={{ color: accent.fg, background: accent.bg, borderColor: accent.border }}
                            >
                                <Layers size={10} />
                                {moduleLabel}
                            </span>
                        )}
                        {recordNo && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#1F4B42] px-2 py-[3px] font-mono text-[10.5px] font-bold tracking-wide text-white">
                                <FileText size={10} />
                                {recordNo}
                            </span>
                        )}
                        <span className="ml-auto inline-flex items-center gap-2">
                            <span
                                className="text-[10.5px] font-medium text-[#8A9891]"
                                title={formatDateTime(item?.created_at)}
                            >
                                {timeAgo(item?.created_at)}
                            </span>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[9.5px] font-bold uppercase tracking-[0.06em] ${
                                    isPending
                                        ? "border-[#E6D5B8] bg-[#FBF4E8] text-[#8B6630]"
                                        : "border-[#C9DFD0] bg-[#EDF6EF] text-[#3E6852]"
                                }`}
                            >
                                {isPending ? <Clock3 size={10} /> : <CheckCircle2 size={10} />}
                                {isPending ? "Pending" : "Completed"}
                            </span>
                        </span>
                    </div>

                    {/* title */}
                    <h3
                        className={`mt-2 font-bold leading-[19px] text-[#21402F] transition-colors group-hover:text-[#17513F] ${
                            compact ? "mt-1.5 text-[12.5px] leading-[17px]" : "text-[13.5px]"
                        } ${isUnread ? "" : "font-semibold text-[#3A5248]"}`}
                    >
                        {item?.title || "Notification"}
                    </h3>

                    {/* stage transition */}
                    {(fromStage || toStage) && (
                        <div
                            className={`flex flex-wrap items-center gap-1.5 ${
                                compact
                                    ? "mt-2"
                                    : "mt-2.5 rounded-[10px] border border-[#E6ECE7] bg-gradient-to-r from-[#F7FAF8] to-white px-2.5 py-2"
                            }`}
                        >
                            <span className="mr-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#93A39A]">
                                Stage
                            </span>
                            <StagePill name={fromStage} />
                            {fromStage && toStage && (
                                <ArrowRight
                                    size={13}
                                    className="notif-arrow shrink-0 text-[#7FA090]"
                                />
                            )}
                            <StagePill name={toStage} current />
                        </div>
                    )}

                    {/* message — in compact mode the stage row already carries it, so show only the action note */}
                    {(!compact || !note) && (
                        <p
                            className={`mt-2 text-[11.5px] leading-[18px] text-[#677A71] ${
                                compact ? "line-clamp-2" : ""
                            }`}
                        >
                            {item?.message || "No additional details available."}
                        </p>
                    )}

                    {note && (
                        <p
                            className={`mt-2 flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold leading-[17px] ${
                                isPending
                                    ? "bg-[#FBF4E8] text-[#8B6630]"
                                    : "bg-[#EEF6F0] text-[#3E6852]"
                            }`}
                        >
                            {isPending ? (
                                <Clock3 size={13} className="mt-[2px] shrink-0" />
                            ) : (
                                <ShieldCheck size={13} className="mt-[2px] shrink-0" />
                            )}
                            <span>{note}</span>
                        </p>
                    )}

                    {/* meta chips */}
                    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "mt-2" : "mt-3"}`}>
                        {item?.role_name && (
                            <MetaChip icon={UserRound} title="Your role">
                                {item.role_name}
                            </MetaChip>
                        )}
                        {actor && (
                            <MetaChip icon={ShieldCheck} title="Action performed by">
                                by <span className="font-semibold text-[#3E5A4D]">{actor}</span>
                            </MetaChip>
                        )}
                        <MetaChip icon={CalendarDays} title="Received">
                            {formatDateTime(item?.created_at)}
                        </MetaChip>
                        {compact && route && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#2F6B58] transition-transform duration-300 group-hover:translate-x-0.5">
                                Open record <ArrowRight size={12} />
                            </span>
                        )}
                        {!compact && item?.completed_at && (
                            <MetaChip icon={CheckCircle2} title="Completed at">
                                Completed {formatDateTime(item.completed_at)}
                            </MetaChip>
                        )}
                        {!compact && (
                            <MetaChip
                                icon={item?.mailed_at ? MailCheck : Mail}
                                title={item?.mailed_at ? `Emailed ${formatDateTime(item.mailed_at)}` : "Not emailed"}
                            >
                                {item?.mailed_at ? "Email sent" : "No email"}
                            </MetaChip>
                        )}
                        {!compact && item?.record_id && (
                            <MetaChip icon={FileText} title="Record ID">
                                #{item.record_id}
                            </MetaChip>
                        )}
                    </div>
                </div>

                {/* open affordance */}
                {route && !compact && (
                    <div className="hidden shrink-0 self-center sm:block">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCE6DF] bg-white text-[#8AA195] transition-all duration-300 group-hover:border-[#2F6B58] group-hover:bg-[#24564E] group-hover:text-white group-hover:shadow-[0_6px_14px_-4px_rgba(36,86,78,0.5)]">
                            <ExternalLink size={14} />
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* Keyframes used by the card — rendered once per page */
export const NotificationStyles = () => (
    <style>{`
        @keyframes notifCardIn {
            from { opacity: 0; transform: translateY(8px) scale(0.99); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes notifModalIn {
            from { opacity: 0; transform: translateY(14px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes notifFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes notifArrow {
            0%, 100% { transform: translateX(0); }
            50%      { transform: translateX(3px); }
        }
        @keyframes notifShimmer {
            0%   { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }
        @keyframes notifBell {
            0%, 100% { transform: rotate(0); }
            10%, 30% { transform: rotate(-12deg); }
            20%, 40% { transform: rotate(12deg); }
            50%      { transform: rotate(0); }
        }
        .notif-card-in  { animation: notifCardIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .notif-modal-in { animation: notifModalIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .notif-fade-in  { animation: notifFadeIn 0.25s ease-out both; }
        .group:hover .notif-arrow { animation: notifArrow 1s ease-in-out infinite; }
        .notif-bell     { animation: notifBell 2.6s ease-in-out infinite; transform-origin: top center; }
        .notif-skeleton {
            background: linear-gradient(90deg, #EDF2EE 0px, #F7FAF8 80px, #EDF2EE 160px);
            background-size: 800px 100%;
            animation: notifShimmer 1.3s linear infinite;
        }
        /* slim themed scrollbar */
        .notif-scroll {
            scrollbar-width: thin;
            scrollbar-color: #A9C4B5 transparent;
            scrollbar-gutter: stable;
        }
        .notif-scroll::-webkit-scrollbar { width: 8px; }
        .notif-scroll::-webkit-scrollbar-track {
            background: transparent;
            margin: 8px 0;
        }
        .notif-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #B9D2C4, #8FB3A0);
            border-radius: 999px;
            border: 2px solid #F6F9F7;
        }
        .notif-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #8FB3A0, #4E8669);
        }
        .notif-scroll::-webkit-scrollbar-button { display: none; height: 0; }
        @media (prefers-reduced-motion: reduce) {
            .notif-card-in, .notif-modal-in, .notif-fade-in, .notif-bell,
            .group:hover .notif-arrow, .notif-skeleton { animation: none !important; }
        }
    `}</style>
);

/* Skeleton placeholder card */
export const NotificationSkeleton = ({ count = 4 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className="flex items-start gap-3.5 rounded-[14px] border border-[#E3E9E4] bg-white px-5 py-4"
            >
                <div className="notif-skeleton h-11 w-11 shrink-0 rounded-[12px]" />
                <div className="flex-1 space-y-2.5">
                    <div className="flex gap-2">
                        <div className="notif-skeleton h-4 w-28 rounded-md" />
                        <div className="notif-skeleton h-4 w-20 rounded-md" />
                    </div>
                    <div className="notif-skeleton h-4 w-3/4 rounded-md" />
                    <div className="notif-skeleton h-8 w-full rounded-[10px]" />
                    <div className="flex gap-2">
                        <div className="notif-skeleton h-5 w-20 rounded-md" />
                        <div className="notif-skeleton h-5 w-32 rounded-md" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default NotificationCard;
