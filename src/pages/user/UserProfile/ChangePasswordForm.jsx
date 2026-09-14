import React from "react";
import {
    LockKeyhole,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
} from "lucide-react";
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
    const t = theme || {
        isSystemAdmin: true,
        textAccent: "text-[#56766D]",
        bgAccent: "bg-[#56766D]",
        bgHoverAccent: "hover:bg-[#48685F]",
        lightBg: "bg-[#E8F0ED]",
        borderLight:
            "border-[#D6D8D3]",
        textAccentHover:
            "hover:text-[#48685F]",
    };

    const getInputClass = (
        field,
        errors = {}
    ) => {
        const base = `
            h-[48px]
            w-full
            rounded-[11px]
            border
            px-3.5
            text-[12.5px]
            font-medium
            outline-none
            transition-all
            duration-200
        `;

        if (errors[field]) {
            return `
                ${base}
                border-[#C98A8A]
                bg-[#FFF9F9]
                text-[#7A3535]
                focus:border-[#B54A4A]
                focus:bg-white
                focus:shadow-[0_0_0_3px_rgba(181,74,74,0.07)]
                placeholder:text-[#B18B8B]
            `;
        }

        return `
            ${base}
            border-[#D8DEDB]
            bg-[#FAFBF9]
            text-[#293A40]
            focus:border-[#9FBAB0]
            focus:bg-white
            focus:shadow-[0_0_0_3px_rgba(86,118,109,0.07)]
            placeholder:text-[#9AA5A1]
        `;
    };

    const getStrengthColor = () => {
        if (passwordStrength.score <= 25) {
            return "#B54A4A";
        }

        if (passwordStrength.score <= 50) {
            return "#B4773D";
        }

        if (passwordStrength.score <= 75) {
            return "#A47D45";
        }

        return "#56766D";
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: -15,
            }}
            transition={{
                duration: 0.2,
            }}
        >
            {/* =================================================
                HEADER
            ================================================== */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <h3
                        className="
                            text-[18px]
                            font-bold
                            tracking-[-0.02em]
                            text-[#243238]
                        "
                    >
                        Change Password
                    </h3>

                    <span
                        className="
                            h-[5px]
                            w-[5px]
                            rounded-full
                            bg-[#A47D45]
                        "
                    />
                </div>

                <p
                    className="
                        mt-1
                        max-w-[700px]
                        text-[11px]
                        font-medium
                        leading-5
                        text-[#7A8582]
                    "
                >
                    Secure your account by updating your login password.
                </p>
            </div>

            {/* =================================================
                FORM
            ================================================== */}
            <form
                onSubmit={handlePasswordSubmit}
                className="space-y-5"
            >
                {/* CURRENT PASSWORD */}
                <div>
                    <label
                        className="
                            mb-2
                            flex
                            items-center
                            gap-1.5
                            text-[10.5px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#61706C]
                        "
                    >
                        <LockKeyhole
                            size={13}
                            strokeWidth={1.9}
                            className={t.textAccent}
                        />

                        Current Password
                    </label>

                    <div className="relative">
                        <input
                            type={
                                showPasswords.current
                                    ? "text"
                                    : "password"
                            }
                            value={
                                passwordForm.currentPassword
                            }
                            onChange={(e) => {
                                setPasswordForm(
                                    (p) => ({
                                        ...p,
                                        currentPassword:
                                            e.target
                                                .value,
                                    })
                                );

                                if (
                                    passwordErrors.currentPassword
                                ) {
                                    setPasswordErrors(
                                        (pe) => ({
                                            ...pe,
                                            currentPassword:
                                                "",
                                        })
                                    );
                                }
                            }}
                            placeholder="Enter current password"
                            className={`${getInputClass(
                                "currentPassword",
                                passwordErrors
                            )} pr-11`}
                        />

                        {/* SHOW/HIDE */}
                        <button
                            type="button"
                            onClick={() =>
                                setShowPasswords(
                                    (p) => ({
                                        ...p,
                                        current:
                                            !p.current,
                                    })
                                )
                            }
                            className="
                                absolute
                                right-3.5
                                top-1/2
                                -translate-y-1/2
                                rounded-md
                                p-1
                                text-[#8B9792]
                                transition-colors
                                duration-150
                                hover:bg-[#E8F0ED]
                                hover:text-[#56766D]
                            "
                            aria-label={
                                showPasswords.current
                                    ? "Hide current password"
                                    : "Show current password"
                            }
                        >
                            {showPasswords.current ? (
                                <EyeOff size={15} />
                            ) : (
                                <Eye size={15} />
                            )}
                        </button>
                    </div>

                    {passwordErrors.currentPassword && (
                        <p
                            className="
                                mt-1.5
                                flex
                                items-center
                                gap-1
                                text-[10.5px]
                                font-semibold
                                text-[#B54A4A]
                            "
                        >
                            <AlertCircle size={12} />

                            {
                                passwordErrors.currentPassword
                            }
                        </p>
                    )}
                </div>

                {/* =================================================
                    NEW PASSWORD
                ================================================== */}
                <div>
                    <label
                        className="
                            mb-2
                            flex
                            items-center
                            gap-1.5
                            text-[10.5px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#61706C]
                        "
                    >
                        <LockKeyhole
                            size={13}
                            strokeWidth={1.9}
                            className={t.textAccent}
                        />

                        New Password
                    </label>

                    <div className="relative">
                        <input
                            type={
                                showPasswords.new
                                    ? "text"
                                    : "password"
                            }
                            value={
                                passwordForm.newPassword
                            }
                            onChange={(e) => {
                                setPasswordForm(
                                    (p) => ({
                                        ...p,
                                        newPassword:
                                            e.target
                                                .value,
                                    })
                                );

                                if (
                                    passwordErrors.newPassword
                                ) {
                                    setPasswordErrors(
                                        (pe) => ({
                                            ...pe,
                                            newPassword:
                                                "",
                                        })
                                    );
                                }
                            }}
                            placeholder="Enter new password"
                            className={`${getInputClass(
                                "newPassword",
                                passwordErrors
                            )} pr-11`}
                        />

                        {/* SHOW/HIDE */}
                        <button
                            type="button"
                            onClick={() =>
                                setShowPasswords(
                                    (p) => ({
                                        ...p,
                                        new:
                                            !p.new,
                                    })
                                )
                            }
                            className="
                                absolute
                                right-3.5
                                top-1/2
                                -translate-y-1/2
                                rounded-md
                                p-1
                                text-[#8B9792]
                                transition-colors
                                duration-150
                                hover:bg-[#E8F0ED]
                                hover:text-[#56766D]
                            "
                            aria-label={
                                showPasswords.new
                                    ? "Hide new password"
                                    : "Show new password"
                            }
                        >
                            {showPasswords.new ? (
                                <EyeOff size={15} />
                            ) : (
                                <Eye size={15} />
                            )}
                        </button>
                    </div>

                    {/* PASSWORD STRENGTH */}
                    {passwordForm.newPassword && (
                        <div
                            className="
                                mt-3
                                rounded-[12px]
                                border
                                border-[#DDE3E0]
                                bg-[#F8FAF8]
                                p-3
                            "
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.07em]
                                        text-[#78837F]
                                    "
                                >
                                    Security strength
                                </span>

                                <span
                                    className="
                                        text-[10px]
                                        font-bold
                                    "
                                    style={{
                                        color: getStrengthColor(),
                                    }}
                                >
                                    {
                                        passwordStrength.label
                                    }
                                </span>
                            </div>

                            {/* STRENGTH BAR */}
                            <div
                                className="
                                    mt-2
                                    h-[5px]
                                    w-full
                                    overflow-hidden
                                    rounded-full
                                    bg-[#E4E8E5]
                                "
                            >
                                <div
                                    className="
                                        h-full
                                        rounded-full
                                        transition-all
                                        duration-300
                                    "
                                    style={{
                                        width: `${passwordStrength.score}%`,
                                        background:
                                            getStrengthColor(),
                                    }}
                                />
                            </div>

                            {/* REQUIREMENTS */}
                            <div
                                className="
                                    mt-3
                                    grid
                                    grid-cols-1
                                    gap-1.5
                                    text-[9.5px]
                                    text-[#74807C]
                                    sm:grid-cols-2
                                "
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="
                                            h-[5px]
                                            w-[5px]
                                            rounded-full
                                            bg-[#A47D45]
                                        "
                                    />
                                    Minimum 8 characters
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className="
                                            h-[5px]
                                            w-[5px]
                                            rounded-full
                                            bg-[#A47D45]
                                        "
                                    />
                                    One capital letter
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className="
                                            h-[5px]
                                            w-[5px]
                                            rounded-full
                                            bg-[#A47D45]
                                        "
                                    />
                                    One number
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className="
                                            h-[5px]
                                            w-[5px]
                                            rounded-full
                                            bg-[#A47D45]
                                        "
                                    />
                                    One special character
                                </div>
                            </div>
                        </div>
                    )}

                    {passwordErrors.newPassword && (
                        <p
                            className="
                                mt-1.5
                                flex
                                items-center
                                gap-1
                                text-[10.5px]
                                font-semibold
                                text-[#B54A4A]
                            "
                        >
                            <AlertCircle size={12} />

                            {
                                passwordErrors.newPassword
                            }
                        </p>
                    )}
                </div>

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================== */}
                <div>
                    <label
                        className="
                            mb-2
                            flex
                            items-center
                            gap-1.5
                            text-[10.5px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#61706C]
                        "
                    >
                        <LockKeyhole
                            size={13}
                            strokeWidth={1.9}
                            className={t.textAccent}
                        />

                        Confirm New Password
                    </label>

                    <div className="relative">
                        <input
                            type={
                                showPasswords.confirm
                                    ? "text"
                                    : "password"
                            }
                            value={
                                passwordForm.confirmPassword
                            }
                            onChange={(e) => {
                                setPasswordForm(
                                    (p) => ({
                                        ...p,
                                        confirmPassword:
                                            e.target
                                                .value,
                                    })
                                );

                                if (
                                    passwordErrors.confirmPassword
                                ) {
                                    setPasswordErrors(
                                        (pe) => ({
                                            ...pe,
                                            confirmPassword:
                                                "",
                                        })
                                    );
                                }
                            }}
                            placeholder="Re-enter new password"
                            className={`${getInputClass(
                                "confirmPassword",
                                passwordErrors
                            )} pr-11`}
                        />

                        {/* SHOW/HIDE */}
                        <button
                            type="button"
                            onClick={() =>
                                setShowPasswords(
                                    (p) => ({
                                        ...p,
                                        confirm:
                                            !p.confirm,
                                    })
                                )
                            }
                            className="
                                absolute
                                right-3.5
                                top-1/2
                                -translate-y-1/2
                                rounded-md
                                p-1
                                text-[#8B9792]
                                transition-colors
                                duration-150
                                hover:bg-[#E8F0ED]
                                hover:text-[#56766D]
                            "
                            aria-label={
                                showPasswords.confirm
                                    ? "Hide confirm password"
                                    : "Show confirm password"
                            }
                        >
                            {showPasswords.confirm ? (
                                <EyeOff size={15} />
                            ) : (
                                <Eye size={15} />
                            )}
                        </button>
                    </div>

                    {passwordErrors.confirmPassword && (
                        <p
                            className="
                                mt-1.5
                                flex
                                items-center
                                gap-1
                                text-[10.5px]
                                font-semibold
                                text-[#B54A4A]
                            "
                        >
                            <AlertCircle size={12} />

                            {
                                passwordErrors.confirmPassword
                            }
                        </p>
                    )}
                </div>

                {/* =================================================
                    ACTION BAR
                ================================================== */}
                <div
                    className="
                        mt-7
                        flex
                        flex-col-reverse
                        gap-2.5
                        border-t
                        border-[#E8EBE7]
                        pt-5
                        sm:flex-row
                        sm:justify-end
                    "
                >
                    {/* CANCEL */}
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={changingPassword}
                        className="
                            h-10
                            rounded-[10px]
                            border
                            border-[#D3DAD6]
                            bg-white
                            px-5
                            text-[11.5px]
                            font-semibold
                            text-[#596762]
                            transition-all
                            duration-200
                            hover:border-[#BECBC5]
                            hover:bg-[#F4F6F4]
                            hover:text-[#48685F]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    {/* UPDATE */}
                    <button
                        type="submit"
                        disabled={changingPassword}
                        className="
                            flex
                            h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-[10px]
                            bg-[#56766D]
                            px-5
                            text-[11.5px]
                            font-bold
                            text-white
                            shadow-[0_3px_9px_rgba(86,118,109,0.14)]
                            transition-all
                            duration-200
                            hover:bg-[#48685F]
                            hover:shadow-[0_5px_14px_rgba(86,118,109,0.18)]
                            active:scale-[0.98]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {changingPassword && (
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        )}

                        {changingPassword
                            ? "Updating Password..."
                            : "Update Password"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ChangePasswordForm;