import React from "react";
import {
    UserPen,
    KeyRound,
    ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const ProfileSidebar = ({
    profileData,
    activeTab,
    setActiveTab,
    theme,
}) => {
    const t = theme || {
        textAccent: "text-[#56766D]",
        bgAccent: "bg-[#56766D]",
        lightBg: "bg-[#E8F0ED]",
        borderLight: "border-[#D6D8D3]",
        borderBadge: "border-[#C7D8D2]",
        rowHover: "hover:bg-[#F4F6F3]",
        shadowAccent:
            "shadow-[0_5px_18px_rgba(86,118,109,0.12)]",
        ringAccent: "ring-[#C7D8D2]",
        textAccentHover: "hover:text-[#48685F]",
        navActive:
            "bg-[#E8F0ED] text-[#48685F] border-[#C7D8D2]",
        badgeBg: "bg-[#E8F0ED]",
    };

    return (
        <div
            className="
                relative
                flex
                flex-col
                overflow-hidden
                rounded-[18px]
                border
                border-[#D6D8D3]
                bg-white
                shadow-[0_5px_20px_rgba(36,50,56,0.055)]
            "
        >
            {/* TOP ACCENT */}
            <div
                className="
                    absolute
                    left-0
                    top-0
                    h-[3px]
                    w-full
                    bg-[#56766D]
                "
            />

            {/* DECORATIVE CORNER */}
            <div
                className="
                    pointer-events-none
                    absolute
                    right-0
                    top-0
                    h-[105px]
                    w-[105px]
                    translate-x-[40px]
                    -translate-y-[40px]
                    rounded-full
                    bg-[#E8F0ED]
                    opacity-65
                "
            />

            <div className="relative z-10 p-5">

                {/* =================================================
                    PROFILE IDENTITY
                ================================================== */}
                <div
                    className="
                        flex
                        flex-col
                        items-center
                        border-b
                        border-[#ECEDEA]
                        pb-5
                        text-center
                    "
                >
                    {/* AVATAR */}
                    <div
                        className="
                            relative
                            flex
                            h-[88px]
                            w-[88px]
                            items-center
                            justify-center
                            rounded-full
                            border-[4px]
                            border-white
                            bg-[#E8F0ED]
                            text-[#56766D]
                            shadow-[0_6px_16px_rgba(86,118,109,0.12)]
                            ring-1
                            ring-[#C7D8D2]
                        "
                    >
                        <span
                            className="
                                text-[29px]
                                font-bold
                                tracking-[-0.04em]
                            "
                        >
                            {profileData?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                        </span>

                        <span
                            className="
                                absolute
                                bottom-[1px]
                                right-[3px]
                                h-[11px]
                                w-[11px]
                                rounded-full
                                border-[3px]
                                border-white
                                bg-[#56766D]
                            "
                        />
                    </div>

                    {/* NAME */}
                    <h2
                        className="
                            mt-4
                            max-w-full
                            truncate
                            text-[15px]
                            font-bold
                            tracking-[-0.015em]
                            text-[#243238]
                        "
                    >
                        {profileData?.salutation}{" "}
                        {profileData?.name}
                    </h2>

                    {/* EMAIL */}
                    <p
                        className="
                            mt-1
                            max-w-full
                            truncate
                            px-2
                            text-[10.5px]
                            font-medium
                            text-[#7A8582]
                        "
                        title={profileData?.email}
                    >
                        {profileData?.email}
                    </p>

                    {/* ROLE */}
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                        {profileData?.roles?.map(
                            (role) => (
                                <span
                                    key={
                                        role.id ||
                                        role
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        rounded-full
                                        border
                                        border-[#D2DFDA]
                                        bg-[#F1F5F3]
                                        px-2
                                        py-0.5
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.04em]
                                        text-[#56766D]
                                    "
                                >
                                    <ShieldCheck
                                        size={10}
                                        strokeWidth={2}
                                    />

                                    {role.name || role}
                                </span>
                            )
                        )}
                    </div>
                </div>

                {/* =================================================
                    SETTINGS NAVIGATION
                ================================================== */}
                <nav className="mt-5 flex flex-col gap-1.5">

                    {/* UPDATE PROFILE */}
                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab("update")
                        }
                        className={`
                            group
                            relative
                            flex
                            w-full
                            items-center
                            justify-between
                            overflow-hidden
                            rounded-[11px]
                            border
                            px-3.5
                            py-3
                            text-left
                            text-[12px]
                            font-semibold
                            transition-all
                            duration-200
                            ${
                                activeTab === "update"
                                    ? `${t.navActive} shadow-[0_2px_7px_rgba(86,118,109,0.06)]`
                                    : `border-transparent text-[#6B7975] ${t.rowHover} ${t.textAccentHover}`
                            }
                        `}
                    >
                        {/* ACTIVE SIDE MARKER */}
                        {activeTab === "update" && (
                            <span
                                className="
                                    absolute
                                    left-0
                                    top-1/2
                                    h-[22px]
                                    w-[3px]
                                    -translate-y-1/2
                                    rounded-r-full
                                    bg-[#56766D]
                                "
                            />
                        )}

                        <span className="flex items-center gap-3">
                            <span
                                className={`
                                    flex
                                    h-[30px]
                                    w-[30px]
                                    items-center
                                    justify-center
                                    rounded-[8px]
                                    transition-all
                                    duration-200
                                    ${
                                        activeTab ===
                                        "update"
                                            ? "bg-white text-[#56766D] shadow-[0_1px_4px_rgba(36,50,56,0.05)]"
                                            : "text-[#87928E] group-hover:text-[#56766D]"
                                    }
                                `}
                            >
                                <UserPen
                                    size={15}
                                    strokeWidth={1.9}
                                />
                            </span>

                            Update Profile
                        </span>

                        {activeTab === "update" && (
                            <motion.span
                                layoutId="tabGlow"
                                className="
                                    h-[6px]
                                    w-[6px]
                                    rounded-full
                                    bg-[#56766D]
                                "
                            />
                        )}
                    </button>

                    {/* CHANGE PASSWORD */}
                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab("password")
                        }
                        className={`
                            group
                            relative
                            flex
                            w-full
                            items-center
                            justify-between
                            overflow-hidden
                            rounded-[11px]
                            border
                            px-3.5
                            py-3
                            text-left
                            text-[12px]
                            font-semibold
                            transition-all
                            duration-200
                            ${
                                activeTab === "password"
                                    ? `${t.navActive} shadow-[0_2px_7px_rgba(86,118,109,0.06)]`
                                    : `border-transparent text-[#6B7975] ${t.rowHover} ${t.textAccentHover}`
                            }
                        `}
                    >
                        {/* ACTIVE SIDE MARKER */}
                        {activeTab === "password" && (
                            <span
                                className="
                                    absolute
                                    left-0
                                    top-1/2
                                    h-[22px]
                                    w-[3px]
                                    -translate-y-1/2
                                    rounded-r-full
                                    bg-[#56766D]
                                "
                            />
                        )}

                        <span className="flex items-center gap-3">
                            <span
                                className={`
                                    flex
                                    h-[30px]
                                    w-[30px]
                                    items-center
                                    justify-center
                                    rounded-[8px]
                                    transition-all
                                    duration-200
                                    ${
                                        activeTab ===
                                        "password"
                                            ? "bg-white text-[#56766D] shadow-[0_1px_4px_rgba(36,50,56,0.05)]"
                                            : "text-[#87928E] group-hover:text-[#56766D]"
                                    }
                                `}
                            >
                                <KeyRound
                                    size={15}
                                    strokeWidth={1.9}
                                />
                            </span>

                            Change Password
                        </span>

                        {activeTab === "password" && (
                            <motion.span
                                layoutId="tabGlow"
                                className="
                                    h-[6px]
                                    w-[6px]
                                    rounded-full
                                    bg-[#56766D]
                                "
                            />
                        )}
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default ProfileSidebar;