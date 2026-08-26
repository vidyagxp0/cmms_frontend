import React from "react";
import { User, Mail, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const UpdateProfileForm = ({
    editForm,
    editErrors,
    updatingProfile,
    handleEditFieldChange,
    handleEditFormSubmit,
    onCancel,
    theme,
}) => {
    // Default fallbacks for safety
    const t = theme || {
        isSystemAdmin: true,
        textAccent: "text-[#17734C]",
        bgAccent: "bg-[#17734C]",
        bgHoverAccent: "hover:bg-[#125D3E]",
        lightBg: "bg-[#EEF8F2]",
        borderLight: "border-[#CBE3D6]",
        textAccentHover: "hover:text-[#17734C]",
    };

    // Dynamic focus ring inputs helper
    const getInputClass = (field, errors = {}) => {
        const base = "h-[46px] w-full rounded-[10px] border px-3.5 text-[12.5px] font-medium outline-none transition-all duration-200";
        if (errors[field]) {
            return `${base} bg-red-50/10 border-[#C43D3D] text-[#7A2A2A] focus:shadow-[0_0_0_3px_rgba(196,61,61,0.07)]`;
        }
        if (t.isSystemAdmin) {
            return `${base} bg-[#F9FCFA] border-[#CBE3D6] text-[#1C382A] focus:border-[#79B89A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,138,95,0.07)] placeholder:text-[#94A79E]`;
        } else {
            return `${base} bg-[#F8FAFC] border-[#D1D5DB] text-[#1E293B] focus:border-[#3B82F6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.07)] placeholder:text-[#94A3B8]`;
        }
    };

    return (
        <motion.div
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
                            <User size={13} strokeWidth={1.9} className={t.textAccent} />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => handleEditFieldChange("name", e.target.value)}
                            placeholder="Enter full name"
                            className={getInputClass("name", editErrors)}
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
                            <Mail size={13} strokeWidth={1.9} className={t.textAccent} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => handleEditFieldChange("email", e.target.value)}
                            placeholder="Enter email address"
                            className={getInputClass("email", editErrors)}
                        />
                        {editErrors.email && (
                            <p className="mt-1.5 text-[11px] font-semibold text-[#C43D3D] flex items-center gap-1">
                                <AlertCircle size={12} /> {editErrors.email}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className={`mt-6 flex justify-end gap-3 border-t ${t.borderLight} pt-5`}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={updatingProfile}
                        className={`h-10 rounded-xl border ${t.borderLight} bg-white px-5 text-[12px] font-bold text-[#557064] transition-all ${t.lightBg} ${t.textAccentHover}`}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={updatingProfile}
                        className={`flex h-10 items-center justify-center gap-2 rounded-xl ${t.bgAccent} ${t.bgHoverAccent} px-5 text-[12px] font-bold text-white shadow-sm transition-all disabled:opacity-60`}
                    >
                        {updatingProfile && <Loader2 size={14} className="animate-spin" />}
                        {updatingProfile ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default UpdateProfileForm;
