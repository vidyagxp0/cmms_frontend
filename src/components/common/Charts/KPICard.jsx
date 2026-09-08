import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
            transition={{ duration: 0.35, delay: delay, ease: "easeOut" }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
        >
            {/* Top Gradient Accent Bar */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />

            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                            {value}
                        </h4>
                    </div>
                </div>

                {Icon && (
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgColor} ${iconColor} transition-transform duration-300 group-hover:scale-105 shadow-2xs ring-1 ring-black/5`}>
                        <Icon size={22} strokeWidth={2} />
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                {subtext && (
                    <span className="text-slate-500 font-medium truncate max-w-[170px]" title={subtext}>
                        {subtext}
                    </span>
                )}

                {trend && (
                    <div
                        className={`inline-flex items-center gap-1 font-semibold rounded-full px-2 py-0.5 text-[11px] ${
                            trendType === "up"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                                : trendType === "down"
                                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-500/20"
                                : "bg-slate-100 text-slate-600 ring-1 ring-slate-400/20"
                        }`}
                    >
                        {trendType === "up" && <TrendingUp size={12} />}
                        {trendType === "down" && <TrendingDown size={12} />}
                        {trendType === "neutral" && <Minus size={12} />}
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default KPICard;
