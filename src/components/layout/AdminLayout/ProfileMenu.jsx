import React, { useState } from "react";
import { LogOut, Settings, User, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
// import { logout } from "../../api/authApi";

const ProfileMenu = ({
    isOpen,
    userName = "Admin",
    userRole = "Administrator",
    onProfile,
    onSettings,
    onLogout,
}) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
        await logout();

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("auth-storage");

        setShowLogoutModal(false);

        navigate("/login", { replace: true });
    } catch (error) {
        console.error("Logout failed:", error);

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user");

        setShowLogoutModal(false);

        navigate("/login", { replace: true });
    } finally {
        setIsLoggingOut(false);
    }
};

    return (
        <>
            {/* Profile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -6,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -6,
                            scale: 0.97,
                        }}
                        transition={{
                            duration: 0.16,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="
                            absolute
                            right-0
                            top-[54px]
                            z-[100]
                            w-[220px]
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            shadow-[0_18px_45px_rgba(15,58,99,0.25)]
                        "
                    >
                        {/* Profile Header */}
                        <div
                            className="px-4 py-4"
                            style={{
                                background:
                                    "linear-gradient(135deg,#0F3A63 0%,#12A594 130%)",
                            }}
                        >
                            <p className="text-[12px] font-bold text-white">
                                {userName}
                            </p>

                            <p className="mt-1 text-[10px] text-white/60">
                                {userRole}
                            </p>
                        </div>

                        {/* Profile Options */}
                        <div className="p-2">
                            <button
                                type="button"
                                onClick={onProfile}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3
                                    py-2.5
                                    text-left
                                    text-[11px]
                                    font-medium
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                "
                            >
                                <User size={15} />
                                My Profile
                            </button>

                            <button
                                type="button"
                                onClick={onSettings}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3
                                    py-2.5
                                    text-left
                                    text-[11px]
                                    font-medium
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                "
                            >
                                <Settings size={15} />
                                Settings
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                disabled={isLoggingOut}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3
                                    py-2.5
                                    text-left
                                    text-[11px]
                                    font-semibold
                                    text-red-500
                                    transition
                                    hover:bg-red-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <LogOut size={15} />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="
                            fixed
                            inset-0
                            z-[9999]
                            flex
                            items-center
                            justify-center
                            bg-black/40
                            px-4
                            backdrop-blur-[3px]
                        "
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.94,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.94,
                                y: 15,
                            }}
                            transition={{
                                duration: 0.2,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="
                                relative
                                w-full
                                max-w-[380px]
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                shadow-[0_25px_70px_rgba(11,42,74,0.25)]
                            "
                        >
                            {/* Close */}
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
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                    disabled:opacity-40
                                "
                            >
                                <X size={17} />
                            </button>

                            {/* Modal Content */}
                            <div className="px-6 pb-6 pt-7">
                                <div className="
                                    mx-auto
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-50
                                    text-red-500
                                ">
                                    <LogOut size={21} />
                                </div>

                                <h3 className="
                                    mt-4
                                    text-center
                                    text-[17px]
                                    font-bold
                                    text-[#0F3A63]
                                ">
                                    Confirm Logout
                                </h3>

                                <p className="
                                    mx-auto
                                    mt-2
                                    max-w-[290px]
                                    text-center
                                    text-[12px]
                                    leading-5
                                    text-slate-500
                                ">
                                    Are you sure you want to logout from
                                    the CMMS system?
                                </p>

                                {/* Actions */}
                                <div className="
                                    mt-6
                                    flex
                                    items-center
                                    justify-end
                                    gap-3
                                ">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowLogoutModal(false)
                                        }
                                        disabled={isLoggingOut}
                                        className="
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-4
                                            py-2.5
                                            text-[11px]
                                            font-semibold
                                            text-slate-600
                                            transition
                                            hover:bg-slate-50
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        Cancel
                                    </button>

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
                                            rounded-xl
                                            bg-red-500
                                            px-4
                                            py-2.5
                                            text-[11px]
                                            font-semibold
                                            text-white
                                            shadow-sm
                                            transition
                                            hover:bg-red-600
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProfileMenu;