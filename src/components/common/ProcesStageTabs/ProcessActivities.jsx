import React, {
    useState,
} from "react";

import {
    ArrowRight,
    LogOut,
    ClipboardCheck,
} from "lucide-react";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import ESignModal from "../ESignModal/ESignModal";

const ProcessActivities = ({
    activities = [],
    loading = false,
    recordId,
    userId,
    activityApi,
    onActivitySuccess,
    onExit,
    auditRoute = "/user/new-audit",
    canPerformActivity = false,
    permissionsLoading = true,
}) => {
    const navigate = useNavigate();

    const [selectedActivity, setSelectedActivity] =
        useState(null);

    const [isESignOpen, setIsESignOpen] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const handleActivityClick = (
        activity
    ) => {
        setSelectedActivity(activity);
        setIsESignOpen(true);
    };

    const handleCloseESign = () => {
        if (isSubmitting) return;

        setIsESignOpen(false);
        setSelectedActivity(null);
    };

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
                user_id: userId,
                email,
                password,
                comment,
                activity_id:
                    selectedActivity.id,
            };

            const response =
                await activityApi(
                    recordId,
                    payload
                );

            if (
                response?.data?.success ===
                false
            ) {
                throw new Error(
                    response?.data
                        ?.message ||
                        "Activity execution failed."
                );
            }

            const activity =
                response?.data?.data
                    ?.activity;

            toast.success(
                activity
                    ? `Activity completed successfully: ${activity.from_stage} → ${activity.to_stage}`
                    : "Activity completed successfully."
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
                error?.response?.data
                    ?.message ||
                    error?.message ||
                    `Failed to perform ${selectedActivity.name}.`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExit = () => {
        if (isSubmitting) return;

        if (onExit) {
            onExit();
            return;
        }

        navigate(-1);
    };

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
            <div
                className="
                    flex
                    min-h-[52px]
                    w-full
                    items-center
                    gap-3
                    rounded-[12px]
                    border
                    border-[#D8E2DD]
                    bg-[#F8FAF8]
                    px-3
                    shadow-[0_2px_9px_rgba(36,50,56,0.035)]
                "
            >
                {/* =================================================
                    ACTIVITIES
                ================================================== */}
                <div
                    className="
                        flex
                        min-w-0
                        flex-1
                        items-center
                        gap-2
                        overflow-x-auto
                        py-1
                        custom-scrollbar
                    "
                >
                    {permissionsLoading
                        ? null
                        : canPerformActivity
                        ? loading
                            ? (
                                <>
                                    <div
                                        className="
                                            h-[30px]
                                            w-[100px]
                                            shrink-0
                                            animate-pulse
                                            rounded-[8px]
                                            bg-[#E3EBE7]
                                        "
                                    />

                                    <div
                                        className="
                                            h-[30px]
                                            w-[100px]
                                            shrink-0
                                            animate-pulse
                                            rounded-[8px]
                                            bg-[#E3EBE7]
                                        "
                                    />
                                </>
                            )
                            : activities.length >
                              0
                            ? activities.map(
                                  (
                                      activity
                                  ) => (
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
                                          className="
                                              group
                                              flex
                                              h-[31px]
                                              shrink-0
                                              items-center
                                              gap-2
                                              rounded-[8px]
                                              border
                                              border-[#BFCFC8]
                                              bg-[#EAF1EE]
                                              px-3
                                              text-[10px]
                                              font-bold
                                              text-[#4D6C61]
                                              transition-all
                                              duration-200
                                              hover:-translate-y-[1px]
                                              hover:border-[#AFC5BC]
                                              hover:bg-[#DEEAE5]
                                              hover:text-[#3F5E54]
                                              hover:shadow-[0_4px_10px_rgba(86,118,109,0.10)]
                                              active:translate-y-0
                                              disabled:cursor-not-allowed
                                              disabled:opacity-50
                                              focus:outline-none
                                              focus-visible:ring-2
                                              focus-visible:ring-[var(--color-primary-muted)]
                                              focus-visible:ring-offset-1
                                          "
                                      >
                                          <span className="whitespace-nowrap">
                                              {
                                                  activity.name
                                              }
                                          </span>

                                          <ArrowRight
                                              size={
                                                  11
                                              }
                                              strokeWidth={
                                                  2
                                              }
                                              className="
                                                  transition-transform
                                                  duration-200
                                                  group-hover:translate-x-0.5
                                              "
                                          />
                                      </button>
                                  )
                              )
                            : (
                                <span
                                    className="
                                        text-[10px]
                                        font-medium
                                        text-[#8A9992]
                                    "
                                >
                                    No actions available for this stage
                                </span>
                            )
                        : null}
                </div>

                {/* =================================================
                    AUDIT / EXIT
                ================================================== */}
                <div
                    className="
                        ml-auto
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        border-l
                        border-[#D9E3DE]
                        pl-3
                    "
                >
                    <button
                        type="button"
                        onClick={
                            handleAudit
                        }
                        disabled={
                            isSubmitting ||
                            !recordId
                        }
                        className="
                            group
                            flex
                            h-[31px]
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-[8px]
                            border
                            border-[#C7D8D1]
                            bg-white
                            px-2.5
                            text-[10px]
                            font-bold
                            text-[#56766D]
                            shadow-[0_1px_5px_rgba(36,50,56,0.035)]
                            transition-all
                            duration-200
                            hover:-translate-y-[1px]
                            hover:border-[#AFC5BC]
                            hover:bg-[#EAF1EE]
                            hover:text-[#48685F]
                            hover:shadow-[0_4px_10px_rgba(86,118,109,0.08)]
                            active:translate-y-0
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[var(--color-primary-muted)]
                            focus-visible:ring-offset-1
                        "
                    >
                        <ClipboardCheck
                            size={12}
                            strokeWidth={1.9}
                            className="
                                transition-transform
                                duration-200
                                group-hover:scale-105
                            "
                        />

                        <span>
                            Audit
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleExit
                        }
                        disabled={
                            isSubmitting
                        }
                        className="
                            group
                            flex
                            h-[31px]
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-[8px]
                            border
                            border-[#E2CCCC]
                            bg-white
                            px-2.5
                            text-[10px]
                            font-bold
                            text-[#A45353]
                            shadow-[0_1px_5px_rgba(36,50,56,0.035)]
                            transition-all
                            duration-200
                            hover:-translate-y-[1px]
                            hover:border-[#D7B0B0]
                            hover:bg-[#FBF0F0]
                            hover:text-[#913F3F]
                            hover:shadow-[0_4px_10px_rgba(169,68,68,0.08)]
                            active:translate-y-0
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[#E4BDBD]
                            focus-visible:ring-offset-1
                        "
                    >
                        <LogOut
                            size={12}
                            strokeWidth={1.9}
                            className="
                                transition-transform
                                duration-200
                                group-hover:-translate-x-0.5
                            "
                        />

                        <span>
                            Exit
                        </span>
                    </button>
                </div>
            </div>

            <ESignModal
                isOpen={isESignOpen}
                activity={
                    selectedActivity
                }
                loading={
                    isSubmitting
                }
                onClose={
                    handleCloseESign
                }
                onConfirm={
                    handleESignConfirm
                }
            />
        </>
    );
};

export default ProcessActivities;