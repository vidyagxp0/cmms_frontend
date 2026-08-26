import React from "react";
import { LockKeyhole, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const ChangePasswordForm = ({
    passwordForm,
    setPasswordForm,
    showPasswords,
    setShowPasswords,
    passwordErrors,
    setPasswordErrors,
    changingPassword,
    passwordStrength,
    handlePasswordSubmit,
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
                        <LockKeyhole size={13} strokeWidth={1.9} className={t.textAccent} />
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
                            className={`${getInputClass("currentPassword", passwordErrors)} pr-10`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A79E] ${t.textAccentHover}`}
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
                        <LockKeyhole size={13} strokeWidth={1.9} className={t.textAccent} />
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
                            className={`${getInputClass("newPassword", passwordErrors)} pr-10`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A79E] ${t.textAccentHover}`}
                        >
                            {showPasswords.new ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordForm.newPassword && (
                        <div className={`mt-2.5 space-y-1.5 rounded-lg border ${t.borderLight} bg-[#FAFDFB] p-2.5`}>
                            <div className="flex items-center justify-between text-[10.5px] font-bold">
                                <span className="text-[#5C7A6C]">Security strength:</span>
                                <span className={
                                    passwordStrength.score <= 25 ? "text-red-500" :
                                    passwordStrength.score <= 50 ? "text-orange-500" :
                                    passwordStrength.score <= 75 ? "text-yellow-600" : (t.isSystemAdmin ? "text-emerald-600" : "text-blue-600")
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
                        <LockKeyhole size={13} strokeWidth={1.9} className={t.textAccent} />
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
                            className={`${getInputClass("confirmPassword", passwordErrors)} pr-10`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A79E] ${t.textAccentHover}`}
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
                <div className={`mt-6 flex justify-end gap-3 border-t ${t.borderLight} pt-5`}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={changingPassword}
                        className={`h-10 rounded-xl border ${t.borderLight} bg-white px-5 text-[12px] font-bold text-[#557064] transition-all ${t.lightBg} ${t.textAccentHover}`}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={changingPassword}
                        className={`flex h-10 items-center justify-center gap-2 rounded-xl ${t.bgAccent} ${t.bgHoverAccent} px-5 text-[12px] font-bold text-white shadow-sm transition-all disabled:opacity-60`}
                    >
                        {changingPassword && <Loader2 size={14} className="animate-spin" />}
                        {changingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ChangePasswordForm;
