import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

const SessionTimer = () => {
    const user = useAuthStore((state) => state.user);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const token = sessionStorage.getItem("admin_token") || sessionStorage.getItem("user_token");
        if (!token) {
            setElapsedSeconds(0);
            return;
        }

        let startTime = sessionStorage.getItem("session_start_time");
        if (!startTime) {
            startTime = String(Date.now());
            sessionStorage.setItem("session_start_time", startTime);
        }

        setElapsedSeconds(Math.floor((Date.now() - Number(startTime)) / 1000));

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - Number(startTime)) / 1000);
            setElapsedSeconds(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [user]);

    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return [
            String(hrs).padStart(2, "0"),
            String(mins).padStart(2, "0"),
            String(secs).padStart(2, "0")
        ].join(":");
    };

    if (!user) return null;

    return (
        <div className="flex h-[38px] items-center gap-2.5 rounded-[10px] border border-[#CBE3D6] bg-white px-3.5 text-[12.5px] font-semibold text-[#152C20]">
            <div className="relative flex h-5 w-5 items-center justify-center">
                <Timer size={16} className="text-[#5C7A6C]" />
                <span
                    className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full border border-white animate-pulse"
                    style={{ background: "#1F8A5F" }}
                />
            </div>
            <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
        </div>
    );
};

export default SessionTimer;
