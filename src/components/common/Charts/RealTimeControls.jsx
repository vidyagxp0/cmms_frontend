import React from "react";
import { RefreshCw, Radio } from "lucide-react";

const RealTimeControls = ({
    lastUpdated,
    onRefresh,
    isRefreshing = false,
    autoRefreshInterval,
    setAutoRefreshInterval,
}) => {
    return (
        <div
            className="
                flex
                flex-wrap
                items-center
                gap-2
                rounded-[12px]
                border
                border-[#D6D8D3]
                bg-[#F7F6F2]
                px-2
                py-1.5
                shadow-[0_2px_8px_rgba(36,50,56,0.045)]
                text-xs
                text-[#667370]
            "
        >
            {/* =====================================================
                LIVE STATUS
            ====================================================== */}
            <div
                className="
                    flex
                    items-center
                    gap-1.5
                    border-r
                    border-[#D9DCD8]
                    pr-2.5
                "
            >
                {/* STATUS DOT */}
                <span className="relative flex h-[7px] w-[7px]">
                    <span
                        className="
                            absolute
                            inline-flex
                            h-full
                            w-full
                            animate-ping
                            rounded-full
                            bg-[#8FB8A9]
                            opacity-60
                        "
                    />

                    <span
                        className="
                            relative
                            inline-flex
                            h-[7px]
                            w-[7px]
                            rounded-full
                            bg-[#56766D]
                        "
                    />
                </span>

                {/* RADIO ICON */}
                <Radio
                    size={13}
                    strokeWidth={1.9}
                    className="
                        animate-pulse
                        text-[#56766D]
                    "
                />

                {/* LABEL */}
                <span
                    className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.1em]
                        text-[#56766D]
                    "
                >
                    Live Data
                </span>
            </div>

            {/* =====================================================
                LAST UPDATED
            ====================================================== */}
            {lastUpdated && (
                <div
                    className="
                        hidden
                        items-center
                        gap-1.5
                        whitespace-nowrap
                        px-1
                        text-[10.5px]
                        font-medium
                        text-[#858E8B]
                        sm:flex
                    "
                >
                    <span>Updated</span>

                    <span
                        className="
                            rounded-md
                            border
                            border-[#E0E2DE]
                            bg-white
                            px-1.5
                            py-[3px]
                            font-mono
                            text-[10px]
                            font-semibold
                            tracking-[0.01em]
                            text-[#53615F]
                        "
                    >
                        {lastUpdated}
                    </span>
                </div>
            )}

            {/* =====================================================
                AUTO REFRESH
            ====================================================== */}
            {setAutoRefreshInterval && (
                <div className="flex items-center gap-1.5">

                    <span
                        className="
                            hidden
                            text-[10.5px]
                            font-semibold
                            text-[#858E8B]
                            md:inline
                        "
                    >
                        Sync
                    </span>

                    <div className="relative">
                        <select
                            value={autoRefreshInterval}
                            onChange={(e) =>
                                setAutoRefreshInterval(
                                    Number(e.target.value)
                                )
                            }
                            className="
                                appearance-none
                                rounded-[8px]
                                border
                                border-[#D9DCD8]
                                bg-white
                                py-1
                                pl-2.5
                                pr-7
                                text-[10.5px]
                                font-semibold
                                text-[#53615F]
                                outline-none
                                transition-all
                                duration-150
                                hover:border-[#C2CCC7]
                                focus:border-[#9DBAB0]
                                focus:ring-2
                                focus:ring-[#DCE7E2]
                            "
                        >
                            <option value={0}>
                                Manual Only
                            </option>

                            <option value={10}>
                                Every 10s
                            </option>

                            <option value={30}>
                                Every 30s
                            </option>

                            <option value={60}>
                                Every 60s
                            </option>
                        </select>

                        {/* CUSTOM CHEVRON */}
                        <span
                            className="
                                pointer-events-none
                                absolute
                                right-2
                                top-1/2
                                -translate-y-1/2
                                text-[9px]
                                text-[#7F8986]
                            "
                        >
                            ▼
                        </span>
                    </div>
                </div>
            )}

            {/* =====================================================
                REFRESH BUTTON
            ====================================================== */}
            <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh dashboard data now"
                className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-[8px]
                    border
                    border-[#BFCFC8]
                    bg-[#E8F0ED]
                    px-2.5
                    py-1.5
                    text-[10.5px]
                    font-bold
                    text-[#56766D]
                    shadow-[0_1px_4px_rgba(86,118,109,0.05)]
                    transition-all
                    duration-200
                    hover:border-[#AFC4BB]
                    hover:bg-[#DCE7E2]
                    hover:text-[#3F6259]
                    active:scale-[0.96]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >
                <RefreshCw
                    size={12}
                    strokeWidth={2}
                    className={`
                        transition-transform
                        duration-500
                        ${
                            isRefreshing
                                ? "animate-spin text-[#56766D]"
                                : ""
                        }
                    `}
                />

                <span>
                    {isRefreshing
                        ? "Syncing..."
                        : "Refresh"}
                </span>
            </button>
        </div>
    );
};

export default RealTimeControls;