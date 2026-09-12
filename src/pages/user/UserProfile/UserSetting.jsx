import React, { useEffect, useState } from "react";
import {
    Settings,
    ArrowLeft,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import {
    getProfile,
    updateProfile,
    changePasword,
    logout,
} from "../../../services/authApi";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

// Import modular child components
import ProfileSidebar from "./ProfileSidebar";
import UpdateProfileForm from "./UpdateProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";

const UserSetting = () => {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const navigate = useNavigate();

    // Active Sidebar Tab State
    const [activeTab, setActiveTab] = useState("update");

    // Profile details state
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Update Profile form states
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
    });

    const [editErrors, setEditErrors] = useState({});
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Change Password form states
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);

    // Password strength check helper
    const getPasswordStrength = (pwd) => {
        if (!pwd) {
            return {
                score: 0,
                label: "",
                color: "bg-gray-200",
            };
        }

        let score = 0;

        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        switch (score) {
            case 1:
                return {
                    score: 25,
                    label: "Weak",
                    color: "bg-red-500",
                };

            case 2:
                return {
                    score: 50,
                    label: "Fair",
                    color: "bg-orange-400",
                };

            case 3:
                return {
                    score: 75,
                    label: "Good",
                    color: "bg-yellow-500",
                };

            case 4:
                return {
                    score: 100,
                    label: "Strong",
                    color: "bg-emerald-500",
                };

            default:
                return {
                    score: 0,
                    label: "",
                    color: "bg-gray-200",
                };
        }
    };

    const passwordStrength =
        getPasswordStrength(
            passwordForm.newPassword
        );

    // Fetch user details from profile endpoint
    const fetchUserProfile = async () => {
        try {
            setLoadingProfile(true);

            const response = await getProfile();
            const apiUser = response?.data?.data;

            if (apiUser) {
                setProfileData(apiUser);

                setEditForm({
                    name: apiUser.name || "",
                    email: apiUser.email || "",
                });
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
        const authType =
            sessionStorage.getItem("auth_type");

        if (authType === "Admin") {
            navigate("/admin/dashboard");
        } else {
            navigate("/user/equipment-dashboard");
        }
    };

    // Update Field state for Edit Form
    const handleEditFieldChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (editErrors[field]) {
            setEditErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    // Validate Edit Profile Form
    const validateEditForm = () => {
        const errors = {};

        if (!editForm.name.trim()) {
            errors.name =
                "Full Name is required";
        }

        if (!editForm.email.trim()) {
            errors.email =
                "Email address is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                editForm.email
            )
        ) {
            errors.email =
                "Invalid email address format";
        }

        setEditErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // Submit Edit Profile Details
    const handleEditFormSubmit = async (e) => {
        e.preventDefault();

        if (!validateEditForm()) return;

        try {
            setUpdatingProfile(true);

            const payload = {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
            };

            await updateProfile(payload);

            toast.success(
                "Profile details updated successfully!"
            );

            // Update local state details
            setProfileData((prev) => ({
                ...prev,
                ...payload,
            }));

            // Update Zustand global store
            if (user) {
                setUser({
                    ...user,
                    name: editForm.name.trim(),
                    email: editForm.email.trim(),
                });
            }

            navigate("/user/cmms-dashboard");
        } catch (error) {
            console.error(
                "Failed to update profile details:",
                error
            );

            const apiMsg =
                error?.response?.data?.message ||
                "Failed to update profile details.";

            toast.error(apiMsg);
        } finally {
            setUpdatingProfile(false);
        }
    };

    // Validate Change Password Form
    const validatePasswordForm = () => {
        const errors = {};

        if (!passwordForm.currentPassword) {
            errors.currentPassword =
                "Current Password is required";
        }

        if (!passwordForm.newPassword) {
            errors.newPassword =
                "New Password is required";
        } else if (
            passwordForm.newPassword.length < 8
        ) {
            errors.newPassword =
                "Password must be at least 8 characters long";
        }

        if (
            passwordForm.confirmPassword !==
            passwordForm.newPassword
        ) {
            errors.confirmPassword =
                "Passwords do not match";
        }

        setPasswordErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // Submit Change Password Form
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) return;

        try {
            setChangingPassword(true);

            const payload = {
                current_password:
                    passwordForm.currentPassword,
                password:
                    passwordForm.newPassword,
                password_confirmation:
                    passwordForm.confirmPassword,
            };

            await changePasword(payload);

            toast.success(
                "Password changed successfully! Logging you out..."
            );

            try {
                await logout();
            } catch (logoutErr) {
                console.error(
                    "Logout request failed:",
                    logoutErr
                );
            } finally {
                clearAuth();

                navigate("/login", {
                    replace: true,
                });
            }
        } catch (error) {
            console.error(
                "Failed to change password:",
                error
            );

            const apiMsg =
                error?.response?.data?.message ||
                "Failed to change password. Please check current password.";

            toast.error(apiMsg);

            setChangingPassword(false);
        }
    };

    // =============================================================
    // APPROVED CMMS THEME
    // =============================================================
    const theme = {
        isSystemAdmin:
            sessionStorage.getItem("auth_type") ===
            "Admin",

        textAccent: "text-[#56766D]",

        bgAccent: "bg-[#56766D]",

        bgHoverAccent:
            "hover:bg-[#48685F]",

        lightBg: "bg-[#E8F0ED]",

        borderLight:
            "border-[#D6D8D3]",

        borderBadge:
            "border-[#C7D8D2]",

        rowHover:
            "hover:bg-[#F4F6F3]",

        shadowAccent:
            "shadow-[0_5px_18px_rgba(86,118,109,0.12)]",

        ringAccent:
            "ring-[#C7D8D2]",

        textAccentHover:
            "hover:text-[#48685F]",

        borderHover:
            "hover:border-[#B9CBC4]",

        navActive:
            "bg-[#E8F0ED] text-[#48685F] border-[#C7D8D2]",

        badgeBg:
            "bg-[#E8F0ED]",
    };

    if (loadingProfile) {
        return (
            <div className="min-h-full bg-[#F1F0EB]">
                <Skeleton
                    variant="accountSettings"
                />
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
                        <Settings
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
                                Account Settings
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
                                text-[#7A8582]
                            "
                        >
                            Configure your account preferences, credentials, and settings.
                        </p>
                    </div>
                </div>

                {/* BACK TO DASHBOARD */}
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
                SETTINGS LAYOUT
            ====================================================== */}
            <div
                className="
                    grid
                    grid-cols-1
                    gap-5
                    lg:grid-cols-12
                "
            >
                {/* SIDEBAR */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <ProfileSidebar
                        profileData={profileData}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        theme={theme}
                    />
                </div>

                {/* MAIN CONTENT */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div
                        className="
                            relative
                            min-h-[500px]
                            overflow-hidden
                            rounded-[18px]
                            border
                            border-[#D6D8D3]
                            bg-white
                            shadow-[0_5px_20px_rgba(36,50,56,0.055)]
                        "
                    >
                        {/* DECORATIVE CORNER */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                right-0
                                top-0
                                h-[145px]
                                w-[145px]
                                translate-x-[58px]
                                -translate-y-[58px]
                                rounded-full
                                bg-[#E8F0ED]
                                opacity-45
                            "
                        />

                        <div className="relative z-10 p-5 sm:p-7">

                            <AnimatePresence mode="wait">
                                {activeTab === "update" && (
                                    <UpdateProfileForm
                                        editForm={editForm}
                                        editErrors={editErrors}
                                        updatingProfile={
                                            updatingProfile
                                        }
                                        handleEditFieldChange={
                                            handleEditFieldChange
                                        }
                                        handleEditFormSubmit={
                                            handleEditFormSubmit
                                        }
                                        theme={theme}
                                        onCancel={() => {
                                            setEditForm({
                                                name:
                                                    profileData?.name ||
                                                    "",
                                                email:
                                                    profileData?.email ||
                                                    "",
                                            });

                                            setEditErrors({});
                                        }}
                                    />
                                )}

                                {activeTab === "password" && (
                                    <ChangePasswordForm
                                        passwordForm={
                                            passwordForm
                                        }
                                        setPasswordForm={
                                            setPasswordForm
                                        }
                                        showPasswords={
                                            showPasswords
                                        }
                                        setShowPasswords={
                                            setShowPasswords
                                        }
                                        passwordErrors={
                                            passwordErrors
                                        }
                                        setPasswordErrors={
                                            setPasswordErrors
                                        }
                                        changingPassword={
                                            changingPassword
                                        }
                                        passwordStrength={
                                            passwordStrength
                                        }
                                        handlePasswordSubmit={
                                            handlePasswordSubmit
                                        }
                                        theme={theme}
                                        onCancel={() => {
                                            setPasswordForm({
                                                currentPassword:
                                                    "",
                                                newPassword:
                                                    "",
                                                confirmPassword:
                                                    "",
                                            });

                                            setPasswordErrors(
                                                {}
                                            );
                                        }}
                                    />
                                )}
                            </AnimatePresence>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSetting;