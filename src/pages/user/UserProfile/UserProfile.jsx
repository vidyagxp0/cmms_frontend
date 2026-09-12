import React, { useEffect, useState } from "react";
import {
    User,
    ArrowLeft,
    ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../../services/authApi";
import ProfileDetails from "./ProfileDetails";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const UserProfile = () => {
    const navigate = useNavigate();

    // Profile details state (loaded fresh from API on mount)
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Fetch user details from profile endpoint
    const fetchUserProfile = async () => {
        try {
            setLoadingProfile(true);

            const response = await getProfile();
            const apiUser = response?.data?.data;

            if (apiUser) {
                setProfileData(apiUser);
            }
        } catch (error) {
            console.error(
                "Failed to load user profile:",
                error
            );

            toast.error(
                "Could not load profile details. Please try again."
            );
        } finally {
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Handle Back to Dashboard based on Session type
    const handleBackToDashboard = () => {
        const authType = sessionStorage.getItem("auth_type");

        if (authType === "Admin") {
            navigate("/admin/dashboard");
        } else {
            navigate("/user/equipment-dashboard");
        }
    };

    // Format Date Helper
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";

        try {
            const date = new Date(dateStr);

            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (e) {
            return dateStr;
        }
    };

    // Get formatted joined date
    const joinedDate = profileData?.created_at
        ? formatDate(profileData.created_at)
        : formatDate(
              new Date().setDate(
                  new Date().getDate() - 30
              )
          );

    // Theme Configuration
    const authType = sessionStorage.getItem("auth_type");
    const isSystemAdmin = authType === "Admin";

    const theme = {
        isSystemAdmin,

        textAccent: "text-[#56766D]",
        bgAccent: "bg-[#56766D]",
        bgHoverAccent: "hover:bg-[#48685F]",

        lightBg: "bg-[#E8F0ED]",
        borderLight: "border-[#D6D8D3]",
        borderBadge: "border-[#C7D8D2]",

        rowHover: "hover:bg-[#F4F6F3]",
        shadowAccent:
            "shadow-[0_5px_18px_rgba(86,118,109,0.12)]",

        ringAccent: "ring-[#C7D8D2]",
        textAccentHover: "hover:text-[#48685F]",
        borderHover: "hover:border-[#B9CBC4]",

        navActive:
            "bg-[#E8F0ED] text-[#48685F] border-[#C7D8D2]",

        badgeBg: "bg-[#E8F0ED]",

        bronze: "text-[#A47D45]",
        bronzeBg: "bg-[#F4EEE4]",
        bronzeBorder: "border-[#E4D7C3]",
    };

    if (loadingProfile) {
        return (
            <div className="min-h-full bg-[#F1F0EB]">
                <Skeleton variant="accountSettings" />
            </div>
        );
    }

    return (
        <div
            className="
                mx-auto
                w-full
                max-w-7xl
                animate-fadeIn
                px-4
                pb-10
                sm:px-6
                lg:px-8
            "
        >
            {/* =====================================================
                PAGE HEADER
            ====================================================== */}
            <div
                className="
                    mb-6
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >
                {/* TITLE */}
                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex
                            h-[42px]
                            w-[42px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[12px]
                            border
                            border-[#C7D8D2]
                            bg-[#E8F0ED]
                            text-[#56766D]
                            shadow-[0_2px_8px_rgba(86,118,109,0.06)]
                        "
                    >
                        <User
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1
                                className="
                                    text-[22px]
                                    font-bold
                                    tracking-[-0.035em]
                                    text-[#243238]
                                "
                            >
                                User Profile
                            </h1>

                            <span
                                className="
                                    hidden
                                    h-[5px]
                                    w-[5px]
                                    rounded-full
                                    bg-[#A47D45]
                                    sm:block
                                "
                            />
                        </div>

                        <p
                            className="
                                mt-0.5
                                text-[11px]
                                font-medium
                                text-[#788481]
                            "
                        >
                            Review your primary user identity and account information.
                        </p>
                    </div>
                </div>

                {/* BACK BUTTON */}
                <button
                    type="button"
                    onClick={handleBackToDashboard}
                    className="
                        inline-flex
                        h-[39px]
                        items-center
                        justify-center
                        gap-2
                        self-start
                        rounded-[10px]
                        border
                        border-[#D0D7D3]
                        bg-white
                        px-4
                        text-[11.5px]
                        font-semibold
                        text-[#53615F]
                        shadow-[0_2px_7px_rgba(36,50,56,0.035)]
                        transition-all
                        duration-200
                        hover:border-[#B8C8C1]
                        hover:bg-[#F5F7F5]
                        hover:text-[#48685F]
                        sm:self-auto
                    "
                >
                    <ArrowLeft
                        size={14}
                        strokeWidth={2}
                    />
                    Back to Dashboard
                </button>
            </div>

            {/* =====================================================
                PROFILE LAYOUT
            ====================================================== */}
            <div
                className="
                    grid
                    grid-cols-1
                    gap-5
                    lg:grid-cols-12
                "
            >
                {/* =================================================
                    LEFT PROFILE IDENTITY
                ================================================== */}
                <div className="lg:col-span-4 xl:col-span-3">

                    <div
                        className="
                            relative
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
                                h-[115px]
                                w-[115px]
                                translate-x-[42px]
                                -translate-y-[42px]
                                rounded-full
                                bg-[#E8F0ED]
                                opacity-70
                            "
                        />

                        <div className="relative z-10 p-6">
                            <div className="flex flex-col items-center text-center">

                                {/* AVATAR */}
                                <div
                                    className="
                                        relative
                                        flex
                                        h-[100px]
                                        w-[100px]
                                        items-center
                                        justify-center
                                        rounded-full
                                        border-[5px]
                                        border-white
                                        bg-[#E8F0ED]
                                        text-[#56766D]
                                        shadow-[0_7px_18px_rgba(86,118,109,0.14)]
                                        ring-1
                                        ring-[#C7D8D2]
                                    "
                                >
                                    <span
                                        className="
                                            text-[32px]
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
                                            bottom-[2px]
                                            right-[5px]
                                            h-[12px]
                                            w-[12px]
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
                                        mt-5
                                        max-w-full
                                        truncate
                                        text-[17px]
                                        font-bold
                                        tracking-[-0.02em]
                                        text-[#243238]
                                    "
                                >
                                    {profileData?.salutation}{" "}
                                    {profileData?.name}
                                </h2>

                                {/* EMAIL */}
                                <p
                                    className="
                                        mt-1.5
                                        max-w-full
                                        truncate
                                        px-3
                                        text-[11px]
                                        font-medium
                                        text-[#778480]
                                    "
                                    title={profileData?.email}
                                >
                                    {profileData?.email}
                                </p>

                                {/* ROLES */}
                                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
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
                                                    gap-1.5
                                                    rounded-full
                                                    border
                                                    border-[#D2DFDA]
                                                    bg-[#F1F5F3]
                                                    px-2.5
                                                    py-1
                                                    text-[9.5px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.05em]
                                                    text-[#56766D]
                                                "
                                            >
                                                <ShieldCheck
                                                    size={11}
                                                    strokeWidth={
                                                        2
                                                    }
                                                />

                                                {role.name ||
                                                    role}
                                            </span>
                                        )
                                    )}
                                </div>

                                {/* ACCOUNT LABEL */}
                                <div
                                    className="
                                        mt-6
                                        flex
                                        w-full
                                        items-center
                                        gap-2
                                        border-t
                                        border-[#ECEDEA]
                                        pt-4
                                    "
                                >
                                    <span
                                        className="
                                            h-[6px]
                                            w-[6px]
                                            rounded-full
                                            bg-[#56766D]
                                        "
                                    />

                                    <span
                                        className="
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]
                                            text-[#88928F]
                                        "
                                    >
                                        Active Account
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    RIGHT PROFILE DETAILS
                ================================================== */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div
                        className="
                            relative
                            min-h-[400px]
                            overflow-hidden
                            rounded-[18px]
                            border
                            border-[#D6D8D3]
                            bg-white
                            shadow-[0_5px_20px_rgba(36,50,56,0.055)]
                        "
                    >
                        <div
                            className="
                                absolute
                                right-0
                                top-0
                                h-[150px]
                                w-[150px]
                                translate-x-[60px]
                                -translate-y-[60px]
                                rounded-full
                                bg-[#E8F0ED]
                                opacity-45
                            "
                        />

                        <div className="relative z-10 p-5 sm:p-7">
                            <ProfileDetails
                                profileData={profileData}
                                joinedDate={joinedDate}
                                theme={theme}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;