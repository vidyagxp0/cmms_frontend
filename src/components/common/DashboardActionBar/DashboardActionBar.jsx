import React from "react";
import {
    ChevronRight,
    Home,
    Plus,
    ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardActionBar = ({
    title = "Dashboard",
    onCreate,
}) => {
    const navigate = useNavigate();

    return (
        <div
            className="
                fixed left-0 right-0 top-[138px] z-30
                h-[54px]
                border-b border-[#D9DEDB]
                bg-[#1a5161]
                px-4
                sm:px-6
                lg:px-8
            "
        >
            <div className="flex h-full items-center justify-between">

                {/* LEFT — BREADCRUMB */}
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => navigate("/user/dashboard")}
                        aria-label="Home"
                        className="
                            group flex h-8 w-8 items-center justify-center
                            rounded-[8px]
                            text-[#dee4e1]
                            transition-all duration-200
                            hover:bg-white
                            hover:text-[#303A35]
                            hover:shadow-[0_2px_8px_-5px_rgba(30,40,35,0.35)]
                            active:scale-[0.96]
                        "
                    >
                        <Home
                            size={15}
                            strokeWidth={1.7}
                            className="
                                transition-transform duration-200
                                group-hover:scale-[1.04]
                            "
                        />
                    </button>

                    <ChevronRight
                        size={14}
                        strokeWidth={1.5}
                        className="mx-1 text-[#d2dad5]"
                    />

                    <span
                        className="
                            rounded-md
                            px-1
                            text-[13px]
                            font-semibold
                            tracking-[-0.01em]
                            text-[#dee9e8]
                        "
                    >
                        {title}
                    </span>
                </div>

                {/* RIGHT — CREATE RECORD */}
                <button
                    type="button"
                    onClick={onCreate}
                    className="
                        group relative
                        flex h-[36px] items-center gap-2.5
                        rounded-[9px]
                        border border-[#BFC7C2]
                        bg-white
                        px-3
                        text-[12px]
                        font-semibold
                        tracking-[-0.01em]
                        text-[#303A35]
                        shadow-[0_2px_8px_-5px_rgba(31,42,36,0.35)]
                        transition-all duration-200
                        ease-out
                        hover:-translate-y-[1px]
                        hover:border-[#929D97]
                        hover:bg-[#FCFDFC]
                        hover:shadow-[0_6px_14px_-8px_rgba(31,42,36,0.42)]
                        active:translate-y-0
                        active:scale-[0.98]
                    "
                >
                    <span
                        className="
                            flex h-[22px] w-[22px]
                            items-center justify-center
                            rounded-[6px]
                            bg-[#EEF1EF]
                            text-[#46534C]
                            transition-all duration-200
                            group-hover:bg-[#E5E9E6]
                            group-hover:text-[#27322D]
                        "
                    >
                        <Plus
                            size={13}
                            strokeWidth={2.2}
                            className="
                                transition-transform duration-200
                                group-hover:rotate-90
                            "
                        />
                    </span>

                    <span className="whitespace-nowrap">
                        Create Record
                    </span>

                    <ArrowUpRight
                        size={13}
                        strokeWidth={1.8}
                        className="
                            text-[#9AA39E]
                            transition-all duration-200
                            group-hover:-translate-y-[1px]
                            group-hover:translate-x-[1px]
                            group-hover:text-[#59645E]
                        "
                    />
                </button>
            </div>
        </div>
    );
};

export default DashboardActionBar;