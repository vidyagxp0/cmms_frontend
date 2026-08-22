import React from "react";

const shimmerBase =
    "relative overflow-hidden bg-[#EEF3F0] before:absolute before:inset-0 before:-translate-x-full before:animate-[premiumShimmer_2.2s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent";
const SkeletonBox = ({ className = "", style = {} }) => (
    <div
        className={`${shimmerBase} rounded-lg ${className}`}
        style={style}
    />
);

/* -------------------------------------------------------------------------- */
/* TABLE SKELETON                                                             */
/* -------------------------------------------------------------------------- */

const TableCellSkeleton = ({ type = "text", align = "left" }) => {
    const alignment =
        align === "center"
            ? "justify-center"
            : align === "right"
            ? "justify-end"
            : "justify-start";

    switch (type) {
        case "number":
            return (
                <div className={`flex ${alignment}`}>
                    <SkeletonBox className="h-4 w-8 rounded-md" />
                </div>
            );
        case "avatar":
            return (
                <div className={`flex ${alignment}`}>
                    <SkeletonBox className="h-9 w-9 rounded-full" />
                </div>
            );
        case "avatarText":
            return (
                <div className="flex items-center gap-3">
                    <SkeletonBox className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="min-w-0 space-y-2">
                        <SkeletonBox className="h-3.5 w-28" />
                        <SkeletonBox className="h-3 w-20" />
                    </div>
                </div>
            );
        case "longText":
            return (
                <div className="space-y-2">
                    <SkeletonBox className="h-3.5 w-40 max-w-full" />
                    <SkeletonBox className="h-3 w-24 max-w-full" />
                </div>
            );
        case "badge":
            return (
                <div className={`flex ${alignment}`}>
                    <SkeletonBox className="h-6 w-20 rounded-full" />
                </div>
            );
        case "date":
            return (
                <div className={`flex ${alignment}`}>
                    <SkeletonBox className="h-3.5 w-24" />
                </div>
            );
        case "email":
            return (
                <div className={`flex ${alignment}`}>
                    <SkeletonBox className="h-3.5 w-36 max-w-full" />
                </div>
            );
        case "actions":
            return (
                <div className={`flex ${alignment} gap-2`}>
                    <SkeletonBox className="h-8 w-8 rounded-lg" />
                    <SkeletonBox className="h-8 w-8 rounded-lg" />
                </div>
            );
        case "action":
            return (
                <div className={`flex ${alignment}`}>
                    <SkeletonBox className="h-8 w-20 rounded-lg" />
                </div>
            );
        case "text":
        default:
            return (
                <div className={`flex ${alignment}`}>
                    <SkeletonBox className="h-3.5 w-28 max-w-full" />
                </div>
            );
    }
};

const TableSkeleton = ({
    rows = 6,
    columns = 5,
    showHeader = true,
    columnDefinitions,
    className = "",
}) => {
    const defaultColumns = Array.from({ length: columns }).map(
        (_, index) => ({
            type:
                index === 0
                    ? "number"
                    : index === columns - 1
                    ? "actions"
                    : "text",
            width:
                index === 0
                    ? "10%"
                    : index === columns - 1
                    ? "20%"
                    : undefined,
            align:
                index === 0
                    ? "center"
                    : index === columns - 1
                    ? "right"
                    : "left",
        })
    );

    const tableColumns = columnDefinitions || defaultColumns;

    return (
        <div
            className={`w-full overflow-hidden rounded-xl border border-[#DDEAE2] bg-white ${className}`}
        >
            <table className="w-full table-fixed border-collapse">
                <colgroup>
                    {tableColumns.map((column, index) => (
                        <col
                            key={index}
                            style={{
                                width: column.width || "auto",
                            }}
                        />
                    ))}
                </colgroup>

                {showHeader && (
                    <thead>
                        <tr className="border-b border-[#E5EEE9] bg-[#F8FBF9]">
                            {tableColumns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-5 py-4 text-${column.align || "left"}`}
                                >
                                    <SkeletonBox
                                        className={
                                            column.type === "number"
                                                ? "mx-auto h-3.5 w-8"
                                                : column.type === "actions"
                                                ? "ml-auto h-3.5 w-16"
                                                : "h-3.5 w-24"
                                        }
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}

                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-b border-[#EDF3EF] last:border-b-0"
                        >
                            {tableColumns.map((column, columnIndex) => (
                                <td
                                    key={columnIndex}
                                    className="px-5 py-4"
                                >
                                    <TableCellSkeleton
                                        type={column.type}
                                        align={column.align}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* CARDS                                                                      */
/* -------------------------------------------------------------------------- */

const CardsSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
            <div
                key={index}
                className="rounded-2xl border border-[#DDEAE2] bg-white p-5 shadow-[0_8px_25px_-20px_rgba(21,61,45,0.35)]"
            >
                <div className="flex items-start justify-between">
                    <SkeletonBox className="h-11 w-11 rounded-xl" />
                    <SkeletonBox className="h-4 w-16 rounded-full" />
                </div>
                <SkeletonBox className="mt-5 h-3.5 w-24" />
                <SkeletonBox className="mt-2 h-8 w-28 rounded-md" />
                <SkeletonBox className="mt-4 h-3 w-20" />
            </div>
        ))}
    </div>
);

/* -------------------------------------------------------------------------- */
/* CHART                                                                      */
/* -------------------------------------------------------------------------- */

const ChartSkeleton = ({ height = "h-72" }) => (
    <div className="rounded-2xl border border-[#DDEAE2] bg-white p-5 shadow-[0_8px_25px_-20px_rgba(21,61,45,0.35)]">
        <div className="flex items-center justify-between">
            <div>
                <SkeletonBox className="h-5 w-36" />
                <SkeletonBox className="mt-2 h-3 w-52" />
            </div>
            <SkeletonBox className="h-9 w-24 rounded-lg" />
        </div>
        <div
            className={`relative mt-7 ${height} overflow-hidden rounded-xl bg-[#F8FBF9]`}
        >
            <div className="absolute inset-x-5 bottom-5 top-5 flex items-end gap-4">
                {[55, 72, 42, 85, 64, 78, 48, 91, 60, 76, 52, 68].map(
                    (barHeight, index) => (
                        <SkeletonBox
                            key={index}
                            className="flex-1 rounded-t-md rounded-b-none"
                            style={{ height: `${barHeight}%` }}
                        />
                    )
                )}
            </div>
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/* LIST                                                                       */
/* -------------------------------------------------------------------------- */

const ListSkeleton = ({ count = 5 }) => (
    <div className="rounded-2xl border border-[#DDEAE2] bg-white p-5 shadow-[0_8px_25px_-20px_rgba(21,61,45,0.35)]">
        <SkeletonBox className="h-5 w-36" />
        <div className="mt-5 divide-y divide-[#EDF3EF]">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                    <SkeletonBox className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                        <SkeletonBox className="h-4 w-32" />
                        <SkeletonBox className="mt-2 h-3 w-48 max-w-full" />
                    </div>
                    <SkeletonBox className="h-3 w-16" />
                </div>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/* FORM                                                                       */
/* -------------------------------------------------------------------------- */

const FormSkeleton = ({ fields = 6 }) => (
    <div className="rounded-2xl border border-[#DDEAE2] bg-white p-6 shadow-[0_8px_25px_-20px_rgba(21,61,45,0.35)]">
        <SkeletonBox className="h-6 w-40" />
        <SkeletonBox className="mt-2 h-3 w-64" />
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({ length: fields }).map((_, index) => (
                <div key={index}>
                    <SkeletonBox className="h-3 w-24" />
                    <SkeletonBox className="mt-2 h-10 w-full rounded-lg" />
                </div>
            ))}
        </div>
        <div className="mt-7 flex justify-end gap-3">
            <SkeletonBox className="h-10 w-24 rounded-lg" />
            <SkeletonBox className="h-10 w-28 rounded-lg" />
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/* DASHBOARD                                                                  */
/* -------------------------------------------------------------------------- */

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <SkeletonBox className="h-7 w-48" />
                <SkeletonBox className="mt-2 h-4 w-72 max-w-full" />
            </div>
            <div className="flex gap-3">
                <SkeletonBox className="h-10 w-28 rounded-lg" />
                <SkeletonBox className="h-10 w-32 rounded-lg" />
            </div>
        </div>

        <CardsSkeleton count={4} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ListSkeleton count={5} />
            <TableSkeleton
                rows={4}
                columnDefinitions={[
                    { type: "number", width: "15%", align: "center" },
                    { type: "text", width: "55%" },
                    { type: "actions", width: "30%", align: "right" },
                ]}
            />
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/* PROFILE                                                                    */
/* -------------------------------------------------------------------------- */

const ProfileSkeleton = () => (
    <div className="rounded-2xl border border-[#DDEAE2] bg-white p-6 shadow-[0_8px_25px_-20px_rgba(21,61,45,0.35)]">
        <div className="flex items-center gap-5">
            <SkeletonBox className="h-20 w-20 rounded-full" />
            <div>
                <SkeletonBox className="h-5 w-36" />
                <SkeletonBox className="mt-2 h-4 w-48" />
                <SkeletonBox className="mt-2 h-3 w-28" />
            </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                    <SkeletonBox className="h-3 w-20" />
                    <SkeletonBox className="mt-2 h-4 w-40" />
                </div>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const Skeleton = ({
    variant = "text",
    rows = 6,
    columns = 5,
    count = 4,
    fields = 6,
    height,
    className = "",
    showHeader = true,
    columnDefinitions,
}) => {
    const skeletons = {
        text: <SkeletonBox className="h-4 w-32" />,
        title: <SkeletonBox className="h-6 w-48" />,
        button: <SkeletonBox className="h-10 w-28 rounded-lg" />,
        input: <SkeletonBox className="h-10 w-full rounded-lg" />,
        avatar: <SkeletonBox className="h-10 w-10 rounded-full" />,
        cards: <CardsSkeleton count={count} />,
        table: (
            <TableSkeleton
                rows={rows}
                columns={columns}
                showHeader={showHeader}
                columnDefinitions={columnDefinitions}
            />
        ),
        chart: <ChartSkeleton height={height} />,
        list: <ListSkeleton count={count} />,
        form: <FormSkeleton fields={fields} />,
        profile: <ProfileSkeleton />,
        dashboard: <DashboardSkeleton />,
    };

    return (
        <div className={className}>
            {skeletons[variant] || skeletons.text}
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* PREMIUM ANIMATION                                                          */
/* -------------------------------------------------------------------------- */

if (typeof document !== "undefined") {
    const styleId = "premium-skeleton-animation";

    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");

        style.id = styleId;

        style.innerHTML = `
            @keyframes premiumShimmer {
                0% {
                    transform: translateX(-120%);
                    opacity: 0;
                }

                15% {
                    opacity: 1;
                }

                50% {
                    opacity: 1;
                }

                85% {
                    opacity: 1;
                }

                100% {
                    transform: translateX(120%);
                    opacity: 0;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .premium-skeleton {
                    animation: none !important;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

export default Skeleton;