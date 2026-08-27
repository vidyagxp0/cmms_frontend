import React, { useEffect, useState } from "react";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { getCalibrationAuditRecord } from "../../../services/usersApi/calibrationApi";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const Audit = ({ id }) => {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        if (id) {
            fetchAudits();
        }
    }, [id]);

    const fetchAudits = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCalibrationAuditRecord(id);

            const data = response?.data?.data || [];

            setAudits(data);
        } catch (err) {
            console.error("Error fetching user audits:", err);
            setError("Failed to load audit history.");
            setAudits([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleAudit = (id) => {
        setExpanded((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const formatFieldName = (key) => {
        if (!key) {
            return "";
        }

        return key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatValue = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return "-";
            }

            return (
                <div className="space-y-2">
                    {value.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-md border border-[#E3F0E8] bg-[#F8FCF9] px-3 py-2"
                        >
                            {typeof item === "object" && item !== null ? (
                                <div className="space-y-1">
                                    {Object.entries(item).map(
                                        ([key, val]) => (
                                            <div
                                                key={key}
                                                className="text-[11px] text-[#5C7A6C]"
                                            >
                                                <span className="font-semibold text-[#3E5A4D]">
                                                    {formatFieldName(key)}:
                                                </span>{" "}
                                                {formatValue(val)}
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <span className="text-[11px] text-[#5C7A6C]">
                                    {String(item)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof value === "object") {
            return (
                <div className="space-y-1">
                    {Object.entries(value).map(([key, val]) => (
                        <div
                            key={key}
                            className="text-[11px] text-[#5C7A6C]"
                        >
                            <span className="font-semibold text-[#3E5A4D]">
                                {formatFieldName(key)}:
                            </span>{" "}
                            {formatValue(val)}
                        </div>
                    ))}
                </div>
            );
        }

        return String(value);
    };

    const getActionStyle = (action) => {
        switch (action) {
            case "Created":
                return "border-[#BFE0CC] bg-[#EDF8F1] text-[#17734C]";

            case "Updated":
                return "border-[#D8D1B8] bg-[#FCF8EE] text-[#9A7625]";

            case "Deleted":
                return "border-[#E5CCCC] bg-[#FEF3F3] text-[#B33A3A]";

            case "Stage Moved":
            case "Status Updated":
                return "border-[#C9D9EA] bg-[#F1F6FC] text-[#426B94]";

            case "Cancelled":
                return "border-[#E5CCCC] bg-[#FEF3F3] text-[#B33A3A]";

            default:
                return "border-[#D6E8DE] bg-[#F5FAF7] text-[#3E5A4D]";
        }
    };

    const getChangedFields = (oldValue, newValue) => {
        const oldData =
            oldValue && typeof oldValue === "object"
                ? oldValue
                : {};

        const newData =
            newValue && typeof newValue === "object"
                ? newValue
                : {};

        const fields = Array.from(
            new Set([
                ...Object.keys(oldData),
                ...Object.keys(newData),
            ])
        );

        return fields;
    };

    const renderChanges = (audit) => {
        const fields = getChangedFields(
            audit.old_value,
            audit.new_value
        );

        if (!fields.length) {
            return null;
        }

        return (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#E3F0E8]">
                <div className="grid grid-cols-3 bg-[#F3F9F5]">
                    <div className="border-r border-[#E3F0E8] px-4 py-3 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#5C7A6C]">
                        Field
                    </div>

                    <div className="border-r border-[#E3F0E8] px-4 py-3 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#8A625F]">
                        Previous Value
                    </div>

                    <div className="px-4 py-3 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#3E6B53]">
                        New Value
                    </div>
                </div>

                {fields.map((field) => (
                    <div
                        key={field}
                        className="grid grid-cols-3 border-t border-[#E3F0E8]"
                    >
                        <div className="border-r border-[#E3F0E8] px-4 py-3 text-[11.5px] font-semibold text-[#3E5A4D]">
                            {formatFieldName(field)}
                        </div>

                        <div className="border-r border-[#E3F0E8] px-4 py-3 text-[11px] text-[#8A625F]">
                            {formatValue(
                                audit.old_value?.[field]
                            )}
                        </div>

                        <div className="px-4 py-3 text-[11px] text-[#3E6B53]">
                            {formatValue(
                                audit.new_value?.[field]
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full">
            {/* PAGE HEADER */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#B8D9C8] bg-[#EEF8F2]">
                            <Activity
                                size={18}
                                strokeWidth={2}
                                className="text-[#17734C]"
                            />
                        </span>

                        <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                            Audit History
                        </h2>
                    </div>

                    <p className="pl-[46px] text-[12.5px] text-[#5C7A6C]">
                        View and track all changes made to this record.
                    </p>
                </div>
            </div>

            {/* AUDIT LIST */}
            <div className="w-full">
                {loading ? (
                    <div className="w-full overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white p-4">
                        <Skeleton
                            variant="table"
                            rows={5}
                            columns={5}
                        />
                    </div>
                ) : error ? (
                    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#E5CCCC] bg-[#FEF3F3] px-6 py-12 text-center">
                        <p className="text-[12px] font-medium text-[#C43D3D]">
                            {error}
                        </p>
                    </div>
                ) : audits.length === 0 ? (
                    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#CBE3D6] bg-white px-6 py-12 text-center">
                        <p className="text-[12px] text-[#8FA79B]">
                            No audit records found.
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* TIMELINE LINE */}
                        <div className="absolute left-[20px] top-5 bottom-5 w-px bg-[#D6E8DE]" />

                        <div className="space-y-5">
                            {audits.map((audit) => {
                                const isExpanded =
                                    expanded[audit.id] ?? true;

                                return (
                                    <div
                                        key={audit.id}
                                        className="relative pl-[50px]"
                                    >
                                        {/* TIMELINE DOT */}
                                        <div className="absolute left-[14px] top-[18px] z-10 flex h-[13px] w-[13px] items-center justify-center rounded-full border-2 border-white bg-[#17734C] shadow-sm" />

                                        <div className="overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
                                            {/* AUDIT HEADER */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleAudit(
                                                        audit.id
                                                    )
                                                }
                                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F8FCF9]"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${getActionStyle(
                                                                audit.action
                                                            )}`}
                                                        >
                                                            {audit.action}
                                                        </span>

                                                        <span className="inline-flex rounded-full border border-[#D6E8DE] bg-[#F5FAF7] px-2.5 py-1 text-[10.5px] font-semibold text-[#3E5A4D]">
                                                            {audit.module}
                                                        </span>
                                                    </div>

                                                    <p className="mt-2 text-[12px] font-medium text-[#152C20]">
                                                        {audit.description}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[11.5px] font-semibold text-[#5C7A6C]">
                                                            {audit.user_name ||
                                                                "-"}
                                                        </p>

                                                        <p className="mt-1 text-[10.5px] text-[#8FA79B]">
                                                            {audit.created_at ||
                                                                "-"}
                                                        </p>
                                                    </div>

                                                    {isExpanded ? (
                                                        <ChevronUp
                                                            size={16}
                                                            className="text-[#8FA79B]"
                                                        />
                                                    ) : (
                                                        <ChevronDown
                                                            size={16}
                                                            className="text-[#8FA79B]"
                                                        />
                                                    )}
                                                </div>
                                            </button>

                                            {/* AUDIT DETAILS */}
                                            {isExpanded && (
                                                <div className="border-t border-[#E3F0E8] px-5 pb-5">
                                                    {renderChanges(
                                                        audit
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Audit;