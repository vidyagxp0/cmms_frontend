import React, { useState } from "react";
import { ArrowRight, Zap, LogOut, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ESignModal from "../ESignModal/ESignModal";

const ProcessActivities = ({
    activities = [],
    loading = false,
    recordId,
    activityApi,
    onActivitySuccess,
    onExit,
    auditRoute = "/user/new-audit",
}) => {
    const navigate = useNavigate();

    const [selectedActivity, setSelectedActivity] =
        useState(null);

    const [isESignOpen, setIsESignOpen] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    // =========================
    // ACTIVITY CLICK
    // =========================
    const handleActivityClick = (activity) => {
        setSelectedActivity(activity);
        setIsESignOpen(true);
    };

    // =========================
    // CLOSE E-SIGN
    // =========================
    const handleCloseESign = () => {
        if (isSubmitting) return;

        setIsESignOpen(false);
        setSelectedActivity(null);
    };

    // =========================
    // E-SIGN CONFIRM
    // =========================
    const handleESignConfirm = async ({
        email,
        password,
        comment,
    }) => {
        if (
            isSubmitting ||
            !selectedActivity ||
            !recordId
        ) {
            return;
        }

        if (!activityApi) {
            toast.error(
                "Activity API is not configured."
            );
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                email,
                password,
                comment,
                activity_id:
                    selectedActivity.id,
            };

            const response = await activityApi(
                recordId,
                payload
            );

            if (
                response?.data?.success === false
            ) {
                throw new Error(
                    response?.data?.message ||
                        "Activity execution failed."
                );
            }

            toast.success(
                `${selectedActivity.name} completed successfully.`
            );

            setIsESignOpen(false);
            setSelectedActivity(null);

            await onActivitySuccess?.(
                response,
                selectedActivity
            );
        } catch (error) {
            console.error(
                "Activity execution failed:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    `Failed to perform ${selectedActivity.name}.`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // =========================
    // EXIT
    // =========================
    const handleExit = () => {
        if (isSubmitting) return;

        if (onExit) {
            onExit();
            return;
        }

        navigate(-1);
    };

    // =========================
    // AUDIT
    // =========================
    const handleAudit = () => {
        if (!recordId) {
            toast.error(
                "Record ID is missing."
            );
            return;
        }

        navigate(
            `${auditRoute}/${recordId}`
        );
    };

    return (
        <>
            <div className="flex min-h-[48px] w-full items-center rounded-xl border border-[#E0EAE5] bg-[#F3F8F5] px-3 shadow-[0_2px_10px_rgba(21,44,32,0.025)]">
                {/* =========================
                    ACTIVITY LABEL
                ========================== */}
                {/* <div className="mr-3 flex shrink-0 items-center gap-1.5 border-r border-[#DCE8E2] pr-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[#20BF63] shadow-sm">
                        <Zap
                            size={12}
                            strokeWidth={2.2}
                        />
                    </div>

                    <span className="hidden text-[10px] font-semibold text-[#60736B] sm:block">
                        Activities
                    </span>
                </div> */}

                {/* =========================
                    ACTIVITIES
                ========================== */}
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5">
                    {loading ? (
                        <>
                            <div className="h-7 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200" />

                            <div className="h-7 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200" />
                        </>
                    ) : activities.length > 0 ? (
                        activities.map(
                            (activity) => (
                                <button
                                    key={
                                        activity.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        handleActivityClick(
                                            activity
                                        )
                                    }
                                    disabled={
                                        isSubmitting
                                    }
                                    className="group flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-[#CFE0D7] bg-gray-900 px-3 text-[10px] font-semibold text-[#D7D7D7] shadow-[0_1px_4px_rgba(21,44,32,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-[#98A3BA] hover:bg-[#142853] hover:text-white hover:shadow-[0_4px_10px_rgba(32,191,99,0.16)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span>
                                        {
                                            activity.name
                                        }
                                    </span>

                                    <ArrowRight
                                        size={11}
                                        strokeWidth={
                                            2
                                        }
                                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </button>
                            )
                        )
                    ) : (
                        <span className="text-[10px] text-[#8A9992]">
                            No actions available
                            for this stage
                        </span>
                    )}
                </div>

                {/* =========================
                    STATIC ACTIONS
                ========================== */}
                <div className="ml-3 flex shrink-0 items-center gap-2 border-l border-[#DCE8E2] pl-3">
                    {/* AUDIT */}
                    <button
                        type="button"
                        onClick={handleAudit}
                        disabled={
                            isSubmitting ||
                            !recordId
                        }
                        className="group flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-[#BFD8CC] bg-white px-3 text-[10px] font-semibold text-[#276149] shadow-[0_1px_4px_rgba(21,44,32,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-[#20BF63] hover:bg-[#EAF7EF] hover:text-[#17603F] hover:shadow-[0_4px_10px_rgba(32,191,99,0.12)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ClipboardCheck
                            size={12}
                            strokeWidth={2}
                            className="transition-transform duration-200 group-hover:scale-105"
                        />

                        <span>Audit</span>
                    </button>

                    {/* EXIT */}
                    <button
                        type="button"
                        onClick={handleExit}
                        disabled={isSubmitting}
                        className="group flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-[#E4CCCC] bg-white px-3 text-[10px] font-semibold text-[#A94444] shadow-[0_1px_4px_rgba(21,44,32,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-[#D98B8B] hover:bg-[#FFF4F4] hover:text-[#913838] hover:shadow-[0_4px_10px_rgba(196,61,61,0.10)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <LogOut
                            size={12}
                            strokeWidth={2}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />

                        <span>Exit</span>
                    </button>
                </div>
            </div>

            {/* =========================
                E-SIGN MODAL
            ========================== */}
            <ESignModal
                isOpen={isESignOpen}
                activity={selectedActivity}
                loading={isSubmitting}
                onClose={handleCloseESign}
                onConfirm={
                    handleESignConfirm
                }
            />
        </>
    );
};

export default ProcessActivities;