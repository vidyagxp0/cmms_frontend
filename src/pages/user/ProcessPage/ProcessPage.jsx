import React, { useState } from "react";
import {
    Building2,
    Wrench,
    HardHat,
    ChevronRight,
} from "lucide-react";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import { getAllProcess } from "../../../services/usersApi/processlistApi";
import { useLocation, useNavigate  } from "react-router-dom";

const SITES = [
    {
        id: "unit4",
        name: "Unit IV",
    },
];

const getProcessIcon = (name = "") => {
    const value = name.toLowerCase();

    if (value.includes("maintenance") || value.includes("equipment")) {
        return Wrench;
    }

    if (value.includes("calibration")) {
        return HardHat;
    }

    return Building2;
};

const ProcessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [selectedSite, setSelectedSite] = useState(null);
    const [processes, setProcesses] = useState([]);
    console.log(processes,"processes>>>>")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const {
        sourceRoute,
        sourceType,
    } = location.state || {};

    console.log(sourceType);

    const handleSiteSelect = async (site) => {
        setSelectedSite(site.id);
        setProcesses([]);
        setError("");
        setLoading(true);

        try {
            const response = await getAllProcess();
            const processData = response?.data?.data ?? [];
            let filteredProcesses = Array.isArray(processData)
                ? processData.filter(
                      (process) =>
                          process.is_active === true &&
                          process.is_child === false
                  )
                : [];
            if (sourceType === "engineering") {
                filteredProcesses = filteredProcesses.slice(0, 2);
            }
            setProcesses(filteredProcesses);
        } catch (error) {
            console.error("Failed to fetch processes:", error);
            setError("Unable to load processes.");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessSelect = (process) => {
    if (sourceType === "engineering") {
        navigate(`/user/calibration-planner-create/${process.id}`, {
        });
    }
};

    return (
        <div className="flex min-h-[calc(100vh-74px)] items-center justify-center bg-[#F6F8F7] px-4">
            <div className="w-full max-w-[650px]">
                {/* CARD */}
                <div
                    className="
                        overflow-hidden rounded-[15px]
                        border border-[#E1E6E3]
                        bg-white
                        shadow-[0_14px_35px_-25px_rgba(30,45,37,0.38)]
                    "
                >
                    <div className="grid grid-cols-[210px_1fr]">
                        {/* ================= SITE ================= */}
                        <div className="border-r border-[#E7EBE9] bg-[#FAFBFA] p-4">
                            <div className="mb-4 px-2">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9690]">
                                    Site
                                </p>
                                <p className="mt-1 text-[11px] text-[#A0A9A5]">
                                    Select a location
                                </p>
                            </div>

                            <div className="space-y-1">
                                {SITES.map((site) => {
                                    const active =
                                        selectedSite === site.id;

                                    return (
                                        <button
                                            key={site.id}
                                            type="button"
                                            onClick={() =>
                                                handleSiteSelect(site)
                                            }
                                            disabled={loading}
                                            className={`
                                                group relative flex w-full
                                                items-center gap-2.5
                                                rounded-[10px]
                                                px-2.5 py-2.5
                                                text-left
                                                transition-all duration-300
                                                ease-[cubic-bezier(.22,1,.36,1)]
                                                disabled:cursor-wait
                                                ${
                                                    active
                                                        ? "translate-x-[1px] bg-white shadow-[0_5px_16px_-12px_rgba(30,45,37,0.45)]"
                                                        : "hover:translate-x-[1px] hover:bg-white/75"
                                                }
                                            `}
                                        >
                                            {/* ACTIVE INDICATOR */}
                                            <span
                                                className={`
                                                    absolute left-0 top-1/2
                                                    h-5 w-[2px]
                                                    -translate-y-1/2
                                                    rounded-r-full
                                                    bg-[#738B7F]
                                                    transition-all duration-300
                                                    ${
                                                        active
                                                            ? "scale-y-100 opacity-100"
                                                            : "scale-y-50 opacity-0"
                                                    }
                                                `}
                                            />

                                            {/* SITE ICON */}
                                            <span
                                                className={`
                                                    flex h-8 w-8 shrink-0
                                                    items-center justify-center
                                                    rounded-[8px]
                                                    transition-all duration-300
                                                    ${
                                                        active
                                                            ? "bg-[#EEF3F0] text-[#52675D]"
                                                            : "bg-[#F0F2F1] text-[#7F8985]"
                                                    }
                                                `}
                                            >
                                                <Building2
                                                    size={15}
                                                    strokeWidth={1.7}
                                                />
                                            </span>

                                            {/* SITE TEXT */}
                                            <span className="min-w-0 flex-1">
                                                <span
                                                    className={`
                                                        block text-[12px]
                                                        font-semibold
                                                        transition-colors duration-300
                                                        ${
                                                            active
                                                                ? "text-[#27332D]"
                                                                : "text-[#5E6963]"
                                                        }
                                                    `}
                                                >
                                                    {site.name}
                                                </span>
                                                <span className="mt-0.5 block truncate text-[9.5px] text-[#9AA39F]">
                                                    {site.subtitle}
                                                </span>
                                            </span>

                                            <ChevronRight
                                                size={14}
                                                strokeWidth={1.7}
                                                className={`
                                                    transition-all duration-300
                                                    ${
                                                        active
                                                            ? "text-[#65736C]"
                                                            : "text-[#B2BAB6] group-hover:translate-x-0.5"
                                                    }
                                                `}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ================= PROCESS ================= */}
                        <div className="p-5">
                            {/* BEFORE SITE SELECTION */}
                            {!selectedSite && (
                                <div
                                    className="
                                        flex min-h-[220px]
                                        flex-col items-center
                                        justify-center
                                        text-center
                                        animate-[processIn_350ms_ease-out]
                                    "
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-[#F2F4F3] text-[#89938E]">
                                        <Building2
                                            size={17}
                                            strokeWidth={1.6}
                                        />
                                    </div>
                                    <p className="mt-3 text-[12px] font-medium text-[#59655F]">
                                        Select a site
                                    </p>
                                    <p className="mt-1 max-w-[190px] text-[10px] leading-[1.5] text-[#9AA39F]">
                                        Choose a site from the left to view
                                        available processes.
                                    </p>
                                </div>
                            )}

                            {/* ================= SKELETON ================= */}
                            {selectedSite && loading && (
                                <div
                                    className="
                                        min-h-[220px]
                                        animate-[processIn_300ms_ease-out]
                                    "
                                >
                                    <div className="mb-4">
                                        <Skeleton
                                            variant="text"
                                            className="h-3 w-14"
                                        />
                                        <Skeleton
                                            variant="text"
                                            className="mt-2 h-4 w-16"
                                        />
                                    </div>
                                    <Skeleton
                                        variant="list"
                                        count={4}
                                        className="
                                            [&>div]:rounded-none
                                            [&>div]:border-0
                                            [&>div]:bg-transparent
                                            [&>div]:p-0
                                            [&>div]:shadow-none
                                        "
                                    />
                                </div>
                            )}

                            {/* ================= ERROR ================= */}
                            {selectedSite && !loading && error && (
                                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-[#F3F4F3] text-[#7D8782]">
                                        !
                                    </div>
                                    <p className="mt-3 text-[12px] font-medium text-[#59655F]">
                                        Unable to load processes
                                    </p>
                                    <p className="mt-1 text-[10px] text-[#9AA39F]">
                                        Please try selecting the site again.
                                    </p>
                                </div>
                            )}

                            {/* ================= PROCESS LIST ================= */}
                            {selectedSite && !loading && !error && (
                                <div
                                    key={selectedSite}
                                    className="
                                        min-h-[220px]
                                        animate-[processIn_380ms_cubic-bezier(.22,1,.36,1)]
                                    "
                                >
                                    <div className="mb-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9690]">
                                            Process
                                        </p>
                                        <p className="mt-1 text-[14px] font-semibold text-[#27332D]">
                                            Unit IV
                                        </p>
                                    </div>

                                    {processes.length === 0 ? (
                                        <div className="flex h-[150px] items-center justify-center text-[10px] text-[#9AA39F]">
                                            No processes available.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                           {processes.map((process) => {
                                            const Icon = getProcessIcon(process.name);

                                            return (
                                                <button
                                                    key={process.id}
                                                    type="button"
                                                    onClick={() => handleProcessSelect(process)}
                                                    className="
                                                        group flex w-full
                                                        items-center gap-3
                                                        rounded-[10px]
                                                        border border-[#E5E9E7]
                                                        px-3 py-2.5
                                                        text-left
                                                        transition-all
                                                        duration-300
                                                        ease-[cubic-bezier(.22,1,.36,1)]
                                                        hover:-translate-y-[1px]
                                                        hover:border-[#D5DDD8]
                                                        hover:bg-[#FBFCFB]
                                                        hover:shadow-[0_7px_18px_-15px_rgba(30,45,37,0.4)]
                                                        active:translate-y-0
                                                        active:scale-[0.99]
                                                    "
                                                >
                                                    <span
                                                        className="
                                                            flex h-8 w-8
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-[8px]
                                                            bg-[#F1F3F2]
                                                            text-[#66736C]
                                                            transition-all
                                                            duration-300
                                                            group-hover:bg-[#E9EEEB]
                                                            group-hover:text-[#465A50]
                                                        "
                                                    >
                                                        <Icon
                                                            size={15}
                                                            strokeWidth={1.7}
                                                        />
                                                    </span>

                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-[12px] font-semibold text-[#2B3731]">
                                                            {process.name}
                                                        </span>
                                                    </span>

                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 group-hover:bg-[#F0F3F1]">
                                                        <ChevronRight
                                                            size={14}
                                                            strokeWidth={1.7}
                                                            className="
                                                                text-[#B0B8B4]
                                                                transition-all
                                                                duration-300
                                                                group-hover:translate-x-0.5
                                                                group-hover:text-[#65736C]
                                                            "
                                                        />
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes processIn {
                    0% {
                        opacity: 0;
                        transform: translateX(7px) scale(0.985);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default ProcessPage;