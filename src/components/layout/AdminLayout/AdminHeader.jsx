import React, { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, CircleHelp, ShieldCheck } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import { useAuthStore } from "../../../store/authStore";


const AdminHeader = ({
    notificationCount = 3,
}) => {
    const user = useAuthStore((state) => state.user);
    const [showProfile, setShowProfile] = useState(false);
    const dropdownRef = useRef(null);
    const userName = user?.name 
    const userRole = user?.roles?.[0] 
    console.log("AdminHeader user:", user);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const initial = userName?.charAt(0)?.toUpperCase() || "A";

    return (
        <header
            className="fixed top-0 right-0 z-50 h-[74px] w-full border-b border-[#CBE3D6] bg-[#E4F1EA]"
            style={{
                boxShadow: "0 6px 20px -14px rgba(21,44,32,0.28)",
            }}
        >
            {/* MAIN HEADER */}
            <div className="flex h-full items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                {/* Shilpa LOGO*/}
                <div className="flex min-w-0 items-center gap-6">
                    <div className="flex shrink-0 items-center">
                        <img
                            src="/shilpaimage.png"
                            alt="Shilpa Logo"
                            className="h-[44px] w-auto max-w-[220px] object-contain"
                        />
                    </div>

                    <div className="hidden h-8 w-px bg-[#CBE3D6] lg:block" />
                    {/* Vidya gxp LOGO */}
                    <div className="flex shrink-0 items-center ml-2">
                        <img
                            src="/vidyagxp_logo.png"
                            alt="VidyaGxP"
                            className="h-[44px] w-auto max-w-[220px] object-contain"
                        />
                    </div>

                    {/* VERTICAL DIVIDER */}
                    <div className="hidden h-8 w-px bg-[#CBE3D6] lg:block" />
                </div>
               

                {/* RIGHT SECTION */}
                <div className="flex shrink-0 items-center gap-2">
                    {/* HELP */}
                    <button
                        type="button"
                        aria-label="Help and support"
                        className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-colors duration-150 hover:border-[#1F8A5F]/35 hover:text-[#17734C]"
                    >
                        <CircleHelp size={18} strokeWidth={1.75} />
                    </button>

                    {/* NOTIFICATIONS */}
                    <button
                        type="button"
                        aria-label={`Notifications (${notificationCount} unread)`}
                        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-colors duration-150 hover:border-[#1F8A5F]/35 hover:text-[#17734C]"
                    >
                        <Bell size={18} strokeWidth={1.75} />

                        {notificationCount > 0 && (
                            <span
                                className="absolute right-[3px] top-[3px] h-[7px] w-[7px] rounded-full border border-white"
                                style={{ background: "#B8933A" }}
                            />
                        )}
                    </button>

                    {/* DIVIDER */}
                    <div className="mx-1 h-7 w-px bg-[#CBE3D6]" />

                    {/* USER PROFILE */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setShowProfile((value) => !value)}
                            aria-expanded={showProfile}
                            aria-haspopup="menu"
                            className="flex items-center gap-2.5 rounded-[10px] border border-transparent px-2 py-1.5 transition-colors duration-150 hover:border-[#CBE3D6] hover:bg-white"
                        >
                            {/* AVATAR */}
                            <div
                                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border text-[12.5px] font-semibold text-[#152C20]"
                                style={{
                                    background: "#FFFFFF",
                                    borderColor: "rgba(31,138,95,0.35)",
                                }}
                            >
                                <span>{initial}</span>

                                {/* ONLINE INDICATOR */}
                                <span
                                    className="absolute bottom-[-1px] right-[-1px] h-[9px] w-[9px] rounded-full border-2 border-[#E4F1EA]"
                                    style={{ background: "#1F8A5F" }}
                                />
                            </div>

                            {/* USER DETAILS */}
                            <div className="hidden text-left sm:block">
                                <div className="flex items-center gap-1.5">
                                    <p className="max-w-[140px] truncate text-[13px] font-semibold leading-tight tracking-[-0.01em] text-[#152C20]">
                                        {userName}
                                    </p>

                                    <ShieldCheck size={12} strokeWidth={2} className="text-[#B8933A]" />
                                </div>

                                <p className="mt-0.5 max-w-[140px] truncate text-[11.5px] font-normal leading-none text-[#5C7A6C]">
                                    {userRole}
                                </p>
                            </div>

                            {/* CHEVRON */}
                            <ChevronDown
                                size={15}
                                strokeWidth={1.75}
                                className={`hidden text-[#5C7A6C] transition-transform duration-150 sm:block ${
                                    showProfile ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* PROFILE MENU */}
                        <ProfileMenu
                            isOpen={showProfile}
                            userName={userName}
                            userRole={userRole}
                            onProfile={() => {
                                console.log("Profile clicked");
                                setShowProfile(false);
                            }}
                            onSettings={() => {
                                console.log("Settings clicked");
                                setShowProfile(false);
                            }}
                            onLogout={() => {
                                console.log("Logout clicked");
                                setShowProfile(false);
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;