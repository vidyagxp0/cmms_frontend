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
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`
                relative flex flex-col rounded-2xl border border-slate-200/80
                bg-white/90 p-5 shadow-xs backdrop-blur-md
                transition-all duration-300 hover:shadow-md hover:border-slate-300/80
                ${minHeight} ${className}
            `}
        >
            {/* CARD HEADER */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#185B61] ring-1 ring-teal-500/20 shadow-2xs">
                            <Icon size={18} strokeWidth={2} />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold tracking-tight text-slate-800">
                                {title}
                            </h3>
                            {badgeText && (
                                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-[#185B61] ring-1 ring-teal-500/30">
                                    {badgeText}
                                </span>
                            )}
                        </div>
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-slate-500 font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {action && <div className="flex items-center gap-2">{action}</div>}
            </div>

            {/* CARD CONTENT */}
            <div className="relative flex-1 w-full min-h-0">
                {children}
            </div>
        </motion.div>
    );
};

export default ChartCard;
