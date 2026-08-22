import React, { useState } from "react";
import { Loader2 } from "lucide-react";

const FloatingActionButtons = ({
    onSave,
    onCancel,
    isSaving = false,
    saveLabel = "Save",
    cancelLabel = "Cancel",
}) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <div
            className="
                fixed right-0 bottom-1/7 z-20
                flex -translate-y-1/2 flex-col items-end gap-3
                sm:right-1
            "
        >
            <button
                type="button"
                onClick={() => setShowActions((prev) => !prev)}
                className="
                    flex h-9 w-9 items-center justify-center
                    rounded-l-[9px]
                    border border-[#D9E0DC]
                    bg-white
                    shadow-[0_5px_16px_rgba(38,53,46,0.16)]
                    transition-all duration-300
                    hover:bg-[#F7F9F8]
                    active:scale-95
                "
                aria-label="Toggle actions"
            >
                <span className="grid grid-cols-2 gap-[3px]">
                    <span className="h-[4px] w-[4px] rounded-full bg-[#59655F]" />
                    <span className="h-[4px] w-[4px] rounded-full bg-[#59655F]" />
                    <span className="h-[4px] w-[4px] rounded-full bg-[#59655F]" />
                    <span className="h-[4px] w-[4px] rounded-full bg-[#59655F]" />
                </span>
            </button>

            <div
                className={`
                    flex flex-col gap-3
                    origin-right
                    transition-all duration-300
                    ease-[cubic-bezier(.22,1,.36,1)]
                    ${
                        showActions
                            ? "translate-x-0 scale-100 opacity-100"
                            : "pointer-events-none translate-x-3 scale-95 opacity-0"
                    }
                `}
            >
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="
                        flex h-[42px] w-[76px]
                        items-center justify-center gap-1.5
                        rounded-l-[9px]
                        bg-[#2B5577]
                        text-[12px] font-semibold text-white
                        shadow-[0_5px_15px_rgba(43,85,119,0.28)]
                        transition-all duration-200
                        hover:bg-[#234766]
                        hover:shadow-[0_7px_18px_rgba(43,85,119,0.35)]
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {isSaving ? (
                        <>
                            <Loader2
                                size={13}
                                className="animate-spin"
                            />
                            Saving
                        </>
                    ) : (
                        saveLabel
                    )}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="
                        flex h-[42px] w-[76px]
                        items-center justify-center gap-1.5
                        rounded-l-[9px]
                        bg-[#F52F3E]
                        text-[12px] font-semibold text-white
                        shadow-[0_5px_15px_rgba(245,47,62,0.25)]
                        transition-all duration-200
                        hover:bg-[#E52635]
                        hover:shadow-[0_7px_18px_rgba(245,47,62,0.32)]
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {cancelLabel}
                </button>
            </div>
        </div>
    );
};

export default FloatingActionButtons;