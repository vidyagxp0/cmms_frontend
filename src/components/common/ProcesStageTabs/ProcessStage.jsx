import React from "react";

const ProcessStage = ({
    stages = [],
    activeStageId,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="flex h-[46px] w-full items-center gap-2 overflow-x-auto rounded-xl border border-[#DCE8E2] bg-[#F7FAF8] px-3 shadow-[0_2px_10px_rgba(21,44,32,0.03)] scrollbar-thin">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="h-8 w-[140px] shrink-0 animate-pulse rounded-lg bg-slate-200"
                    />
                ))}
            </div>
        );
    }

    if (!stages.length) return null;

    const normalizedActiveStageId = Number(activeStageId);

    const activeStage = stages.find(
        (stage) => Number(stage?.id) === normalizedActiveStageId
    );

    const isCancelledStageActive =
        normalizedActiveStageId === 6 ||
        activeStage?.name?.trim().toLowerCase() === "close - cancelled";

    /*
     * If Close - Cancelled is active:
     * - Hide every other stage
     * - Show only Close - Cancelled
     * - Give it full red treatment
     */
    const visibleStages = isCancelledStageActive
        ? activeStage
            ? [activeStage]
            : [
                  {
                      id: 6,
                      name: "Close - Cancelled",
                  },
              ]
        : stages.filter(
              (stage) =>
                  stage?.name?.trim().toLowerCase() !==
                  "close - cancelled"
          );

    const activeStageIndex = stages.findIndex(
        (stage) => Number(stage?.id) === normalizedActiveStageId
    );

    return (
        <div className="w-full overflow-hidden rounded-xl border border-[#DCE8E2] bg-[#F7FAF8] px-3 shadow-[0_2px_10px_rgba(21,44,32,0.03)]">
            <div className="flex min-h-[46px] w-full items-center gap-2 overflow-x-auto py-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#C8D8D0]">
                {visibleStages.map((stage) => {
                    const originalIndex = stages.findIndex(
                        (item) =>
                            Number(item?.id) === Number(stage?.id)
                    );

                    const isActive =
                        Number(stage?.id) === normalizedActiveStageId;

                    const isCompleted =
                        activeStageIndex >= 0 &&
                        originalIndex <= activeStageIndex;

                    const isClosedDone =
                        stage?.name?.trim().toLowerCase() ===
                        "closed - done";

                    /*
                     * Stage 6 / Close - Cancelled
                     */
                    if (isCancelledStageActive) {
                        return (
                            <div
                                key={stage?.id}
                                title={stage?.name}
                                className="flex h-8 min-w-[140px] max-w-[280px] shrink-0 items-center justify-center rounded-lg bg-[#C43D3D] px-5 text-center text-[10.5px] font-semibold leading-none text-white shadow-[0_3px_12px_rgba(196,61,61,0.24)] transition-all duration-300"
                            >
                                <span className="truncate">
                                    {stage?.name || "Close - Cancelled"}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={stage?.id}
                            title={stage?.name}
                            className={`
                                flex h-8 min-w-[120px] max-w-[260px] shrink-0
                                items-center justify-center rounded-lg
                                px-5 text-center text-[10.5px]
                                font-semibold leading-none
                                whitespace-nowrap
                                transition-all duration-300
                                ${
                                    isClosedDone && isActive
                                        ? "bg-[#C43D3D] text-white shadow-[0_3px_10px_rgba(196,61,61,0.22)]"
                                        : isCompleted
                                        ? "bg-[#20BF63] text-white shadow-[0_3px_10px_rgba(32,191,99,0.18)]"
                                        : "border border-[#DCE8E2] bg-white text-[#60736B] hover:border-[#BFD4C8] hover:text-[#3D574D]"
                                }
                            `}
                        >
                            <span className="truncate">
                                {stage?.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProcessStage;