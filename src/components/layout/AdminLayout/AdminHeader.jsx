import React, { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, CircleHelp, Search, ShieldCheck } from "lucide-react";
import ProfileMenu from "./ProfileMenu";

const AdminHeader = ({
    userName = "Admin",
    userRole = "Administrator",
    notificationCount = 3,
}) => {
    const [showProfile, setShowProfile] = useState(false);
    const dropdownRef = useRef(null);

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
        <header className="fixed top-0 right-0 z-50 h-[74px] w-full border-b border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.055)]">
            {/* MAIN HEADER */}
            <div className="flex h-full items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                {/* LEFT SECTION */}
                <div className="flex min-w-0 items-center gap-7">
                    {/* LOGO */}
                    <div className="flex shrink-0 items-center">
                        <img
                            src="/vidyagxp_logo.png"
                            alt="VidyaGxP"
                            className="h-[54px] w-auto max-w-[250px] object-contain"
                        />
                    </div>

                    {/* VERTICAL DIVIDER */}
                    <div className="hidden h-9 w-px bg-slate-200 lg:block" />
                </div>

                {/* RIGHT SECTION */}
                <div className="flex shrink-0 items-center gap-2">
                    {/* HELP */}
                    <button
                        type="button"
                        aria-label="Help and support"
                        className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-95"
                    >
                        <CircleHelp size={18} strokeWidth={1.8} />
                    </button>

                    {/* NOTIFICATIONS */}
                    <button
                        type="button"
                        aria-label={`Notifications (${notificationCount} unread)`}
                        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-95"
                    >
                        <Bell
                            size={18}
                            strokeWidth={1.8}
                            className="transition-colors group-hover:text-[#F28C00]"
                        />

                        {notificationCount > 0 && (
                            <span className="absolute right-[-2px] top-[-3px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-[#F28C00] px-1 text-[8px] font-bold leading-none text-white">
                                {notificationCount > 9 ? "9+" : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* DIVIDER */}
                    <div className="mx-1 h-8 w-px bg-slate-200" />

                    {/* USER PROFILE */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setShowProfile((value) => !value)}
                            aria-expanded={showProfile}
                            aria-haspopup="menu"
                            className="group flex items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-1 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50"
                        >
                            {/* AVATAR */}
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-[13px] font-bold text-slate-700">
                                <span>{initial}</span>

                                {/* ONLINE INDICATOR */}
                                <span className="absolute bottom-[-1px] right-[-1px] h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                            </div>

                            {/* USER DETAILS */}
                            <div className="hidden text-left sm:block">
                                <div className="flex items-center gap-1.5">
                                    <p className="max-w-[140px] truncate text-[12px] font-semibold leading-tight text-slate-800">
                                        {userName}
                                    </p>

                                    <ShieldCheck
                                        size={12}
                                        strokeWidth={2}
                                        className="text-[#F28C00]"
                                    />
                                </div>

                                <p className="mt-1 max-w-[140px] truncate text-[9px] font-medium uppercase tracking-[0.06em] leading-none text-slate-400">
                                    {userRole}
                                </p>
                            </div>

                            {/* CHEVRON */}
                            <ChevronDown
                                size={15}
                                strokeWidth={1.8}
                                className={`hidden text-slate-400 transition-transform duration-200 sm:block ${
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

            {/* VERY SUBTLE BRAND LINE */}
            <div className="absolute bottom-0 left-0 h-px w-full bg-slate-100" />
        </header>
    );
};

export default AdminHeader;