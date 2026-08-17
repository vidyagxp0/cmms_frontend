import React,{useState,useEffect,useRef} from "react";
import { Bell,ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import ProfileMenu from "./ProfileMenu";

const AdminHeader=({
    userName="Admin",
    userRole="Administrator",
    notificationCount=3,
})=>{
    const [showProfile,setShowProfile]=useState(false);
    const dropdownRef=useRef(null);

    /* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */
    useEffect(()=>{
        const handleClickOutside=(event)=>{
            if(dropdownRef.current&&!dropdownRef.current.contains(event.target)){
                setShowProfile(false);
            }
        };

        document.addEventListener("mousedown",handleClickOutside);
        return()=>document.removeEventListener("mousedown",handleClickOutside);
    },[]);

    /* USER INITIAL */
    const initial=userName?.charAt(0)?.toUpperCase()||"A";

    return(
<header className="fixed top-0 right-0 z-50 h-[72px] w-full overflow-visible bg-gradient-to-r from-[#082943] via-[#0b3858] to-[#0b4969] shadow-md">
            {/* HEADER DECORATIVE LAYER */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* ANIMATIONS */}
                <style>{`
                    @keyframes vgxp-drift-a{
                        0%,100%{transform:translate(-6%,-12%) scale(1);}
                        50%{transform:translate(4%,6%) scale(1.15);}
                    }
                    @keyframes vgxp-drift-b{
                        0%,100%{transform:translate(8%,10%) scale(1);}
                        50%{transform:translate(-4%,-8%) scale(1.2);}
                    }
                    @keyframes vgxp-breathe{
                        0%,100%{opacity:1;transform:scale(1);}
                        50%{opacity:0.5;transform:scale(0.8);}
                    }
                    @keyframes vgxp-scan{
                        0%{transform:translateX(-100%);}
                        100%{transform:translateX(220%);}
                    }
                    @keyframes vgxp-gauge-draw{
                        from{stroke-dashoffset:100.5;}
                        to{stroke-dashoffset:22;}
                    }
                    .vgxp-glow-a{
                        animation:vgxp-drift-a 14s ease-in-out infinite;
                    }
                    .vgxp-glow-b{
                        animation:vgxp-drift-b 18s ease-in-out infinite;
                    }
                    .vgxp-status-dot{
                        animation:vgxp-breathe 2.4s ease-in-out infinite;
                    }
                    .vgxp-scan-line{
                        animation:vgxp-scan 6s linear infinite;
                    }
                    .vgxp-gauge-arc{
                        animation:vgxp-gauge-draw 1.1s cubic-bezier(0.16,1,0.3,1) forwards;
                    }
                    @media (prefers-reduced-motion:reduce){
                        .vgxp-glow-a,.vgxp-glow-b,.vgxp-status-dot,.vgxp-scan-line,.vgxp-gauge-arc{
                            animation:none!important;
                        }
                    }
                `}</style>
                {/* BASE SCRIM */}
                <div className="absolute inset-0 bg-[#0B2A4A]/10"/>
            </div>

            {/* MAIN HEADER CONTENT */}
            <div className="relative z-10 flex h-full items-center justify-between px-5 lg:px-7">
                {/* LEFT SECTION */}
                <div className="flex min-w-0 items-center gap-4">
                    {/* VidyaGxp Icon */}
                    <img
                        src="/vidyagxp_icon_transparent.png"
                        alt="VidyaGxp"
                        className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
                    />

                    {/* Brand Information */}
                    <div className="hidden min-w-0 items-center gap-3 border-l border-white/20 pl-4 sm:flex">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-[16px] font-bold tracking-tight text-white drop-shadow-sm"
                                    style={{fontFamily:"'Space Grotesk','Manrope',sans-serif"}}
                                >
                                    Vidya
                                    <span style={{color:"#F5B84B"}}>GxP</span>
                                </span>

                                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#F5D9A8] ring-1 ring-white/20">
                                    CMMS
                                </span>
                            </div>

                            <p className="truncate text-[9px] text-white/60">
                                Data Informs, Wisdom Discerns.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex shrink-0 items-center gap-1.5">
                    {/* NOTIFICATIONS */}
                    <button
                        type="button"
                        aria-label={`Notifications (${notificationCount} unread)`}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-all duration-200 hover:bg-white/12 hover:text-white"
                    >
                        <Bell size={19} strokeWidth={1.8}/>

                        {notificationCount>0&&(
                            <span className="absolute right-[7px] top-[6px] flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#12A594] bg-[#F5B84B] px-0.5 text-[8px] font-bold text-[#0B2A4A]">
                                {notificationCount>9?"9+":notificationCount}
                            </span>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="mx-1 h-8 w-px bg-white/20"/>

                    {/* USER PROFILE */}
                    <div className="relative" ref={dropdownRef}>
                        {/* Profile Button */}
                        <button
                            type="button"
                            onClick={()=>setShowProfile(value=>!value)}
                            aria-expanded={showProfile}
                            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-white/12"
                        >
                            {/* Calibration Gauge Avatar */}
                            <div className="relative h-10 w-10 shrink-0">
                                <svg
                                    viewBox="0 0 40 40"
                                    className="absolute inset-0 h-full w-full -rotate-90"
                                >
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="16"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.25)"
                                        strokeWidth="1.6"
                                    />

                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="16"
                                        fill="none"
                                        stroke="#F5B84B"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeDasharray="100.5"
                                        className="vgxp-gauge-arc"
                                    />
                                </svg>

                                <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-white/95 text-[12px] font-bold text-[#0F3A63] shadow-sm">
                                    {initial}
                                </div>
                            </div>

                            {/* User Information */}
                            <div className="hidden text-left sm:block">
                                <p className="text-[11px] font-bold leading-tight text-white">
                                    {userName}
                                </p>

                                <p className="mt-0.5 text-[9px] text-white/60">
                                    {userRole}
                                </p>
                            </div>

                            {/* Chevron */}
                            <ChevronDown
                                size={14}
                                className={`hidden text-white/60 transition-transform duration-200 sm:block ${
                                    showProfile?"rotate-180":""
                                }`}
                            />
                        </button>

                        {/* REUSABLE PROFILE MENU */}
                        <ProfileMenu
                            isOpen={showProfile}
                            userName={userName}
                            userRole={userRole}
                            onProfile={()=>{
                                console.log("Profile clicked");
                                setShowProfile(false);
                            }}
                            onSettings={()=>{
                                console.log("Settings clicked");
                                setShowProfile(false);
                            }}
                            onLogout={()=>{
                                console.log("Logout clicked");
                                setShowProfile(false);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* GOLD QA / COMPLIANCE SCAN LINE */}
            <div className="absolute bottom-0 left-0 z-20 h-[2px] w-full overflow-hidden">
                <div
                    className="vgxp-scan-line h-full w-1/4"
                    style={{
                        background:"linear-gradient(90deg,transparent,rgba(245,184,75,0.85),transparent)",
                    }}
                />
            </div>
        </header>
    );
};

export default AdminHeader;