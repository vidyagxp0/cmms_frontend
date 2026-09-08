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
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 shadow-2xs backdrop-blur-xs text-xs text-slate-600">
            {/* LIVE INDICATOR */}
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 pr-2 border-r border-slate-200">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Radio size={13} className="text-emerald-600 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Live Data
                </span>
            </div>

            {/* LAST UPDATED */}
            {lastUpdated && (
                <div className="text-[11px] text-slate-500 hidden sm:block">
                    Updated: <span className="font-mono font-medium text-slate-700">{lastUpdated}</span>
                </div>
            )}

            {/* AUTO REFRESH DROPDOWN */}
            {setAutoRefreshInterval && (
                <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 hidden md:inline">Sync:</span>
                    <select
                        value={autoRefreshInterval}
                        onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-teal-500"
                    >
                        <option value={0}>Manual Only</option>
                        <option value={10}>Every 10s</option>
                        <option value={30}>Every 30s</option>
                        <option value={60}>Every 60s</option>
                    </select>
                </div>
            )}

            {/* REFRESH BUTTON */}
            <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#185B61] px-2.5 py-1 text-[11px] font-semibold border border-teal-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Refresh dashboard data now"
            >
                <RefreshCw
                    size={12}
                    className={`transition-transform duration-500 ${
                        isRefreshing ? "animate-spin text-teal-700" : ""
                    }`}
                />
                <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
            </button>
        </div>
    );
};

export default RealTimeControls;
