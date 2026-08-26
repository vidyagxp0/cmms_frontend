import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

const ProcessTabs = ({ tabs = [], activeTab, onTabChange }) => {
    const [search, setSearch] = useState("");

    const filteredTabs = useMemo(() => {
        const value = search.trim().toLowerCase();
        if (!value) return tabs;
        return tabs.filter((tab) =>
            tab.label.toLowerCase().includes(value)
        );
    }, [tabs, search]);

    return (
        <div className="w-full rounded-xl border border-[#D5DEDA] bg-[#4E7585] p-2.5 shadow-[0_6px_20px_rgba(48,74,83,0.12)] sm:p-3">
            <div className="flex w-full items-center gap-3">
                {/* Tabs */}
                <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="scrollbar-none flex w-full items-center gap-1 overflow-x-auto">
                        {filteredTabs.length > 0 ? (
                            filteredTabs.map((tab) => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => onTabChange(tab.id)}
                                        className={`
                                            group relative flex h-9 shrink-0
                                            items-center gap-1.5 rounded-lg
                                            px-3.5 text-[11px] font-semibold
                                            tracking-[-0.01em] whitespace-nowrap
                                            transition-all duration-200
                                            active:scale-[0.98]
                                            ${
                                                active
                                                    ? "bg-white text-[#263B35] shadow-[0_3px_10px_rgba(0,0,0,0.12)]"
                                                    : "text-[#E4ECE9] hover:bg-white/10 hover:text-white"
                                            }
                                        `}
                                    >
                                        {Icon && (
                                            <Icon
                                                size={13}
                                                strokeWidth={1.9}
                                                className={`
                                                    shrink-0 transition-colors duration-200
                                                    ${
                                                        active
                                                            ? "text-[#4E7585]"
                                                            : "text-[#BFD0CA] group-hover:text-white"
                                                    }
                                                `}
                                            />
                                        )}

                                        <span>{tab.label}</span>

                                        {active && (
                                            <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-[#4E7585]" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <span className="px-2 text-[10px] font-medium text-[#E0E9E5]">
                                No tabs found
                            </span>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-[190px] shrink-0">
                    <Search
                        size={13}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#81969D]"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tabs..."
                        className="h-8 w-full rounded-lg border border-[#D6E0DC] bg-white pl-8 pr-8 text-[10px] font-medium text-[#34453E] outline-none transition-all duration-200 placeholder:text-[#9AA7A2] focus:border-[#B8CBC3] focus:ring-2 focus:ring-white/20"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear tab search"
                            className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-[#7B8983] transition-all duration-200 hover:bg-[#EEF2F0] hover:text-[#34453E] active:scale-90"
                        >
                            <X size={11} strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProcessTabs;