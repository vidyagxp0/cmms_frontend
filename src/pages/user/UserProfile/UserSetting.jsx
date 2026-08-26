import React, { useEffect, useState } from "react";
import { Settings, ArrowLeft, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { getProfile, updateProfile, changePasword, logout } from "../../../services/authApi";

// Import modular child components
import ProfileSidebar from "./ProfileSidebar";
import UpdateProfileForm from "./UpdateProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";

const UserSetting = () => {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const navigate = useNavigate();

    // Active Sidebar Tab State (Defaults to 'update' since details are on the Profile page)
    const [activeTab, setActiveTab] = useState("update"); // 'update' | 'password'

    // Profile details state (loaded fresh from API on mount)
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Update Profile form states (Name and Email are editable)
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
        if (!pwd) return { score: 0, label: "", color: "bg-gray-200" };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        switch (score) {
            case 1:
                return { score: 25, label: "Weak", color: "bg-red-500" };
            case 2:
                return { score: 50, label: "Fair", color: "bg-orange-400" };
            case 3:
                return { score: 75, label: "Good", color: "bg-yellow-500" };
            case 4:
                return { score: 100, label: "Strong", color: "bg-emerald-500" };
            default:
                return { score: 0, label: "", color: "bg-gray-200" };
        }
    };

    const passwordStrength = getPasswordStrength(passwordForm.newPassword);

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

    // Update Field state for Edit Form
    const handleEditFieldChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
        if (editErrors[field]) {
            setEditErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // Validate Edit Profile Form (Name and Email)
    const validateEditForm = () => {
        const errors = {};
        if (!editForm.name.trim()) {
            errors.name = "Full Name is required";
        }
        if (!editForm.email.trim()) {
            errors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
            errors.email = "Invalid email address format";
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
            toast.success("Profile details updated successfully!");

            // Update local state details
            setProfileData((prev) => ({ ...prev, ...payload }));

            // Update Zustand global store
            if (user) {
                setUser({
                    ...user,
                    name: editForm.name.trim(),
                    email: editForm.email.trim(),
                });
            }
        } catch (error) {
            console.error("Failed to update profile details:", error);
            const apiMsg = error?.response?.data?.message || "Failed to update profile details.";
            toast.error(apiMsg);
        } finally {
            setUpdatingProfile(false);
        }
    };

    // Validate Change Password Form
    const validatePasswordForm = () => {
        const errors = {};
        if (!passwordForm.currentPassword) {
            errors.currentPassword = "Current Password is required";
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = "New Password is required";
        } else if (passwordForm.newPassword.length < 8) {
            errors.newPassword = "Password must be at least 8 characters long";
        }
        if (passwordForm.confirmPassword !== passwordForm.newPassword) {
            errors.confirmPassword = "Passwords do not match";
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
                current_password: passwordForm.currentPassword,
                password: passwordForm.newPassword,
                password_confirmation: passwordForm.confirmPassword,
            };

            await changePasword(payload);
            toast.success("Password changed successfully! Logging you out...");

            try {
                await logout();
            } catch (logoutErr) {
                console.error("Logout request failed:", logoutErr);
            } finally {
                clearAuth();
                navigate("/login", { replace: true });
            }
        } catch (error) {
            console.error("Failed to change password:", error);
            const apiMsg = error?.response?.data?.message || "Failed to change password. Please check current password.";
            toast.error(apiMsg);
            setChangingPassword(false);
        }
    };

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
                    <span className="text-[13px] font-semibold text-[#5C7A6C]">Loading Settings Workspace...</span>
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
                        <Settings size={20} strokeWidth={2} className={theme.textAccent} />
                    </span>
                    <div>
                        <h1 className="text-[22px] font-bold tracking-tight text-[#152C20]">
                            Account Settings
                        </h1>
                        <p className="mt-0.5 text-[12px] text-[#6C8679]">
                            Configure your account preferences, credentials, and settings.
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
                {/* 1. Left Sidebar component */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <ProfileSidebar
                        profileData={profileData}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        theme={theme}
                    />
                </div>

                {/* 2. Right Interactive Content Panel */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className={`relative min-h-[500px] overflow-hidden rounded-2xl border ${theme.borderLight} bg-white p-6 shadow-[0_10px_30px_-18px_rgba(21,44,32,0.25)] sm:p-8`}>
                        <AnimatePresence mode="wait">
                            {activeTab === "update" && (
                                <UpdateProfileForm
                                    editForm={editForm}
                                    editErrors={editErrors}
                                    updatingProfile={updatingProfile}
                                    handleEditFieldChange={handleEditFieldChange}
                                    handleEditFormSubmit={handleEditFormSubmit}
                                    theme={theme}
                                    onCancel={() => {
                                        setEditForm({
                                            name: profileData?.name || "",
                                            email: profileData?.email || "",
                                        });
                                        setEditErrors({});
                                    }}
                                />
                            )}

                            {activeTab === "password" && (
                                <ChangePasswordForm
                                    passwordForm={passwordForm}
                                    setPasswordForm={setPasswordForm}
                                    showPasswords={showPasswords}
                                    setShowPasswords={setShowPasswords}
                                    passwordErrors={passwordErrors}
                                    setPasswordErrors={setPasswordErrors}
                                    changingPassword={changingPassword}
                                    passwordStrength={passwordStrength}
                                    handlePasswordSubmit={handlePasswordSubmit}
                                    theme={theme}
                                    onCancel={() => {
                                        setPasswordForm({
                                            currentPassword: "",
                                            newPassword: "",
                                            confirmPassword: "",
                                        });
                                        setPasswordErrors({});
                                    }}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSetting;
