import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    FileText,
    Settings,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    ShieldCheck,
} from "lucide-react";

const AdminSidebar = ({ collapsed, setCollapsed }) => {
    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/admin/dashboard",
        },
         {
            label: "Department Management",
            icon: Settings,
            path: "/admin/department-management",
        },
         {
            label: "Role Management",
            icon: ClipboardList,
            path: "/admin/roles-management",
        },
        {
            label: "Users Management",
            icon: Users,
            path: "/admin/users-management",
        },
        {
            label: "Audit History",
            icon: FileText,
            path: "/admin/audit-history",
        },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-visible border-r border-white/[0.07] bg-[#121a16] text-white shadow-[8px_0_30px_rgba(0,0,0,0.18)] transition-[width] duration-300 ease-out ${
                collapsed ? "w-[65px]" : "w-[230px]"
            }`}
        >
            {/* BRAND */}
            <div
                className={`relative flex h-[72px] shrink-0 items-center gap-3 ${
                    collapsed ? "justify-center px-3" : "px-5"
                }`}
            >
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border"
                    style={{
                        background: "rgba(31,138,95,0.14)",
                        borderColor: "rgba(31,138,95,0.35)",
                    }}
                >
                    <ShieldCheck size={18} strokeWidth={2} className="text-[#4FBE8B]" />
                </div>

                <div className="absolute bottom-0 left-5 right-5 h-px bg-white/[0.08]" />
            </div>

            {/* NAVIGATION */}
            <nav
                className={`flex-1 py-6 ${
                    collapsed
                        ? "overflow-visible px-3"
                        : "overflow-x-hidden overflow-y-auto px-3.5"
                }`}
            >

                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className="group relative">
                                <NavLink
                                    to={item.path}
                                    end
                                    className={({ isActive }) =>
                                        `relative flex items-center rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                                            collapsed
                                                ? "h-[46px] justify-center"
                                                : "gap-3 px-3.5 py-2.5"
                                        } ${
                                            isActive
                                                ? "text-[#F2F7F4]"
                                                : "text-[#B7CBC0] hover:bg-white/[0.045] hover:text-[#F2F7F4]"
                                        }`
                                    }
                                    style={({ isActive }) => ({
                                        background: isActive
                                            ? "rgba(31,138,95,0.14)"
                                            : "transparent",
                                        boxShadow: isActive
                                            ? "inset 0 0 0 1px rgba(79,190,139,0.20)"
                                            : "none",
                                    })}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {/* ACTIVE INDICATOR */}
                                            {isActive && (
                                                <span
                                                    className="absolute left-0 top-1/2 h-6 w-[2.5px] -translate-y-1/2 rounded-r-full"
                                                    style={{ background: "#4FBE8B" }}
                                                />
                                            )}

                                            {/* ICON */}
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                    isActive ? "" : "group-hover:bg-white/[0.05]"
                                                }`}
                                                style={
                                                    isActive
                                                        ? { background: "rgba(79,190,139,0.16)" }
                                                        : undefined
                                                }
                                            >
                                                <Icon
                                                    size={18}
                                                    strokeWidth={isActive ? 2 : 1.75}
                                                    className={
                                                        isActive
                                                            ? "text-[#4FBE8B]"
                                                            : "text-[#7FA391] group-hover:text-[#B7CBC0]"
                                                    }
                                                />
                                            </span>

                                            {/* LABEL */}
                                            <span
                                                className={`min-w-0 flex-1 transition-all duration-200 ${
                                                    collapsed
                                                        ? "pointer-events-none w-0 overflow-hidden opacity-0"
                                                        : "opacity-100"
                                                }`}
                                            >
                                                <span
                                                    className={`block truncate leading-tight ${
                                                        isActive ? "font-bold" : "font-medium"
                                                    }`}
                                                >
                                                    {item.label}
                                                </span>
                                            </span>

                                            {/* ACTIVE CHEVRON */}
                                            {!collapsed && isActive && (
                                                <ChevronRight
                                                    size={14}
                                                    strokeWidth={1.8}
                                                    className="shrink-0 text-[#4FBE8B]/60"
                                                />
                                            )}
                                        </>
                                    )}
                                </NavLink>

                                {/* COLLAPSED TOOLTIP */}
                                {collapsed && (
                                    <div className="pointer-events-none fixed left-[88px] z-[9999] -translate-x-[6px] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#132420] px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                                        {item.label}
                                        <span className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-white/[0.08] bg-[#132420]" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* COLLAPSE / EXPAND */}
            <div className="shrink-0 border-t border-white/[0.07] p-3">
                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    className={`group relative flex h-[46px] w-full items-center rounded-[10px] border border-white/[0.07] bg-white/[0.035] text-[#8FA79B] transition-all duration-200 hover:border-[#4FBE8B]/30 hover:bg-white/[0.06] hover:text-[#F2F7F4] ${
                        collapsed ? "justify-center" : "gap-3 px-3.5"
                    }`}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {/* ICON */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                        {collapsed ? (
                            <PanelLeftOpen size={18} strokeWidth={1.8} />
                        ) : (
                            <PanelLeftClose size={18} strokeWidth={1.8} />
                        )}
                    </span>

                    {/* LABEL */}
                    <span
                        className={`whitespace-nowrap text-[12px] font-medium transition-all duration-200 ${
                            collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
                        }`}
                    >
                        Collapse sidebar
                    </span>

                    {/* COLLAPSED TOOLTIP */}
                    {collapsed && (
                        <span className="pointer-events-none fixed left-[88px] z-[9999] whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#132420] px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                            Expand sidebar
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;