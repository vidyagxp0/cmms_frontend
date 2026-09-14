import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Wrench,
    HardHat,
    Activity,
    CheckCircle2,
    Clock,
    Layers,
    Cpu,
    TrendingUp,
    ShieldAlert,
    BarChart2,
    Building2,
    Calendar,
    Sparkles,
    FileText,
    User,
    ArrowUpRight,
    ListFilter,
} from "lucide-react";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LabelList,
} from "recharts";

import { useNavigate } from "react-router-dom";

import { getAllEquipment } from "../../../services/usersApi/equipmentApi";
import { getAllRecords } from "../../../services/usersApi/calibrationApi";
import KPICard from "../../../components/common/Charts/KPICard";
import ChartCard from "../../../components/common/Charts/ChartCard";
import RealTimeControls from "../../../components/common/Charts/RealTimeControls";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";

/* ================================================================
   APPROVED CMMS CHART PALETTE
   Warm Pearl + Sage + Muted Bronze + Deep Ink
================================================================ */
const CHART_PALETTE = [
    "#56766D",
    "#7E9D93",
    "#A47D45",
    "#6D8B84",
    "#9AADA6",
    "#8D7657",
    "#486A62",
    "#B3C1BC",
];

/* ================================================================
   CHART CONSTANTS
================================================================ */
const GRID_COLOR = "#E8EBE7";
const AXIS_COLOR = "#88918E";
const TOOLTIP_BORDER = "#D6D8D3";
const TOOLTIP_SHADOW =
    "0 14px 35px rgba(36,50,56,0.12)";

const UserDashboard = () => {
    const navigate = useNavigate();

    const [equipmentList, setEquipmentList] = useState([]);
    const [engineeringRecords, setEngineeringRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timelineView, setTimelineView] = useState("monthly");
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    /* ============================================================
       LIVE CLOCK TIMER
    ============================================================ */
    useEffect(() => {
        const clockTimer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(clockTimer);
    }, []);

    /* ============================================================
       FORMATTED DATE
    ============================================================ */
    const formattedDate = useMemo(() => {
        return currentDateTime.toLocaleDateString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }, [currentDateTime]);

    /* ============================================================
       FORMATTED TIME
    ============================================================ */
    const formattedTime = useMemo(() => {
        return currentDateTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    }, [currentDateTime]);

    /* ============================================================
       FETCH DASHBOARD DATA
       FUNCTIONALITY PRESERVED
    ============================================================ */
    const fetchData = useCallback(async (isManual = false) => {
        if (isManual) setIsRefreshing(true);

        try {
            setLoading(true);

            const [equipRes, engRes] = await Promise.allSettled([
                getAllEquipment({
                    page: 1,
                    per_page: 100,
                }),
                getAllRecords({
                    page: 1,
                    per_page: 100,
                }),
            ]);

            if (equipRes.status === "fulfilled") {
                const equipData =
                    equipRes.value?.data?.data?.data ||
                    equipRes.value?.data?.data ||
                    [];

                setEquipmentList(
                    Array.isArray(equipData)
                        ? equipData
                        : []
                );
            } else {
                setEquipmentList([]);
            }

            if (engRes.status === "fulfilled") {
                const engData =
                    engRes.value?.data?.data?.data ||
                    engRes.value?.data?.data ||
                    [];

                setEngineeringRecords(
                    Array.isArray(engData)
                        ? engData
                        : []
                );
            } else {
                setEngineeringRecords([]);
            }

            const now = new Date();

            setLastUpdated(
                now.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
        } catch (err) {
            console.error(
                "Error fetching dashboard analytics:",
                err
            );

            setEquipmentList([]);
            setEngineeringRecords([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    /* ============================================================
       INITIAL DATA LOAD
    ============================================================ */
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* ============================================================
       AUTO REFRESH TIMER
       FUNCTIONALITY PRESERVED
    ============================================================ */
    useEffect(() => {
        if (!autoRefreshInterval || autoRefreshInterval <= 0) {
            return;
        }

        const timer = setInterval(() => {
            fetchData();
        }, autoRefreshInterval * 1000);

        return () => clearInterval(timer);
    }, [autoRefreshInterval, fetchData]);

    /* ============================================================
       1. PROCESS DISTRIBUTION
    ============================================================ */
    const processData = useMemo(() => {
        if (!engineeringRecords.length) return [];

        const counts = {};

        engineeringRecords.forEach((rec) => {
            const procName =
                rec.process?.name ||
                "General Process";

            counts[procName] =
                (counts[procName] || 0) + 1;
        });

        const total = engineeringRecords.length;

        return Object.entries(counts).map(
            ([name, value], index) => ({
                name,
                value,
                percent: Math.round(
                    (value / total) * 100
                ),
                fill:
                    CHART_PALETTE[
                        index % CHART_PALETTE.length
                    ],
            })
        );
    }, [engineeringRecords]);

    /* ============================================================
       2. EQUIPMENT TYPES
    ============================================================ */
    const equipmentTypeData = useMemo(() => {
        if (!equipmentList.length) return [];

        const counts = {};

        equipmentList.forEach((item) => {
            const type =
                item.equipment_type ||
                "General Equipment";

            counts[type] =
                (counts[type] || 0) + 1;
        });

        return Object.entries(counts).map(
            ([name, count]) => ({
                name,
                count,
            })
        );
    }, [equipmentList]);

    /* ============================================================
       3. EQUIPMENT MAKE / MANUFACTURER
    ============================================================ */
    const equipmentMakeData = useMemo(() => {
        if (!equipmentList.length) return [];

        const counts = {};

        equipmentList.forEach((item) => {
            const make =
                item.make ||
                "General Vendor";

            counts[make] =
                (counts[make] || 0) + 1;
        });

        const total = equipmentList.length;

        return Object.entries(counts)
            .map(([name, value]) => ({
                name,
                value,
                percent: Math.round(
                    (value / total) * 100
                ),
            }))
            .sort((a, b) => b.value - a.value);
    }, [equipmentList]);

    /* ============================================================
       4. ENGINEERING STAGES
    ============================================================ */
    const engineeringStageData = useMemo(() => {
        if (!engineeringRecords.length) return [];

        const counts = {};

        engineeringRecords.forEach((rec) => {
            const stageName =
                rec.stage?.name ||
                rec.stage ||
                "Opened";

            counts[stageName] =
                (counts[stageName] || 0) + 1;
        });

        return Object.entries(counts).map(
            ([stage, count], index) => ({
                stage,
                count,
                fill:
                    CHART_PALETTE[
                        index % CHART_PALETTE.length
                    ],
            })
        );
    }, [engineeringRecords]);

    /* ============================================================
       5. DEPARTMENT BREAKDOWN
    ============================================================ */
    const departmentData = useMemo(() => {
        if (!engineeringRecords.length) return [];

        const counts = {};

        engineeringRecords.forEach((rec) => {
            const dept =
                rec.department?.name ||
                rec.initiationDepartment ||
                "Engineering";

            counts[dept] =
                (counts[dept] || 0) + 1;
        });

        const total = engineeringRecords.length;

        return Object.entries(counts).map(
            ([name, value]) => ({
                name,
                value,
                percent: Math.round(
                    (value / total) * 100
                ),
            })
        );
    }, [engineeringRecords]);

    /* ============================================================
       6. INITIATOR ACTIVITY
    ============================================================ */
    const initiatorData = useMemo(() => {
        if (!engineeringRecords.length) return [];

        const counts = {};

        engineeringRecords.forEach((rec) => {
            const initName =
                rec.initiator?.name ||
                "Initiator";

            counts[initName] =
                (counts[initName] || 0) + 1;
        });

        return Object.entries(counts).map(
            ([name, count]) => ({
                name,
                count,
            })
        );
    }, [engineeringRecords]);

    /* ============================================================
       7. RECENT ENGINEERING ACTIVITY
    ============================================================ */
    const recentEngineeringRecords = useMemo(() => {
        if (!engineeringRecords.length) return [];

        return [...engineeringRecords]
            .sort(
                (a, b) =>
                    (b.id || 0) -
                    (a.id || 0)
            )
            .slice(0, 5);
    }, [engineeringRecords]);

    /* ============================================================
       8. TIMELINE
    ============================================================ */
    const timelineData = useMemo(() => {
        const now = new Date();

        if (timelineView === "daily") {
            const daysMap = {};

            for (let i = 6; i >= 0; i--) {
                const d = new Date();

                d.setDate(
                    now.getDate() - i
                );

                const dayStr =
                    d.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                        }
                    );

                daysMap[dayStr] = {
                    month: dayStr,
                    equipment: 0,
                    records: 0,
                };
            }

            equipmentList.forEach((item) => {
                if (!item.created_at) return;

                const d = new Date(
                    item.created_at
                );

                if (isNaN(d.getTime())) return;

                const dayStr =
                    d.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                        }
                    );

                if (daysMap[dayStr]) {
                    daysMap[dayStr].equipment += 1;
                }
            });

            engineeringRecords.forEach((item) => {
                const dateVal =
                    item.created_at ||
                    item.dateOfInitiation;

                if (!dateVal) return;

                const d = new Date(dateVal);

                if (isNaN(d.getTime())) return;

                const dayStr =
                    d.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                        }
                    );

                if (daysMap[dayStr]) {
                    daysMap[dayStr].records += 1;
                }
            });

            return Object.values(daysMap);
        } else {
            const monthsMap = {};

            for (let i = 5; i >= 0; i--) {
                const d = new Date();

                d.setMonth(
                    now.getMonth() - i
                );

                const monthStr =
                    d.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                        }
                    );

                monthsMap[monthStr] = {
                    month: monthStr,
                    equipment: 0,
                    records: 0,
                };
            }

            equipmentList.forEach((item) => {
                if (!item.created_at) return;

                const d = new Date(
                    item.created_at
                );

                if (isNaN(d.getTime())) return;

                const monthStr =
                    d.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                        }
                    );

                if (monthsMap[monthStr]) {
                    monthsMap[
                        monthStr
                    ].equipment += 1;
                } else {
                    const currMonth =
                        now.toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                            }
                        );

                    if (monthsMap[currMonth]) {
                        monthsMap[
                            currMonth
                        ].equipment += 1;
                    }
                }
            });

            engineeringRecords.forEach((item) => {
                const dateVal =
                    item.created_at ||
                    item.dateOfInitiation;

                if (!dateVal) return;

                const d = new Date(dateVal);

                if (isNaN(d.getTime())) return;

                const monthStr =
                    d.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                        }
                    );

                if (monthsMap[monthStr]) {
                    monthsMap[
                        monthStr
                    ].records += 1;
                } else {
                    const currMonth =
                        now.toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                            }
                        );

                    if (monthsMap[currMonth]) {
                        monthsMap[
                            currMonth
                        ].records += 1;
                    }
                }
            });

            return Object.values(monthsMap);
        }
    }, [
        equipmentList,
        engineeringRecords,
        timelineView,
    ]);

    /* ============================================================
       DYNAMIC METRICS
    ============================================================ */
    const totalEquip = equipmentList.length;
    const totalRecords = engineeringRecords.length;
    const uniqueProcessesCount =
        processData.length;

    const completedRecordsCount = useMemo(() => {
        return engineeringRecords.filter((rec) => {
            const s = (
                rec.stage?.name || ""
            ).toLowerCase();

            return (
                s.includes("complete") ||
                s.includes("approve") ||
                s.includes("close")
            );
        }).length;
    }, [engineeringRecords]);

    const completionRatePercent =
        totalRecords > 0
            ? Math.round(
                  (completedRecordsCount /
                      totalRecords) *
                      100
              )
            : 0;

    const activeStagesCount = useMemo(() => {
        return engineeringRecords.filter((rec) => {
            const s = (
                rec.stage?.name || ""
            ).toLowerCase();

            return !s.includes("close");
        }).length;
    }, [engineeringRecords]);

    const uniqueMakesCount = useMemo(
        () =>
            new Set(
                equipmentList
                    .map((e) => e.make)
                    .filter(Boolean)
            ).size,
        [equipmentList]
    );

    const uniqueTypesCount = useMemo(
        () =>
            new Set(
                equipmentList
                    .map((e) => e.equipment_type)
                    .filter(Boolean)
            ).size,
        [equipmentList]
    );

    const topDeptObj = useMemo(() => {
        if (!departmentData.length) return null;

        return [...departmentData].sort(
            (a, b) => b.value - a.value
        )[0];
    }, [departmentData]);

    /* ============================================================
       LOADING STATE
    ============================================================ */
    if (loading) {
        return (
            <CustomScrollContainer className="pr-1 pb-12 space-y-6 bg-[#F7F9F8] p-4 sm:p-6">
                <Skeleton variant="dashboard" />
            </CustomScrollContainer>
        );
    }

    /* ============================================================
       DASHBOARD
    ============================================================ */
    return (
        <CustomScrollContainer className="pr-1 pb-12 space-y-6 bg-[#F7F9F8]">
            {/* SVG GRADIENTS */}
            <svg style={{ height: 0, width: 0, position: "absolute" }}>
                <defs>
                    <linearGradient
                        id="areaEquipGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#56766D"
                            stopOpacity={0.24}
                        />

                        <stop
                            offset="65%"
                            stopColor="#56766D"
                            stopOpacity={0.08}
                        />

                        <stop
                            offset="100%"
                            stopColor="#56766D"
                            stopOpacity={0}
                        />
                    </linearGradient>

                    <linearGradient
                        id="areaRecordGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#A47D45"
                            stopOpacity={0.20}
                        />

                        <stop
                            offset="65%"
                            stopColor="#A47D45"
                            stopOpacity={0.07}
                        />

                        <stop
                            offset="100%"
                            stopColor="#A47D45"
                            stopOpacity={0}
                        />
                    </linearGradient>

                    <linearGradient
                        id="barSageGrad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <stop
                            offset="0%"
                            stopColor="#6C8B82"
                        />

                        <stop
                            offset="100%"
                            stopColor="#56766D"
                        />
                    </linearGradient>

                    <linearGradient
                        id="barBronzeGrad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <stop
                            offset="0%"
                            stopColor="#B3905C"
                        />

                        <stop
                            offset="100%"
                            stopColor="#A47D45"
                        />
                    </linearGradient>
                </defs>
            </svg>

            {/* =====================================================
                DASHBOARD HEADER
            ====================================================== */}
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    border-b
                    border-[#D6D8D3]
                    pb-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-[10px]
                                border
                                border-[#C9D8D3]
                                bg-[#E8F0ED]
                                text-[#56766D]
                            "
                        >
                            <LayoutDashboard
                                size={18}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <h1
                                className="
                                    text-[23px]
                                    font-bold
                                    tracking-[-0.035em]
                                    text-[#243238]
                                "
                            >
                                CMMS Dashboard
                            </h1>

                            <p
                                className="
                                    mt-0.5
                                    text-[11px]
                                    font-medium
                                    text-[#7B8584]
                                "
                            >
                                Equipment, engineering and workflow overview
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                    {/* DATE + LIVE CLOCK */}
                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            rounded-[12px]
                            border
                            border-[#D6D8D3]
                            bg-[#F7F6F2]
                            px-3.5
                            py-2
                            shadow-[0_2px_8px_rgba(36,50,56,0.035)]
                        "
                    >
                        <div className="flex items-center gap-2">
                            <Calendar
                                size={14}
                                strokeWidth={1.8}
                                className="text-[#56766D]"
                            />

                            <span
                                className="
                                    text-[10.5px]
                                    font-semibold
                                    text-[#4F5E5D]
                                "
                            >
                                {formattedDate}
                            </span>
                        </div>

                        <div className="h-5 w-px bg-[#D8DBD7]" />

                        <div className="flex items-center gap-2">
                            <Clock
                                size={14}
                                strokeWidth={1.8}
                                className="
                                    animate-pulse
                                    text-[#A47D45]
                                "
                            />

                            <span
                                className="
                                    font-mono
                                    text-[10.5px]
                                    font-bold
                                    tracking-wide
                                    text-[#243238]
                                "
                            >
                                {formattedTime}
                            </span>
                        </div>
                    </div>

                    <RealTimeControls
                        lastUpdated={lastUpdated}
                        onRefresh={() => fetchData(true)}
                        isRefreshing={
                            isRefreshing || loading
                        }
                        autoRefreshInterval={
                            autoRefreshInterval
                        }
                        setAutoRefreshInterval={
                            setAutoRefreshInterval
                        }
                    />
                </div>
            </div>

            {/* =====================================================
                KPI CARDS
            ====================================================== */}
            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    sm:gap-5
                    lg:grid-cols-4
                "
            >
                <KPICard
                    title="Total Equipment Assets"
                    value={totalEquip}
                    subtext={
                        uniqueTypesCount
                            ? `${uniqueTypesCount} Asset Categories`
                            : "Equipment API"
                    }
                    icon={Wrench}
                    trend={`${totalEquip} Assets`}
                    trendType="up"
                    gradient="from-[#56766D] to-[#7E9D93]"
                    bgColor="bg-[#E8F0ED]"
                    iconColor="text-[#56766D]"
                    delay={0.05}
                />

                <KPICard
                    title="Engineering Records"
                    value={totalRecords}
                    subtext={
                        uniqueProcessesCount
                            ? `${uniqueProcessesCount} Active Processes`
                            : "Engineering API"
                    }
                    icon={HardHat}
                    trend={`${totalRecords} Records`}
                    trendType="up"
                    gradient="from-[#6D8B84] to-[#56766D]"
                    bgColor="bg-[#E8F0ED]"
                    iconColor="text-[#56766D]"
                    delay={0.1}
                />

                <KPICard
                    title="Active Workflow Tasks"
                    value={activeStagesCount}
                    subtext="Tasks in active execution"
                    icon={Activity}
                    trend={`${activeStagesCount} Active`}
                    trendType="neutral"
                    gradient="from-[#A47D45] to-[#B3905C]"
                    bgColor="bg-[#F4EEE4]"
                    iconColor="text-[#A47D45]"
                    delay={0.15}
                />

                <KPICard
                    title="Process Completion Rate"
                    value={`${completionRatePercent}%`}
                    subtext={`${completedRecordsCount} of ${totalRecords} Closed`}
                    icon={CheckCircle2}
                    trend={
                        completionRatePercent > 0
                            ? "Active Rate"
                            : "Pending"
                    }
                    trendType={
                        completionRatePercent > 0
                            ? "up"
                            : "neutral"
                    }
                    gradient="from-[#56766D] to-[#486A62]"
                    bgColor="bg-[#E8F0ED]"
                    iconColor="text-[#56766D]"
                    delay={0.2}
                />
            </div>

            {/* =====================================================
                ROW 1
            ====================================================== */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* TIMELINE */}
                <div className="lg:col-span-7">
                    <ChartCard
                        title="Equipment & Engineering Growth Velocity"
                        subtitle="Continuous trajectory sequence comparing onboarding vs engineering tasks"
                        icon={TrendingUp}
                        badgeText="Live API Timeline"
                        minHeight="h-[400px]"
                        action={
                            <div
                                className="
                                    flex
                                    items-center
                                    rounded-[9px]
                                    border
                                    border-[#D8DDD9]
                                    bg-[#F3F4F1]
                                    p-0.5
                                    text-[10px]
                                    font-semibold
                                    text-[#76817E]
                                "
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTimelineView(
                                            "monthly"
                                        )
                                    }
                                    className={`
                                        rounded-[7px]
                                        px-3
                                        py-1
                                        transition-all
                                        duration-200
                                        ${
                                            timelineView ===
                                            "monthly"
                                                ? "bg-white text-[#2F4640] shadow-[0_1px_4px_rgba(36,50,56,0.08)]"
                                                : "hover:text-[#405850]"
                                        }
                                    `}
                                >
                                    Monthly
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setTimelineView(
                                            "daily"
                                        )
                                    }
                                    className={`
                                        rounded-[7px]
                                        px-3
                                        py-1
                                        transition-all
                                        duration-200
                                        ${
                                            timelineView ===
                                            "daily"
                                                ? "bg-white text-[#2F4640] shadow-[0_1px_4px_rgba(36,50,56,0.08)]"
                                                : "hover:text-[#405850]"
                                        }
                                    `}
                                >
                                    Last 7 Days
                                </button>
                            </div>
                        }
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <AreaChart
                                data={timelineData}
                                margin={{
                                    top: 22,
                                    right: 22,
                                    left: -8,
                                    bottom: 4,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="2 5"
                                    vertical={false}
                                    stroke={GRID_COLOR}
                                />

                                <XAxis
                                    dataKey="month"
                                    stroke={AXIS_COLOR}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />

                                <YAxis
                                    stroke={AXIS_COLOR}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />

                                <Tooltip
                                    cursor={{
                                        stroke: "#CCD4D0",
                                        strokeWidth: 1,
                                        strokeDasharray: "3 3",
                                    }}
                                    contentStyle={{
                                        backgroundColor:
                                            "#FFFFFF",
                                        borderRadius:
                                            "12px",
                                        border: `1px solid ${TOOLTIP_BORDER}`,
                                        boxShadow:
                                            TOOLTIP_SHADOW,
                                        padding:
                                            "10px 12px",
                                        fontSize:
                                            "11px",
                                    }}
                                    labelStyle={{
                                        color: "#243238",
                                        fontWeight: 700,
                                        marginBottom: 5,
                                    }}
                                    itemStyle={{
                                        color: "#5D6A67",
                                        fontWeight: 600,
                                    }}
                                />

                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{
                                        fontSize: "10px",
                                        color: "#687571",
                                    }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="equipment"
                                    name="Equipment Assets"
                                    stroke="#56766D"
                                    strokeWidth={2.4}
                                    activeDot={{
                                        r: 5,
                                        stroke: "#56766D",
                                        strokeWidth: 2,
                                        fill: "#FFFFFF",
                                    }}
                                    fillOpacity={1}
                                    fill="url(#areaEquipGrad)"
                                />

                                <Area
                                    type="monotone"
                                    dataKey="records"
                                    name="Engineering Records"
                                    stroke="#A47D45"
                                    strokeWidth={2.2}
                                    activeDot={{
                                        r: 5,
                                        stroke: "#A47D45",
                                        strokeWidth: 2,
                                        fill: "#FFFFFF",
                                    }}
                                    fillOpacity={1}
                                    fill="url(#areaRecordGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* PROCESS DONUT */}
                <div className="lg:col-span-5">
                    <ChartCard
                        title="CMMS Process Workflow Breakdown"
                        subtitle="Distribution by process (Calibration Planner vs Management)"
                        icon={FileText}
                        badgeText={`${uniqueProcessesCount} Processes`}
                        minHeight="h-[400px]"
                    >
                        <div className="relative h-full w-full">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart
                                    margin={{
                                        top: 10,
                                        right: 8,
                                        bottom: 16,
                                        left: 8,
                                    }}
                                >
                                    <Pie
                                        data={
                                            processData.length
                                                ? processData
                                                : [
                                                      {
                                                          name: "No Data",
                                                          value: 1,
                                                      },
                                                  ]
                                        }
                                        cx="50%"
                                        cy="47%"
                                        innerRadius={63}
                                        outerRadius={87}
                                        paddingAngle={4}
                                        cornerRadius={3}
                                        dataKey="value"
                                    >
                                        {processData.map(
                                            (
                                                entry,
                                                index
                                            ) => (
                                                <Cell
                                                    key={`cell-proc-${index}`}
                                                    fill={
                                                        entry.fill
                                                    }
                                                    stroke="#FFFFFF"
                                                    strokeWidth={
                                                        3
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                "#FFFFFF",
                                            borderRadius:
                                                "12px",
                                            border: `1px solid ${TOOLTIP_BORDER}`,
                                            boxShadow:
                                                TOOLTIP_SHADOW,
                                            fontSize:
                                                "11px",
                                        }}
                                        labelStyle={{
                                            color: "#243238",
                                            fontWeight: 700,
                                        }}
                                    />

                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        wrapperStyle={{
                                            paddingTop:
                                                "8px",
                                            fontSize:
                                                "10px",
                                            color:
                                                "#6D7975",
                                        }}
                                        iconType="circle"
                                        iconSize={7}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    pb-8
                                "
                            >
                                <span
                                    className="
                                        text-[28px]
                                        font-bold
                                        leading-none
                                        tracking-[-0.04em]
                                        text-[#243238]
                                    "
                                >
                                    {totalRecords}
                                </span>

                                <span
                                    className="
                                        mt-1.5
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.13em]
                                        text-[#87918E]
                                    "
                                >
                                    Total Processes
                                </span>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>

            {/* =====================================================
                ROW 2
            ====================================================== */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* ENGINEERING STAGE PIPELINE */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Engineering Record Stage Pipeline"
                        subtitle="Task volume distribution across workflow stages from Engineering API"
                        icon={Layers}
                        badgeText="Workflow Stages"
                        minHeight="h-[360px]"
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={
                                    engineeringStageData
                                }
                                margin={{
                                    top: 28,
                                    right: 15,
                                    left: -15,
                                    bottom: 2,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="2 5"
                                    vertical={false}
                                    stroke={GRID_COLOR}
                                />

                                <XAxis
                                    dataKey="stage"
                                    stroke={AXIS_COLOR}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />

                                <YAxis
                                    stroke={AXIS_COLOR}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "rgba(86,118,109,0.045)",
                                    }}
                                    contentStyle={{
                                        backgroundColor:
                                            "#FFFFFF",
                                        borderRadius:
                                            "12px",
                                        border: `1px solid ${TOOLTIP_BORDER}`,
                                        boxShadow:
                                            TOOLTIP_SHADOW,
                                        fontSize:
                                            "11px",
                                    }}
                                />

                                <Bar
                                    dataKey="count"
                                    name="Records"
                                    fill="url(#barSageGrad)"
                                    radius={[
                                        7,
                                        7,
                                        2,
                                        2,
                                    ]}
                                    barSize={31}
                                >
                                    {engineeringStageData.map(
                                        (
                                            entry,
                                            index
                                        ) => (
                                            <Cell
                                                key={`cell-bar-${index}`}
                                                fill={
                                                    entry.fill
                                                }
                                            />
                                        )
                                    )}

                                    <LabelList
                                        dataKey="count"
                                        position="top"
                                        fill="#53615E"
                                        fontSize={10}
                                        fontWeight={700}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* EQUIPMENT TYPES */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Equipment Classification & Types"
                        subtitle="Count of equipment grouped by operational category"
                        icon={BarChart2}
                        badgeText="Category Specs"
                        minHeight="h-[360px]"
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={
                                    equipmentTypeData
                                }
                                layout="vertical"
                                margin={{
                                    top: 15,
                                    right: 34,
                                    left: 32,
                                    bottom: 2,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="2 5"
                                    horizontal={false}
                                    stroke={GRID_COLOR}
                                />

                                <XAxis
                                    type="number"
                                    stroke={AXIS_COLOR}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke={AXIS_COLOR}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "rgba(86,118,109,0.04)",
                                    }}
                                    contentStyle={{
                                        backgroundColor:
                                            "#FFFFFF",
                                        borderRadius:
                                            "12px",
                                        border: `1px solid ${TOOLTIP_BORDER}`,
                                        boxShadow:
                                            TOOLTIP_SHADOW,
                                        fontSize:
                                            "11px",
                                    }}
                                />

                                <Bar
                                    dataKey="count"
                                    name="Equipment Assets"
                                    fill="url(#barSageGrad)"
                                    radius={[
                                        0,
                                        7,
                                        7,
                                        0,
                                    ]}
                                    barSize={21}
                                >
                                    <LabelList
                                        dataKey="count"
                                        position="right"
                                        fill="#56766D"
                                        fontSize={10}
                                        fontWeight={700}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>

            {/* =====================================================
                ROW 3
            ====================================================== */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* DEPARTMENT DONUT */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Departmental Initiation Share"
                        subtitle="Distribution of engineering records initiated by department"
                        icon={Building2}
                        badgeText="Department Ratio"
                        minHeight="h-[350px]"
                    >
                        <div className="relative h-full w-full">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart
                                    margin={{
                                        top: 10,
                                        right: 8,
                                        bottom: 15,
                                        left: 8,
                                    }}
                                >
                                    <Pie
                                        data={
                                            departmentData.length
                                                ? departmentData
                                                : [
                                                      {
                                                          name: "No Data",
                                                          value: 1,
                                                      },
                                                  ]
                                        }
                                        cx="50%"
                                        cy="47%"
                                        innerRadius={59}
                                        outerRadius={81}
                                        paddingAngle={4}
                                        cornerRadius={3}
                                        dataKey="value"
                                    >
                                        {departmentData.map(
                                            (
                                                entry,
                                                index
                                            ) => (
                                                <Cell
                                                    key={`cell-dept-${index}`}
                                                    fill={
                                                        CHART_PALETTE[
                                                            (index +
                                                                1) %
                                                                CHART_PALETTE.length
                                                        ]
                                                    }
                                                    stroke="#FFFFFF"
                                                    strokeWidth={
                                                        3
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                "#FFFFFF",
                                            borderRadius:
                                                "12px",
                                            border: `1px solid ${TOOLTIP_BORDER}`,
                                            boxShadow:
                                                TOOLTIP_SHADOW,
                                            fontSize:
                                                "11px",
                                        }}
                                    />

                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        iconSize={7}
                                        wrapperStyle={{
                                            fontSize:
                                                "10px",
                                            color:
                                                "#6D7975",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    pb-8
                                "
                            >
                                <span
                                    className="
                                        text-[26px]
                                        font-bold
                                        leading-none
                                        tracking-[-0.04em]
                                        text-[#243238]
                                    "
                                >
                                    {departmentData.length}
                                </span>

                                <span
                                    className="
                                        mt-1.5
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.13em]
                                        text-[#87918E]
                                    "
                                >
                                    Departments
                                </span>
                            </div>
                        </div>
                    </ChartCard>
                </div>

                {/* INITIATOR VOLUME */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Record Initiation Volume by User"
                        subtitle="Count of engineering records initiated per user"
                        icon={User}
                        badgeText="User Initiations"
                        minHeight="h-[350px]"
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={initiatorData}
                                layout="vertical"
                                margin={{
                                    top: 15,
                                    right: 34,
                                    left: 22,
                                    bottom: 2,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="2 5"
                                    horizontal={false}
                                    stroke={GRID_COLOR}
                                />

                                <XAxis
                                    type="number"
                                    stroke={AXIS_COLOR}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke={AXIS_COLOR}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "rgba(164,125,69,0.045)",
                                    }}
                                    contentStyle={{
                                        backgroundColor:
                                            "#FFFFFF",
                                        borderRadius:
                                            "12px",
                                        border: `1px solid ${TOOLTIP_BORDER}`,
                                        boxShadow:
                                            TOOLTIP_SHADOW,
                                        fontSize:
                                            "11px",
                                    }}
                                />

                                <Bar
                                    dataKey="count"
                                    name="Initiated Records"
                                    fill="url(#barBronzeGrad)"
                                    radius={[
                                        0,
                                        7,
                                        7,
                                        0,
                                    ]}
                                    barSize={21}
                                >
                                    <LabelList
                                        dataKey="count"
                                        position="right"
                                        fill="#A47D45"
                                        fontSize={10}
                                        fontWeight={700}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </CustomScrollContainer>
    );
};

export default UserDashboard;