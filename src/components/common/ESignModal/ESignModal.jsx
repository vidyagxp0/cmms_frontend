import React, { useEffect, useRef, useState } from "react";
import { Check, Eye, EyeOff, LockKeyhole, MessageSquare, ShieldCheck, User, X } from "lucide-react";

const fieldBase =
    "flex items-center rounded-[10px] border bg-white transition-all duration-150";
const fieldOk =
    "border-[#D9E5DF] hover:border-[#C6D7CF] focus-within:border-[#2F7A5B] focus-within:shadow-[0_0_0_3px_rgba(47,122,91,0.12)]";
const fieldErr =
    "border-[#E3A9AC] bg-[#FFF8F8] focus-within:border-[#C94B4F] focus-within:shadow-[0_0_0_3px_rgba(201,75,79,0.10)]";

const ESignModal = ({ isOpen = false, activity = null, onClose, onConfirm, loading = false }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [comment, setComment] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const usernameRef = useRef(null);

    // Reset + enter animation
    useEffect(() => {
        if (!isOpen) {
            setIsVisible(false);
            setUsername("");
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
                usernameRef.current?.focus();
            });
        });

        return () => {
            cancelAnimationFrame(frame1);
            if (frame2) cancelAnimationFrame(frame2);
        };
    }, [isOpen]);

    // Scroll lock + Escape to close
    useEffect(() => {
        if (!isOpen) return;

        const body = document.body.style;
        const html = document.documentElement.style;
        const prev = {
            bodyOverflow: body.overflow,
            bodyOverscroll: body.overscrollBehavior,
            htmlOverflow: html.overflow,
            htmlOverscroll: html.overscrollBehavior,
        };

        body.overflow = "hidden";
        body.overscrollBehavior = "none";
        html.overflow = "hidden";
        html.overscrollBehavior = "none";

        const preventBackgroundScroll = (event) => {
            if (!event.target?.closest?.("[data-esign-content]")) event.preventDefault();
        };
        const handleKey = (event) => {
            if (event.key === "Escape" && !loading) onClose?.();
        };

        document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
        document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
        document.addEventListener("keydown", handleKey);

        return () => {
            body.overflow = prev.bodyOverflow;
            body.overscrollBehavior = prev.bodyOverscroll;
            html.overflow = prev.htmlOverflow;
            html.overscrollBehavior = prev.htmlOverscroll;
            document.removeEventListener("wheel", preventBackgroundScroll);
            document.removeEventListener("touchmove", preventBackgroundScroll);
            document.removeEventListener("keydown", handleKey);
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const validate = () => {
        const next = {};
        if (!username.trim()) next.username = "Username is required";
        if (!password.trim()) next.password = "Password is required";
        if (!comment.trim()) next.comment = "Comment is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (loading || !validate()) return;

        await onConfirm?.({
            username: username.trim(),
            password,
            comment: comment.trim(),
            activity,
        });
    };

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && !loading) onClose?.();
    };

    const clearError = (key) => {
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    return (
        <>
            <style>{`
                @keyframes esignButtonSweep {
                    0%   { transform: translateX(0) skewX(-16deg); opacity: 0; }
                    20%  { opacity: 0.5; }
                    100% { transform: translateX(420%) skewX(-16deg); opacity: 0; }
                }
                @media (prefers-reduced-motion: reduce) {
                    [data-esign-anim] { animation: none !important; transition: none !important; }
                }
            `}</style>

            {/* OVERLAY — soft tint + light blur */}
            <div
                data-esign-anim
                className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 overscroll-none bg-[#0F1D17]/25 backdrop-blur-[5px] transition-opacity duration-300 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
                onMouseDown={handleOverlayClick}
            >
                {/* MODAL */}
                <div
                    data-esign-content
                    data-esign-anim
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="esign-title"
                    className={`relative w-full max-w-[420px] overflow-hidden rounded-[18px] border border-[#E3ECE7] bg-[#FCFDFC] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_24px_64px_-12px_rgba(15,29,23,0.28),0_4px_14px_rgba(15,29,23,0.06)] transform-gpu transition-all duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] ${isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.97] opacity-0"}`}
                >
                    {/* HEADER BAND */}
                    <div className="relative border-b border-[#E3ECE7] bg-[#F2F8F4] px-5 pb-4 pt-5">
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-[#A47D45]" />

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Close e-sign"
                            className="absolute right-3 top-3.5 flex h-8 w-8 items-center justify-center rounded-[9px] text-[#7C8F87] transition-all duration-150 hover:bg-white hover:text-[#1F4A3B] hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <X size={16} strokeWidth={1.9} />
                        </button>

                        <div className="flex items-start gap-3 pr-8">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[#D5E6DC] bg-white text-[#2F7A5B] shadow-[0_4px_12px_rgba(31,74,59,0.08)]">
                                <ShieldCheck size={20} strokeWidth={1.8} />
                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#18B865]" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h2
                                        id="esign-title"
                                        className="font-[var(--font-display)] text-[15px] font-bold tracking-[-0.02em] text-[#1F3D33]"
                                    >
                                        Electronic Signature
                                    </h2>
                                </div>
                                <p className="mt-1 text-[11.5px] leading-[16px] text-[#6B7F77]">
                                    Enter your credentials to sign this action.
                                </p>
                            </div>
                        </div>

                        {/* ACTIVITY */}
                        <div className="mt-4 flex items-center gap-3 rounded-[11px] border border-[#DCE8E1] bg-white px-3 py-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#E4F1EA] text-[#2F7A5B]">
                                <Check size={14} strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#8A9A93]">
                                    Workflow Activity
                                </p>
                                <p className="truncate font-[var(--font-display)] text-[12.5px] font-semibold tracking-[-0.01em] text-[#1F3D33]">
                                    {activity?.name || "Workflow Action"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} noValidate className="px-5 pb-5 pt-4">
                        {/* USERNAME */}
                        <div className="mb-3.5">
                            <label htmlFor="esign-username" className="mb-1.5 block text-[11px] font-semibold text-[#344A43]">
                                Username <span className="text-[#C94B4F]">*</span>
                            </label>
                            <div className={`${fieldBase} h-10 ${errors.username ? fieldErr : fieldOk}`}>
                                <User size={15} strokeWidth={1.8} className="ml-3 shrink-0 text-[#7C9189]" />
                                <input
                                    id="esign-username"
                                    ref={usernameRef}
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        clearError("username");
                                    }}
                                    placeholder="Enter your username"
                                    disabled={loading}
                                    autoComplete="username"
                                    aria-invalid={!!errors.username}
                                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[12.5px] font-medium text-[#1F3D33] outline-none placeholder:text-[#A3B1AB] disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>
                            {errors.username && <p className="mt-1 text-[10.5px] font-medium text-[#C94B4F]">{errors.username}</p>}
                        </div>

                        {/* PASSWORD */}
                        <div className="mb-3.5">
                            <label htmlFor="esign-password" className="mb-1.5 block text-[11px] font-semibold text-[#344A43]">
                                Password <span className="text-[#C94B4F]">*</span>
                            </label>
                            <div className={`${fieldBase} h-10 ${errors.password ? fieldErr : fieldOk}`}>
                                <LockKeyhole size={15} strokeWidth={1.8} className="ml-3 shrink-0 text-[#7C9189]" />
                                <input
                                    id="esign-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        clearError("password");
                                    }}
                                    placeholder="Enter your password"
                                    disabled={loading}
                                    autoComplete="current-password"
                                    aria-invalid={!!errors.password}
                                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[12.5px] font-medium text-[#1F3D33] outline-none placeholder:text-[#A3B1AB] disabled:cursor-not-allowed disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    disabled={loading}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="mr-1.5 flex h-7 w-7 items-center justify-center rounded-[7px] text-[#7C8F87] transition-colors duration-150 hover:bg-[#EEF5F1] hover:text-[#2F7A5B] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-[10.5px] font-medium text-[#C94B4F]">{errors.password}</p>}
                        </div>

                        {/* COMMENT */}
                        <div className="mb-4">
                            <label htmlFor="esign-comment" className="mb-1.5 block text-[11px] font-semibold text-[#344A43]">
                                Comment <span className="text-[#C94B4F]">*</span>
                            </label>
                            <div className={`${fieldBase} relative items-start ${errors.comment ? fieldErr : fieldOk}`}>
                                <MessageSquare size={15} strokeWidth={1.8} className="absolute left-3 top-[11px] text-[#7C9189]" />
                                <textarea
                                    id="esign-comment"
                                    value={comment}
                                    onChange={(e) => {
                                        setComment(e.target.value);
                                        clearError("comment");
                                    }}
                                    placeholder="Enter Comment...."
                                    disabled={loading}
                                    rows={3}
                                    aria-invalid={!!errors.comment}
                                    className="w-full resize-none bg-transparent py-2.5 pl-9 pr-3 text-[12.5px] font-medium leading-[18px] text-[#1F3D33] outline-none placeholder:text-[#A3B1AB] disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>
                            {errors.comment && <p className="mt-1 text-[10.5px] font-medium text-[#C94B4F]">{errors.comment}</p>}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="h-9 rounded-[10px] border border-[#D9E5DF] bg-white px-4 text-[12px] font-semibold text-[#4B6158] transition-all duration-150 hover:border-[#C6D7CF] hover:bg-[#F4F8F6] hover:text-[#1F3D33] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Exit
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="relative flex h-9 min-w-[140px] items-center justify-center gap-2 overflow-hidden rounded-[10px] border border-[#1F5E45] bg-[#246B4F] px-4 text-[12px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_16px_-4px_rgba(36,107,79,0.45)] transition-all duration-150 hover:-translate-y-px hover:bg-[#1F5E45] hover:shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_10px_20px_-6px_rgba(36,107,79,0.55)] active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <span
                                            aria-hidden="true"
                                            data-esign-anim
                                            className="pointer-events-none absolute inset-y-0 left-[-45%] w-[35%] bg-white/25 blur-[8px] animate-[esignButtonSweep_1.25s_ease-in-out_infinite]"
                                        />
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Signing...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={14} strokeWidth={2} />
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