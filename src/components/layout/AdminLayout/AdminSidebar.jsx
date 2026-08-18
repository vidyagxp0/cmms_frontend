import React from "react";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    FileText,
    Settings,
    ShieldCheck,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

const AdminSidebar = ({ collapsed, setCollapsed }) => {
    const menuItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", active: true },
        { label: "Users Management", icon: Users, path: "/admin/users" },
        { label: "Role Management", icon: ClipboardList, path: "/admin/management" },
        { label: "Audit History", icon: FileText, path: "/admin/reports" },
        { label: "Department Management", icon: Settings, path: "/admin/settings" },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-visible border-r border-white/[0.07] bg-[#101112] text-white shadow-[8px_0_30px_rgba(0,0,0,0.08)] transition-[width] duration-300 ease-out ${
                collapsed ? "w-[76px]" : "w-[264px]"
            }`}
        >
            {/* Brand */}
            <div
                className={`relative flex h-[72px] shrink-0 items-center ${
                    collapsed ? "justify-center px-3" : "px-6"
                }`}
            >

                <div className="absolute bottom-0 left-5 right-5 h-px bg-white/[0.10]" />
            </div>

            {/* Navigation */}
            <nav
                className={`flex-1 py-7 ${
                    collapsed
                        ? "overflow-visible px-3"
                        : "overflow-x-hidden overflow-y-auto px-3.5"
                }`}
            >
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className="group relative"
                            >
                                <a
                                    href={item.path}
                                    className={`relative flex h-[46px] items-center rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                                        collapsed
                                            ? "justify-center"
                                            : "gap-3 px-3.5"
                                    } ${
                                        item.active
                                            ? "bg-white/[0.095] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
                                            : "text-white/100 hover:bg-white/[0.045] hover:text-white font-bold"
                                    }`}
                                >
                                    {item.active && (
                                        <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-white" />
                                    )}

                                    <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                            item.active
                                                ? "bg-white/[0.08]"
                                                : "group-hover:bg-white/[0.05]"
                                        }`}
                                    >
                                        <Icon
                                            size={18}
                                            strokeWidth={item.active ? 2 : 1.8}
                                            className={
                                                item.active
                                                    ? "text-white"
                                                    : "text-white/65 group-hover:text-white"
                                            }
                                        />
                                    </span>

                                    <span
                                        className={`flex-1 truncate whitespace-nowrap transition-all duration-200 ${
                                            collapsed
                                                ? "pointer-events-none w-0 overflow-hidden opacity-0"
                                                : "opacity-100"
                                        }`}
                                    >
                                        {item.label}
                                    </span>

                                    {!collapsed && item.active && (
                                        <ChevronRight
                                            size={14}
                                            strokeWidth={1.8}
                                            className="text-white/30"
                                        />
                                    )}
                                </a>

                                {/* Collapsed Tooltip */}
                                {collapsed && (
                                    <div className="pointer-events-none fixed left-[88px] z-[9999] -translate-y-1/2 translate-x-[-6px] whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#1B1D1F] px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                                        {item.label}

                                        <span className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-white/[0.08] bg-[#1B1D1F]" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Collapse / Expand */}
            <div className="shrink-0 border-t border-white/[0.06] p-3">
                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    className={`group relative flex h-[46px] w-full items-center rounded-[10px] border border-white/[0.06] bg-white/[0.035] text-white/75 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.07] hover:text-white ${
                        collapsed ? "justify-center" : "gap-3 px-3.5"
                    }`}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                        {collapsed ? (
                            <PanelLeftOpen
                                size={18}
                                strokeWidth={1.8}
                            />
                        ) : (
                            <PanelLeftClose
                                size={18}
                                strokeWidth={1.8}
                            />
                        )}
                    </span>

                    <span
                        className={`whitespace-nowrap text-[12px] font-medium transition-all duration-200 ${
                            collapsed
                                ? "w-0 overflow-hidden opacity-0"
                                : "opacity-100"
                        }`}
                    >
                        Collapse sidebar
                    </span>

                    {collapsed && (
                        <span className="pointer-events-none fixed left-[88px] z-[9999] whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#1C1E20] px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                            Expand sidebar
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;