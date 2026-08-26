import React, { useEffect, useState } from "react";
import {
    User,
    UserPen,
    KeyRound,
    Mail,
    Phone,
    Building2,
    ShieldCheck,
    Calendar,
    Eye,
    EyeOff,
    Loader2,
    Hash,
    AtSign,
    LockKeyhole,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { getProfile, updateProfile, changePasword } from "../../../services/authApi";
import { inputClass } from "../../../components/ui/formStyles";

const UserProfile = () => {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    // Active Sidebar Tab State
    const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'update' | 'password'

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
            toast.success("Profile updated successfully!");

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

            setActiveTab("profile");
        } catch (error) {
            console.error("Failed to update profile:", error);
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
                new_password: passwordForm.newPassword,
                new_password_confirmation: passwordForm.confirmPassword,
            };

            await changePasword(payload);
            toast.success("Password changed successfully!");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setActiveTab("profile");
        } catch (error) {
            console.error("Failed to change password:", error);
            const apiMsg = error?.response?.data?.message || "Failed to change password. Please check current password.";
            toast.error(apiMsg);
        } finally {
            setChangingPassword(false);
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

    if (loadingProfile) {
        return (
            <div className="flex min-h-[450px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={36} className="animate-spin text-[#17734C]" />
                    <span className="text-[13px] font-semibold text-[#5C7A6C]">Loading Profile Workspace...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl animate-fadeIn">
            {/* Page Header */}
            <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#B8D9C8] bg-[#EEF8F2] shadow-sm">
                    <User size={20} strokeWidth={2} className="text-[#17734C]" />
                </span>
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-[#152C20]">
                        Account Workspace
                    </h1>
                    <p className="mt-0.5 text-[12px] text-[#6C8679]">
                        Manage your user information, profile settings, and credentials.
                    </p>
                </div>
            </div>

            {/* Split Layout Container */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* 1. Left Navigation Sidebar Panel */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="flex flex-col rounded-2xl border border-[#CBE3D6] bg-white p-5 shadow-[0_8px_30px_rgba(21,44,32,0.06)]">
                        {/* Profile Photo Display Block (Non-editable custom visual circle avatar) */}
                        <div className="flex flex-col items-center pb-6 text-center border-b border-[#E3F0E8]">
                            <div className="relative">
                                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EEF8F2] shadow-[0_4px_15px_rgba(23,115,76,0.12)] ring-2 ring-[#CBE3D6]">
                                    <span className="text-[32px] font-extrabold text-[#17734C]">
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
                                        className="inline-flex items-center gap-1 rounded-full border border-[#B8DAC6] bg-[#EEF8F2] px-2.5 py-0.5 text-[10.5px] font-bold text-[#17734C]"
                                    >
                                        <ShieldCheck size={11} className="text-[#17734C]" />
                                        {role.name || role}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Links List */}
                        <nav className="mt-6 flex flex-col gap-1.5">
                            <button
                                type="button"
                                onClick={() => setActiveTab("profile")}
                                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-left text-[13px] font-semibold transition-all duration-200 ${
                                    activeTab === "profile"
                                        ? "bg-[#EEF8F2] text-[#17734C] border border-[#B8D9C8]"
                                        : "text-[#5C7A6C] hover:bg-[#F4FAF7] hover:text-[#17734C] border border-transparent"
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <User
                                        size={16}
                                        className={`transition-colors duration-200 ${
                                            activeTab === "profile" ? "text-[#17734C]" : "text-[#8FA79B]"
                                        }`}
                                    />
                                    Profile Details
                                </span>
                                {activeTab === "profile" && (
                                    <motion.div
                                        layoutId="tabGlow"
                                        className="h-1.5 w-1.5 rounded-full bg-[#17734C]"
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("update")}
                                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-left text-[13px] font-semibold transition-all duration-200 ${
                                    activeTab === "update"
                                        ? "bg-[#EEF8F2] text-[#17734C] border border-[#B8D9C8]"
                                        : "text-[#5C7A6C] hover:bg-[#F4FAF7] hover:text-[#17734C] border border-transparent"
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <UserPen
                                        size={16}
                                        className={`transition-colors duration-200 ${
                                            activeTab === "update" ? "text-[#17734C]" : "text-[#8FA79B]"
                                        }`}
                                    />
                                    Update Profile
                                </span>
                                {activeTab === "update" && (
                                    <motion.div
                                        layoutId="tabGlow"
                                        className="h-1.5 w-1.5 rounded-full bg-[#17734C]"
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("password")}
                                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-left text-[13px] font-semibold transition-all duration-200 ${
                                    activeTab === "password"
                                        ? "bg-[#EEF8F2] text-[#17734C] border border-[#B8D9C8]"
                                        : "text-[#5C7A6C] hover:bg-[#F4FAF7] hover:text-[#17734C] border border-transparent"
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <KeyRound
                                        size={16}
                                        className={`transition-colors duration-200 ${
                                            activeTab === "password" ? "text-[#17734C]" : "text-[#8FA79B]"
                                        }`}
                                    />
                                    Change Password
                                </span>
                                {activeTab === "password" && (
                                    <motion.div
                                        layoutId="tabGlow"
                                        className="h-1.5 w-1.5 rounded-full bg-[#17734C]"
                                    />
                                )}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* 2. Right Interactive Content Panel */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className="relative min-h-[500px] overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(21,44,32,0.25)] sm:p-8">
                        <AnimatePresence mode="wait">
                            {/* TAB 1: PROFILE DETAILS VIEW */}
                            {activeTab === "profile" && (
                                <motion.div
                                    key="tab-profile"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-[17px] font-bold text-[#152C20]">
                                            Profile Information
                                        </h3>
                                        <p className="mt-1 text-[11.5px] text-[#5C7A6C]">
                                            Primary identity and settings assigned to your account.
                                        </p>
                                    </div>

                                    {/* User Details Grid */}
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        {/* Name Detail Card */}
                                        <div className="flex items-start gap-3.5 rounded-xl border border-[#E3F0E8] bg-[#FAFDFB] p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#17734C]">
                                                <User size={16} />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                                                    Salutation & Full Name
                                                </p>
                                                <p className="mt-1 text-[13px] font-semibold text-[#152C20]">
                                                    {profileData?.salutation} {profileData?.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Person ID Detail Card */}
                                        <div className="flex items-start gap-3.5 rounded-xl border border-[#E3F0E8] bg-[#FAFDFB] p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#17734C]">
                                                <Hash size={16} />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                                                    Person ID
                                                </p>
                                                <p className="mt-1 text-[13px] font-semibold text-[#152C20]">
                                                    {profileData?.person_id || "System Generated"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Username Detail Card */}
                                        <div className="flex items-start gap-3.5 rounded-xl border border-[#E3F0E8] bg-[#FAFDFB] p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#17734C]">
                                                <AtSign size={16} />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                                                    Username
                                                </p>
                                                <p className="mt-1 text-[13px] font-semibold text-[#152C20]">
                                                    {profileData?.username}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Email Detail Card */}
                                        <div className="flex items-start gap-3.5 rounded-xl border border-[#E3F0E8] bg-[#FAFDFB] p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#17734C]">
                                                <Mail size={16} />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                                                    Email Address
                                                </p>
                                                <p className="mt-1 text-[13px] font-semibold text-[#152C20] break-all">
                                                    {profileData?.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Mobile Number Detail Card */}
                                        <div className="flex items-start gap-3.5 rounded-xl border border-[#E3F0E8] bg-[#FAFDFB] p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#17734C]">
                                                <Phone size={16} />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                                                    Mobile Number
                                                </p>
                                                <p className="mt-1 text-[13px] font-semibold text-[#152C20]">
                                                    {profileData?.mobile_no || "Not Provided"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Department Detail Card */}
                                        <div className="flex items-start gap-3.5 rounded-xl border border-[#E3F0E8] bg-[#FAFDFB] p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#17734C]">
                                                <Building2 size={16} />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                                                    Department
                                                </p>
                                                <p className="mt-1 text-[13px] font-semibold text-[#152C20]">
                                                    {profileData?.department?.name || "Unassigned"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Joined Date Detail Card */}
                                        <div className="flex items-start gap-3.5 rounded-xl border border-[#E3F0E8] bg-[#FAFDFB] p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#17734C]">
                                                <Calendar size={16} />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                                                    Joined Date
                                                </p>
                                                <p className="mt-1 text-[13px] font-semibold text-[#152C20]">
                                                    {joinedDate}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Detail Card */}
                                        <div className="flex items-start gap-3.5 rounded-xl border border-[#E3F0E8] bg-[#FAFDFB] p-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#17734C]">
                                                <CheckCircle2 size={16} />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                                                    Account Status
                                                </p>
                                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Active Session
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB 2: UPDATE PROFILE FORM (NAME AND EMAIL FIELDS) */}
                            {activeTab === "update" && (
                                <motion.div
                                    key="tab-update"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="mb-5">
                                        <h3 className="text-[17px] font-bold text-[#152C20]">
                                            Update Profile Details
                                        </h3>
                                        <p className="mt-1 text-[11.5px] text-[#5C7A6C]">
                                            Modify your display name and email address. Other identity details are system-assigned.
                                        </p>
                                    </div>

                                    <form onSubmit={handleEditFormSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            {/* Full Name */}
                                            <div>
                                                <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
                                                    <User size={13} strokeWidth={1.9} className="text-[#39785D]" />
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => handleEditFieldChange("name", e.target.value)}
                                                    placeholder="Enter full name"
                                                    className={inputClass("name", editErrors)}
                                                />
                                                {editErrors.name && (
                                                    <p className="mt-1.5 text-[11px] font-semibold text-[#C43D3D] flex items-center gap-1">
                                                        <AlertCircle size={12} /> {editErrors.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Email Address */}
                                            <div>
                                                <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
                                                    <Mail size={13} strokeWidth={1.9} className="text-[#39785D]" />
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => handleEditFieldChange("email", e.target.value)}
                                                    placeholder="Enter email address"
                                                    className={inputClass("email", editErrors)}
                                                />
                                                {editErrors.email && (
                                                    <p className="mt-1.5 text-[11px] font-semibold text-[#C43D3D] flex items-center gap-1">
                                                        <AlertCircle size={12} /> {editErrors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="mt-6 flex justify-end gap-3 border-t border-[#E3F0E8] pt-5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditForm({
                                                        name: profileData?.name || "",
                                                        email: profileData?.email || "",
                                                    });
                                                    setEditErrors({});
                                                    setActiveTab("profile");
                                                }}
                                                disabled={updatingProfile}
                                                className="h-10 rounded-xl border border-[#CBE3D6] bg-white px-5 text-[12px] font-bold text-[#557064] transition-all hover:bg-[#F5FAF7]"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={updatingProfile}
                                                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#17734C] px-5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#125D3E] disabled:opacity-60"
                                            >
                                                {updatingProfile && <Loader2 size={14} className="animate-spin" />}
                                                {updatingProfile ? "Saving Changes..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* TAB 3: CHANGE PASSWORD FORM */}
                            {activeTab === "password" && (
                                <motion.div
                                    key="tab-password"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="mb-5">
                                        <h3 className="text-[17px] font-bold text-[#152C20]">
                                            Change Password
                                        </h3>
                                        <p className="mt-1 text-[11.5px] text-[#5C7A6C]">
                                            Secure your account by updating your login password.
                                        </p>
                                    </div>

                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        {/* Current Password */}
                                        <div className="relative">
                                            <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
                                                <LockKeyhole size={13} strokeWidth={1.9} className="text-[#39785D]" />
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => {
                                                        setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }));
                                                        if (passwordErrors.currentPassword) setPasswordErrors((pe) => ({ ...pe, currentPassword: "" }));
                                                    }}
                                                    placeholder="Enter current password"
                                                    className={`${inputClass("currentPassword", passwordErrors)} pr-10`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A79E] hover:text-[#17734C]"
                                                >
                                                    {showPasswords.current ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                            {passwordErrors.currentPassword && (
                                                <p className="mt-1.5 text-[11px] font-semibold text-[#C43D3D] flex items-center gap-1">
                                                    <AlertCircle size={12} /> {passwordErrors.currentPassword}
                                                </p>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
                                                <LockKeyhole size={13} strokeWidth={1.9} className="text-[#39785D]" />
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => {
                                                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }));
                                                        if (passwordErrors.newPassword) setPasswordErrors((pe) => ({ ...pe, newPassword: "" }));
                                                    }}
                                                    placeholder="Enter new password"
                                                    className={`${inputClass("newPassword", passwordErrors)} pr-10`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A79E] hover:text-[#17734C]"
                                                >
                                                    {showPasswords.new ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>

                                            {/* Password Strength Indicator */}
                                            {passwordForm.newPassword && (
                                                <div className="mt-2.5 space-y-1.5 rounded-lg border border-[#E3F0E8] bg-[#FAFDFB] p-2.5">
                                                    <div className="flex items-center justify-between text-[10.5px] font-bold">
                                                        <span className="text-[#5C7A6C]">Security strength:</span>
                                                        <span className={
                                                            passwordStrength.score <= 25 ? "text-red-500" :
                                                            passwordStrength.score <= 50 ? "text-orange-500" :
                                                            passwordStrength.score <= 75 ? "text-yellow-600" : "text-emerald-600"
                                                        }>
                                                            {passwordStrength.label}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                                        <div
                                                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                            style={{ width: `${passwordStrength.score}%` }}
                                                        />
                                                    </div>
                                                    <ul className="text-[10px] text-[#6C8679] list-disc pl-4 space-y-0.5">
                                                        <li>Minimum 8 characters length</li>
                                                        <li>At least one capital letter (A-Z)</li>
                                                        <li>At least one number (0-9)</li>
                                                        <li>At least one special character (e.g. @, #, $, %)</li>
                                                    </ul>
                                                </div>
                                            )}

                                            {passwordErrors.newPassword && (
                                                <p className="mt-1.5 text-[11px] font-semibold text-[#C43D3D] flex items-center gap-1">
                                                    <AlertCircle size={12} /> {passwordErrors.newPassword}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm New Password */}
                                        <div className="relative">
                                            <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
                                                <LockKeyhole size={13} strokeWidth={1.9} className="text-[#39785D]" />
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => {
                                                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }));
                                                        if (passwordErrors.confirmPassword) setPasswordErrors((pe) => ({ ...pe, confirmPassword: "" }));
                                                    }}
                                                    placeholder="Re-enter new password"
                                                    className={`${inputClass("confirmPassword", passwordErrors)} pr-10`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A79E] hover:text-[#17734C]"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                            {passwordErrors.confirmPassword && (
                                                <p className="mt-1.5 text-[11px] font-semibold text-[#C43D3D] flex items-center gap-1">
                                                    <AlertCircle size={12} /> {passwordErrors.confirmPassword}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="mt-6 flex justify-end gap-3 border-t border-[#E3F0E8] pt-5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                                    setPasswordErrors({});
                                                    setActiveTab("profile");
                                                }}
                                                disabled={changingPassword}
                                                className="h-10 rounded-xl border border-[#CBE3D6] bg-white px-5 text-[12px] font-bold text-[#557064] transition-all hover:bg-[#F5FAF7]"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={changingPassword}
                                                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#17734C] px-5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#125D3E] disabled:opacity-60"
                                            >
                                                {changingPassword && <Loader2 size={14} className="animate-spin" />}
                                                {changingPassword ? "Updating Password..." : "Update Password"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;