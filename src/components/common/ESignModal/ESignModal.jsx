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
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsVisible(false);
            setEmail("");
            setPassword("");
            setComment("");
            setShowPassword(false);
            setErrors({});
            return;
        }

        let frame2;
        const frame1 = requestAnimationFrame(() => {
            frame2 = requestAnimationFrame(() => {
                setIsVisible(true);
            });
        });

        return () => {
            cancelAnimationFrame(frame1);
            if (frame2) cancelAnimationFrame(frame2);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousBodyOverflow = document.body.style.overflow;
        const previousBodyOverscroll = document.body.style.overscrollBehavior;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousHtmlOverscroll =
            document.documentElement.style.overscrollBehavior;

        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.overscrollBehavior = "none";

        const preventBackgroundScroll = (event) => {
            const modalContent = event.target?.closest?.(
                "[data-esign-content]"
            );

            if (!modalContent) {
                event.preventDefault();
            }
        };

        document.addEventListener(
            "wheel",
            preventBackgroundScroll,
            { passive: false }
        );
        document.addEventListener(
            "touchmove",
            preventBackgroundScroll,
            { passive: false }
        );

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.body.style.overscrollBehavior = previousBodyOverscroll;
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.documentElement.style.overscrollBehavior =
                previousHtmlOverscroll;

            document.removeEventListener(
                "wheel",
                preventBackgroundScroll
            );
            document.removeEventListener(
                "touchmove",
                preventBackgroundScroll
            );
        };
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
        <>
            <style>{`
                @keyframes esignSubmitPulse {
                    0%, 100% {
                        box-shadow: 0 4px 12px rgba(24, 184, 101, 0.18);
                    }
                    50% {
                        box-shadow:
                            0 8px 24px rgba(24, 184, 101, 0.24),
                            0 0 0 4px rgba(24, 184, 101, 0.08);
                    }
                }

                @keyframes esignButtonSweep {
                    0% {
                        transform: translateX(0) skewX(-16deg);
                        opacity: 0;
                    }
                    18% {
                        opacity: 0.12;
                    }
                    55% {
                        opacity: 0.75;
                    }
                    100% {
                        transform: translateX(420%) skewX(-16deg);
                        opacity: 0;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    @keyframes esignSubmitPulse {
                        0%, 100% {
                            box-shadow: 0 4px 12px rgba(24, 184, 101, 0.18);
                        }
                    }

                    @keyframes esignButtonSweep {
                        0%, 100% {
                            transform: translateX(0) skewX(-16deg);
                            opacity: 0;
                        }
                    }
                }
            `}</style>

            <div
                className={`
                    fixed
                    inset-0
                    z-[9999]
                    flex
                    items-center
                    justify-center
                    bg-transparent
                    px-4
                    py-6
                    overscroll-none
                `}
                onMouseDown={handleOverlayClick}
            >
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-0
                    bg-[#10231F]/18
                "
            />

            <div
                data-esign-content
                className={`
                    relative
                    z-10
                    w-full
                    max-w-[410px]
                    overflow-hidden
                    rounded-[18px]
                    border
                    border-white/45
                    bg-white/35
                    backdrop-blur-[22px]
                    shadow-[0_28px_90px_rgba(18,48,40,0.30)]
                    ring-1
                    ring-black/[0.03]
                    transform-gpu
                    origin-center
                    transition-transform
                    duration-[620ms]
                    ease-[cubic-bezier(.22,1,.36,1)]
                    ${isVisible
                        ? "translate-y-0 scale-100"
                        : "translate-y-2 scale-[0.985]"}
                `}
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
                                border-white/50
                                bg-white/35
                                backdrop-blur-md
                                text-[#56766D]
                                shadow-[0_6px_16px_rgba(36,79,74,0.08)]
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
                                border-white/45
                                bg-white/35
                                backdrop-blur-md
                                text-[#56766D]
                                shadow-[0_4px_12px_rgba(36,79,74,0.08)]
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
                        border-white/35
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
                                            border-[#D58B8F]/70
                                            bg-[#FFF6F6]/45
                                            focus-within:border-[#C94B4F]
                                        `
                                        : `
                                            border-white/45
                                            focus-within:border-[#6E9487]
                                            focus-within:bg-white/40
                                            focus-within:shadow-[0_0_0_3px_rgba(110,148,135,0.10),0_8px_24px_rgba(36,79,74,0.06)]
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
                                            border-[#D58B8F]/70
                                            bg-[#FFF6F6]/45
                                            focus-within:border-[#C94B4F]
                                        `
                                        : `
                                            border-white/45
                                            focus-within:border-[#6E9487]
                                            focus-within:bg-white/40
                                            focus-within:shadow-[0_0_0_3px_rgba(110,148,135,0.10),0_8px_24px_rgba(36,79,74,0.06)]
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
                                            border-[#D58B8F]/70
                                            bg-[#FFF6F6]/45
                                            focus-within:border-[#C94B4F]
                                        `
                                        : `
                                            border-white/45
                                            focus-within:border-[#6E9487]
                                            focus-within:bg-white/40
                                            focus-within:shadow-[0_0_0_3px_rgba(110,148,135,0.10),0_8px_24px_rgba(36,79,74,0.06)]
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
                            border-white/40
                            bg-white/26
                            backdrop-blur-md
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.30)]
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
                                border
                                border-white/35
                                bg-white/30
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
                                border-white/50
                                bg-white/30
                                backdrop-blur-md
                                px-3.5
                                font-[var(--font-display)]
                                text-[10px]
                                font-bold
                                tracking-[-0.01em]
                                text-[#53675E]
                                transition-all
                                duration-150
                                hover:border-white/65
                                hover:bg-white/45
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
                            className={`
                                group
                                flex
                                h-[34px]
                                min-w-[118px]
                                items-center
                                justify-center
                                gap-2
                                rounded-[9px]
                                border
                                border-[#5817dadd]/80
                                bg-[#5817dadd]/95
                                backdrop-blur-md
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
                                hover:bg-[#5715d9dd]
                                hover:shadow-[0_6px_15px_rgba(24,184,101,0.22)]
                                active:translate-y-0
                                active:scale-[0.98]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                ${loading ? "animate-[esignSubmitPulse_1.5s_ease-in-out_infinite]" : ""}
                            `}
                        >
                            {loading ? (
                                <>
                                    <span
                                        aria-hidden="true"
                                        className="
                                            pointer-events-none
                                            absolute
                                            inset-y-0
                                            left-[-45%]
                                            w-[35%]
                                            skew-x-[-16deg]
                                            bg-white/25
                                            blur-[8px]
                                            animate-[esignButtonSweep_1.25s_ease-in-out_infinite]
                                        "
                                    />
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
        </>
    );
};

export default ESignModal;