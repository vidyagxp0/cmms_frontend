import React from "react";
import { User, UserPen, KeyRound, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ProfileSidebar = ({ profileData, activeTab, setActiveTab }) => {
    return (
        <div className="flex flex-col rounded-2xl border border-[#CBE3D6] bg-white p-5 shadow-[0_8px_30px_rgba(21,44,32,0.06)] animate-fadeIn">
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
    );
};

export default ProfileSidebar;
