import React, { useState } from "react";
import {
    Building2,
    Wrench,
    HardHat,
    ChevronRight,
    ArrowRight,
    MapPin,
    Workflow,
    AlertCircle,
} from "lucide-react";

import Skeleton from "../../../components/common/Skeleton/Skeleton";
import { getAllProcess } from "../../../services/usersApi/processlistApi";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

const SITES = [
    {
        id: "unit4",
        name: "Unit IV",
    },
];

const getProcessIcon = (name = "") => {
    const value = name.toLowerCase();

    if (
        value.includes("maintenance") ||
        value.includes("equipment")
    ) {
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

    const [selectedSite, setSelectedSite] =
        useState(null);

    const [processes, setProcesses] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const {
        sourceRoute,
        sourceType,
    } = location.state || {};

    const handleSiteSelect = async (
        site
    ) => {
        setSelectedSite(site.id);
        setProcesses([]);
        setError("");
        setLoading(true);

        try {
            const response =
                await getAllProcess();

            const processData =
                response?.data?.data ?? [];

            let filteredProcesses =
                Array.isArray(processData)
                    ? processData.filter(
                          (process) =>
                              process.is_active ===
                                  true &&
                              process.is_child ===
                                  false
                      )
                    : [];

            /*
             * Engineering
             * Only Calibration Planner.
             */
            if (
                sourceType ===
                "engineering"
            ) {
                filteredProcesses =
                    filteredProcesses.filter(
                        (process) =>
                            process.name
                                ?.toLowerCase() ===
                            "calibration planner"
                    );
            }

            /*
             * Preventive
             * Only Preventive Maintenance Planner.
             */
            if (
                sourceType ===
                "preventive"
            ) {
                filteredProcesses =
                    filteredProcesses.filter(
                        (process) =>
                            process.name
                                ?.toLowerCase() ===
                            "preventive maintenance planner"
                    );
            }

            setProcesses(
                filteredProcesses
            );
        } catch (error) {
            console.error(
                "Failed to fetch processes:",
                error
            );

            setError(
                "Unable to load processes."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleProcessSelect = (
        process
    ) => {
        if (
            sourceType ===
            "engineering"
        ) {
            navigate(
                `/user/calibration-planner-create/${process.id}`
            );

            return;
        }

        if (
            sourceType ===
            "preventive"
        ) {
            navigate(
                `/user/preventive-maintenance-planner-create/${process.id}`
            );

            return;
        }
    };

    const activeSite =
        SITES.find(
            (site) =>
                site.id === selectedSite
        );

    return (
        <div
            className="
                flex
                min-h-[calc(100vh-74px)]
                w-full
                items-center
                justify-center
                bg-[var(--color-background)]
                px-4
                py-6
                sm:px-6
                lg:px-8
            "
        >
            <div
                className="
                    w-full
                    max-w-[980px]
                "
            >
                {/* =================================================
                    TOP PAGE HEADER
                ================================================== */}
                <div
                    className="
                        mb-4
                        overflow-hidden
                        rounded-[16px]
                        border
                        border-[#CBD9D3]
                        bg-[#F7F9F7]
                        shadow-[0_8px_28px_rgba(35,55,47,0.07)]
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            px-5
                            py-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            sm:px-6
                        "
                    >
                        {/* TITLE */}
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex
                                    h-[42px]
                                    w-[42px]
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-[11px]
                                    border
                                    border-[#BFD0C8]
                                    bg-[#E7EFEB]
                                    text-[#486A5E]
                                    shadow-[0_2px_7px_rgba(65,104,92,0.08)]
                                "
                            >
                                <Workflow
                                    size={20}
                                    strokeWidth={1.9}
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h1
                                        className="
                                            text-[20px]
                                            font-bold
                                            tracking-[-0.025em]
                                            text-[#263B35]
                                        "
                                    >
                                        Create Record
                                    </h1>

                                    <span
                                        className="
                                            rounded-full
                                            border
                                            border-[#CDB990]
                                            bg-[#F6F0E4]
                                            px-2
                                            py-0.5
                                            text-[8px]
                                            font-extrabold
                                            uppercase
                                            tracking-[0.09em]
                                            text-[#896A35]
                                        "
                                    >
                                        New
                                    </span>
                                </div>

                                <p
                                    className="
                                        mt-0.5
                                        text-[11px]
                                        font-medium
                                        text-[#74827C]
                                    "
                                >
                                    Select a site and
                                    workflow to start a
                                    new record.
                                </p>
                            </div>
                        </div>

                        {/* FLOW INDICATOR */}
                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                self-start
                                sm:self-auto
                            "
                        >
                            <div
                                className={`
                                    flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    px-3
                                    py-1.5
                                    text-[9px]
                                    font-bold
                                    ${
                                        selectedSite
                                            ? "border-[#BED4CA] bg-[#EAF2EE] text-[#4C6C61]"
                                            : "border-[#BFCFC7] bg-[#244F4A] text-white"
                                    }
                                `}
                            >
                                <span
                                    className="
                                        flex
                                        h-[18px]
                                        w-[18px]
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-white/10
                                    "
                                >
                                    1
                                </span>

                                Site
                            </div>

                            <ArrowRight
                                size={13}
                                strokeWidth={1.8}
                                className="text-[#AAB6B0]"
                            />

                            <div
                                className={`
                                    flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    px-3
                                    py-1.5
                                    text-[9px]
                                    font-bold
                                    ${
                                        selectedSite
                                            ? "border-[#BFCFC7] bg-[#244F4A] text-white"
                                            : "border-[#D8E0DC] bg-white text-[#9AA6A1]"
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        flex
                                        h-[18px]
                                        w-[18px]
                                        items-center
                                        justify-center
                                        rounded-full
                                        ${
                                            selectedSite
                                                ? "bg-white/10"
                                                : "bg-[#F0F3F1]"
                                        }
                                    `}
                                >
                                    2
                                </span>

                                Process
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    MAIN SELECTION WORKSPACE
                ================================================== */}
                <div
                    className="
                        overflow-hidden
                        rounded-[17px]
                        border
                        border-[#CFDCD6]
                        bg-white
                        shadow-[0_14px_40px_rgba(35,55,47,0.09)]
                    "
                >
                    <div
                        className="
                            grid
                            min-h-[390px]
                            grid-cols-1
                            lg:grid-cols-[275px_minmax(0,1fr)]
                        "
                    >
                        {/* =================================================
                            LEFT : SITE SELECTION
                        ================================================== */}
                        <aside
                            className="
                                border-b
                                border-[#E1E8E4]
                                bg-[#F7F9F7]
                                lg:border-b-0
                                lg:border-r
                            "
                        >
                            <div
                                className="
                                    px-5
                                    pb-4
                                    pt-5
                                "
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="
                                                    flex
                                                    h-[26px]
                                                    w-[26px]
                                                    items-center
                                                    justify-center
                                                    rounded-[7px]
                                                    bg-[#E6EFEA]
                                                    text-[#56766D]
                                                "
                                            >
                                                <MapPin
                                                    size={13}
                                                    strokeWidth={1.9}
                                                />
                                            </span>

                                            <div>
                                                <p
                                                    className="
                                                        text-[9px]
                                                        font-extrabold
                                                        uppercase
                                                        tracking-[0.12em]
                                                        text-[#81918A]
                                                    "
                                                >
                                                    Step 01
                                                </p>

                                                <h2
                                                    className="
                                                        mt-0.5
                                                        text-[14px]
                                                        font-bold
                                                        text-[#334B42]
                                                    "
                                                >
                                                    Select Site
                                                </h2>
                                            </div>
                                        </div>
                                    </div>

                                    <span
                                        className="
                                            rounded-full
                                            bg-[#E9EFEC]
                                            px-2
                                            py-1
                                            text-[8px]
                                            font-bold
                                            uppercase
                                            tracking-[0.08em]
                                            text-[#71817A]
                                        "
                                    >
                                        Required
                                    </span>
                                </div>

                                <p
                                    className="
                                        mt-3
                                        max-w-[205px]
                                        text-[10px]
                                        leading-[1.5]
                                        text-[#899790]
                                    "
                                >
                                    Choose the facility
                                    or site where this
                                    record will be initiated.
                                </p>
                            </div>

                            <div className="px-3 pb-4">
                                {SITES.map(
                                    (site) => {
                                        const active =
                                            selectedSite ===
                                            site.id;

                                        return (
                                            <button
                                                key={
                                                    site.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleSiteSelect(
                                                        site
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                                className={`
                                                    group
                                                    relative
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    rounded-[11px]
                                                    border
                                                    px-3
                                                    py-3
                                                    text-left
                                                    transition-all
                                                    duration-200
                                                    ${
                                                        active
                                                            ? `
                                                                border-[#BFD4CA]
                                                                bg-white
                                                                shadow-[0_7px_18px_rgba(51,77,68,0.09)]
                                                            `
                                                            : `
                                                                border-transparent
                                                                bg-transparent
                                                                hover:border-[#DCE5E0]
                                                                hover:bg-white
                                                            `
                                                    }
                                                    disabled:cursor-wait
                                                    disabled:opacity-70
                                                `}
                                            >
                                                {/* ACTIVE RAIL */}
                                                <span
                                                    className={`
                                                        absolute
                                                        left-0
                                                        top-1/2
                                                        h-[22px]
                                                        w-[3px]
                                                        -translate-y-1/2
                                                        rounded-r-full
                                                        bg-[#A47D45]
                                                        transition-all
                                                        duration-200
                                                        ${
                                                            active
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        }
                                                    `}
                                                />

                                                {/* ICON */}
                                                <span
                                                    className={`
                                                        flex
                                                        h-[34px]
                                                        w-[34px]
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-[9px]
                                                        border
                                                        transition-all
                                                        duration-200
                                                        ${
                                                            active
                                                                ? `
                                                                    border-[#CBDBD4]
                                                                    bg-[#E9F1ED]
                                                                    text-[#4F7165]
                                                                `
                                                                : `
                                                                    border-[#E1E7E3]
                                                                    bg-[#EFF2F0]
                                                                    text-[#84918B]
                                                                `
                                                        }
                                                    `}
                                                >
                                                    <Building2
                                                        size={16}
                                                        strokeWidth={
                                                            active
                                                                ? 2
                                                                : 1.7
                                                        }
                                                    />
                                                </span>

                                                {/* TEXT */}
                                                <span className="min-w-0 flex-1">
                                                    <span
                                                        className={`
                                                            block
                                                            text-[12px]
                                                            font-bold
                                                            transition-colors
                                                            duration-200
                                                            ${
                                                                active
                                                                    ? "text-[#30473E]"
                                                                    : "text-[#5D6D66]"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            site.name
                                                        }
                                                    </span>

                                                    <span
                                                        className="
                                                            mt-0.5
                                                            block
                                                            text-[9px]
                                                            font-medium
                                                            text-[#99A49F]
                                                        "
                                                    >
                                                        Facility
                                                        location
                                                    </span>
                                                </span>

                                                <ChevronRight
                                                    size={14}
                                                    strokeWidth={
                                                        1.7
                                                    }
                                                    className={`
                                                        shrink-0
                                                        transition-all
                                                        duration-200
                                                        ${
                                                            active
                                                                ? "translate-x-0 text-[#58786C]"
                                                                : "text-[#B1BAB5] group-hover:translate-x-0.5"
                                                        }
                                                    `}
                                                />
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </aside>

                        {/* =================================================
                            RIGHT : PROCESS SELECTION
                        ================================================== */}
                        <section className="min-w-0 bg-white">
                            {/* BEFORE SITE */}
                            {!selectedSite && (
                                <div
                                    className="
                                        flex
                                        min-h-[390px]
                                        flex-col
                                        items-center
                                        justify-center
                                        px-6
                                        text-center
                                        animate-[processIn_350ms_ease-out]
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            h-[58px]
                                            w-[58px]
                                            items-center
                                            justify-center
                                            rounded-[15px]
                                            border
                                            border-[#D5E1DB]
                                            bg-[#F3F7F4]
                                            text-[#6E857B]
                                            shadow-[0_5px_15px_rgba(68,93,83,0.06)]
                                        "
                                    >
                                        <Workflow
                                            size={25}
                                            strokeWidth={1.6}
                                        />
                                    </div>

                                    <p
                                        className="
                                            mt-4
                                            text-[15px]
                                            font-bold
                                            text-[#334B42]
                                        "
                                    >
                                        Select a site
                                    </p>

                                    <p
                                        className="
                                            mt-1.5
                                            max-w-[300px]
                                            text-[10.5px]
                                            leading-[1.6]
                                            text-[#8D9A94]
                                        "
                                    >
                                        Choose a site from
                                        the left to load
                                        the workflows
                                        available for
                                        record creation.
                                    </p>

                                    <div
                                        className="
                                            mt-5
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-full
                                            border
                                            border-[#DCE5E0]
                                            bg-[#F8FAF8]
                                            px-3
                                            py-1.5
                                            text-[9px]
                                            font-semibold
                                            text-[#7B8A83]
                                        "
                                    >
                                        <span
                                            className="
                                                h-[6px]
                                                w-[6px]
                                                rounded-full
                                                bg-[#A47D45]
                                            "
                                        />

                                        Waiting for site
                                    </div>
                                </div>
                            )}

                            {/* LOADING */}
                            {selectedSite &&
                                loading && (
                                    <div
                                        className="
                                            min-h-[390px]
                                            px-5
                                            py-5
                                            animate-[processIn_300ms_ease-out]
                                        "
                                    >
                                        <div className="mb-5">
                                            <Skeleton
                                                variant="text"
                                                className="h-3 w-16"
                                            />

                                            <Skeleton
                                                variant="text"
                                                className="mt-2 h-5 w-32"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            {[
                                                1,
                                                2,
                                                3,
                                            ].map(
                                                (
                                                    item
                                                ) => (
                                                    <div
                                                        key={
                                                            item
                                                        }
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                            rounded-[11px]
                                                            border
                                                            border-[#EDF1EF]
                                                            px-3
                                                            py-3
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                h-[34px]
                                                                w-[34px]
                                                                shrink-0
                                                                animate-pulse
                                                                rounded-[9px]
                                                                bg-[#E4EBE7]
                                                            "
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <div
                                                                className="
                                                                    h-3
                                                                    w-[55%]
                                                                    animate-pulse
                                                                    rounded-full
                                                                    bg-[#E4EBE7]
                                                                "
                                                            />

                                                            <div
                                                                className="
                                                                    mt-2
                                                                    h-2
                                                                    w-[30%]
                                                                    animate-pulse
                                                                    rounded-full
                                                                    bg-[#EDF1EF]
                                                                "
                                                            />
                                                        </div>

                                                        <div
                                                            className="
                                                                h-5
                                                                w-5
                                                                animate-pulse
                                                                rounded-full
                                                                bg-[#EDF1EF]
                                                            "
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* ERROR */}
                            {selectedSite &&
                                !loading &&
                                error && (
                                    <div
                                        className="
                                            flex
                                            min-h-[390px]
                                            flex-col
                                            items-center
                                            justify-center
                                            px-6
                                            text-center
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-[52px]
                                                w-[52px]
                                                items-center
                                                justify-center
                                                rounded-[14px]
                                                border
                                                border-[#E4D5D4]
                                                bg-[#FBF3F2]
                                                text-[#A75C59]
                                            "
                                        >
                                            <AlertCircle
                                                size={23}
                                                strokeWidth={1.7}
                                            />
                                        </div>

                                        <p
                                            className="
                                                mt-4
                                                text-[14px]
                                                font-bold
                                                text-[#4A5752]
                                            "
                                        >
                                            Unable to load
                                            processes
                                        </p>

                                        <p
                                            className="
                                                mt-1.5
                                                max-w-[280px]
                                                text-[10px]
                                                leading-[1.5]
                                                text-[#909B96]
                                            "
                                        >
                                            There was a problem
                                            retrieving the
                                            available
                                            workflows. Try
                                            selecting the site
                                            again.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const site =
                                                    SITES.find(
                                                        (
                                                            item
                                                        ) =>
                                                            item.id ===
                                                            selectedSite
                                                    );

                                                if (
                                                    site
                                                ) {
                                                    handleSiteSelect(
                                                        site
                                                    );
                                                }
                                            }}
                                            className="
                                                mt-4
                                                rounded-[9px]
                                                border
                                                border-[#CADBD3]
                                                bg-[#EEF4F1]
                                                px-3
                                                py-2
                                                text-[10px]
                                                font-bold
                                                text-[#537166]
                                                transition-all
                                                hover:bg-[#E5EFEA]
                                            "
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}

                            {/* PROCESS LIST */}
                            {selectedSite &&
                                !loading &&
                                !error && (
                                    <div
                                        key={
                                            selectedSite
                                        }
                                        className="
                                            min-h-[390px]
                                            px-5
                                            py-5
                                            animate-[processIn_380ms_cubic-bezier(.22,1,.36,1)]
                                        "
                                    >
                                        <div
                                            className="
                                                mb-4
                                                flex
                                                items-end
                                                justify-between
                                                gap-4
                                            "
                                        >
                                            <div>
                                                <p
                                                    className="
                                                        text-[9px]
                                                        font-extrabold
                                                        uppercase
                                                        tracking-[0.13em]
                                                        text-[#84918B]
                                                    "
                                                >
                                                    Step 02
                                                </p>

                                                <h2
                                                    className="
                                                        mt-1
                                                        text-[17px]
                                                        font-bold
                                                        tracking-[-0.02em]
                                                        text-[#2F453D]
                                                    "
                                                >
                                                    Available
                                                    Processes
                                                </h2>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-[10px]
                                                        text-[#8D9A94]
                                                    "
                                                >
                                                    {activeSite?.name ||
                                                        "Selected Site"}
                                                </p>
                                            </div>

                                            <div
                                                className="
                                                    flex
                                                    shrink-0
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    border
                                                    border-[#D8E3DE]
                                                    bg-[#F5F8F6]
                                                    px-2.5
                                                    py-1.5
                                                    text-[9px]
                                                    font-bold
                                                    text-[#70817A]
                                                "
                                            >
                                                <span
                                                    className="
                                                        h-[6px]
                                                        w-[6px]
                                                        rounded-full
                                                        bg-[#5B8A77]
                                                    "
                                                />

                                                {
                                                    processes.length
                                                }{" "}
                                                Process
                                                {processes.length ===
                                                1
                                                    ? ""
                                                    : "es"}
                                            </div>
                                        </div>

                                        {processes.length ===
                                        0 ? (
                                            <div
                                                className="
                                                    flex
                                                    min-h-[260px]
                                                    flex-col
                                                    items-center
                                                    justify-center
                                                    rounded-[13px]
                                                    border
                                                    border-dashed
                                                    border-[#DCE5E0]
                                                    bg-[#FAFCFB]
                                                    text-center
                                                "
                                            >
                                                <div
                                                    className="
                                                        flex
                                                        h-[44px]
                                                        w-[44px]
                                                        items-center
                                                        justify-center
                                                        rounded-[12px]
                                                        bg-[#EEF3F0]
                                                        text-[#81918A]
                                                    "
                                                >
                                                    <Workflow
                                                        size={19}
                                                        strokeWidth={
                                                            1.7
                                                        }
                                                    />
                                                </div>

                                                <p
                                                    className="
                                                        mt-3
                                                        text-[12px]
                                                        font-bold
                                                        text-[#66756E]
                                                    "
                                                >
                                                    No processes
                                                    available
                                                </p>

                                                <p
                                                    className="
                                                        mt-1
                                                        max-w-[250px]
                                                        text-[9.5px]
                                                        leading-[1.5]
                                                        text-[#9AA59F]
                                                    "
                                                >
                                                    There are
                                                    currently
                                                    no active
                                                    workflows
                                                    available
                                                    for this
                                                    site.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {processes.map(
                                                    (
                                                        process
                                                    ) => {
                                                        const Icon =
                                                            getProcessIcon(
                                                                process.name
                                                            );

                                                        return (
                                                            <button
                                                                key={
                                                                    process.id
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    handleProcessSelect(
                                                                        process
                                                                    )
                                                                }
                                                                className="
                                                                    group
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-3
                                                                    rounded-[12px]
                                                                    border
                                                                    border-[#DDE6E1]
                                                                    bg-white
                                                                    px-3.5
                                                                    py-3
                                                                    text-left
                                                                    shadow-[0_2px_8px_rgba(40,60,51,0.025)]
                                                                    transition-all
                                                                    duration-200
                                                                    hover:-translate-y-[1px]
                                                                    hover:border-[#BBCFC5]
                                                                    hover:bg-[#FBFDFC]
                                                                    hover:shadow-[0_7px_18px_rgba(49,79,67,0.09)]
                                                                    active:translate-y-0
                                                                    active:scale-[0.995]
                                                                    focus:outline-none
                                                                    focus-visible:ring-2
                                                                    focus-visible:ring-[#BBD0C6]
                                                                    focus-visible:ring-offset-1
                                                                "
                                                            >
                                                                {/* PROCESS ICON */}
                                                                <span
                                                                    className="
                                                                        flex
                                                                        h-[38px]
                                                                        w-[38px]
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-[10px]
                                                                        border
                                                                        border-[#D8E4DE]
                                                                        bg-[#EEF4F1]
                                                                        text-[#58786C]
                                                                        transition-all
                                                                        duration-200
                                                                        group-hover:border-[#C6D8D0]
                                                                        group-hover:bg-[#E6EFEB]
                                                                        group-hover:text-[#496A5E]
                                                                    "
                                                                >
                                                                    <Icon
                                                                        size={
                                                                            17
                                                                        }
                                                                        strokeWidth={
                                                                            1.8
                                                                        }
                                                                    />
                                                                </span>

                                                                {/* PROCESS INFO */}
                                                                <span className="min-w-0 flex-1">
                                                                    <span
                                                                        className="
                                                                            block
                                                                            truncate
                                                                            text-[12.5px]
                                                                            font-bold
                                                                            text-[#30473E]
                                                                        "
                                                                    >
                                                                        {
                                                                            process.name
                                                                        }
                                                                    </span>

                                                                    <span
                                                                        className="
                                                                            mt-1
                                                                            block
                                                                            text-[9px]
                                                                            font-medium
                                                                            text-[#8D9A94]
                                                                        "
                                                                    >
                                                                        Start
                                                                        a new{" "}
                                                                        {
                                                                            process.name
                                                                        }{" "}
                                                                        record
                                                                    </span>
                                                                </span>

                                                                {/* ACTION */}
                                                                <span
                                                                    className="
                                                                        flex
                                                                        h-[30px]
                                                                        w-[30px]
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-full
                                                                        border
                                                                        border-[#DCE5E0]
                                                                        bg-[#F7F9F7]
                                                                        text-[#85938C]
                                                                        transition-all
                                                                        duration-200
                                                                        group-hover:border-[#C7D9D1]
                                                                        group-hover:bg-[#EAF1ED]
                                                                        group-hover:text-[#56776B]
                                                                    "
                                                                >
                                                                    <ChevronRight
                                                                        size={
                                                                            15
                                                                        }
                                                                        strokeWidth={
                                                                            1.9
                                                                        }
                                                                        className="
                                                                            transition-transform
                                                                            duration-200
                                                                            group-hover:translate-x-0.5
                                                                        "
                                                                    />
                                                                </span>
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                        </section>
                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================== */}
                    <div
                        className="
                            flex
                            min-h-[42px]
                            items-center
                            justify-between
                            gap-3
                            border-t
                            border-[#E3EAE6]
                            bg-[#FAFBFA]
                            px-4
                            text-[9px]
                            text-[#8B9791]
                            sm:px-5
                        "
                    >
                        <span>
                            {selectedSite
                                ? `Site selected: ${
                                      activeSite?.name ||
                                      "—"
                                  }`
                                : "Select a site to continue"}
                        </span>

                        <span className="hidden sm:block">
                            Controlled record creation
                        </span>
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