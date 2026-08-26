import React from "react";
import { User, Mail, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { inputClass } from "../../../components/ui/formStyles";

const UpdateProfileForm = ({
    editForm,
    editErrors,
    updatingProfile,
    handleEditFieldChange,
    handleEditFormSubmit,
    onCancel,
}) => {
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
                        onClick={onCancel}
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
    );
};

export default UpdateProfileForm;
