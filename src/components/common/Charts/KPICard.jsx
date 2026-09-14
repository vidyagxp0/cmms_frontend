import React from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

const KPICard = ({
    title,
    value,
    subtext,
    icon: Icon,
    trend,
    trendType = "up",
    gradient = "from-teal-500 to-emerald-600",
    bgColor = "bg-teal-50/50",
    iconColor = "text-[#185B61]",
    delay = 0,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                delay: delay,
                ease: "easeOut",
            }}
            className="
                group
                relative
                flex
                min-h-[166px]
                flex-col
                justify-between
                overflow-hidden
                rounded-[18px]
                border
                border-[#D6D8D3]
                bg-[#F7F6F2]
                p-4
                shadow-[0_3px_12px_rgba(36,50,56,0.045)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#C4CCC7]
                hover:shadow-[0_12px_28px_rgba(36,50,56,0.09)]
            "
        >
            {/* =====================================================
                INNER CARD SURFACE
            ====================================================== */}
            <div
                className="
                    absolute
                    inset-[1px]
                    rounded-[17px]
                    bg-white
                "
            />

            {/* =====================================================
                SUBTLE ACCENT
            ====================================================== */}
            <div
                className="
                    pointer-events-none
                    absolute
                    right-0
                    top-0
                    h-[82px]
                    w-[82px]
                    translate-x-[24px]
                    -translate-y-[24px]
                    rounded-full
                    bg-[#DCE7E2]
                    opacity-40
                    blur-[1px]
                    transition-all
                    duration-300
                    group-hover:opacity-60
                "
            />

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

            {/* =====================================================
                CONTENT
            ====================================================== */}
            <div className="relative z-10 flex h-full flex-col justify-between">

                {/* TOP */}
                <div className="flex items-start justify-between gap-3">

                    {/* TITLE + VALUE */}
                    <div className="min-w-0">

                        <div className="flex items-center gap-2">
                            <span
                                className="
                                    h-[5px]
                                    w-[5px]
                                    shrink-0
                                    rounded-full
                                    bg-[#A47D45]
                                "
                            />

                            <p
                                className="
                                    truncate
                                    text-[10.5px]
                                    font-bold
                                    uppercase
                                    tracking-[0.11em]
                                    text-[#7A8583]
                                "
                            >
                                {title}
                            </p>
                        </div>

                        <div className="mt-3 flex items-baseline gap-2">
                            <h4
                                className="
                                    truncate
                                    text-[29px]
                                    font-bold
                                    leading-none
                                    tracking-[-0.035em]
                                    text-[#243238]
                                "
                            >
                                {value}
                            </h4>
                        </div>
                    </div>

                    {/* ICON */}
                    {Icon && (
                        <div
                            className="
                                relative
                                flex
                                h-[45px]
                                w-[45px]
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-[13px]
                                border
                                border-[#C9D8D3]
                                bg-[#E8F0ED]
                                text-[#56766D]
                                shadow-[0_3px_8px_rgba(86,118,109,0.07)]
                                transition-all
                                duration-300
                                group-hover:scale-[1.04]
                                group-hover:border-[#B9CCC5]
                                group-hover:bg-[#E2ECE8]
                            "
                        >
                            <Icon
                                size={21}
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
                                    opacity-80
                                "
                            />
                        </div>
                    )}
                </div>

                {/* =================================================
                    FOOTER
                ================================================== */}
                <div
                    className="
                        mt-5
                        flex
                        min-w-0
                        items-end
                        justify-between
                        gap-3
                        border-t
                        border-[#ECEDEA]
                        pt-3
                    "
                >
                    {/* SUBTEXT */}
                    {subtext ? (
                        <span
                            className="
                                min-w-0
                                max-w-[62%]
                                truncate
                                text-[11px]
                                font-medium
                                leading-[1.35]
                                text-[#7B8584]
                            "
                            title={subtext}
                        >
                            {subtext}
                        </span>
                    ) : (
                        <span />
                    )}

                    {/* TREND */}
                    {trend && (
                        <div
                            className={`
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                tracking-[0.01em]
                                transition-all
                                duration-200
                                ${
                                    trendType === "up"
                                        ? "border-[#CFE1D9] bg-[#EEF5F2] text-[#56766D]"
                                        : trendType === "down"
                                        ? "border-[#E8D0D0] bg-[#FBF2F2] text-[#B54A4A]"
                                        : "border-[#DDE1DE] bg-[#F3F4F2] text-[#707B79]"
                                }
                            `}
                        >
                            {trendType === "up" && (
                                <TrendingUp
                                    size={11}
                                    strokeWidth={2.2}
                                />
                            )}

                            {trendType === "down" && (
                                <TrendingDown
                                    size={11}
                                    strokeWidth={2.2}
                                />
                            )}

                            {trendType === "neutral" && (
                                <Minus
                                    size={11}
                                    strokeWidth={2.2}
                                />
                            )}

                            <span>{trend}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default KPICard;