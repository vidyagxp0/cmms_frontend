import React, { useEffect, useRef, useState } from "react";
import { Loader2, Check, X } from "lucide-react";

const FloatingActionButtons = ({
    onSave,
    onCancel,
    isSaving = false,
    saveLabel = "Save",
    cancelLabel = "Cancel",
}) => {
    const [showActions, setShowActions] = useState(false);
    // "save" | "cancel" | null — which button the user clicked last
    const [pendingAction, setPendingAction] = useState(null);
    const containerRef = useRef(null);

    // Single source of truth for "the record is busy"
    const isBusy = isSaving;
    const isSavingRef = useRef(isSaving);

    // Keep the panel open while saving; clear `pendingAction` once the
    // save finishes so a stuck spinner is impossible.
    useEffect(() => {
        if (isSaving) {
            setShowActions(true);
        } else {
            setPendingAction(null);
        }
    }, [isSaving]);

    // Close on outside click (disabled while busy)
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!showActions || isBusy || !containerRef.current) return;
            if (!containerRef.current.contains(event.target)) {
                setShowActions(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [showActions, isBusy]);

    const handleOpenActions = () => {
        if (isBusy) return;
        setShowActions(true);
    };

    // Double-click protection. `form.submit()` validates asynchronously before
    // the page sets isSaving=true, so two quick clicks could both get through
    // and create the record twice. Lock until the save starts (isSaving flips)
    // or, if validation fails and no save starts, for a short moment.
    const saveLockRef = useRef(false);
    const saveLockTimerRef = useRef(null);

    useEffect(() => {
        isSavingRef.current = isSaving;
        if (isSaving) {
            clearTimeout(saveLockTimerRef.current);
            saveLockRef.current = true;
        } else {
            saveLockRef.current = false;
        }
    }, [isSaving]);

    useEffect(() => () => clearTimeout(saveLockTimerRef.current), []);

    const handleSaveClick = () => {
        if (isBusy || saveLockRef.current) return;
        saveLockRef.current = true;
        clearTimeout(saveLockTimerRef.current);
        saveLockTimerRef.current = setTimeout(() => {
            if (!isSavingRef.current) saveLockRef.current = false;
        }, 1200);
        setPendingAction("save");
        setShowActions(true);
        onSave?.();
    };

    const handleCancelClick = () => {
        if (isBusy) return;
        setPendingAction("cancel");
        setShowActions(true);
        onCancel?.();
    };

    // Only show "Cancelling…" when the in-flight save was triggered
    // from the Cancel flow (e.g. "Save & Exit"). Otherwise show "Cancel".
    const showCancellingSpinner = isSaving && pendingAction === "cancel";

    return (
        <div ref={containerRef} className="fixed right-0 bottom-[12%] z-20 sm:right-1">
            <div className="relative flex min-h-[92px] min-w-[124px] items-center justify-end">
                {/* COLLAPSED DONGLE (unchanged) */}
                <button
                    type="button"
                    onClick={handleOpenActions}
                    disabled={isBusy}
                    aria-label="Show actions"
                    aria-expanded={showActions}
                    className={`
                        absolute right-0 top-1/2 flex h-[40px] w-[40px] -translate-y-1/2
                        items-center justify-center rounded-l-[10px] border border-[#C8D6D0]
                        bg-[#F7F8F5] text-[#56766D] shadow-[0_6px_18px_rgba(36,50,56,0.13)]
                        transition-all duration-300 ease-out hover:border-[#AFC5BC]
                        hover:bg-white hover:text-[#48685F] hover:shadow-[0_8px_22px_rgba(36,50,56,0.16)]
                        active:scale-[0.96] focus:outline-none focus-visible:ring-2
                        focus-visible:ring-[var(--color-primary-muted)] focus-visible:ring-offset-1
                        ${
                            showActions
                                ? "pointer-events-none translate-x-6 scale-90 opacity-0"
                                : "pointer-events-auto translate-x-0 scale-100 opacity-100"
                        }
                    `}
                >
                    <span className="grid grid-cols-2 gap-[4px]">
                        <span className="h-[4px] w-[4px] rounded-full bg-[#63756E]" />
                        <span className="h-[4px] w-[4px] rounded-full bg-[#63756E]" />
                        <span className="h-[4px] w-[4px] rounded-full bg-[#63756E]" />
                        <span className="h-[4px] w-[4px] rounded-full bg-[#63756E]" />
                    </span>
                </button>

                {/* EXPANDED ACTIONS */}
                <div
                    className={`
                        absolute right-0 top-1/2 flex -translate-y-1/2 flex-col gap-2
                        transition-all duration-300 ease-out
                        ${
                            showActions
                                ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
                                : "pointer-events-none translate-x-6 scale-95 opacity-0"
                        }
                    `}
                >
                    {/* SAVE / UPDATE */}
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        disabled={isBusy}
                        className="
                            group flex h-[42px] w-[116px] items-center justify-center gap-2
                            rounded-[10px] border border-[#C7D8D0] bg-[#F7FAF8] px-3
                            text-[11px] font-bold text-[#4C6A60] shadow-[0_4px_12px_rgba(36,50,56,0.08)]
                            transition-all duration-200 hover:-translate-x-[1px]
                            hover:border-[#AFC5BC] hover:bg-[#EAF1EE] hover:text-[#3F5F54]
                            hover:shadow-[0_6px_15px_rgba(86,118,109,0.12)] active:translate-x-0
                            disabled:cursor-not-allowed disabled:opacity-55 focus:outline-none
                            focus-visible:ring-2 focus-visible:ring-[var(--color-primary-muted)]
                            focus-visible:ring-offset-1
                        "
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border border-[#C9D9D2] bg-[#E8F0ED] text-[#56766D]">
                                    <Check size={13} strokeWidth={2.2} />
                                </span>
                                <span className="whitespace-nowrap">{saveLabel}</span>
                            </>
                        )}
                    </button>

                    {/* CANCEL */}
                    <button
                        type="button"
                        onClick={handleCancelClick}
                        disabled={isBusy}
                        className="
                            group flex h-[42px] w-[116px] items-center justify-center gap-2
                            rounded-[10px] border border-[#E3CCCC] bg-[#FBF7F7] px-3
                            text-[11px] font-bold text-[#A45353] shadow-[0_4px_12px_rgba(169,68,68,0.07)]
                            transition-all duration-200 hover:-translate-x-[1px]
                            hover:border-[#D7B0B0] hover:bg-[#FBF0F0] hover:text-[#913F3F]
                            hover:shadow-[0_6px_15px_rgba(169,68,68,0.10)] active:translate-x-0
                            disabled:cursor-not-allowed disabled:opacity-55 focus:outline-none
                            focus-visible:ring-2 focus-visible:ring-[#E4BDBD] focus-visible:ring-offset-1
                        "
                    >
                        {showCancellingSpinner ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Cancelling...</span>
                            </>
                        ) : (
                            <>
                                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border border-[#E3CCCC] bg-[#FBEFEF] text-[#A45353]">
                                    <X size={13} strokeWidth={2.2} />
                                </span>
                                <span className="whitespace-nowrap">{cancelLabel}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloatingActionButtons;