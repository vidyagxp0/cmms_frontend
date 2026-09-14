import React, {
    useMemo,
    useState,
} from "react";

import {
    Search,
    X,
} from "lucide-react";

const ProcessTabs = ({
    tabs = [],
    activeTab,
    onTabChange,
}) => {
    const [search, setSearch] = useState("");

    const filteredTabs = useMemo(() => {
        const value = search
            .trim()
            .toLowerCase();

        if (!value) {
            return tabs;
        }

        return tabs.filter((tab) =>
            tab.label
                .toLowerCase()
                .includes(value)
        );
    }, [tabs, search]);

    return (
        <div
            className="
                w-full
                overflow-hidden
                rounded-[12px]
                bg-[#244F4A]
            "
        >
            <div
                className="
                    flex
                    h-[54px]
                    w-full
                    items-center
                "
            >
                {/* =================================================
                    TAB STRIP
                    ONLY THIS AREA SCROLLS HORIZONTALLY
                ================================================== */}
                <div
                    className="
                        min-w-0
                        flex-1
                        self-stretch
                        overflow-x-auto
                        overflow-y-hidden
                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-[#698D85]
                        overscroll-x-contain
                    "
                >
                    <div
                        className="
                            flex
                            h-full
                            w-max
                            min-w-full
                            items-center
                            gap-1.5
                            px-3
                            sm:px-4
                        "
                    >
                        {filteredTabs.length > 0 ? (
                            filteredTabs.map((tab) => {
                                const Icon = tab.icon;
                                const active =
                                    activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() =>
                                            onTabChange(tab.id)
                                        }
                                        title={tab.label}
                                        className={`
                                            group
                                            relative
                                            flex
                                            h-[36px]
                                            shrink-0
                                            items-center
                                            gap-2
                                            rounded-[10px]
                                            border
                                            px-3
                                            transition-all
                                            duration-200
                                            ease-out
                                            focus:outline-none
                                            focus-visible:ring-2
                                            focus-visible:ring-[#AFC7C1]
                                            focus-visible:ring-offset-1
                                            focus-visible:ring-offset-[#244F4A]

                                            ${
                                                active
                                                    ? `
                                                        border-white/20
                                                        bg-[#F1F0EB]
                                                        text-[#244F4A]
                                                        shadow-[0_3px_10px_-4px_rgba(0,0,0,0.35)]
                                                    `
                                                    : `
                                                        border-transparent
                                                        bg-transparent
                                                        text-[#C7D8D3]
                                                        hover:border-white/10
                                                        hover:bg-white/10
                                                        hover:text-white
                                                    `
                                            }
                                        `}
                                    >
                                        {/* ICON */}
                                        {Icon && (
                                            <span
                                                className={`
                                                    flex
                                                    h-[27px]
                                                    w-[27px]
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-[8px]
                                                    transition-all
                                                    duration-200

                                                    ${
                                                        active
                                                            ? `
                                                                bg-[#E8F0ED]
                                                                text-[#56766D]
                                                            `
                                                            : `
                                                                bg-transparent
                                                                text-[#B7CBC5]
                                                                group-hover:text-white
                                                            `
                                                    }
                                                `}
                                            >
                                                <Icon
                                                    size={14}
                                                    strokeWidth={
                                                        active
                                                            ? 2.1
                                                            : 1.8
                                                    }
                                                />
                                            </span>
                                        )}

                                        {/* LABEL
                                            EXACTLY SAME TYPOGRAPHY
                                            AS DASHBOARD ACTION BAR */}
                                        <span
                                            className="
                                                whitespace-nowrap
                                                font-[var(--font-display)]
                                                text-[12px]
                                                font-bold
                                                tracking-[-0.02em]
                                            "
                                        >
                                            {tab.label}
                                        </span>

                                        {/* ACTIVE INDICATOR */}
                                        {active && (
                                            <span
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    -bottom-[9px]
                                                    left-1/2
                                                    h-[3px]
                                                    w-[26px]
                                                    -translate-x-1/2
                                                    rounded-full
                                                    bg-[#A47D45]
                                                "
                                            />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <span
                                className="
                                    flex
                                    h-full
                                    items-center
                                    px-2
                                    text-[10px]
                                    font-medium
                                    text-[#D2DEDA]
                                "
                            >
                                No tabs found
                            </span>
                        )}
                    </div>
                </div>

                {/* =================================================
                    DESKTOP SEARCH
                    FIXED — DOES NOT SCROLL
                ================================================== */}
                <div
                    className="
                        hidden
                        w-[200px]
                        shrink-0
                        px-3
                        lg:block
                    "
                >
                    <div className="relative w-full">
                        <Search
                            size={13}
                            strokeWidth={1.8}
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-[#AFC4BE]
                            "
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search tabs..."
                            className="
                                h-[32px]
                                w-full
                                rounded-[8px]
                                border
                                border-white/20
                                bg-white/10
                                pl-8
                                pr-8
                                text-[10px]
                                font-medium
                                text-white
                                outline-none
                                placeholder:text-[#B7C8C3]
                                hover:border-white/30
                                hover:bg-white/15
                                focus:border-white/40
                                focus:bg-white/15
                                focus:ring-2
                                focus:ring-white/10
                            "
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                                aria-label="Clear tab search"
                                className="
                                    absolute
                                    right-1.5
                                    top-1/2
                                    flex
                                    h-5
                                    w-5
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-[6px]
                                    text-[#B8C9C4]
                                    transition-all
                                    duration-150
                                    hover:bg-white/10
                                    hover:text-white
                                    active:scale-90
                                    focus:outline-none
                                "
                            >
                                <X
                                    size={11}
                                    strokeWidth={2}
                                />
                            </button>
                        )}
                    </div>
                </div>

                {/* =================================================
                    MOBILE SEARCH
                ================================================== */}
                <div
                    className="
                        w-[145px]
                        shrink-0
                        px-2
                        lg:hidden
                    "
                >
                    <div className="relative w-full">
                        <Search
                            size={12}
                            strokeWidth={1.8}
                            className="
                                pointer-events-none
                                absolute
                                left-2.5
                                top-1/2
                                -translate-y-1/2
                                text-[#AFC4BE]
                            "
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search..."
                            className="
                                h-[30px]
                                w-full
                                rounded-[8px]
                                border
                                border-white/20
                                bg-white/10
                                pl-7
                                pr-7
                                text-[9.5px]
                                font-medium
                                text-white
                                outline-none
                                placeholder:text-[#B7C8C3]
                                focus:border-white/40
                                focus:bg-white/15
                                focus:ring-2
                                focus:ring-white/10
                            "
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                                aria-label="Clear tab search"
                                className="
                                    absolute
                                    right-1
                                    top-1/2
                                    flex
                                    h-5
                                    w-5
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-[6px]
                                    text-[#B8C9C4]
                                    hover:bg-white/10
                                    hover:text-white
                                    focus:outline-none
                                "
                            >
                                <X
                                    size={10}
                                    strokeWidth={2}
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessTabs;