import React from "react";

const ProcessStage = ({
    stages = [],
    activeStageId,
    loading = false,
}) => {
    if (loading) {
        return (
            <div
                className="
                    w-full
                    overflow-hidden
                    rounded-[14px]
                    border
                    border-[#D7E1DC]
                    bg-[#F7F9F7]
                    px-3
                    shadow-[0_3px_12px_rgba(36,50,56,0.04)]
                "
            >
                <div
                    className="
                        flex
                        min-h-[56px]
                        w-max
                        min-w-full
                        items-center
                        gap-2
                        overflow-x-auto
                        overflow-y-hidden
                        py-2
                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-[#C8D8D0]
                    "
                >
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="
                                h-[38px]
                                w-[150px]
                                shrink-0
                                animate-pulse
                                rounded-full
                                bg-[#DDE8E2]
                            "
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!stages.length) {
        return null;
    }

    const normalizedActiveStageId = Number(activeStageId);

    const activeStage = stages.find(
        (stage) => Number(stage?.id) === normalizedActiveStageId
    );

    const isCancelledStageActive =
        normalizedActiveStageId === 6 ||
        activeStage?.name?.trim().toLowerCase() === "close - cancelled";

    const visibleStages = isCancelledStageActive
        ? activeStage
            ? [activeStage]
            : [{ id: 6, name: "Close - Cancelled" }]
        : stages.filter(
              (stage) =>
                  stage?.name?.trim().toLowerCase() !== "close - cancelled"
          );

    const activeStageIndex = stages.findIndex(
        (stage) => Number(stage?.id) === normalizedActiveStageId
    );

    return (
        <>
            <div
                className="
                    w-full
                    overflow-hidden
                    rounded-[14px]
                    border
                    border-[#D5DED9]
                    bg-[#F7F9F7]
                    px-2.5
                    shadow-[0_3px_12px_rgba(36,50,56,0.04)]
                "
            >
                <div
                    className="
                        flex
                        min-h-[56px]
                        w-full
                        items-center
                        overflow-x-auto
                        overflow-y-hidden
                        py-2
                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-[#BFCFC7]
                        overscroll-x-contain
                    "
                >
                    <div
                        className="
                            flex
                            w-max
                            min-w-full
                            items-center
                            gap-2
                        "
                    >
                        {visibleStages.map((stage) => {
                            const originalIndex = stages.findIndex(
                                (item) =>
                                    Number(item?.id) === Number(stage?.id)
                            );

                            const isActive =
                                Number(stage?.id) === normalizedActiveStageId;

                            const isCompleted =
                                activeStageIndex >= 0 &&
                                originalIndex < activeStageIndex;

                            const normalizedName =
                                stage?.name?.trim().toLowerCase();

                            const isClosedDone =
                                normalizedName === "closed - done";

                            const isCancelled =
                                normalizedName === "close - cancelled";

                            if (isCancelled) {
                                return (
                                    <div
                                        key={stage?.id}
                                        title={stage?.name}
                                        className={`
                                            relative
                                            flex
                                            h-[38px]
                                            min-w-[170px]
                                            shrink-0
                                            items-center
                                            justify-center
                                            overflow-hidden
                                            rounded-full
                                            border
                                            border-[#B83E43]
                                            bg-[#C94B4F]
                                            px-5
                                            text-center
                                            text-[10.5px]
                                            font-bold
                                            leading-none
                                            whitespace-nowrap
                                            text-white
                                            shadow-[0_4px_12px_rgba(201,75,79,0.22)]
                                        `}
                                    >
                                        {isActive && (
                                            <span
                                                aria-hidden="true"
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    inset-y-[-25%]
                                                    left-[-45%]
                                                    z-0
                                                    w-[45%]
                                                    rotate-[8deg]
                                                    rounded-full
                                                    bg-white/16
                                                    blur-[13px]
                                                    animate-[stageBackgroundSweep_2.8s_ease-in-out_infinite]
                                                "
                                            />
                                        )}

                                        <span
                                            className={`
                                                relative
                                                z-10
                                                whitespace-nowrap
                                                ${
                                                    isActive
                                                        ? "animate-[stageTextBreathRed_2.4s_ease-in-out_infinite]"
                                                        : ""
                                                }
                                            `}
                                        >
                                            {stage?.name}
                                        </span>
                                    </div>
                                );
                            }

                            if (isClosedDone && isActive) {
                                return (
                                    <div
                                        key={stage?.id}
                                        title={stage?.name}
                                        className="
                                            relative
                                            flex
                                            h-[38px]
                                            min-w-[150px]
                                            shrink-0
                                            items-center
                                            justify-center
                                            overflow-hidden
                                            rounded-full
                                            border
                                            border-[#B83E43]
                                            bg-[#C93F45]
                                            px-5
                                            text-center
                                            text-[10.5px]
                                            font-bold
                                            leading-none
                                            whitespace-nowrap
                                            text-white
                                            shadow-[0_4px_13px_rgba(201,63,69,0.24)]
                                        "
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="
                                                pointer-events-none
                                                absolute
                                                inset-y-[-25%]
                                                left-[-45%]
                                                z-0
                                                w-[45%]
                                                rotate-[8deg]
                                                rounded-full
                                                bg-white/18
                                                blur-[13px]
                                                animate-[stageBackgroundSweep_2.8s_ease-in-out_infinite]
                                            "
                                        />

                                        <span
                                            aria-hidden="true"
                                            className="
                                                pointer-events-none
                                                absolute
                                                inset-[2px]
                                                z-[1]
                                                rounded-full
                                                border
                                                border-white/10
                                            "
                                        />

                                        <span
                                            className="
                                                relative
                                                z-10
                                                whitespace-nowrap
                                                animate-[stageTextBreathRed_2.4s_ease-in-out_infinite]
                                            "
                                        >
                                            {stage?.name}
                                        </span>
                                    </div>
                                );
                            }

                            if (isCompleted || isActive) {
                                return (
                                    <div
                                        key={stage?.id}
                                        title={stage?.name}
                                        className={`
                                            relative
                                            flex
                                            h-[38px]
                                            min-w-[150px]
                                            shrink-0
                                            items-center
                                            justify-center
                                            overflow-hidden
                                            rounded-full
                                            border
                                            px-5
                                            text-center
                                            text-[10.5px]
                                            font-bold
                                            leading-none
                                            whitespace-nowrap
                                            text-white
                                            transition-colors
                                            duration-200
                                            ${
                                                isActive
                                                    ? `
                                                        border-[#119653]
                                                        bg-[#18B865]
                                                        shadow-[0_4px_13px_rgba(24,184,101,0.22)]
                                                    `
                                                    : `
                                                        border-[#20A961]
                                                        bg-[#20B96B]
                                                        shadow-[0_2px_8px_rgba(32,185,107,0.14)]
                                                    `
                                            }
                                        `}
                                    >
                                        {isActive && (
                                            <>
                                                <span
                                                    aria-hidden="true"
                                                    className="
                                                        pointer-events-none
                                                        absolute
                                                        inset-y-[-25%]
                                                        left-[-45%]
                                                        z-0
                                                        w-[45%]
                                                        rotate-[8deg]
                                                        rounded-full
                                                        bg-white/18
                                                        blur-[13px]
                                                        animate-[stageBackgroundSweep_2.8s_ease-in-out_infinite]
                                                    "
                                                />

                                                <span
                                                    aria-hidden="true"
                                                    className="
                                                        pointer-events-none
                                                        absolute
                                                        inset-[2px]
                                                        z-[1]
                                                        rounded-full
                                                        border
                                                        border-white/12
                                                    "
                                                />
                                            </>
                                        )}

                                        <span
                                            className={`
                                                relative
                                                z-10
                                                whitespace-nowrap
                                                ${
                                                    isActive
                                                        ? "animate-[stageTextBreathGreen_2.4s_ease-in-out_infinite]"
                                                        : ""
                                                }
                                            `}
                                        >
                                            {stage?.name}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={stage?.id}
                                    title={stage?.name}
                                    className="
                                        flex
                                        h-[38px]
                                        min-w-[145px]
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-[#D5DFDA]
                                        bg-white
                                        px-5
                                        text-center
                                        text-[10.5px]
                                        font-semibold
                                        leading-none
                                        whitespace-nowrap
                                        text-[#7D8A85]
                                        transition-all
                                        duration-200
                                        hover:border-[#C7D5CF]
                                        hover:bg-[#FBFCFB]
                                        hover:text-[#5F7169]
                                    "
                                >
                                    <span className="whitespace-nowrap">
                                        {stage?.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>
                {`
                    @keyframes stageBackgroundSweep {
                        0% {
                            transform: translateX(0) rotate(8deg);
                            opacity: 0;
                        }

                        12% {
                            opacity: 0;
                        }

                        35% {
                            opacity: 0.72;
                        }

                        55% {
                            opacity: 0.52;
                        }

                        75% {
                            opacity: 0.18;
                        }

                        100% {
                            transform: translateX(330%) rotate(8deg);
                            opacity: 0;
                        }
                    }

                    @keyframes stageTextBreathGreen {
                        0%,
                        100% {
                            transform: scale(1);
                        }

                        50% {
                            transform: scale(1.06);
                        }
                    }

                    @keyframes stageTextBreathRed {
                        0%,
                        100% {
                            transform: scale(1);
                        }

                        50% {
                            transform: scale(1.06);
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        [class*="animate-[stageBackgroundSweep"],
                        [class*="animate-[stageTextBreathGreen"],
                        [class*="animate-[stageTextBreathRed"] {
                            animation: none !important;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default ProcessStage;
