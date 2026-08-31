import React, { useEffect, useState } from "react";
import { Check, Eye, EyeOff, LockKeyhole, Mail, MessageSquare, ShieldCheck, X } from "lucide-react";

const ESignModal = ({ isOpen = false, activity = null, onClose, onConfirm, loading = false }) => {
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
    if (!email.trim()) { nextErrors.email = "Email is required"; } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { nextErrors.email = "Please enter a valid email"; }
    if (!password.trim()) { nextErrors.password = "Password is required"; }
    if (!comment.trim()) { nextErrors.comment = "Comment is required"; }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || !validate()) return;
    await onConfirm?.({ email: email.trim(), password, comment: comment.trim(), activity });
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !loading) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07120E]/55 px-4 py-6 backdrop-blur-[5px]"
      onMouseDown={handleOverlayClick}
    >
      <div className="relative w-full max-w-[380px] overflow-hidden rounded-[18px] border border-white/70 bg-white shadow-[0_20px_60px_rgba(9,32,22,0.25)]">
        {/* Top accent - neutral gray */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500" />

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close e-sign"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-[#8A9992] transition-all hover:bg-[#F0F6F2] hover:text-[#344A43] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={16} strokeWidth={1.8} />
        </button>

        <div className="px-5 pb-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-gray-100 text-gray-600 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
              <ShieldCheck size={18} strokeWidth={1.8} />
              <span className="absolute bottom-[3px] right-[3px] h-[5px] w-[5px] rounded-full bg-gray-500" />
            </div>
            <div className="min-w-0 pr-6">
              <p className="text-[14px] font-bold tracking-[-0.01em] text-[#1F342B]">Electronic Signature</p>
              <p className="mt-0.5 text-[10px] leading-[15px] text-[#7A8B84]">Verify your identity to perform this action.</p>
            </div>
          </div>
        </div>

        <div className="mx-5 mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#8B9A94]">Workflow Activity</p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-[#344A43]">{activity?.name || "Workflow Action"}</p>
          </div>
          <div className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm">
            <Check size={13} strokeWidth={2} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5">
          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-semibold text-[#344A43]">Email <span className="text-[#D94A4A]">*</span></label>
            <div className={`flex h-[38px] items-center rounded-lg border bg-[#FBFDFC] transition-all focus-within:bg-white ${errors.email ? "border-[#E5A5A5] focus-within:border-[#D94A4A]" : "border-gray-300 focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"}`}>
              <Mail size={14} strokeWidth={1.8} className="ml-3 shrink-0 text-[#8A9992]" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((prev) => ({ ...prev, email: "" })); }}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-[11px] text-[#344A43] outline-none placeholder:text-[#A4B0AB] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            {errors.email && <p className="mt-0.5 text-[9px] text-[#D94A4A]">{errors.email}</p>}
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-semibold text-[#344A43]">Password <span className="text-[#D94A4A]">*</span></label>
            <div className={`flex h-[38px] items-center rounded-lg border bg-[#FBFDFC] transition-all focus-within:bg-white ${errors.password ? "border-[#E5A5A5]" : "border-gray-300 focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"}`}>
              <LockKeyhole size={14} strokeWidth={1.8} className="ml-3 shrink-0 text-[#8A9992]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((prev) => ({ ...prev, password: "" })); }}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-[11px] text-[#344A43] outline-none placeholder:text-[#A4B0AB] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                className="mr-1 flex h-6 w-6 items-center justify-center rounded-lg text-[#8A9992] hover:bg-[#EDF5F0] hover:text-[#344A43]"
              >
                {showPassword ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
              </button>
            </div>
            {errors.password && <p className="mt-0.5 text-[9px] text-[#D94A4A]">{errors.password}</p>}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-[10px] font-semibold text-[#344A43]">Comment <span className="text-[#D94A4A]">*</span></label>
            <div className={`relative rounded-lg border bg-[#FBFDFC] transition-all focus-within:bg-white ${errors.comment ? "border-[#E5A5A5]" : "border-gray-300 focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"}`}>
              <MessageSquare size={14} strokeWidth={1.8} className="absolute left-3 top-2.5 text-[#8A9992]" />
              <textarea
                value={comment}
                onChange={(e) => { setComment(e.target.value); if (errors.comment) setErrors((prev) => ({ ...prev, comment: "" })); }}
                placeholder="Enter a comment..."
                disabled={loading}
                rows={2}
                className="w-full resize-none bg-transparent py-2 pl-9 pr-3 text-[11px] leading-4 text-[#344A43] outline-none placeholder:text-[#A4B0AB] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            {errors.comment && <p className="mt-0.5 text-[9px] text-[#D94A4A]">{errors.comment}</p>}
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5">
            <ShieldCheck size={12} strokeWidth={1.8} className="shrink-0 text-gray-500" />
            <p className="text-[8px] leading-3 text-[#71837B]">Your signature will be recorded with this action.</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-8 rounded-lg border border-gray-300 bg-white px-3 text-[10px] font-semibold text-[#53675E] transition-all hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group flex h-8 min-w-[110px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-[10px] font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-px hover:bg-blue-700 hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck size={13} strokeWidth={2} />
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