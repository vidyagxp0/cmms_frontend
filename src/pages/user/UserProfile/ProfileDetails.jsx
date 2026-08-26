import React from "react";
import {
    User,
    Hash,
    AtSign,
    Mail,
    Phone,
    Building2,
    Calendar,
    CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const ProfileDetails = ({ profileData, joinedDate, theme }) => {
    // Default fallbacks for safety
    const t = theme || {
        isSystemAdmin: true,
        textAccent: "text-[#17734C]",
        bgAccent: "bg-[#17734C]",
        lightBg: "bg-[#EEF8F2]",
        borderLight: "border-[#CBE3D6]",
        badgeBg: "bg-[#EEF8F2]",
    };

    return (
        <motion.div
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
                <div className={`flex items-start gap-3.5 rounded-xl border ${t.borderLight} bg-[#FAFDFB] p-4`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.badgeBg} ${t.textAccent}`}>
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
                <div className={`flex items-start gap-3.5 rounded-xl border ${t.borderLight} bg-[#FAFDFB] p-4`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.badgeBg} ${t.textAccent}`}>
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
                <div className={`flex items-start gap-3.5 rounded-xl border ${t.borderLight} bg-[#FAFDFB] p-4`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.badgeBg} ${t.textAccent}`}>
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
                <div className={`flex items-start gap-3.5 rounded-xl border ${t.borderLight} bg-[#FAFDFB] p-4`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.badgeBg} ${t.textAccent}`}>
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
                <div className={`flex items-start gap-3.5 rounded-xl border ${t.borderLight} bg-[#FAFDFB] p-4`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.badgeBg} ${t.textAccent}`}>
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
                <div className={`flex items-start gap-3.5 rounded-xl border ${t.borderLight} bg-[#FAFDFB] p-4`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.badgeBg} ${t.textAccent}`}>
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
                <div className={`flex items-start gap-3.5 rounded-xl border ${t.borderLight} bg-[#FAFDFB] p-4`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.badgeBg} ${t.textAccent}`}>
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
                <div className={`flex items-start gap-3.5 rounded-xl border ${t.borderLight} bg-[#FAFDFB] p-4`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.badgeBg} ${t.textAccent}`}>
                        <CheckCircle2 size={16} />
                    </span>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8FA79B]">
                            Account Status
                        </p>
                        <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            t.isSystemAdmin 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                                : "bg-blue-50 border-blue-200 text-blue-600"
                        }`}>
                            <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                                t.isSystemAdmin ? "bg-emerald-500" : "bg-blue-500"
                            }`} />
                            Active Session
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileDetails;
