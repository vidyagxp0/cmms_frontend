import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    LayoutDashboard,
    HardHat,
    Activity,
    CheckCircle2,
    Clock,
    Layers,
    Cpu,
    BarChart2,
    Calendar,
    FileText,
    Factory,
    Gauge,
    Package,
    ClipboardCheck,
    ListChecks,
} from "lucide-react";

import {
    ResponsiveContainer,
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

import KPICard from "../../../components/common/Charts/KPICard";
import ChartCard from "../../../components/common/Charts/ChartCard";
import RealTimeControls from "../../../components/common/Charts/RealTimeControls";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";
import { getAllDashboardData } from "../../../services/usersApi/dashboardAllApi";

/* ================================================================
   APPROVED CMMS CHART PALETTE
================================================================ */
const CHART_PALETTE = [
    "#56766D", "#7E9D93", "#A47D45", "#6D8B84",
    "#9AADA6", "#8D7657", "#486A62", "#B3C1BC",
];

const GRID_COLOR = "#E8EBE7";
const AXIS_COLOR = "#88918E";
const TOOLTIP_BORDER = "#D6D8D3";
const TOOLTIP_SHADOW = "0 14px 35px rgba(36,50,56,0.12)";

const EMPTY_RECORDS = [];

/* Live clock — isolated so its 1s tick does not re-render the dashboard. */
const useNow = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return now;
};

const LiveDate = () => {
    const now = useNow();
    return now.toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const LiveTime = () => {
    const now = useNow();
    return now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

const SectionTitle = ({ title, subtitle }) => (
    <div className="flex items-end justify-between gap-3 pt-1">
        <div>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#4F5E5D]">
                {title}
            </h2>
            {subtitle && (
                <p className="mt-0.5 text-[11px] font-medium text-[#8A9390]">{subtitle}</p>
            )}
        </div>
    </div>
);

const StatPill = ({ label, value, dotClass }) => (
    <div className="rounded-[12px] border border-[#ECEDEA] bg-[#FAFAF8] px-3 py-2">
        <div className="flex items-center gap-1.5">
            <span className={`h-[6px] w-[6px] rounded-full ${dotClass}`} />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#87918E]">
                {label}
            </span>
        </div>
        <p className="mt-1 text-[18px] font-bold leading-none tracking-[-0.03em] text-[#243238]">
            {value}
        </p>
    </div>
);

const ProcessDetailCard = ({ process }) => {
    const { name, total, opened, closed, other, completion, share, color } = process;
    const pct = (n) => (total > 0 ? (n / total) * 100 : 0);

    return (
        <div className="group relative overflow-hidden rounded-[18px] border border-[#D6D8D3] bg-white p-4 shadow-[0_3px_12px_rgba(36,50,56,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C4CCC7] hover:shadow-[0_12px_28px_rgba(36,50,56,0.09)]">
            <span className="absolute left-0 top-0 h-full w-[3px]" style={{ backgroundColor: color }} />

            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#C9D8D3] bg-[#E8F0ED] text-[#56766D]">
                        <ListChecks size={17} strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-[#243238]" title={name}>
                            {name}
                        </p>
                        <p className="text-[10.5px] font-medium text-[#8A9390]">
                            {share}% of all records
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[24px] font-bold leading-none tracking-[-0.04em] text-[#243238]">
                        {total}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#87918E]">
                        Total
                    </p>
                </div>
            </div>

            {/* Stacked status bar */}
            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-[#EEF0ED]">
                <div className="h-full bg-[#A47D45]" style={{ width: `${pct(opened)}%` }} title={`Opened: ${opened}`} />
                <div className="h-full bg-[#9AADA6]" style={{ width: `${pct(other)}%` }} title={`Other stages: ${other}`} />
                <div className="h-full bg-[#56766D]" style={{ width: `${pct(closed)}%` }} title={`Closed - Done: ${closed}`} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
                <StatPill label="Opened" value={opened} dotClass="bg-[#A47D45]" />
                <StatPill label="In Progress" value={other} dotClass="bg-[#9AADA6]" />
                <StatPill label="Closed" value={closed} dotClass="bg-[#56766D]" />
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#ECEDEA] pt-3">
                <span className="text-[11px] font-medium text-[#7B8584]">Completion</span>
                <span className="rounded-full border border-[#CFE1D9] bg-[#EEF5F2] px-2.5 py-0.5 text-[10px] font-bold text-[#56766D]">
                    {completion}%
                </span>
            </div>
        </div>
    );
};

const UserDashboard = () => {
    const [dashboardData, setDashboardData] = useState({});
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // LIVE CLOCK moved to <LiveDate/> / <LiveTime/> (bottom of this file) so the
    // 1-second tick re-renders only the clock text, not every chart on the page.

    /* ============================================================
       FETCH – ONLY /user/dashboard-count
    ============================================================ */
    const fetchData = useCallback(async (isManual = false) => {
        if (isManual) setIsRefreshing(true);
        try {
            setLoading(true);

            const res = await getAllDashboardData();
            const data =
                res?.data?.data ??   // { success, message, data }
                res?.data ??
                {};

            setDashboardData(data && typeof data === "object" ? data : {});

            setLastUpdated(
                new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
        } catch (err) {
            console.error("Error fetching dashboard counts:", err);
            setDashboardData({});
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* AUTO REFRESH */
    useEffect(() => {
        if (!autoRefreshInterval || autoRefreshInterval <= 0) return;
        const t = setInterval(() => fetchData(), autoRefreshInterval * 1000);
        return () => clearInterval(t);
    }, [autoRefreshInterval, fetchData]);

    /* ============================================================
       RAW DATA SLICES
    ============================================================ */
    const instrumentMasters = dashboardData?.instrument_masters || {};
    const processRecords = Array.isArray(dashboardData?.process_records)
        ? dashboardData.process_records
        : EMPTY_RECORDS; // stable reference so the memos below don't recompute

    const masterCount = Number(instrumentMasters.master_instruments || 0);
    const fieldCount = Number(instrumentMasters.field_instruments || 0);
    const spareCount = Number(instrumentMasters.spare_instruments || 0);
    const equipmentCount = Number(instrumentMasters.equipment_master || 0);

    const totalInstruments = masterCount + fieldCount + spareCount + equipmentCount;
    const shareOf = (count) =>
        totalInstruments > 0
            ? `${((count / totalInstruments) * 100).toFixed(1)}% Share`
            : "0% Share";
    const totalProcesses = processRecords.length;

    const totalRecords = useMemo(
        () =>
            processRecords.reduce(
                (s, p) => s + (Number(p.total_records) || 0),
                0
            ),
        [processRecords]
    );

    const openRecords = useMemo(
        () =>
            processRecords.reduce(
                (s, p) => s + (Number(p.Opened_records) || 0),
                0
            ),
        [processRecords]
    );

    const closedRecords = useMemo(
        () =>
            processRecords.reduce(
                (s, p) => s + (Number(p["Closed - Done_records"]) || 0),
                0
            ),
        [processRecords]
    );

    const completionRatePercent =
        totalRecords > 0
            ? Math.round((closedRecords / totalRecords) * 100)
            : 0;

    const otherStageRecords = Math.max(0, totalRecords - openRecords - closedRecords);

    /* Per-process detail (total / opened / closed / other stages) */
    const processDetails = useMemo(
        () =>
            processRecords.map((p, i) => {
                const total = Number(p.total_records) || 0;
                const opened = Number(p.Opened_records) || 0;
                const closed = Number(p["Closed - Done_records"]) || 0;
                const other = Math.max(0, total - opened - closed);
                return {
                    id: p.process_id ?? i,
                    name: p.process_name || "—",
                    total,
                    opened,
                    closed,
                    other,
                    completion: total > 0 ? Math.round((closed / total) * 100) : 0,
                    share: totalRecords > 0 ? Math.round((total / totalRecords) * 100) : 0,
                    color: CHART_PALETTE[i % CHART_PALETTE.length],
                };
            }),
        [processRecords, totalRecords]
    );

    /* ============================================================
       CHART DATA
    ============================================================ */
    /* Process status – grouped bar (Opened vs Closed per process) */
    const processStatusData = useMemo(() => {
        if (!processRecords.length) {
            return [{ process: "No Data", opened: 0, closed: 0 }];
        }
        return processRecords.map((p) => ({
            process: p.process_name || "—",
            opened: Number(p.Opened_records) || 0,
            closed: Number(p["Closed - Done_records"]) || 0,
        }));
    }, [processRecords]);

    /* Process distribution – donut by total_records */
    const processDistributionData = useMemo(() => {
        if (!processRecords.length) return [];
        return processRecords.map((p, i) => ({
            name: p.process_name || "—",
            value: Number(p.total_records) || 0,
            fill: CHART_PALETTE[i % CHART_PALETTE.length],
        }));
    }, [processRecords]);

    /* Instrument masters – donut */
    const instrumentMastersData = useMemo(() => {
        const list = [
            { name: "Equipment Master", value: equipmentCount, fill: CHART_PALETTE[3] },
            { name: "Field Instruments", value: fieldCount, fill: CHART_PALETTE[1] },
            { name: "Master Instruments", value: masterCount, fill: CHART_PALETTE[0] },
            { name: "Spare Instruments", value: spareCount, fill: CHART_PALETTE[2] },
        ];
        const filtered = list.filter((x) => x.value > 0);
        return filtered.length ? filtered : [{ name: "No Data", value: 1, fill: "#D6D8D3" }];
    }, [masterCount, fieldCount, spareCount, equipmentCount]);

    /* Records volume – horizontal bar per process (desc) */
    const processVolumeData = useMemo(() => {
        if (!processRecords.length) {
            return [{ name: "No Data", count: 0 }];
        }
        return [...processRecords]
            .map((p) => ({
                name: p.process_name || "—",
                count: Number(p.total_records) || 0,
            }))
            .sort((a, b) => b.count - a.count);
    }, [processRecords]);

    /* ============================================================
       LOADING
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
                    <linearGradient id="barSageGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6C8B82" />
                        <stop offset="100%" stopColor="#56766D" />
                    </linearGradient>
                    <linearGradient id="barBronzeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#B3905C" />
                        <stop offset="100%" stopColor="#A47D45" />
                    </linearGradient>
                </defs>
            </svg>

            {/* =====================================================
                HEADER
            ====================================================== */}
            <div className="flex flex-col gap-4 border-b border-[#D6D8D3] pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C9D8D3] bg-[#E8F0ED] text-[#56766D]">
                            <LayoutDashboard size={18} strokeWidth={1.9} />
                        </div>
                        <div>
                            <h1 className="text-[23px] font-bold tracking-[-0.035em] text-[#243238]">
                                CMMS Dashboard
                            </h1>
                            <p className="mt-0.5 text-[11px] font-medium text-[#7B8584]">
                                Equipment, engineering and workflow overview
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 rounded-[12px] border border-[#D6D8D3] bg-[#F7F6F2] px-3.5 py-2 shadow-[0_2px_8px_rgba(36,50,56,0.035)]">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} strokeWidth={1.8} className="text-[#56766D]" />
                            <span className="text-[10.5px] font-semibold text-[#4F5E5D]">
                                <LiveDate />
                            </span>
                        </div>
                        <div className="h-5 w-px bg-[#D8DBD7]" />
                        <div className="flex items-center gap-2">
                            <Clock size={14} strokeWidth={1.8} className="animate-pulse text-[#A47D45]" />
                            <span className="font-mono text-[10.5px] font-bold tracking-wide text-[#243238]">
                                <LiveTime />
                            </span>
                        </div>
                    </div>

                    <RealTimeControls
                        lastUpdated={lastUpdated}
                        onRefresh={() => fetchData(true)}
                        isRefreshing={isRefreshing || loading}
                        autoRefreshInterval={autoRefreshInterval}
                        setAutoRefreshInterval={setAutoRefreshInterval}
                    />
                </div>
            </div>

            {/* =====================================================
                KPI CARDS
            ====================================================== */}
            <SectionTitle
                title="Instrument & Equipment Masters"
                subtitle="Registered assets across each master list"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                <KPICard
                    title="Equipment Master"
                    value={equipmentCount.toLocaleString("en-IN")}
                    subtext="Department equipment records"
                    icon={Factory}
                    trend={shareOf(equipmentCount)}
                    trendType={equipmentCount > 0 ? "up" : "neutral"}
                    delay={0.05}
                />

                <KPICard
                    title="Field Instruments"
                    value={fieldCount.toLocaleString("en-IN")}
                    subtext="Instruments installed in the field"
                    icon={Gauge}
                    trend={shareOf(fieldCount)}
                    trendType={fieldCount > 0 ? "up" : "neutral"}
                    delay={0.1}
                />

                <KPICard
                    title="Master Instruments"
                    value={masterCount.toLocaleString("en-IN")}
                    subtext="Reference / master instruments"
                    icon={Cpu}
                    trend={shareOf(masterCount)}
                    trendType={masterCount > 0 ? "up" : "neutral"}
                    delay={0.15}
                />

                <KPICard
                    title="Spare Instruments"
                    value={spareCount.toLocaleString("en-IN")}
                    subtext="Spare instruments in stock"
                    icon={Package}
                    trend={shareOf(spareCount)}
                    trendType={spareCount > 0 ? "up" : "neutral"}
                    delay={0.2}
                />
            </div>

            <SectionTitle
                title="Workflow Records"
                subtitle={`Combined status across ${totalProcesses} workflow processes`}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                <KPICard
                    title="Process Records"
                    value={totalRecords}
                    subtext={`${totalProcesses} Active Processes`}
                    icon={HardHat}
                    trend={`${totalRecords} Records`}
                    trendType="up"
                    delay={0.25}
                />

                <KPICard
                    title="Open Records"
                    value={openRecords}
                    subtext={`${otherStageRecords} more in other stages`}
                    icon={Activity}
                    trend={`${openRecords} Open`}
                    trendType={openRecords > 0 ? "up" : "neutral"}
                    delay={0.3}
                />

                <KPICard
                    title="Closed - Done"
                    value={closedRecords}
                    subtext="Records fully completed"
                    icon={ClipboardCheck}
                    trend={`${closedRecords} Closed`}
                    trendType={closedRecords > 0 ? "up" : "neutral"}
                    delay={0.35}
                />

                <KPICard
                    title="Completion Rate"
                    value={`${completionRatePercent}%`}
                    subtext={`${closedRecords} of ${totalRecords} Closed - Done`}
                    icon={CheckCircle2}
                    trend={completionRatePercent > 0 ? "Active Rate" : "Pending"}
                    trendType={completionRatePercent > 0 ? "up" : "neutral"}
                    delay={0.4}
                />
            </div>

            {/* =====================================================
                PROCESS BREAKDOWN – one detailed card per process
            ====================================================== */}
            <SectionTitle
                title="Process Breakdown"
                subtitle="Total, opened, closed and in-progress records for each process"
            />
            {processDetails.length === 0 ? (
                <div className="rounded-[18px] border border-[#D6D8D3] bg-white p-6 text-center text-[12px] font-medium text-[#7B8584]">
                    No process records available.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                    {processDetails.map((p) => (
                        <ProcessDetailCard key={p.id} process={p} />
                    ))}
                </div>
            )}

            {/* =====================================================
                ROW 1 – Process Status + Process Distribution
            ====================================================== */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* PROCESS STATUS – grouped horizontal bar */}
                <div className="lg:col-span-7">
                    <ChartCard
                        title="Process Records – Open vs Closed"
                        subtitle="Status volume per process from dashboard-count API"
                        icon={Layers}
                        badgeText={`${totalProcesses} Processes`}
                        minHeight="h-[400px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={processStatusData}
                                layout="vertical"
                                margin={{ top: 10, right: 40, left: 30, bottom: 5 }}
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
                                    dataKey="process"
                                    stroke={AXIS_COLOR}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    width={180}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(86,118,109,0.045)" }}
                                    contentStyle={{
                                        backgroundColor: "#FFFFFF",
                                        borderRadius: "12px",
                                        border: `1px solid ${TOOLTIP_BORDER}`,
                                        boxShadow: TOOLTIP_SHADOW,
                                        fontSize: "11px",
                                    }}
                                    labelStyle={{ color: "#243238", fontWeight: 700 }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={32}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: "10px", color: "#687571" }}
                                />
                                <Bar
                                    dataKey="opened"
                                    name="Opened"
                                    fill="#A47D45"
                                    radius={[0, 6, 6, 0]}
                                    barSize={14}
                                >
                                    <LabelList
                                        dataKey="opened"
                                        position="right"
                                        fill="#A47D45"
                                        fontSize={10}
                                        fontWeight={700}
                                    />
                                </Bar>
                                <Bar
                                    dataKey="closed"
                                    name="Closed - Done"
                                    fill="url(#barSageGrad)"
                                    radius={[0, 6, 6, 0]}
                                    barSize={14}
                                >
                                    <LabelList
                                        dataKey="closed"
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

                {/* PROCESS DISTRIBUTION – donut */}
                <div className="lg:col-span-5">
                    <ChartCard
                        title="Process Records Distribution"
                        subtitle="Share of total records per workflow process"
                        icon={FileText}
                        badgeText={`${totalProcesses} Processes`}
                        minHeight="h-[400px]"
                    >
                        <div className="relative h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart
                                    margin={{ top: 10, right: 8, bottom: 16, left: 8 }}
                                >
                                    <Pie
                                        data={
                                            processDistributionData.length
                                                ? processDistributionData
                                                : [{ name: "No Data", value: 1, fill: "#D6D8D3" }]
                                        }
                                        cx="50%"
                                        cy="47%"
                                        innerRadius={63}
                                        outerRadius={87}
                                        paddingAngle={4}
                                        cornerRadius={3}
                                        dataKey="value"
                                    >
                                        {(processDistributionData.length
                                            ? processDistributionData
                                            : [{ fill: "#D6D8D3" }]
                                        ).map((entry, index) => (
                                            <Cell
                                                key={`cell-proc-${index}`}
                                                fill={entry.fill}
                                                stroke="#FFFFFF"
                                                strokeWidth={3}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "12px",
                                            border: `1px solid ${TOOLTIP_BORDER}`,
                                            boxShadow: TOOLTIP_SHADOW,
                                            fontSize: "11px",
                                        }}
                                        labelStyle={{ color: "#243238", fontWeight: 700 }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        iconSize={7}
                                        wrapperStyle={{
                                            paddingTop: "8px",
                                            fontSize: "10px",
                                            color: "#6D7975",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                                <span className="text-[28px] font-bold leading-none tracking-[-0.04em] text-[#243238]">
                                    {totalRecords}
                                </span>
                                <span className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#87918E]">
                                    Total Records
                                </span>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>

            {/* =====================================================
                ROW 2 – Instrument Masters + Process Volume
            ====================================================== */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* INSTRUMENT MASTERS – donut */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Instrument Masters Composition"
                        subtitle="Equipment, Field, Master and Spare distribution"
                        icon={Cpu}
                        badgeText={`${totalInstruments} Instruments`}
                        minHeight="h-[360px]"
                    >
                        <div className="relative h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart
                                    margin={{ top: 10, right: 8, bottom: 15, left: 8 }}
                                >
                                    <Pie
                                        data={instrumentMastersData}
                                        cx="50%"
                                        cy="47%"
                                        innerRadius={59}
                                        outerRadius={81}
                                        paddingAngle={4}
                                        cornerRadius={3}
                                        dataKey="value"
                                    >
                                        {instrumentMastersData.map((entry, index) => (
                                            <Cell
                                                key={`cell-inst-${index}`}
                                                fill={entry.fill}
                                                stroke="#FFFFFF"
                                                strokeWidth={3}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "12px",
                                            border: `1px solid ${TOOLTIP_BORDER}`,
                                            boxShadow: TOOLTIP_SHADOW,
                                            fontSize: "11px",
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        iconSize={7}
                                        wrapperStyle={{ fontSize: "10px", color: "#6D7975" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                                <span className="text-[26px] font-bold leading-none tracking-[-0.04em] text-[#243238]">
                                    {totalInstruments.toLocaleString("en-IN")}
                                </span>
                                <span className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#87918E]">
                                    Total Assets
                                </span>
                            </div>
                        </div>
                    </ChartCard>
                </div>

                {/* PROCESS VOLUME – horizontal bar */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Records Volume by Process"
                        subtitle="Total records aggregated per process, sorted descending"
                        icon={BarChart2}
                        badgeText="Volume"
                        minHeight="h-[360px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={processVolumeData}
                                layout="vertical"
                                margin={{ top: 15, right: 40, left: 30, bottom: 2 }}
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
                                    width={180}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(86,118,109,0.04)" }}
                                    contentStyle={{
                                        backgroundColor: "#FFFFFF",
                                        borderRadius: "12px",
                                        border: `1px solid ${TOOLTIP_BORDER}`,
                                        boxShadow: TOOLTIP_SHADOW,
                                        fontSize: "11px",
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Total Records"
                                    fill="url(#barSageGrad)"
                                    radius={[0, 7, 7, 0]}
                                    barSize={22}
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
        </CustomScrollContainer>
    );
};

export default UserDashboard;