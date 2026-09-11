import React from "react";
import { motion } from "framer-motion";

const ChartCard = ({
    title,
    subtitle,
    icon: Icon,
    badgeText,
    action,
    children,
    className = "",
    minHeight = "min-h-[320px]",
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                ease: "easeOut",
            }}
            className={`
                group
                relative
                flex
                flex-col
                overflow-hidden
                rounded-[18px]
                border
                border-[#D6D8D3]
                bg-[#F7F6F2]
                p-[1px]
                shadow-[0_4px_14px_rgba(36,50,56,0.045)]
                transition-all
                duration-300
                hover:-translate-y-[1px]
                hover:border-[#C7CEC9]
                hover:shadow-[0_12px_30px_rgba(36,50,56,0.08)]
                ${minHeight}
                ${className}
            `}
        >
            {/* =====================================================
                INNER SURFACE
            ====================================================== */}
            <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[17px] bg-white">

                {/* =================================================
                    SUBTLE CORNER DETAIL
                ================================================== */}
                <div
                    className="
                        pointer-events-none
                        absolute
                        right-0
                        top-0
                        h-[110px]
                        w-[110px]
                        translate-x-[42px]
                        -translate-y-[42px]
                        rounded-full
                        bg-[#DCE7E2]
                        opacity-30
                        transition-opacity
                        duration-300
                        group-hover:opacity-50
                    "
                />

                {/* =================================================
                    HEADER
                ================================================== */}
                <div
                    className="
                        relative
                        z-10
                        mb-0
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-[#ECEDEA]
                        px-5
                        pb-4
                        pt-5
                    "
                >
                    {/* LEFT HEADER */}
                    <div className="flex min-w-0 items-center gap-3">

                        {/* ICON */}
                        {Icon && (
                            <div
                                className="
                                    relative
                                    flex
                                    h-[39px]
                                    w-[39px]
                                    shrink-0
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-[11px]
                                    border
                                    border-[#C9D8D3]
                                    bg-[#E8F0ED]
                                    text-[#56766D]
                                    shadow-[0_2px_7px_rgba(86,118,109,0.06)]
                                    transition-all
                                    duration-300
                                    group-hover:border-[#B9CCC5]
                                    group-hover:bg-[#E2ECE8]
                                "
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={1.9}
                                />

                                <span
                                    className="
                                        absolute
                                        bottom-0
                                        left-0
                                        h-[2px]
                                        w-full
                                        bg-[#A47D45]
                                        opacity-70
                                    "
                                />
                            </div>
                        )}

                        {/* TITLE AREA */}
                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <h3
                                    className="
                                        truncate
                                        text-[13.5px]
                                        font-bold
                                        tracking-[-0.015em]
                                        text-[#243238]
                                    "
                                >
                                    {title}
                                </h3>

                                {/* BADGE */}
                                {badgeText && (
                                    <span
                                        className="
                                            inline-flex
                                            shrink-0
                                            items-center
                                            rounded-full
                                            border
                                            border-[#D2DFDB]
                                            bg-[#F0F5F3]
                                            px-2.5
                                            py-[3px]
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.07em]
                                            text-[#56766D]
                                        "
                                    >
                                        {badgeText}
                                    </span>
                                )}
                            </div>

                            {/* SUBTITLE */}
                            {subtitle && (
                                <p
                                    className="
                                        mt-1
                                        max-w-[700px]
                                        text-[11px]
                                        font-medium
                                        leading-[1.45]
                                        text-[#7A8584]
                                    "
                                >
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ACTION */}
                    {action && (
                        <div className="flex shrink-0 items-center gap-2">
                            {action}
                        </div>
                    )}
                </div>

                {/* =================================================
                    CONTENT
                ================================================== */}
                <div
                    className="
                        relative
                        z-10
                        flex
                        min-h-0
                        flex-1
                        w-full
                        px-4
                        pb-4
                        pt-3
                    "
                >
                    {children}
                </div>

                {/* =================================================
                    BOTTOM ACCENT
                ================================================== */}
                <div
                    className="
                        pointer-events-none
                        absolute
                        bottom-0
                        left-0
                        h-[3px]
                        w-full
                        bg-[#DCE7E2]
                    "
                />

                <div
                    className="
                        pointer-events-none
                        absolute
                        bottom-0
                        left-0
                        h-[3px]
                        w-[34%]
                        bg-[#56766D]
                        opacity-75
                        transition-all
                        duration-300
                        group-hover:w-[48%]
                    "
                />
            </div>
        </motion.div>
    );
};

export default ChartCard;