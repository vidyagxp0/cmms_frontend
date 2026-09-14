import React, { useState } from "react";
import {
    LogOut,
    Settings,
    User,
    Loader2,
    X,
} from "lucide-react";
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

    const hoverBgClass = isSystemAdmin
        ? "hover:bg-[#EDF5F3]"
        : "hover:bg-[#F2F5F6]";

    const hoverTextClass = isSystemAdmin
        ? "hover:text-[#287C73]"
        : "hover:text-[#2B5663]";

    const userBlockBg = "#F3F7F5";

    const borderLight = isSystemAdmin
        ? "border-[#D9E4E1]"
        : "border-[#DCE3E6]";

    const borderHeader = isSystemAdmin
        ? "border-[#E1EAE7]"
        : "border-[#E3E9EB]";

    const shadowColor =
        "shadow-[0_24px_60px_rgba(36,50,56,0.16)]";

    const avatarBorder = "rgba(86,118,109,0.32)";

    const textAccentMuted = isSystemAdmin
        ? "text-[#718A83]"
        : "text-[#75858D]";

    return (
        <>
            {/* =====================================================
                PROFILE DROPDOWN
            ====================================================== */}
            <div>
                {isOpen && (
                    <div
                        className={`
                            absolute
                            right-0
                            top-[55px]
                            z-[100]
                            w-[244px]
                            overflow-hidden
                            rounded-[15px]
                            border
                            ${borderLight}
                            bg-white
                            ${shadowColor}
                        `}
                    >
                        {/* USER BLOCK */}
                        <div
                            className={`
                                flex
                                items-center
                                gap-3
                                border-b
                                ${borderHeader}
                                px-4
                                py-4
                            `}
                            style={{
                                background: userBlockBg,
                            }}
                        >
                            <div
                                className="
                                    relative
                                    flex
                                    h-[39px]
                                    w-[39px]
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-[10px]
                                    border
                                    bg-[#DCE7E2]
                                    text-[12.5px]
                                    font-bold
                                    text-[#29433C]
                                "
                                style={{
                                    borderColor: avatarBorder,
                                }}
                            >
                                {initial}

                                <span
                                    className="
                                        absolute
                                        bottom-[-1px]
                                        right-[-1px]
                                        h-[9px]
                                        w-[9px]
                                        rounded-full
                                        border-2
                                        border-[#DCE7E2]
                                        bg-[#56766D]
                                    "
                                />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-[12.5px] font-semibold text-[#243238]">
                                    {userName}
                                </p>

                                <p
                                    className={`
                                        mt-1
                                        truncate
                                        text-[10.5px]
                                        font-medium
                                        ${textAccentMuted}
                                    `}
                                >
                                    {userRole}
                                </p>
                            </div>
                        </div>

                        {/* MENU */}
                        <div className="p-2">

                            {/* PROFILE */}
                            <button
                                type="button"
                                onClick={onProfile}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-[10px]
                                    px-3
                                    py-2.5
                                    text-left
                                    text-[12px]
                                    font-medium
                                    text-[#46575F]
                                    transition-colors
                                    duration-150
                                    ${hoverBgClass}
                                    ${hoverTextClass}
                                `}
                            >
                                <User
                                    size={15}
                                    strokeWidth={1.9}
                                />

                                <span>Profile</span>
                            </button>

                            {/* SETTINGS */}
                            <button
                                type="button"
                                onClick={onSettings}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-[10px]
                                    px-3
                                    py-2.5
                                    text-left
                                    text-[12px]
                                    font-medium
                                    text-[#46575F]
                                    transition-colors
                                    duration-150
                                    ${hoverBgClass}
                                    ${hoverTextClass}
                                `}
                            >
                                <Settings
                                    size={15}
                                    strokeWidth={1.9}
                                />

                                <span>Settings</span>
                            </button>

                            {/* DIVIDER */}
                            <div
                                className={`
                                    my-1.5
                                    border-t
                                    ${borderHeader}
                                `}
                            />

                            {/* LOGOUT */}
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                disabled={isLoggingOut}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-[10px]
                                    px-3
                                    py-2.5
                                    text-left
                                    text-[12px]
                                    font-semibold
                                    text-[#B54A4A]
                                    transition-colors
                                    duration-150
                                    hover:bg-[#FCF1F1]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <LogOut
                                    size={15}
                                    strokeWidth={1.9}
                                />

                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* =====================================================
                LOGOUT MODAL
            ====================================================== */}
            {showLogoutModal && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]
                        flex
                        items-center
                        justify-center
                        bg-[#243238]/45
                        px-4
                        backdrop-blur-[4px]
                    "
                >
                    <div
                        className="
                            relative
                            w-full
                            max-w-[380px]
                            overflow-hidden
                            rounded-[17px]
                            border
                            border-[#D6D8D3]
                            bg-white
                            shadow-[0_28px_75px_rgba(36,50,56,0.25)]
                        "
                    >
                        {/* CLOSE */}
                        <button
                            type="button"
                            onClick={() =>
                                !isLoggingOut &&
                                setShowLogoutModal(false)
                            }
                            disabled={isLoggingOut}
                            className="
                                absolute
                                right-4
                                top-4
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-[#829097]
                                transition-colors
                                duration-150
                                hover:bg-[#F2F5F5]
                                hover:text-[#455760]
                                disabled:opacity-40
                            "
                        >
                            <X size={17} />
                        </button>

                        <div className="px-6 pb-6 pt-7">

                            {/* ICON */}
                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#FCF0F0]
                                    text-[#B54A4A]
                                "
                            >
                                <LogOut size={21} />
                            </div>

                            {/* TITLE */}
                            <h3 className="mt-4 text-center text-[17px] font-bold text-[#243238]">
                                Confirm Logout
                            </h3>

                            {/* DESCRIPTION */}
                            <p className="mx-auto mt-2 max-w-[290px] text-center text-[12px] leading-5 text-[#748088]">
                                Are you sure you want to logout from the CMMS system?
                            </p>

                            {/* ACTIONS */}
                            <div className="mt-6 flex items-center justify-end gap-3">

                                {/* CANCEL */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowLogoutModal(false)
                                    }
                                    disabled={isLoggingOut}
                                    className="
                                        rounded-[10px]
                                        border
                                        border-[#D8E1E3]
                                        px-4
                                        py-2.5
                                        text-[11px]
                                        font-semibold
                                        text-[#46575F]
                                        transition-colors
                                        duration-150
                                        hover:bg-[#F3F6F6]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>

                                {/* LOGOUT */}
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="
                                        flex
                                        min-w-[105px]
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-[10px]
                                        bg-[#B54A4A]
                                        px-4
                                        py-2.5
                                        text-[11px]
                                        font-semibold
                                        text-white
                                        shadow-sm
                                        transition-all
                                        duration-150
                                        hover:bg-[#A13F3F]
                                        hover:shadow-[0_4px_12px_rgba(181,74,74,0.18)]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-70
                                    "
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
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