import React, { useEffect, useState, useMemo } from "react";
import { X, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Select } from "antd";
import dayjs from "dayjs";

import {
    getAllCalibrationPlannerRecords,
    getAllCalibrationManagementRecords,
    getAllPreventivePlanner,
    getAllPreventiveManagementRecords,
} from "../../services/usersApi/dashboardAllApi";

// Extract record number helper
const getRecordNo = (item) =>
    item.record_number ||
    (Array.isArray(item.process_data) &&
        item.process_data.find((p) => p?.key === "recordNumber" || p?.key === "record_number")?.value) ||
    `#${item.id}`;

// Process options (starts with All Processes, followed by the 4 processes)
const PROCESS_OPTIONS = [
    { label: "All Processes", value: "All" },
    { label: "Calibration Planner", value: "Calibration Planner" },
    { label: "Calibration Management", value: "Calibration Management" },
    { label: "Preventive Planner", value: "Preventive Planner" },
    { label: "Preventive Maintenance", value: "Preventive Maintenance" },
];

const NotificationPopup = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProcess, setSelectedProcess] = useState("All");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const results = await Promise.allSettled([
                    getAllCalibrationPlannerRecords({ page: 1, per_page: 20 }),
                    getAllCalibrationManagementRecords({ page: 1, per_page: 20 }),
                    getAllPreventivePlanner({ page: 1, per_page: 20 }),
                    getAllPreventiveManagementRecords({ page: 1, per_page: 20 }),
                ]);

                const modules = [
                    { list: results[0], name: "Calibration Planner", prefix: "calib-plan" },
                    { list: results[1], name: "Calibration Management", prefix: "calib-mgmt" },
                    { list: results[2], name: "Preventive Planner", prefix: "prev-plan" },
                    { list: results[3], name: "Preventive Maintenance", prefix: "prev-mgmt" },
                ];

                const combined = modules.flatMap(({ list, name, prefix }) => {
                    const items = list.status === "fulfilled" ? list.value?.data?.data?.data || [] : [];
                    return items.map((item) => {
                        const date = item.updated_at || item.created_at;
                        return {
                            id: `${prefix}-${item.id}`,
                            recordNumber: getRecordNo(item),
                            processName: name,
                            processTitle: item.process?.name || name,
                            stage: item.stage?.name || item.stage || "Closed - Done",
                            date: date ? dayjs(date).format("DD MMM YYYY, hh:mm A") : "-",
                            rawDate: date,
                        };
                    });
                });

                const closed = combined
                    .filter((i) => {
                        const s = String(i.stage).toLowerCase();
                        return s === "closed - done" || (s.includes("closed") && s.includes("done"));
                    })
                    .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

                setNotifications(closed);
            } catch {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filtered = useMemo(
        () => (selectedProcess === "All" ? notifications : notifications.filter((n) => n.processName === selectedProcess)),
        [notifications, selectedProcess]
    );

    return (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[350px] sm:w-[390px] rounded-xl border border-[#D6D8D3] bg-[#FBFBFA] shadow-[0_12px_32px_rgba(36,50,56,0.14)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E3E5E0] bg-[#F4F3EE] px-4 py-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#2F3D39]">Closed Activities</h3>
                    <span className="rounded-full bg-[#4B6F66]/10 px-2 py-0.5 text-[11px] font-medium text-[#4B6F66]">
                        {filtered.length}
                    </span>
                </div>
                {onClose && (
                    <button type="button" onClick={onClose} className="rounded-md p-1 text-[#596965] hover:bg-[#EAEBE6] transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Filter Bar using AntD Select (ALWAYS opens downwards like first image) */}
            <div className="flex items-center justify-between gap-2 border-b border-[#EAEBE6] bg-[#FAF9F5] px-4 py-2">
                <span className="shrink-0 text-[11px] font-semibold text-[#5B6E67]">Process:</span>
                <Select
                    size="small"
                    value={selectedProcess}
                    onChange={setSelectedProcess}
                    options={PROCESS_OPTIONS}
                    style={{ width: "210px" }}
                    popupMatchSelectWidth={true}
                    placement="bottomRight"
                    dropdownAlign={{ overflow: { adjustY: false } }}
                    popupAlign={{ overflow: { adjustY: false } }}
                    className="!w-[210px] shrink-0 text-[11.5px]"
                />
            </div>

            {/* Content List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#EAEBE6]">
                {loading ? (
                    <div className="flex items-center justify-center p-8 text-sm text-[#7D8A86]">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#4B6F66]" /> Loading closed activities...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-6 text-center text-sm text-[#7D8A86]">No closed activities found</div>
                ) : (
                    filtered.map((item) => (
                        <div key={item.id} className="p-3.5 transition-colors hover:bg-[#F2F1EC]">
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center rounded border border-[#D5E0DB] bg-[#F0F5F2] px-2 py-0.5 font-mono text-[11px] font-bold text-[#536D64]">
                                    {item.recordNumber}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10.5px] font-semibold text-red-700">
                                    <CheckCircle2 size={11} /> {item.stage}
                                </span>
                            </div>

                            <p className="mt-1.5 text-xs font-semibold text-[#2F3D39] leading-snug">{item.processTitle || item.processName}</p>

                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#7D8A86]">
                                <Clock size={11} className="text-[#8C9894]" />
                                <span className="font-medium tracking-tight">{item.date}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPopup;
