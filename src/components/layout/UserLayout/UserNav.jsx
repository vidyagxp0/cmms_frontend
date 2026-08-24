import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Wrench,
    HardHat,
} from "lucide-react";

const UserNav = () => {
    const navItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            path: "/user/cmms-dashboard",
            icon: LayoutDashboard,
        },
        {
            id: "equipment",
            label: "Equipment Dashboard",
            path: "/user/equipment-dashboard",
            icon: Wrench,
        },
        {
            id: "engineering",
            label: "Engineering Dashboard",
            path: "/user/engineering-dashboard",
            icon: HardHat,
        },
    ];

    return (
        <nav className="fixed left-0 right-0 top-[74px] z-40 h-[64px] border-b border-[#DCEBE2] bg-[#F4FAF7]">
            <div className="flex h-full items-center px-4 sm:px-6 lg:px-8">

                {/* NAVIGATION */}
                <div className="flex h-full items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={({ isActive }) => `
                                    group relative flex h-full items-center gap-2.5
                                    px-5 text-[13px] font-medium
                                    tracking-[-0.01em]
                                    transition-all duration-200 ease-out
                                    ${
                                        isActive
                                            ? "text-[#17734C]"
                                            : "text-[#637C70] hover:text-[#17734C]"
                                    }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* ICON */}
                                        <span
                                            className={`
                                                flex h-8 w-8 items-center justify-center
                                                rounded-[9px]
                                                transition-all duration-200
                                                ${
                                                    isActive
                                                        ? "bg-[#E2F2E9] text-[#1F8A5F]"
                                                        : "bg-transparent text-[#789487] group-hover:bg-[#EAF5EF] group-hover:text-[#1F8A5F]"
                                                }
                                            `}
                                        >
                                            <Icon
                                                size={17}
                                                strokeWidth={isActive ? 2 : 1.75}
                                            />
                                        </span>

                                        {/* LABEL */}
                                        <span className="whitespace-nowrap">
                                            {item.label}
                                        </span>

                                        {/* ACTIVE INDICATOR */}
                                        <span
                                            className={`
                                                absolute bottom-0 left-1/2
                                                h-[3px] -translate-x-1/2
                                                rounded-t-full
                                                bg-[#1F8A5F]
                                                transition-all duration-200
                                                ${
                                                    isActive
                                                        ? "w-[42px] opacity-100"
                                                        : "w-0 opacity-0"
                                                }
                                            `}
                                        />
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default UserNav;