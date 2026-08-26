import React, { useEffect, useState } from "react";
import { User, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { getProfile } from "../../../services/authApi";
import ProfileDetails from "./ProfileDetails";

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
            console.error("Failed to load user profile:", error);
            toast.error("Could not load profile details. Please try again.");
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

    // Get formatted joined date (using created_at or default/simulated)
    const joinedDate = profileData?.created_at 
        ? formatDate(profileData.created_at) 
        : formatDate(new Date().setDate(new Date().getDate() - 30)); // 30 days ago fallback

    // Dynamic Theme Configuration
    const authType = sessionStorage.getItem("auth_type");
    const isSystemAdmin = authType === "Admin";

    const theme = {
        isSystemAdmin,
        textAccent: isSystemAdmin ? "text-[#17734C]" : "text-[#2563EB]",
        bgAccent: isSystemAdmin ? "bg-[#17734C]" : "bg-[#2563EB]",
        bgHoverAccent: isSystemAdmin ? "hover:bg-[#125D3E]" : "hover:bg-[#1D4ED8]",
        lightBg: isSystemAdmin ? "bg-[#EEF8F2]" : "bg-[#EFF6FF]",
        borderLight: isSystemAdmin ? "border-[#CBE3D6]" : "border-[#BFDBFE]",
        borderBadge: isSystemAdmin ? "border-[#B8D9C8]" : "border-[#93C5FD]",
        rowHover: isSystemAdmin ? "hover:bg-[#F5FAF7]" : "hover:bg-[#F0F7FF]",
        shadowAccent: isSystemAdmin ? "shadow-[0_4px_15px_rgba(23,115,76,0.12)]" : "shadow-[0_4px_15px_rgba(37,99,235,0.12)]",
        ringAccent: isSystemAdmin ? "ring-[#CBE3D6]" : "ring-[#BFDBFE]",
        textAccentHover: isSystemAdmin ? "hover:text-[#17734C]" : "hover:text-[#2563EB]",
        borderHover: isSystemAdmin ? "hover:border-[#AFCFBE]" : "hover:border-[#93C5FD]",
        navActive: isSystemAdmin ? "bg-[#EEF8F2] text-[#17734C] border-[#B8D9C8]" : "bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]",
        badgeBg: isSystemAdmin ? "bg-[#EEF8F2]" : "bg-[#EFF6FF]",
    };

    if (loadingProfile) {
        return (
            <div className="flex min-h-[450px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={36} className={`animate-spin ${theme.textAccent}`} />
                    <span className="text-[13px] font-semibold text-[#5C7A6C]">Loading Profile Workspace...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl animate-fadeIn">
            {/* Page Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-[12px] border ${theme.borderBadge} ${theme.badgeBg} shadow-sm`}>
                        <User size={20} strokeWidth={2} className={theme.textAccent} />
                    </span>
                    <div>
                        <h1 className="text-[22px] font-bold tracking-tight text-[#152C20]">
                            User Profile
                        </h1>
                        <p className="mt-0.5 text-[12px] text-[#6C8679]">
                            Review your primary user identity and settings.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleBackToDashboard}
                    className={`flex h-9 items-center justify-center gap-2 rounded-xl border ${theme.borderLight} bg-white px-4 text-[12px] font-bold text-[#3E5A4D] shadow-sm transition-all duration-150 ${theme.lightBg} ${theme.textAccentHover}`}
                >
                    <ArrowLeft size={14} strokeWidth={2.2} />
                    Back to Dashboard
                </button>
            </div>

            {/* Split Layout Container */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* 1. Left Static Info Card (No Tabs) */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className={`flex flex-col rounded-2xl border ${theme.borderLight} bg-white p-5 shadow-[0_8px_30px_rgba(21,44,32,0.06)]`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                <div className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white ${theme.badgeBg} ${theme.shadowAccent} ring-2 ${theme.ringAccent}`}>
                                    <span className={`text-[32px] font-extrabold ${theme.textAccent}`}>
                                        {profileData?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                </div>
                            </div>

                            <h2 className="mt-4 text-[16px] font-bold text-[#152C20]">
                                {profileData?.salutation} {profileData?.name}
                            </h2>
                            <p className="mt-1 text-[11.5px] font-medium text-[#5C7A6C] max-w-full truncate px-2">
                                {profileData?.email}
                            </p>

                            <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
                                {profileData?.roles?.map((role) => (
                                    <span
                                        key={role.id || role}
                                        className={`inline-flex items-center gap-1 rounded-full border ${theme.borderBadge} ${theme.badgeBg} px-2.5 py-0.5 text-[10.5px] font-bold ${theme.textAccent}`}
                                    >
                                        <ShieldCheck size={11} className={theme.textAccent} />
                                        {role.name || role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Right Interactive Content Panel */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className={`relative min-h-[400px] overflow-hidden rounded-2xl border ${theme.borderLight} bg-white p-6 shadow-[0_10px_30px_-18px_rgba(21,44,32,0.25)] sm:p-8`}>
                        <ProfileDetails
                            profileData={profileData}
                            joinedDate={joinedDate}
                            theme={theme}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;