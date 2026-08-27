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

    const activeStageIndex = stages.findIndex(
        (stage) =>
            Number(stage.id) === Number(activeStageId)
    );

    return (
        <div className="w-full overflow-hidden rounded-xl border border-[#DCE8E2] bg-[#F7FAF8] px-3 shadow-[0_2px_10px_rgba(21,44,32,0.03)]">
            <div className="flex min-h-[46px] w-full items-center gap-2 overflow-x-auto py-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#C8D8D0]">
                {stages.map((stage, index) => {
                    const isActive =
                        Number(stage.id) ===
                        Number(activeStageId);

                    const isCompleted =
                        activeStageIndex >= 0 &&
                        index <= activeStageIndex;

                    const isLast =
                        index === stages.length - 1;

                    const isFuture =
                        !isCompleted;

                    return (
                        <div
                            key={stage.id}
                            title={stage.name}
                            className={`
                                flex h-8 min-w-[120px] max-w-[260px] shrink-0
                                items-center justify-center rounded-lg
                                px-5 text-center text-[10.5px]
                                font-semibold leading-none
                                whitespace-nowrap
                                transition-all duration-300
                                ${
                                    isCompleted
                                        ? "bg-[#20BF63] text-white shadow-[0_3px_10px_rgba(32,191,99,0.18)]"
                                        : isLast && isFuture
                                        ? "border border-[#F2C8C8] bg-[#FFF7F7] text-[#C43D3D]"
                                        : "border border-[#DCE8E2] bg-white text-[#60736B] hover:border-[#BFD4C8] hover:text-[#3D574D]"
                                }
                            `}
                        >
                            <span className="truncate">
                                {stage.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProcessStage;