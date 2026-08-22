import React from "react";
import { motion } from "framer-motion";

const GlassCard = ({
    icon: Icon,
    label,
    value,
    tone = "teal",
    className = "",
    delay = 0,
    floatDelay = 0,
}) => {

    const toneMap = {
        teal: "text-teal-200",
        green: "text-emerald-300",
        sky: "text-sky-200",
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 16,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={`absolute ${className}`}
        >

            <motion.div
                animate={{
                    y: [0, -8, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: floatDelay,
                }}
                className="
                    flex
                    items-center
                    gap-2.5
                    rounded-2xl
                    border
                    border-white/15
                    bg-white/10
                    px-4
                    py-3
                    backdrop-blur-md
                    shadow-[0_8px_30px_rgba(0,0,0,0.25)]
                "
            >

                <div
                    className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-white/10
                        ${toneMap[tone]}
                    `}
                >
                    <Icon
                        size={16}
                        strokeWidth={2}
                    />
                </div>

                <div className="leading-tight">

                    <p className="text-[11px] font-medium text-white/60">
                        {label}
                    </p>

                    <p className="text-[13px] font-semibold text-white">
                        {value}
                    </p>

                </div>

            </motion.div>

        </motion.div>
    );
};

export default GlassCard;