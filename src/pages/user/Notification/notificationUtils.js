/* Shared presentation helpers for NotificationList + NotificationAlertModal */

export const formatDateTime = (date) => {
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

export const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

export const timeAgo = (date) => {
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

/* "Today" / "Yesterday" / "24 Nov 2026" — used to group the list by day */
export const dayLabel = (date) => {
    if (!date) return "Earlier";
    const d = new Date(date);
    const today = new Date();
    const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diffDays = Math.round((startOf(today) - startOf(d)) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

/* Pull structured details out of the title/message text.
   e.g. "PA/26/002 (Preventive Addendum) was moved from Pending QA Approval
         to Closed - Done by qa_approver. No further action is required from you." */
export const parseNotification = (item) => {
    const title = item?.title || "";
    const message = item?.message || "";

    const recordNo =
        (title.match(/\b[A-Z]{1,8}\/\d{2,4}\/\d{1,6}\b/) ||
            message.match(/\b[A-Z]{1,8}\/\d{2,4}\/\d{1,6}\b/) ||
            [])[0] || null;

    /* Stage names can themselves contain "By" (e.g. "Reviewed By HOD/Designee"),
       so the actor is the LAST lower-case " by <user>." in the sentence. */
    const transition = message.match(/moved from (.+?) to (.+) by ([^\s.]+)\./);
    const titleStage = title.match(/is now at (.+)$/i)?.[1]?.trim() || null;
    const fromStage = transition?.[1]?.trim() || null;
    const toStage = titleStage || transition?.[2]?.trim() || null;
    const actor = transition?.[3]?.trim() || null;

    /* sentence after the transition, e.g. "Your action is required as HOD/Designee." */
    const actorEnd = transition ? message.indexOf(transition[0]) + transition[0].length : -1;
    const note =
        actorEnd > 0
            ? message.slice(actorEnd).trim() || null
            : null;

    return { recordNo, fromStage, toStage, actor, note };
};

/* Module accent colours — keyed by process_id */
const ACCENTS = [
    { fg: "#2F6B58", bg: "#E7F3EC", border: "#C7E0D1" }, // green
    { fg: "#3C5A99", bg: "#E9EFFB", border: "#CCD8F1" }, // indigo
    { fg: "#9A6A22", bg: "#FBF2E2", border: "#EEDCB8" }, // amber
    { fg: "#2E7487", bg: "#E5F3F6", border: "#C3E0E8" }, // teal
    { fg: "#7A4E9C", bg: "#F3EBFA", border: "#DECDEE" }, // violet
    { fg: "#A2475A", bg: "#FBEBEE", border: "#F0CCD4" }, // rose
];

export const moduleAccent = (item) => {
    const id = Number(item?.process_id ?? item?.process?.id) || 0;
    return ACCENTS[id % ACCENTS.length];
};

export const isClosedStage = (stage) => /closed|done|complete/i.test(stage || "");
export const isCancelledStage = (stage) => /cancel/i.test(stage || "");
