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
    const [showPassword, setShowPassword] =
        useState(false);
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
            nextErrors.email =
                "Please enter a valid email";
        }

        if (!password.trim()) {
            nextErrors.password =
                "Password is required";
        }

        if (!comment.trim()) {
            nextErrors.comment =
                "Comment is required";
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07120E]/55 px-4 py-6 backdrop-blur-[5px]"
            onMouseDown={handleOverlayClick}
        >
            <div className="relative w-full max-w-[430px] overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(9,32,22,0.30)]">
                {/* TOP ACCENT */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-[#20BF63] via-[#35D878] to-[#159A50]" />

                {/* CLOSE */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close e-sign"
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[#8A9992] transition-all duration-200 hover:bg-[#F0F6F2] hover:text-[#344A43] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <X
                        size={17}
                        strokeWidth={1.8}
                    />
                </button>

                {/* HEADER */}
                <div className="px-6 pb-4 pt-7">
                    <div className="flex items-start gap-3.5">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#EAF8F0] text-[#20BF63] shadow-[inset_0_0_0_1px_rgba(32,191,99,0.08)]">
                            <ShieldCheck
                                size={22}
                                strokeWidth={1.8}
                            />

                            <span className="absolute bottom-[4px] right-[4px] h-[6px] w-[6px] rounded-full bg-[#20BF63]" />
                        </div>

                        <div className="min-w-0 pr-7">
                            <p className="text-[16px] font-bold tracking-[-0.02em] text-[#1F342B]">
                                Electronic Signature
                            </p>

                            <p className="mt-1 text-[11px] leading-[17px] text-[#7A8B84]">
                                Verify your identity to
                                perform this workflow
                                action.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ACTIVITY */}
                <div className="mx-6 mb-5 flex items-center justify-between rounded-xl border border-[#DCE9E2] bg-[#F6FAF8] px-3.5 py-2.5">
                    <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#8B9A94]">
                            Workflow Activity
                        </p>

                        <p className="mt-0.5 truncate text-[12px] font-semibold text-[#344A43]">
                            {activity?.name ||
                                "Workflow Action"}
                        </p>
                    </div>

                    <div className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#20BF63] shadow-sm">
                        <Check
                            size={14}
                            strokeWidth={2}
                        />
                    </div>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="px-6 pb-6"
                >
                    {/* EMAIL */}
                    <div className="mb-4">
                        <label className="mb-1.5 block text-[10.5px] font-semibold text-[#344A43]">
                            Email{" "}
                            <span className="text-[#D94A4A]">
                                *
                            </span>
                        </label>

                        <div
                            className={`flex h-[42px] items-center rounded-xl border bg-[#FBFDFC] transition-all duration-200 focus-within:bg-white ${
                                errors.email
                                    ? "border-[#E5A5A5] focus-within:border-[#D94A4A]"
                                    : "border-[#D8E5DE] focus-within:border-[#20BF63] focus-within:shadow-[0_0_0_3px_rgba(32,191,99,0.08)]"
                            }`}
                        >
                            <Mail
                                size={15}
                                strokeWidth={1.8}
                                className="ml-3.5 shrink-0 text-[#8A9992]"
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(
                                        event.target
                                            .value
                                    );

                                    if (
                                        errors.email
                                    ) {
                                        setErrors(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                email: "",
                                            })
                                        );
                                    }
                                }}
                                placeholder="Enter your email"
                                disabled={loading}
                                autoComplete="email"
                                className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[12px] text-[#344A43] outline-none placeholder:text-[#A4B0AB] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {errors.email && (
                            <p className="mt-1 text-[10px] text-[#D94A4A]">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div className="mb-4">
                        <label className="mb-1.5 block text-[10.5px] font-semibold text-[#344A43]">
                            Password{" "}
                            <span className="text-[#D94A4A]">
                                *
                            </span>
                        </label>

                        <div
                            className={`flex h-[42px] items-center rounded-xl border bg-[#FBFDFC] transition-all duration-200 focus-within:bg-white ${
                                errors.password
                                    ? "border-[#E5A5A5]"
                                    : "border-[#D8E5DE] focus-within:border-[#20BF63] focus-within:shadow-[0_0_0_3px_rgba(32,191,99,0.08)]"
                            }`}
                        >
                            <LockKeyhole
                                size={15}
                                strokeWidth={1.8}
                                className="ml-3.5 shrink-0 text-[#8A9992]"
                            />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(event) => {
                                    setPassword(
                                        event.target
                                            .value
                                    );

                                    if (
                                        errors.password
                                    ) {
                                        setErrors(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                password:
                                                    "",
                                            })
                                        );
                                    }
                                }}
                                placeholder="Enter your password"
                                disabled={loading}
                                autoComplete="current-password"
                                className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[12px] text-[#344A43] outline-none placeholder:text-[#A4B0AB] disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (value) =>
                                            !value
                                    )
                                }
                                disabled={loading}
                                className="mr-2 flex h-7 w-7 items-center justify-center rounded-lg text-[#8A9992] transition-colors hover:bg-[#EDF5F0] hover:text-[#344A43]"
                            >
                                {showPassword ? (
                                    <EyeOff
                                        size={15}
                                        strokeWidth={
                                            1.8
                                        }
                                    />
                                ) : (
                                    <Eye
                                        size={15}
                                        strokeWidth={
                                            1.8
                                        }
                                    />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="mt-1 text-[10px] text-[#D94A4A]">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* COMMENT */}
                    <div className="mb-5">
                        <label className="mb-1.5 block text-[10.5px] font-semibold text-[#344A43]">
                            Comment{" "}
                            <span className="text-[#D94A4A]">
                                *
                            </span>
                        </label>

                        <div
                            className={`relative rounded-xl border bg-[#FBFDFC] transition-all duration-200 focus-within:bg-white ${
                                errors.comment
                                    ? "border-[#E5A5A5]"
                                    : "border-[#D8E5DE] focus-within:border-[#20BF63] focus-within:shadow-[0_0_0_3px_rgba(32,191,99,0.08)]"
                            }`}
                        >
                            <MessageSquare
                                size={15}
                                strokeWidth={1.8}
                                className="absolute left-3.5 top-3 text-[#8A9992]"
                            />

                            <textarea
                                value={comment}
                                onChange={(event) => {
                                    setComment(
                                        event.target
                                            .value
                                    );

                                    if (
                                        errors.comment
                                    ) {
                                        setErrors(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                comment:
                                                    "",
                                            })
                                        );
                                    }
                                }}
                                placeholder="Enter a comment for this action..."
                                disabled={loading}
                                rows={3}
                                className="w-full resize-none bg-transparent py-2.5 pl-10 pr-3.5 text-[12px] leading-5 text-[#344A43] outline-none placeholder:text-[#A4B0AB] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {errors.comment && (
                            <p className="mt-1 text-[10px] text-[#D94A4A]">
                                {errors.comment}
                            </p>
                        )}
                    </div>

                    {/* SECURITY MESSAGE */}
                    <div className="mb-5 flex items-center gap-2 rounded-lg bg-[#F5F9F7] px-3 py-2">
                        <ShieldCheck
                            size={13}
                            strokeWidth={1.8}
                            className="shrink-0 text-[#20BF63]"
                        />

                        <p className="text-[9px] leading-4 text-[#71837B]">
                            Your electronic signature will
                            be recorded with this workflow
                            action.
                        </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-9 rounded-xl border border-[#D8E5DE] bg-white px-4 text-[10.5px] font-semibold text-[#53675E] transition-all duration-200 hover:border-[#C5D6CD] hover:bg-[#F5F9F7] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex h-9 min-w-[132px] items-center justify-center gap-2 rounded-xl bg-[#20BF63] px-4 text-[10.5px] font-semibold text-white shadow-[0_5px_14px_rgba(32,191,99,0.20)] transition-all duration-200 hover:-translate-y-px hover:bg-[#1CAF59] hover:shadow-[0_7px_18px_rgba(32,191,99,0.25)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck
                                        size={14}
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