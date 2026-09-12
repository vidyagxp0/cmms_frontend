import React from "react";
import {
    User,
    Hash,
    Mail,
    Phone,
    Building2,
    Calendar,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const ProfileDetails = ({
    profileData,
    joinedDate,
    theme,
}) => {
    const t = theme || {
        isSystemAdmin: true,
        textAccent: "text-[#56766D]",
        bgAccent: "bg-[#56766D]",
        lightBg: "bg-[#E8F0ED]",
        borderLight: "border-[#D6D8D3]",
        badgeBg: "bg-[#E8F0ED]",
    };

    const detailItems = [
        {
            label: "Salutation & Full Name",
            value: `${profileData?.salutation || ""} ${
                profileData?.name || ""
            }`.trim(),
            icon: User,
        },
        {
            label: "Person ID",
            value:
                profileData?.person_id ||
                "System Generated",
            icon: Hash,
        },
        {
            label: "Roles",
            value:
                profileData?.roles
                    ?.map(
                        (role) =>
                            role.name || role
                    )
                    .join(", ") ||
                "No Roles",
            icon: ShieldCheck,
        },
        {
            label: "Email Address",
            value: profileData?.email || "N/A",
            icon: Mail,
            breakAll: true,
        },
        {
            label: "Mobile Number",
            value:
                profileData?.mobile_no ||
                "Not Provided",
            icon: Phone,
        },
        {
            label: "Department",
            value:
                profileData?.department?.name ||
                "Unassigned",
            icon: Building2,
        },
        {
            label: "Joined Date",
            value: joinedDate,
            icon: Calendar,
        },
    ];

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: -15,
            }}
            transition={{
                duration: 0.2,
            }}
            className="space-y-6"
        >
            {/* =====================================================
                SECTION HEADER
            ====================================================== */}
            <div className="flex items-start justify-between gap-4">

                <div>
                    <div className="flex items-center gap-2">
                        <h3
                            className="
                                text-[17px]
                                font-bold
                                tracking-[-0.02em]
                                text-[#243238]
                            "
                        >
                            Profile Information
                        </h3>

                        <span
                            className="
                                h-[5px]
                                w-[5px]
                                rounded-full
                                bg-[#A47D45]
                            "
                        />
                    </div>

                    <p
                        className="
                            mt-1
                            text-[11px]
                            font-medium
                            text-[#7A8582]
                        "
                    >
                        Primary identity and settings assigned to your account.
                    </p>
                </div>

                {/* ACCOUNT STATUS MINI LABEL */}
                <div
                    className="
                        hidden
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-[#D2DFDA]
                        bg-[#F1F5F3]
                        px-2.5
                        py-1
                        sm:flex
                    "
                >
                    <span
                        className="
                            h-[6px]
                            w-[6px]
                            animate-pulse
                            rounded-full
                            bg-[#56766D]
                        "
                    />

                    <span
                        className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#56766D]
                        "
                    >
                        Active
                    </span>
                </div>
            </div>

            {/* =====================================================
                DETAILS GRID
            ====================================================== */}
            <div
                className="
                    grid
                    grid-cols-1
                    gap-3.5
                    md:grid-cols-2
                "
            >
                {detailItems.map(
                    (item, index) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={`${item.label}-${index}`}
                                className="
                                    group
                                    relative
                                    flex
                                    min-h-[76px]
                                    items-start
                                    gap-3.5
                                    overflow-hidden
                                    rounded-[13px]
                                    border
                                    border-[#DDE2DF]
                                    bg-[#FAFBF9]
                                    p-3.5
                                    transition-all
                                    duration-200
                                    hover:border-[#C8D4CF]
                                    hover:bg-[#F7F9F7]
                                    hover:shadow-[0_4px_12px_rgba(36,50,56,0.04)]
                                "
                            >
                                {/* LEFT ACCENT */}
                                <span
                                    className="
                                        absolute
                                        bottom-0
                                        left-0
                                        h-[2px]
                                        w-[26%]
                                        bg-[#DCE7E2]
                                        transition-all
                                        duration-200
                                        group-hover:w-[42%]
                                    "
                                />

                                {/* ICON */}
                                <span
                                    className="
                                        flex
                                        h-[35px]
                                        w-[35px]
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-[9px]
                                        border
                                        border-[#D2DFDA]
                                        bg-[#E8F0ED]
                                        text-[#56766D]
                                        transition-all
                                        duration-200
                                        group-hover:border-[#C0D2CA]
                                        group-hover:bg-[#E2ECE8]
                                    "
                                >
                                    <Icon
                                        size={16}
                                        strokeWidth={1.9}
                                    />
                                </span>

                                {/* CONTENT */}
                                <div className="min-w-0 pt-0.5">
                                    <p
                                        className="
                                            text-[9.5px]
                                            font-bold
                                            uppercase
                                            tracking-[0.11em]
                                            text-[#8A9491]
                                        "
                                    >
                                        {item.label}
                                    </p>

                                    <p
                                        className={`
                                            mt-1
                                            text-[12px]
                                            font-semibold
                                            leading-[1.4]
                                            text-[#293A40]
                                            ${
                                                item.breakAll
                                                    ? "break-all"
                                                    : "truncate"
                                            }
                                        `}
                                        title={
                                            item.value
                                        }
                                    >
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                        );
                    }
                )}

                {/* =================================================
                    ACCOUNT STATUS
                ================================================== */}
                <div
                    className="
                        group
                        relative
                        flex
                        min-h-[76px]
                        items-start
                        gap-3.5
                        overflow-hidden
                        rounded-[13px]
                        border
                        border-[#DDE2DF]
                        bg-[#FAFBF9]
                        p-3.5
                        transition-all
                        duration-200
                        hover:border-[#C8D4CF]
                        hover:bg-[#F7F9F7]
                        hover:shadow-[0_4px_12px_rgba(36,50,56,0.04)]
                    "
                >
                    {/* LEFT ACCENT */}
                    <span
                        className="
                            absolute
                            bottom-0
                            left-0
                            h-[2px]
                            w-[26%]
                            bg-[#DCE7E2]
                            transition-all
                            duration-200
                            group-hover:w-[42%]
                        "
                    />

                    {/* ICON */}
                    <span
                        className="
                            flex
                            h-[35px]
                            w-[35px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[9px]
                            border
                            border-[#D2DFDA]
                            bg-[#E8F0ED]
                            text-[#56766D]
                            transition-all
                            duration-200
                            group-hover:border-[#C0D2CA]
                            group-hover:bg-[#E2ECE8]
                        "
                    >
                        <CheckCircle2
                            size={16}
                            strokeWidth={1.9}
                        />
                    </span>

                    {/* CONTENT */}
                    <div className="min-w-0 pt-0.5">
                        <p
                            className="
                                text-[9.5px]
                                font-bold
                                uppercase
                                tracking-[0.11em]
                                text-[#8A9491]
                            "
                        >
                            Account Status
                        </p>

                        <div className="mt-2">
                            <span
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    border-[#CFE1D9]
                                    bg-[#EEF5F2]
                                    px-2.5
                                    py-1
                                    text-[9.5px]
                                    font-bold
                                    uppercase
                                    tracking-[0.05em]
                                    text-[#56766D]
                                "
                            >
                                <span
                                    className="
                                        h-[6px]
                                        w-[6px]
                                        animate-pulse
                                        rounded-full
                                        bg-[#56766D]
                                    "
                                />

                                Active Session
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileDetails;