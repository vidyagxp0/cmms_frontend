import React from "react";
import { X, Loader2 } from "lucide-react";

const AdminModal = ({
    open,
    onClose,
    title,
    description,
    icon: Icon,
    children,
    onSubmit,
    submitText = "Save",
    cancelText = "Cancel",
    loading = false,
    submitDisabled = false,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#10251B]/35 backdrop-blur-[3px]"
                onClick={!loading ? onClose : undefined}
            />

            <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl border border-[#D4E7DC] bg-white shadow-[0_24px_70px_-20px_rgba(21,61,45,0.38)]">
                <div className="flex items-start justify-between border-b border-[#E8F1EB] px-6 py-5">
                    <div className="flex items-start gap-3">
                        {Icon && (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#C5E1D1] bg-[#EEF8F2]">
                                <Icon
                                    size={19}
                                    strokeWidth={1.9}
                                    className="text-[#17734C]"
                                />
                            </span>
                        )}

                        <div>
                            <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[#152C20]">
                                {title}
                            </h2>

                            {description && (
                                <p className="mt-1 text-[11.5px] leading-5 text-[#71877C]">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7A9185] transition-all duration-150 hover:bg-[#F1F7F3] hover:text-[#263F33] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X size={17} strokeWidth={1.8} />
                    </button>
                </div>

                {/* <form onSubmit={onSubmit}> */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit(e);
                        }}
                    >
                    <div className="px-6 py-6">
                        {children}
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-[#E8F1EB] bg-[#FBFDFC] px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-9 rounded-[9px] border border-[#D3E4DA] bg-white px-4 text-[11.5px] font-semibold text-[#536D60] transition-all duration-150 hover:border-[#B9D3C4] hover:bg-[#F7FBF8] hover:text-[#263F33] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {cancelText}
                        </button>

                        <button
                            type="submit"
                            disabled={loading || submitDisabled}
                            className="flex h-9 min-w-[100px] items-center justify-center gap-2 rounded-[9px] border border-[#176B49] bg-[#17734C] px-4 text-[11.5px] font-semibold text-white shadow-[0_6px_18px_-8px_rgba(23,115,76,0.6)] transition-all duration-150 hover:bg-[#125D3E] hover:shadow-[0_8px_22px_-8px_rgba(23,115,76,0.65)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && (
                                <Loader2
                                    size={14}
                                    strokeWidth={2}
                                    className="animate-spin"
                                />
                            )}

                            {loading ? "Saving..." : submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminModal;