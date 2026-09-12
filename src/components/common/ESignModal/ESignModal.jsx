import React, { useEffect, useState } from "react";
import {
    Check,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    MessageSquare,
    ShieldCheck,
    X,
} from "lucide-react";

const ESignModal = ({
    isOpen = false,
    activity = null,
    onClose,
    onConfirm,
    loading = false,
}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [comment, setComment] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) {
            setEmail("");
            setPassword("");
            setComment("");
            setShowPassword(false);
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const nextErrors = {};

        if (!email.trim()) {
            nextErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email.trim()
            )
        ) {
            nextErrors.email = "Please enter a valid email";
        }

        if (!password.trim()) {
            nextErrors.password = "Password is required";
        }

        if (!comment.trim()) {
            nextErrors.comment = "Comment is required";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading || !validate()) return;

        await onConfirm?.({
            email: email.trim(),
            password,
            comment: comment.trim(),
            activity,
        });
    };

    const handleOverlayClick = (event) => {
        if (
            event.target === event.currentTarget &&
            !loading
        ) {
            onClose?.();
        }
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-[9999]
                flex
                items-center
                justify-center
                bg-[#10231F]/55
                px-4
                py-6
                backdrop-blur-[5px]
            "
            onMouseDown={handleOverlayClick}
        >
            <div
                className="
                    relative
                    w-full
                    max-w-[410px]
                    overflow-hidden
                    rounded-[18px]
                    border
                    border-[#D6E0DB]
                    bg-[#FBFCFA]
                    shadow-[0_24px_70px_rgba(18,48,40,0.24)]
                "
            >
                {/* =================================================
                    TOP ACCENT
                ================================================== */}
                <div
                    className="
                        absolute
                        inset-x-0
                        top-0
                        h-[3px]
                        bg-[#A47D45]
                    "
                />

                {/* =================================================
                    CLOSE BUTTON
                ================================================== */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close e-sign"
                    className="
                        absolute
                        right-3
                        top-3
                        z-10
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-[8px]
                        text-[#82938C]
                        transition-all
                        duration-150
                        hover:bg-[#EDF3F0]
                        hover:text-[#244F4A]
                        active:scale-95
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                    "
                >
                    <X
                        size={15}
                        strokeWidth={1.8}
                    />
                </button>

                {/* =================================================
                    HEADER
                ================================================== */}
                <div
                    className="
                        px-5
                        pb-4
                        pt-5
                    "
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="
                                relative
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-[11px]
                                border
                                border-[#C9DAD3]
                                bg-[#E9F0EC]
                                text-[#56766D]
                            "
                        >
                            <ShieldCheck
                                size={19}
                                strokeWidth={1.8}
                            />

                            <span
                                className="
                                    absolute
                                    bottom-[3px]
                                    right-[3px]
                                    h-[5px]
                                    w-[5px]
                                    rounded-full
                                    bg-[#18B865]
                                "
                            />
                        </div>

                        <div className="min-w-0 pr-6">
                            <div className="flex items-center gap-2">
                                <h2
                                    className="
                                        font-[var(--font-display)]
                                        text-[14px]
                                        font-bold
                                        tracking-[-0.02em]
                                        text-[#244F4A]
                                    "
                                >
                                    Electronic Signature
                                </h2>

                                <span
                                    className="
                                        rounded-full
                                        border
                                        border-[#DCC9AB]
                                        bg-[#F3EBDD]
                                        px-1.5
                                        py-0.5
                                        text-[7px]
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]
                                        text-[#8D6A38]
                                    "
                                >
                                    E-Sign
                                </span>
                            </div>

                            <p
                                className="
                                    mt-1
                                    text-[10px]
                                    leading-[15px]
                                    text-[#758780]
                                "
                            >
                                Verify your identity to perform
                                this action.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    ACTIVITY
                ================================================== */}
                <div className="px-5 pb-4">
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            rounded-[11px]
                            border
                            border-[#D8E2DD]
                            bg-[#F1F5F2]
                            px-3
                            py-2
                        "
                    >
                        <div className="min-w-0">
                            <p
                                className="
                                    text-[7px]
                                    font-bold
                                    uppercase
                                    tracking-[0.13em]
                                    text-[#8A9A93]
                                "
                            >
                                Workflow Activity
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    truncate
                                    font-[var(--font-display)]
                                    text-[11px]
                                    font-bold
                                    tracking-[-0.01em]
                                    text-[#344A43]
                                "
                            >
                                {activity?.name ||
                                    "Workflow Action"}
                            </p>
                        </div>

                        <div
                            className="
                                ml-3
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-[8px]
                                border
                                border-[#D4E0DB]
                                bg-[#FBFCFA]
                                text-[#56766D]
                                shadow-[0_2px_6px_rgba(36,79,74,0.06)]
                            "
                        >
                            <Check
                                size={13}
                                strokeWidth={2}
                            />
                        </div>
                    </div>
                </div>

                {/* =================================================
                    FORM
                ================================================== */}
                <form
                    onSubmit={handleSubmit}
                    className="
                        border-t
                        border-[#E1E8E4]
                        px-5
                        pb-5
                        pt-4
                    "
                >
                    {/* =================================================
                        EMAIL
                    ================================================== */}
                    <div className="mb-3.5">
                        <label
                            className="
                                mb-1.5
                                block
                                font-[var(--font-display)]
                                text-[10px]
                                font-bold
                                tracking-[-0.01em]
                                text-[#344A43]
                            "
                        >
                            Email{" "}
                            <span className="text-[#C94B4F]">
                                *
                            </span>
                        </label>

                        <div
                            className={`
                                flex
                                h-[38px]
                                items-center
                                rounded-[9px]
                                border
                                bg-[#FBFDFC]
                                transition-all
                                duration-150

                                ${
                                    errors.email
                                        ? `
                                            border-[#E4B1B1]
                                            focus-within:border-[#C94B4F]
                                        `
                                        : `
                                            border-[#D1DDD8]
                                            focus-within:border-[#6E9487]
                                            focus-within:shadow-[0_0_0_3px_rgba(110,148,135,0.10)]
                                        `
                                }
                            `}
                        >
                            <Mail
                                size={14}
                                strokeWidth={1.8}
                                className="
                                    ml-3
                                    shrink-0
                                    text-[#789087]
                                "
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(
                                        e.target.value
                                    );

                                    if (errors.email) {
                                        setErrors(
                                            (prev) => ({
                                                ...prev,
                                                email: "",
                                            })
                                        );
                                    }
                                }}
                                placeholder="Enter your email"
                                disabled={loading}
                                autoComplete="email"
                                className="
                                    h-full
                                    min-w-0
                                    flex-1
                                    bg-transparent
                                    px-2
                                    text-[11px]
                                    font-medium
                                    text-[#344A43]
                                    outline-none
                                    placeholder:text-[#9EACA6]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            />
                        </div>

                        {errors.email && (
                            <p
                                className="
                                    mt-1
                                    text-[9px]
                                    font-medium
                                    text-[#C94B4F]
                                "
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* =================================================
                        PASSWORD
                    ================================================== */}
                    <div className="mb-3.5">
                        <label
                            className="
                                mb-1.5
                                block
                                font-[var(--font-display)]
                                text-[10px]
                                font-bold
                                tracking-[-0.01em]
                                text-[#344A43]
                            "
                        >
                            Password{" "}
                            <span className="text-[#C94B4F]">
                                *
                            </span>
                        </label>

                        <div
                            className={`
                                flex
                                h-[38px]
                                items-center
                                rounded-[9px]
                                border
                                bg-[#FBFDFC]
                                transition-all
                                duration-150

                                ${
                                    errors.password
                                        ? `
                                            border-[#E4B1B1]
                                            focus-within:border-[#C94B4F]
                                        `
                                        : `
                                            border-[#D1DDD8]
                                            focus-within:border-[#6E9487]
                                            focus-within:shadow-[0_0_0_3px_rgba(110,148,135,0.10)]
                                        `
                                }
                            `}
                        >
                            <LockKeyhole
                                size={14}
                                strokeWidth={1.8}
                                className="
                                    ml-3
                                    shrink-0
                                    text-[#789087]
                                "
                            />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) => {
                                    setPassword(
                                        e.target.value
                                    );

                                    if (errors.password) {
                                        setErrors(
                                            (prev) => ({
                                                ...prev,
                                                password: "",
                                            })
                                        );
                                    }
                                }}
                                placeholder="Enter your password"
                                disabled={loading}
                                autoComplete="current-password"
                                className="
                                    h-full
                                    min-w-0
                                    flex-1
                                    bg-transparent
                                    px-2
                                    text-[11px]
                                    font-medium
                                    text-[#344A43]
                                    outline-none
                                    placeholder:text-[#9EACA6]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (value) => !value
                                    )
                                }
                                disabled={loading}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="
                                    mr-1.5
                                    flex
                                    h-6
                                    w-6
                                    items-center
                                    justify-center
                                    rounded-[7px]
                                    text-[#82938C]
                                    transition-all
                                    duration-150
                                    hover:bg-[#EDF3F0]
                                    hover:text-[#56766D]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                {showPassword ? (
                                    <EyeOff
                                        size={14}
                                        strokeWidth={1.8}
                                    />
                                ) : (
                                    <Eye
                                        size={14}
                                        strokeWidth={1.8}
                                    />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p
                                className="
                                    mt-1
                                    text-[9px]
                                    font-medium
                                    text-[#C94B4F]
                                "
                            >
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* =================================================
                        COMMENT
                    ================================================== */}
                    <div className="mb-4">
                        <label
                            className="
                                mb-1.5
                                block
                                font-[var(--font-display)]
                                text-[10px]
                                font-bold
                                tracking-[-0.01em]
                                text-[#344A43]
                            "
                        >
                            Comment{" "}
                            <span className="text-[#C94B4F]">
                                *
                            </span>
                        </label>

                        <div
                            className={`
                                relative
                                rounded-[9px]
                                border
                                bg-[#FBFDFC]
                                transition-all
                                duration-150

                                ${
                                    errors.comment
                                        ? `
                                            border-[#E4B1B1]
                                            focus-within:border-[#C94B4F]
                                        `
                                        : `
                                            border-[#D1DDD8]
                                            focus-within:border-[#6E9487]
                                            focus-within:shadow-[0_0_0_3px_rgba(110,148,135,0.10)]
                                        `
                                }
                            `}
                        >
                            <MessageSquare
                                size={14}
                                strokeWidth={1.8}
                                className="
                                    absolute
                                    left-3
                                    top-2.5
                                    text-[#789087]
                                "
                            />

                            <textarea
                                value={comment}
                                onChange={(e) => {
                                    setComment(
                                        e.target.value
                                    );

                                    if (errors.comment) {
                                        setErrors(
                                            (prev) => ({
                                                ...prev,
                                                comment: "",
                                            })
                                        );
                                    }
                                }}
                                placeholder="Enter a comment..."
                                disabled={loading}
                                rows={2}
                                className="
                                    w-full
                                    resize-none
                                    bg-transparent
                                    py-2
                                    pl-9
                                    pr-3
                                    text-[11px]
                                    font-medium
                                    leading-4
                                    text-[#344A43]
                                    outline-none
                                    placeholder:text-[#9EACA6]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            />
                        </div>

                        {errors.comment && (
                            <p
                                className="
                                    mt-1
                                    text-[9px]
                                    font-medium
                                    text-[#C94B4F]
                                "
                            >
                                {errors.comment}
                            </p>
                        )}
                    </div>

                    {/* =================================================
                        SIGNATURE NOTICE
                    ================================================== */}
                    <div
                        className="
                            mb-4
                            flex
                            items-center
                            gap-2
                            rounded-[9px]
                            border
                            border-[#DDE6E1]
                            bg-[#F3F6F4]
                            px-3
                            py-2
                        "
                    >
                        <div
                            className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-[7px]
                                bg-[#E7EFEB]
                                text-[#56766D]
                            "
                        >
                            <ShieldCheck
                                size={12}
                                strokeWidth={1.8}
                            />
                        </div>

                        <p
                            className="
                                text-[8px]
                                font-medium
                                leading-3
                                text-[#71837B]
                            "
                        >
                            Your signature will be recorded
                            with this action.
                        </p>
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================== */}
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="
                                h-[34px]
                                rounded-[9px]
                                border
                                border-[#D0DDD7]
                                bg-white
                                px-3.5
                                font-[var(--font-display)]
                                text-[10px]
                                font-bold
                                tracking-[-0.01em]
                                text-[#53675E]
                                transition-all
                                duration-150
                                hover:border-[#BACBC3]
                                hover:bg-[#F5F8F6]
                                hover:text-[#344A43]
                                active:scale-[0.98]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                group
                                flex
                                h-[34px]
                                min-w-[118px]
                                items-center
                                justify-center
                                gap-2
                                rounded-[9px]
                                border
                                border-[#119653]
                                bg-[#18B865]
                                px-3.5
                                font-[var(--font-display)]
                                text-[10px]
                                font-bold
                                tracking-[-0.01em]
                                text-white
                                shadow-[0_4px_12px_rgba(24,184,101,0.18)]
                                transition-all
                                duration-150
                                hover:-translate-y-px
                                hover:bg-[#16AA5C]
                                hover:shadow-[0_6px_15px_rgba(24,184,101,0.22)]
                                active:translate-y-0
                                active:scale-[0.98]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {loading ? (
                                <>
                                    <span
                                        className="
                                            h-3
                                            w-3
                                            animate-spin
                                            rounded-full
                                            border-2
                                            border-white/30
                                            border-t-white
                                        "
                                    />

                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck
                                        size={13}
                                        strokeWidth={2}
                                    />

                                    Sign & Continue
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ESignModal;