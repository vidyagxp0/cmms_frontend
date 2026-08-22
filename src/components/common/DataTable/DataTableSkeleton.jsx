import React from "react";

const DataTableSkeleton = ({
    columns = 6,
    rows = 8,
}) => {
    return (
        <div className="h-full overflow-hidden">
            <div className="border-b border-slate-100 bg-[#FAFBFC]">
                <div
                    className="grid gap-6 px-5 py-4"
                    style={{
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: columns }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="
                                    h-3
                                    animate-pulse
                                    rounded
                                    bg-slate-200
                                "
                            />
                        )
                    )}
                </div>
            </div>

            {Array.from({ length: rows }).map(
                (_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="
                            grid
                            gap-6
                            border-b
                            border-slate-100
                            px-5
                            py-4
                        "
                        style={{
                            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                        }}
                    >
                        {Array.from({
                            length: columns,
                        }).map((_, columnIndex) => (
                            <div
                                key={columnIndex}
                                className="
                                    h-4
                                    animate-pulse
                                    rounded
                                    bg-slate-100
                                "
                            />
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default DataTableSkeleton;