import React, { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, ShieldCheck } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router-dom";
import SessionTimer from "../../common/SessionTimer/SessionTimer";
import { getRecordNotifications } from "../../../services/usersApi/workflowCommonApi";

const POLL_INTERVAL_MS = 60_000; // refresh every 60s

const UserHeader = ({
    // optional override — if not provided, the header fetches live count
    notificationCount: notificationCountOverride,
}) => {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const dropdownRef = useRef(null);

    const [pendingCount, setPendingCount] = useState(0);

    const userName = user?.name;
    const userRole = user?.roles?.[0];
    const initial = userName?.charAt(0)?.toUpperCase() || "A";

    const notificationCount =
        notificationCountOverride !== undefined
            ? notificationCountOverride
            : pendingCount;

    /* ==============================================================
       LIVE PENDING NOTIFICATION COUNT
       - fetch on mount
       - re-fetch when tab regains focus
       - poll every 60s as a fallback
    ============================================================== */
    useEffect(() => {
        let cancelled = false;

        const fetchCount = async () => {
            try {
                const res = await getRecordNotifications({
                    status: "pending",
                    page: 1,
                    per_page: 1,
                });

                const total = Number(res?.data?.data?.total) || 0;

                if (!cancelled) setPendingCount(total);
            } catch (err) {
                // silent — keep last known count
                if (import.meta?.env?.DEV) {
                    console.warn("Notification count fetch failed:", err?.message);
                }
            }
        };

        fetchCount();

        const onFocus = () => fetchCount();
        window.addEventListener("focus", onFocus);

        const interval = setInterval(fetchCount, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            window.removeEventListener("focus", onFocus);
            clearInterval(interval);
        };
    }, []);

    /* ==============================================================
       CLICK OUTSIDE PROFILE DROPDOWN
    ============================================================== */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowProfile(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header
            className="
                fixed
                top-0
                right-0
                z-50
                h-[76px]
                w-full
                border-b
                border-[#D6D8D3]
                bg-[#F1F0EB]
            "
            style={{
                boxShadow: "0 4px 18px -12px rgba(36,50,56,0.18)",
            }}
        >
            <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* =====================================================
                    BRAND AREA
                ====================================================== */}
                <div className="flex h-full min-w-0 items-center">

                    <button
                        type="button"
                        onClick={() => navigate("/user/cmms-dashboard")}
                        aria-label="Go to CMMS dashboard"
                        className="group flex h-full shrink-0 items-center rounded-none border-0 bg-transparent pr-4"
                    >
                        <img
                            src="/shilpaimage.png"
                            alt="Shilpa Logo"
                            className="h-[43px] w-auto max-w-[215px] cursor-pointer object-contain transition-transform duration-200 group-hover:scale-[1.015]"
                        />
                    </button>

                    <div className="hidden h-[34px] w-px bg-[#C9CDC7] lg:block" />

                    <button
                        type="button"
                        onClick={() => navigate("/user/cmms-dashboard")}
                        aria-label="Go to CMMS dashboard"
                        className="group flex h-full shrink-0 items-center rounded-none border-0 bg-transparent pl-4"
                    >
                        <img
                            src="/vidyagxp_logo.png"
                            alt="VidyaGxP"
                            className="h-[43px] w-auto max-w-[215px] cursor-pointer object-contain transition-transform duration-200 group-hover:scale-[1.015]"
                        />
                    </button>
                </div>

                {/* =====================================================
                    RIGHT AREA
                ====================================================== */}
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                    {/* SESSION TIMER */}
                    <div className="hidden items-center rounded-[10px] border border-[#D6D8D3] bg-[#F7F6F2] px-1 py-1 text-[#53615F] shadow-[0_1px_5px_rgba(36,50,56,0.035)] sm:flex">
                        <SessionTimer />
                    </div>

                    {/* NOTIFICATIONS */}
                    <button
                        type="button"
                        onClick={() => navigate("/user/notification-list")}
                        aria-label={
                            notificationCount > 0
                                ? `Notifications, ${notificationCount} pending`
                                : "Notifications"
                        }
                        className="
                            relative flex h-[42px] w-[42px] items-center justify-center
                            rounded-[11px] border border-[#D6D8D3] bg-[#F7F6F2]
                            text-[#596965] shadow-[0_1px_5px_rgba(36,50,56,0.035)]
                            transition-all duration-200 hover:border-[#B8C7C0]
                            hover:bg-[#EDF3F0] hover:text-[#4B6F66] active:scale-[0.97]
                        "
                    >
                        <Bell size={18} strokeWidth={1.8} />

                        {notificationCount > 0 && (
                            <span
                                className="
                                    absolute -right-1 -top-1 flex h-[18px] min-w-[18px]
                                    items-center justify-center rounded-full border-2
                                    border-[#F1F0EB] bg-[#A47D45] px-1
                                    text-[9px] font-bold leading-none text-white
                                    shadow-[0_1px_3px_rgba(164,125,69,0.45)]
                                "
                            >
                                {notificationCount > 99 ? "99+" : notificationCount}
                            </span>
                        )}
                    </button>

                    <div className="mx-1 hidden h-[30px] w-px bg-[#D1D4CF] sm:block" />

                    {/* USER PROFILE */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setShowProfile((v) => !v)}
                            aria-expanded={showProfile}
                            aria-haspopup="menu"
                            className="group flex items-center gap-2.5 rounded-[12px] border border-transparent bg-transparent px-2 py-1.5 transition-all duration-200 hover:border-[#D6D8D3] hover:bg-[#F7F6F2]"
                        >
                            <div className="relative flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[11px] border border-[#B8C7C0] bg-[#DCE7E2] text-[13px] font-bold text-[#29433C]">
                                <span>{initial}</span>
                                <span className="absolute bottom-[-1px] right-[-1px] h-[10px] w-[10px] rounded-full border-2 border-[#F1F0EB] bg-[#56766D]" />
                            </div>

                            <div className="hidden min-w-0 text-left sm:block">
                                <div className="flex items-center gap-1.5">
                                    <p className="max-w-[145px] truncate text-[13px] font-semibold leading-tight tracking-[-0.01em] text-[#243238]">
                                        {userName}
                                    </p>
                                    <ShieldCheck
                                        size={12}
                                        strokeWidth={2}
                                        className="shrink-0 text-[#A47D45]"
                                    />
                                </div>

                                <p className="mt-1 max-w-[145px] truncate text-[11px] font-medium leading-none text-[#7B8584]">
                                    {userRole}
                                </p>
                            </div>

                            <ChevronDown
                                size={15}
                                strokeWidth={1.8}
                                className={`hidden text-[#7B8584] transition-transform duration-200 sm:block ${
                                    showProfile ? "rotate-180 text-[#56766D]" : ""
                                }`}
                            />
                        </button>

                        <ProfileMenu
                            isOpen={showProfile}
                            userName={userName}
                            userRole={userRole}
                            onProfile={() => {
                                navigate("/user/user-profile");
                                setShowProfile(false);
                            }}
                            onSettings={() => {
                                navigate("/user/user-setting");
                                setShowProfile(false);
                            }}
                            onLogout={() => {
                                setShowProfile(false);
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default UserHeader;