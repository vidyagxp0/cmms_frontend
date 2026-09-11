import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    USER_NAV_ITEMS,
    isNavItemActive,
} from "./navigation";

const UserNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = USER_NAV_ITEMS;

    return (
        <nav
            className="
                fixed
                left-0
                right-0
                top-[74px]
                z-40
                h-[64px]
                w-full
                border-b
                border-[var(--color-border)]
                bg-[var(--color-background)]
            "
            style={{
                boxShadow:
                    "0 3px 14px -12px rgba(36,50,56,0.16)",
            }}
        >
            <div
                className="
                    flex
                    h-full
                    items-center
                    overflow-x-auto
                    px-4
                    sm:px-6
                    lg:px-8
                    custom-scrollbar
                "
            >
                <div className="flex h-full min-w-max items-center gap-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        const isActive =
                            isNavItemActive(
                                location.pathname,
                                item
                            );

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                    navigate(item.path)
                                }
                                className={`
                                    group
                                    relative
                                    flex
                                    h-[44px]
                                    shrink-0
                                    items-center
                                    gap-2.5
                                    rounded-[11px]
                                    border
                                    px-3.5
                                    text-[12px]
                                    font-semibold
                                    tracking-[-0.01em]
                                    transition-all
                                    duration-200
                                    ease-out

                                    focus:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-[var(--color-primary-muted)]
                                    focus-visible:ring-offset-1

                                    ${
                                        isActive
                                            ? `
                                                border-[var(--color-border-strong)]
                                                bg-[var(--color-primary-soft)]
                                                text-[var(--color-primary-dark)]
                                                shadow-[0_2px_8px_rgba(86,118,109,0.07)]
                                            `
                                            : `
                                                border-transparent
                                                bg-transparent
                                                text-[var(--color-text-secondary)]
                                                hover:border-[var(--color-border-soft)]
                                                hover:bg-[var(--color-surface-muted)]
                                                hover:text-[var(--color-text-primary)]
                                            `
                                    }
                                `}
                            >
                                {/* =================================================
                                    ICON
                                ================================================== */}
                                <span
                                    className={`
                                        flex
                                        h-[30px]
                                        w-[30px]
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-[8px]
                                        transition-all
                                        duration-200
                                        ${
                                            isActive
                                                ? `
                                                    bg-[var(--color-surface)]
                                                    text-[var(--color-primary)]
                                                    shadow-[0_1px_4px_rgba(36,50,56,0.045)]
                                                `
                                                : `
                                                    bg-transparent
                                                    text-[var(--color-text-muted)]
                                                    group-hover:text-[var(--color-primary)]
                                                `
                                        }
                                    `}
                                >
                                    <Icon
                                        size={16}
                                        strokeWidth={
                                            isActive
                                                ? 2
                                                : 1.75
                                        }
                                    />
                                </span>

                                {/* =================================================
                                    LABEL
                                ================================================== */}
                                <span className="whitespace-nowrap">
                                    {item.label}
                                </span>

                                {/* =================================================
                                    ACTIVE INDICATOR
                                ================================================== */}
                                <span
                                    className={`
                                        pointer-events-none
                                        absolute
                                        bottom-[-10px]
                                        left-1/2
                                        h-[3px]
                                        -translate-x-1/2
                                        rounded-full
                                        bg-[var(--color-primary)]
                                        transition-all
                                        duration-200
                                        ${
                                            isActive
                                                ? "w-[28px] opacity-100"
                                                : "w-0 opacity-0"
                                        }
                                    `}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default UserNav;