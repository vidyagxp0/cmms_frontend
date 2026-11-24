import { ArrowUpRight } from "lucide-react";

/**
 * Sr. No. cell for record tables.
 *
 * Shows the row's serial number as an obviously clickable "open record" link:
 * link-coloured pill, arrow icon, pointer cursor, hover/press feedback,
 * tooltip and keyboard focus ring. Navigation is fully owned by the caller
 * (`onClick`), so each dashboard keeps its own routing rules.
 */
const SrNoLink = ({ value, onClick, title = "Open record" }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={`${title} — Sr. No. ${value}`}
        className="
            group inline-flex min-w-[52px] cursor-pointer items-center justify-center gap-1
            rounded-lg border border-[#BFD3CA] bg-[#EEF5F1] px-2.5 py-1.5
            text-[11px] font-bold tabular-nums text-[#2F6457]
            shadow-[0_1px_3px_rgba(36,50,56,0.06)]
            transition-all duration-200 ease-out
            hover:-translate-y-px hover:border-[#8FB3A5] hover:bg-[#DDEBE4] hover:text-[#1F4E43]
            hover:shadow-[0_4px_10px_rgba(47,100,87,0.16)]
            active:translate-y-0 active:scale-[0.97]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E9487]/45 focus-visible:ring-offset-1
        "
    >
        <span className="underline decoration-[#2F6457]/30 decoration-dotted underline-offset-[3px] group-hover:decoration-solid group-hover:decoration-[#1F4E43]/60">
            {value}
        </span>
        <ArrowUpRight
            size={12}
            strokeWidth={2.4}
            aria-hidden="true"
            className="shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-100"
        />
    </button>
);

export default SrNoLink;
