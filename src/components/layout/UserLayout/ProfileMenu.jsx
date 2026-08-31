import React, { useState } from "react";
import { LogOut, Settings, User, Loader2, X } from "lucide-react";
import { logout } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";


const ProfileMenu = ({
    isOpen,
    onProfile,
    onSettings,
    onLogout,
}) => {
  const user = useAuthStore((state) => state.user);
const clearAuth = useAuthStore((state) => state.clearAuth);

const navigate = useNavigate();

const userName = user?.name;
const userRole = user?.roles?.[0];

const [showLogoutModal, setShowLogoutModal] = useState(false);
const [isLoggingOut, setIsLoggingOut] = useState(false);

const handleLogoutClick = () => setShowLogoutModal(true);

const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
        await logout();
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        clearAuth();
        setShowLogoutModal(false);
        setIsLoggingOut(false);

        navigate("/login", {
            replace: true,
        });
    }
};
    const initial = userName?.charAt(0)?.toUpperCase() || "A";

    const authType = sessionStorage.getItem("auth_type");
    const isSystemAdmin = authType === "Admin";

    const hoverBgClass = isSystemAdmin ? "hover:bg-[#EAF5EE]" : "hover:bg-[#EFF6FF]";
    const hoverTextClass = isSystemAdmin ? "hover:text-[#17734C]" : "hover:text-[#2563EB]";
    const userBlockBg = isSystemAdmin ? "bg-[#F3F9F5]" : "bg-[#EFF6FF]";
    const borderLight = isSystemAdmin ? "border-[#CBE3D6]" : "border-[#BFDBFE]";
    const borderHeader = isSystemAdmin ? "border-[#E3F0E8]" : "border-[#DBEAFE]";
    const shadowColor = isSystemAdmin ? "shadow-[0_18px_45px_rgba(21,44,32,0.16)]" : "shadow-[0_18px_45px_rgba(37,99,235,0.16)]";
    const avatarBorder = isSystemAdmin ? "rgba(31,138,95,0.35)" : "rgba(37,99,235,0.35)";
    const textAccentMuted = isSystemAdmin ? "text-[#5C7A6C]" : "text-[#5B7898]";

    return (
        <>
            <div>
                {isOpen && (
                    <div
                        className={`absolute right-0 top-[54px] z-[100] w-[230px] overflow-hidden rounded-2xl border ${borderLight} bg-white ${shadowColor}`}
                    >
                        {/* USER BLOCK */}
                        <div className={`flex items-center gap-3 border-b ${borderHeader} ${userBlockBg} px-4 py-4`}>
                            <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border text-[12.5px] font-semibold text-[#152C20]"
                                style={{
                                    background: "#FFFFFF",
                                    borderColor: avatarBorder,
                                }}
                            >
                                {initial}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-[12.5px] font-semibold text-[#152C20]">
                                    {userName}
                                </p>
                                <p className={`mt-0.5 truncate text-[10.5px] ${textAccentMuted}`}>
                                    {userRole}
                                </p>
                            </div>
                        </div>

                        <div className="p-2">
                            <button
                                type="button"
                                onClick={onProfile}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium text-[#3E5A4D] transition-colors duration-150 ${hoverBgClass} ${hoverTextClass}`}
                            >
                                <User size={15} strokeWidth={1.9} />
                                Profile
                            </button>

                            <button
                                type="button"
                                onClick={onSettings}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium text-[#3E5A4D] transition-colors duration-150 ${hoverBgClass} ${hoverTextClass}`}
                            >
                                <Settings size={15} strokeWidth={1.9} />
                                Settings
                            </button>

                            <div className={`my-1.5 border-t ${borderHeader}`} />

                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                disabled={isLoggingOut}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[#C43D3D] transition-colors duration-150 hover:bg-[#FBEDED] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <LogOut size={15} strokeWidth={1.9} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1712]/45 px-4 backdrop-blur-[3px]">
                    <div className="relative w-full max-w-[380px] overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_25px_70px_rgba(21,44,32,0.28)]">
                        <button
                            type="button"
                            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
                            disabled={isLoggingOut}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#8FA79B] transition-colors duration-150 hover:bg-[#EAF5EE] hover:text-[#3E5A4D] disabled:opacity-40"
                        >
                            <X size={17} />
                        </button>

                        <div className="px-6 pb-6 pt-7">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBEDED] text-[#C43D3D]">
                                <LogOut size={21} />
                            </div>

                            <h3 className="mt-4 text-center text-[17px] font-bold text-[#152C20]">
                                Confirm Logout
                            </h3>

                            <p className="mx-auto mt-2 max-w-[290px] text-center text-[12px] leading-5 text-[#5C7A6C]">
                                Are you sure you want to logout from the CMMS system?
                            </p>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutModal(false)}
                                    disabled={isLoggingOut}
                                    className="rounded-xl border border-[#CBE3D6] px-4 py-2.5 text-[11px] font-semibold text-[#3E5A4D] transition-colors duration-150 hover:bg-[#EAF5EE] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex min-w-[105px] items-center justify-center gap-2 rounded-xl bg-[#C43D3D] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#AD3333] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut size={14} />
                                            Logout
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileMenu;