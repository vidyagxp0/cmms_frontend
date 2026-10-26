import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Workflow } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { getAllProcess } from "../../../services/usersApi/processlistApi";

const ProcessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processName, setProcessName] = useState("");

    const { sourceType } = location.state || {};

    useEffect(() => {
        let isMounted = true;

        const fetchAndRedirect = async () => {
            setLoading(true);
            setError("");

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

                // Filter based on sourceType
                if (sourceType === "engineering") {
                    filteredProcesses = filteredProcesses.filter(
                        (process) =>
                            process.name?.toLowerCase() === "calibration planner"
                    );
                } else if (sourceType === "preventive") {
                    filteredProcesses = filteredProcesses.filter(
                        (process) =>
                            process.name?.toLowerCase() ===
                            "preventive maintenance planner"
                    );
                } else if (sourceType === "field-instrument-planner") {
                    filteredProcesses = filteredProcesses.filter(
                        (process) =>
                            process.name?.toLowerCase() ===
                            "field instrument planner"
                    );
                } else if (sourceType === "instrument-calibration") {
                    filteredProcesses = filteredProcesses.filter(
                        (process) =>
                            process.name?.toLowerCase() ===
                            "field instrument calibration addendum"
                    );
                }

                if (filteredProcesses.length === 0) {
                    if (isMounted) {
                        setError(
                            "No matching process found for this action. Please contact your administrator."
                        );
                        setLoading(false);
                    }
                    return;
                }

                const targetProcess = filteredProcesses[0];

                if (isMounted) {
                    setProcessName(targetProcess.name);
                }

                // Small delay so user sees the loader gracefully
                setTimeout(() => {
                    if (!isMounted) return;

                    switch (sourceType) {
                        case "engineering":
                            navigate(
                                `/user/calibration-planner-create/${targetProcess.id}`
                            );
                            break;
                        case "preventive":
                            navigate(
                                `/user/preventive-maintenance-planner-create/${targetProcess.id}`
                            );
                            break;
                        case "field-instrument-planner":
                            navigate(
                                `/user/field-instrument-planner-create/${targetProcess.id}`
                            );
                            break;
                        case "instrument-calibration":
                            navigate(
                                `/user/field-instrument-calibration-addendum-create/${targetProcess.id}`
                            );
                            break;
                        default:
                            if (isMounted) {
                                setError(
                                    "Invalid source type specified. Please try again."
                                );
                                setLoading(false);
                            }
                    }
                }, 800);
            } catch (err) {
                console.error("Failed to fetch processes:", err);
                if (isMounted) {
                    setError("Unable to load processes. Please try again.");
                    setLoading(false);
                }
            }
        };

        fetchAndRedirect();

        return () => {
            isMounted = false;
        };
    }, [sourceType, navigate]);

    // ─── LOADING STATE ───
    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-74px)] w-full items-center justify-center bg-[var(--color-background)] px-4 py-6">
                <div className="flex w-full max-w-[440px] flex-col items-center justify-center rounded-[17px] border border-[#CFDCD6] bg-white px-10 py-12 text-center shadow-[0_14px_40px_rgba(35,55,47,0.09)]">
                    <div className="relative mb-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C9D9D3] bg-[#E7EFEB] text-[#486A5E] shadow-[0_4px_14px_rgba(65,104,92,0.10)]">
                            <Workflow size={26} strokeWidth={1.8} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#244F4A] text-white shadow-md">
                            <Loader2 size={13} className="animate-spin" />
                        </div>
                    </div>

                    <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#84918B]">
                        Preparing Workspace
                    </p>

                    <h2 className="mt-2 text-[17px] font-bold tracking-[-0.02em] text-[#263B35]">
                        {processName
                            ? `Redirecting to ${processName}`
                            : "Fetching Process..."}
                    </h2>

                    <p className="mt-2 max-w-[280px] text-[11px] leading-[1.55] text-[#8D9A94]">
                        {processName
                            ? "Please wait while we open the record form for you."
                            : "Setting up the right process for your action."}
                    </p>

                    <div className="mt-7 flex gap-1.5">
                        <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A47D45]"
                            style={{ animationDelay: "0ms" }}
                        />
                        <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A47D45]"
                            style={{ animationDelay: "150ms" }}
                        />
                        <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A47D45]"
                            style={{ animationDelay: "300ms" }}
                        />
                    </div>

                    <div className="mt-7 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-[#EEF3F0]">
                        <div
                            className="h-full rounded-full bg-[#244F4A]"
                            style={{
                                width: processName ? "85%" : "45%",
                                transition: "width 700ms ease",
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ─── ERROR STATE ───
    return (
        <div className="flex min-h-[calc(100vh-74px)] w-full items-center justify-center bg-[var(--color-background)] px-4 py-6">
            <div className="flex w-full max-w-[420px] flex-col items-center justify-center rounded-[17px] border border-[#CFDCD6] bg-white px-10 py-12 text-center shadow-[0_14px_40px_rgba(35,55,47,0.09)]">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[#E4D5D4] bg-[#FBF3F2] text-[#A75C59]">
                    <AlertCircle size={23} strokeWidth={1.7} />
                </div>

                <p className="mt-4 text-[14px] font-bold text-[#4A5752]">
                    Unable to start record
                </p>

                <p className="mt-1.5 max-w-[280px] text-[10.5px] leading-[1.55] text-[#909B96]">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-6 rounded-[9px] border border-[#CADBD3] bg-[#EEF4F1] px-5 py-2.5 text-[11px] font-bold text-[#537166] transition-all hover:bg-[#E5EFEA]"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default ProcessPage;