import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
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
    ListFilter
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
    LabelList
} from "recharts";
import { useNavigate } from "react-router-dom";

import { getAllEquipment } from "../../../services/usersApi/equipmentApi";
import { getAllRecords } from "../../../services/usersApi/calibrationApi";
import KPICard from "../../../components/common/Charts/KPICard";
import ChartCard from "../../../components/common/Charts/ChartCard";
import RealTimeControls from "../../../components/common/Charts/RealTimeControls";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const VIBRANT_PALETTE = [
    "#185B61",
    "#159A8C",
    "#0284C7",
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981"
];

const UserDashboard = () => {
    const navigate = useNavigate();
    const [equipmentList, setEquipmentList] = useState([]);
    const [engineeringRecords, setEngineeringRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(30);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timelineView, setTimelineView] = useState("monthly");
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    // Live Clock Timer
    useEffect(() => {
        const clockTimer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(clockTimer);
    }, []);

    // Formatted Date & Time Strings
    const formattedDate = useMemo(() => {
        return currentDateTime.toLocaleDateString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }, [currentDateTime]);

    const formattedTime = useMemo(() => {
        return currentDateTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
    }, [currentDateTime]);

    const fetchData = useCallback(async (isManual = false) => {
        if (isManual) setIsRefreshing(true);
        try {
            setLoading(true);
            const [equipRes, engRes] = await Promise.allSettled([
                getAllEquipment({ page: 1, per_page: 100 }),
                getAllRecords({ page: 1, per_page: 100 })
            ]);

            if (equipRes.status === "fulfilled") {
                const equipData = equipRes.value?.data?.data?.data || equipRes.value?.data?.data || [];
                setEquipmentList(Array.isArray(equipData) ? equipData : []);
            } else {
                setEquipmentList([]);
            }

            if (engRes.status === "fulfilled") {
                const engData = engRes.value?.data?.data?.data || engRes.value?.data?.data || [];
                setEngineeringRecords(Array.isArray(engData) ? engData : []);
            } else {
                setEngineeringRecords([]);
            }

            const now = new Date();
            setLastUpdated(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        } catch (err) {
            console.error("Error fetching dashboard analytics:", err);
            setEquipmentList([]);
            setEngineeringRecords([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh timer
    useEffect(() => {
        if (!autoRefreshInterval || autoRefreshInterval <= 0) return;
        const timer = setInterval(() => {
            fetchData();
        }, autoRefreshInterval * 1000);
        return () => clearInterval(timer);
    }, [autoRefreshInterval, fetchData]);

    // 100% Dynamic Aggregations from Live API Data

    // 1. Dynamic Process Distribution Breakdown (Calibration Planner vs Calibration Management, etc.)
    const processData = useMemo(() => {
        if (!engineeringRecords.length) return [];
        const counts = {};
        engineeringRecords.forEach((rec) => {
            const procName = rec.process?.name || "General Process";
            counts[procName] = (counts[procName] || 0) + 1;
        });
        const total = engineeringRecords.length;
        return Object.entries(counts).map(([name, value], index) => ({
            name,
            value,
            percent: Math.round((value / total) * 100),
            fill: VIBRANT_PALETTE[(index + 2) % VIBRANT_PALETTE.length]
        }));
    }, [engineeringRecords]);

    // 2. Dynamic Equipment Types Breakdown
    const equipmentTypeData = useMemo(() => {
        if (!equipmentList.length) return [];
        const counts = {};
        equipmentList.forEach((item) => {
            const type = item.equipment_type || "General Equipment";
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [equipmentList]);

    // 3. Dynamic Equipment Make/Manufacturer Share
    const equipmentMakeData = useMemo(() => {
        if (!equipmentList.length) return [];
        const counts = {};
        equipmentList.forEach((item) => {
            const make = item.make || "General Vendor";
            counts[make] = (counts[make] || 0) + 1;
        });
        const total = equipmentList.length;
        return Object.entries(counts)
            .map(([name, value]) => ({
                name,
                value,
                percent: Math.round((value / total) * 100)
            }))
            .sort((a, b) => b.value - a.value);
    }, [equipmentList]);

    // 4. Dynamic Engineering Stages Pipeline
    const engineeringStageData = useMemo(() => {
        if (!engineeringRecords.length) return [];
        const counts = {};
        engineeringRecords.forEach((rec) => {
            const stageName = rec.stage?.name || rec.stage || "Opened";
            counts[stageName] = (counts[stageName] || 0) + 1;
        });
        return Object.entries(counts).map(([stage, count], index) => ({
            stage,
            count,
            fill: VIBRANT_PALETTE[index % VIBRANT_PALETTE.length]
        }));
    }, [engineeringRecords]);

    // 5. Dynamic Department Breakdown
    const departmentData = useMemo(() => {
        if (!engineeringRecords.length) return [];
        const counts = {};
        engineeringRecords.forEach((rec) => {
            const dept = rec.department?.name || rec.initiationDepartment || "Engineering";
            counts[dept] = (counts[dept] || 0) + 1;
        });
        const total = engineeringRecords.length;
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            percent: Math.round((value / total) * 100)
        }));
    }, [engineeringRecords]);

    // 6. Dynamic Initiator Activity Volume
    const initiatorData = useMemo(() => {
        if (!engineeringRecords.length) return [];
        const counts = {};
        engineeringRecords.forEach((rec) => {
            const initName = rec.initiator?.name || "Initiator";
            counts[initName] = (counts[initName] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [engineeringRecords]);

    // 7. Recent Engineering Activity Stream
    const recentEngineeringRecords = useMemo(() => {
        if (!engineeringRecords.length) return [];
        return [...engineeringRecords]
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 5);
    }, [engineeringRecords]);

    // 8. Multi-Point Trajectory Timeline
    const timelineData = useMemo(() => {
        const now = new Date();

        if (timelineView === "daily") {
            const daysMap = {};
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const dayStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                daysMap[dayStr] = { month: dayStr, equipment: 0, records: 0 };
            }

            equipmentList.forEach((item) => {
                if (!item.created_at) return;
                const d = new Date(item.created_at);
                if (isNaN(d.getTime())) return;
                const dayStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                if (daysMap[dayStr]) daysMap[dayStr].equipment += 1;
            });

            engineeringRecords.forEach((item) => {
                const dateVal = item.created_at || item.dateOfInitiation;
                if (!dateVal) return;
                const d = new Date(dateVal);
                if (isNaN(d.getTime())) return;
                const dayStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                if (daysMap[dayStr]) daysMap[dayStr].records += 1;
            });

            return Object.values(daysMap);
        } else {
            const monthsMap = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(now.getMonth() - i);
                const monthStr = d.toLocaleDateString("en-US", { month: "short" });
                monthsMap[monthStr] = { month: monthStr, equipment: 0, records: 0 };
            }

            equipmentList.forEach((item) => {
                if (!item.created_at) return;
                const d = new Date(item.created_at);
                if (isNaN(d.getTime())) return;
                const monthStr = d.toLocaleDateString("en-US", { month: "short" });
                if (monthsMap[monthStr]) {
                    monthsMap[monthStr].equipment += 1;
                } else {
                    const currMonth = now.toLocaleDateString("en-US", { month: "short" });
                    if (monthsMap[currMonth]) monthsMap[currMonth].equipment += 1;
                }
            });

            engineeringRecords.forEach((item) => {
                const dateVal = item.created_at || item.dateOfInitiation;
                if (!dateVal) return;
                const d = new Date(dateVal);
                if (isNaN(d.getTime())) return;
                const monthStr = d.toLocaleDateString("en-US", { month: "short" });
                if (monthsMap[monthStr]) {
                    monthsMap[monthStr].records += 1;
                } else {
                    const currMonth = now.toLocaleDateString("en-US", { month: "short" });
                    if (monthsMap[currMonth]) monthsMap[currMonth].records += 1;
                }
            });

            return Object.values(monthsMap);
        }
    }, [equipmentList, engineeringRecords, timelineView]);

    // Dynamic Metrics
    const totalEquip = equipmentList.length;
    const totalRecords = engineeringRecords.length;
    const uniqueProcessesCount = processData.length;

    const completedRecordsCount = useMemo(() => {
        return engineeringRecords.filter((rec) => {
            const s = (rec.stage?.name || "").toLowerCase();
            return s.includes("complete") || s.includes("approve") || s.includes("close");
        }).length;
    }, [engineeringRecords]);

    const completionRatePercent = totalRecords > 0
        ? Math.round((completedRecordsCount / totalRecords) * 100)
        : 0;

    const activeStagesCount = useMemo(() => {
        return engineeringRecords.filter((rec) => {
            const s = (rec.stage?.name || "").toLowerCase();
            return !s.includes("close");
        }).length;
    }, [engineeringRecords]);

    const uniqueMakesCount = useMemo(() => new Set(equipmentList.map(e => e.make).filter(Boolean)).size, [equipmentList]);
    const uniqueTypesCount = useMemo(() => new Set(equipmentList.map(e => e.equipment_type).filter(Boolean)).size, [equipmentList]);

    const topDeptObj = useMemo(() => {
        if (!departmentData.length) return null;
        return [...departmentData].sort((a, b) => b.value - a.value)[0];
    }, [departmentData]);

    if (loading) {
        return (
            <div className="h-full overflow-y-auto pr-1 pb-12 space-y-6 bg-[#F7F9F8] p-4 sm:p-6">
                <Skeleton variant="dashboard" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto pr-1 pb-12 space-y-6 bg-[#F7F9F8]">
            {/* SVG GRADIENTS */}
            <svg style={{ height: 0, width: 0, position: "absolute" }}>
                <defs>
                    <linearGradient id="areaEquipGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#185B61" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#185B61" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="areaRecordGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="barTealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#159A8C" />
                        <stop offset="100%" stopColor="#185B61" />
                    </linearGradient>
                    <linearGradient id="barBlueGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id="barIndigoGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                </defs>
            </svg>

            {/* DASHBOARD HEADER & LIVE SYNC CONTROLS */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                            CMMS Dashboard
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* LIVE DATE & TICKS CLOCK BADGE */}
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-1.5 shadow-2xs backdrop-blur-xs text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5 text-[#185B61] pr-2.5 border-r border-slate-200">
                            <Calendar size={14} className="text-teal-600" />
                            <span className="font-semibold text-slate-800">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                            <Clock size={14} className="text-teal-600 animate-pulse" />
                            <span className="font-mono font-bold text-slate-900 tracking-wide">{formattedTime}</span>
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

            {/* TOP SUMMARY KPI METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <KPICard
                    title="Total Equipment Assets"
                    value={totalEquip}
                    subtext={uniqueTypesCount ? `${uniqueTypesCount} Asset Categories` : "Equipment API"}
                    icon={Wrench}
                    trend={`${totalEquip} Assets`}
                    trendType="up"
                    gradient="from-teal-600 to-emerald-500"
                    bgColor="bg-teal-50"
                    iconColor="text-[#185B61]"
                    delay={0.05}
                />
                <KPICard
                    title="Engineering Records"
                    value={totalRecords}
                    subtext={uniqueProcessesCount ? `${uniqueProcessesCount} Active Processes` : "Engineering API"}
                    icon={HardHat}
                    trend={`${totalRecords} Records`}
                    trendType="up"
                    gradient="from-blue-600 to-indigo-500"
                    bgColor="bg-blue-50"
                    iconColor="text-blue-700"
                    delay={0.1}
                />
                <KPICard
                    title="Active Workflow Tasks"
                    value={activeStagesCount}
                    subtext="Tasks in active execution"
                    icon={Activity}
                    trend={`${activeStagesCount} Active`}
                    trendType="neutral"
                    gradient="from-amber-500 to-orange-500"
                    bgColor="bg-amber-50"
                    iconColor="text-amber-700"
                    delay={0.15}
                />
                <KPICard
                    title="Process Completion Rate"
                    value={`${completionRatePercent}%`}
                    subtext={`${completedRecordsCount} of ${totalRecords} Closed`}
                    icon={CheckCircle2}
                    trend={completionRatePercent > 0 ? "Active Rate" : "Pending"}
                    trendType={completionRatePercent > 0 ? "up" : "neutral"}
                    gradient="from-emerald-500 to-teal-500"
                    bgColor="bg-emerald-50"
                    iconColor="text-emerald-700"
                    delay={0.2}
                />
            </div>

            {/* ROW 1: GROWTH VELOCITY & PROCESS WORKFLOW DISTRIBUTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. TIMELINE OVERVIEW (AREA CHART) - 7 COLS */}
                <div className="lg:col-span-7">
                    <ChartCard
                        title="Equipment & Engineering Growth Velocity"
                        subtitle="Continuous trajectory sequence comparing onboarding vs engineering tasks"
                        icon={TrendingUp}
                        badgeText="Live API Timeline"
                        minHeight="h-[400px]"
                        action={
                            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-semibold text-slate-600">
                                <button
                                    type="button"
                                    onClick={() => setTimelineView("monthly")}
                                    className={`rounded-md px-2.5 py-0.5 transition-all cursor-pointer ${
                                        timelineView === "monthly" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                                    }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTimelineView("daily")}
                                    className={`rounded-md px-2.5 py-0.5 transition-all cursor-pointer ${
                                        timelineView === "daily" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                                    }`}
                                >
                                    Last 7 Days
                                </button>
                            </div>
                        }
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData} margin={{ top: 20, right: 25, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748B" fontSize={12} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#FFFFFF",
                                        borderRadius: "12px",
                                        border: "1px solid #E2E8F0",
                                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                                    }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area
                                    type="monotone"
                                    dataKey="equipment"
                                    name="Equipment Assets"
                                    stroke="#185B61"
                                    strokeWidth={3}
                                    activeDot={{ r: 6, stroke: "#185B61", strokeWidth: 2, fill: "#FFF" }}
                                    fillOpacity={1}
                                    fill="url(#areaEquipGrad)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="records"
                                    name="Engineering Records"
                                    stroke="#0284C7"
                                    strokeWidth={3}
                                    activeDot={{ r: 6, stroke: "#0284C7", strokeWidth: 2, fill: "#FFF" }}
                                    fillOpacity={1}
                                    fill="url(#areaRecordGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* 2. PROCESS WORKFLOW DISTRIBUTION (DONUT CHART WITH CENTER OVERLAY) - 5 COLS */}
                <div className="lg:col-span-5">
                    <ChartCard
                        title="CMMS Process Workflow Breakdown"
                        subtitle="Distribution by process (Calibration Planner vs Management)"
                        icon={FileText}
                        badgeText={`${uniqueProcessesCount} Processes`}
                        minHeight="h-[400px]"
                    >
                        <div className="relative h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 15, right: 10, bottom: 15, left: 10 }}>
                                    <Pie
                                        data={processData.length ? processData : [{ name: "No Data", value: 1 }]}
                                        cx="50%"
                                        cy="48%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {processData.map((entry, index) => (
                                            <Cell
                                                key={`cell-proc-${index}`}
                                                fill={entry.fill}
                                                stroke="#FFF"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                                    />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* CENTER STAT OVERLAY INSIDE PROCESS DONUT */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                                <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">
                                    {totalRecords}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Total Processes
                                </span>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>

            {/* ROW 2: STAGE PIPELINE & EQUIPMENT TYPES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 3. ENGINEERING STAGE PIPELINE (BAR CHART) - 6 COLS */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Engineering Record Stage Pipeline"
                        subtitle="Task volume distribution across workflow stages from Engineering API"
                        icon={Layers}
                        badgeText="Workflow Stages"
                        minHeight="h-[360px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engineeringStageData} margin={{ top: 25, right: 15, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="stage" stroke="#64748B" fontSize={11} tickLine={false} />
                                <YAxis stroke="#64748B" fontSize={12} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: "rgba(24, 91, 97, 0.05)" }}
                                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                                />
                                <Bar dataKey="count" name="Records" radius={[8, 8, 0, 0]} barSize={34}>
                                    {engineeringStageData.map((entry, index) => (
                                        <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                                    ))}
                                    <LabelList dataKey="count" position="top" fill="#475569" fontSize={11} fontWeight={700} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* 4. EQUIPMENT BY TYPE (BAR CHART WITH GRADIENTS) - 6 COLS */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Equipment Classification & Types"
                        subtitle="Count of equipment grouped by operational category"
                        icon={BarChart2}
                        badgeText="Category Specs"
                        minHeight="h-[360px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={equipmentTypeData} layout="vertical" margin={{ top: 15, right: 30, left: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" stroke="#64748B" fontSize={12} tickLine={false} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                                />
                                <Bar dataKey="count" name="Equipment Assets" fill="url(#barBlueGrad)" radius={[0, 8, 8, 0]} barSize={22}>
                                    <LabelList dataKey="count" position="right" fill="#0284C7" fontSize={11} fontWeight={700} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>

            {/* ROW 3: DEPARTMENT DISTRIBUTION & INITIATOR VOLUME */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 5. DEPARTMENTAL SHARE (DONUT CHART WITH OVERLAY) - 6 COLS */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Departmental Initiation Share"
                        subtitle="Distribution of engineering records initiated by department"
                        icon={Building2}
                        badgeText="Department Ratio"
                        minHeight="h-[350px]"
                    >
                        <div className="relative h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 15, right: 10, bottom: 15, left: 10 }}>
                                    <Pie
                                        data={departmentData.length ? departmentData : [{ name: "No Data", value: 1 }]}
                                        cx="50%"
                                        cy="48%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell
                                                key={`cell-dept-${index}`}
                                                fill={VIBRANT_PALETTE[(index + 3) % VIBRANT_PALETTE.length]}
                                                stroke="#FFF"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                                <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">
                                    {departmentData.length}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Depts
                                </span>
                            </div>
                        </div>
                    </ChartCard>
                </div>

                {/* 6. INITIATOR VOLUME (HORIZONTAL BAR CHART) - 6 COLS */}
                <div className="lg:col-span-6">
                    <ChartCard
                        title="Record Initiation Volume by User"
                        subtitle="Count of engineering records initiated per user"
                        icon={User}
                        badgeText="User Initiations"
                        minHeight="h-[350px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={initiatorData} layout="vertical" margin={{ top: 15, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" stroke="#64748B" fontSize={12} tickLine={false} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                                />
                                <Bar dataKey="count" name="Initiated Records" fill="url(#barIndigoGrad)" radius={[0, 8, 8, 0]} barSize={22}>
                                    <LabelList dataKey="count" position="right" fill="#4F46E5" fontSize={11} fontWeight={700} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;