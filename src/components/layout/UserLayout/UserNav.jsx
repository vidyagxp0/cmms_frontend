
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
                h-[65px]
                border-b
                border-[#DCEBE2]
                bg-[#F4FAF7]
            "
        >
            <div
                className="
                    flex
                    h-full
                    items-center
                    px-4
                    sm:px-6
                    lg:px-8
                "
            >
                <div className="flex h-full items-center gap-0.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        const isActive = isNavItemActive(
                            location.pathname,
                            item
                        );

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => navigate(item.path)}
                                className={`
                                    group
                                    relative
                                    flex
                                    h-full
                                    items-center
                                    gap-1
                                    px-4
                                    transition-all
                                    duration-200
                                    ease-out
                                    focus:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-[#9DBCB2]
                                    focus-visible:ring-inset

                                    ${
                                        isActive
                                            ? "text-[#244F4A]"
                                            : "text-[#647773] hover:text-[#244F4A]"
                                    }
                                `}
                            >
                                {/* ICON */}
                                <span
                                    className={`
                                        flex
                                        h-7
                                        w-7
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-[8px]
                                        transition-all
                                        duration-200

                                        ${
                                            isActive
                                                ? "bg-[#E3EFEB] text-[#4E766B]"
                                                : "bg-transparent text-[#71827C] group-hover:bg-[#EDF5F2] group-hover:text-[#4E766B]"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={16}
                                        strokeWidth={isActive ? 2 : 1.75}
                                    />
                                </span>

                                {/* LABEL */}
                                <span
                                    className="
                                        whitespace-nowrap
                                        font-[var(--font-display)]
                                        text-[12px]
                                        font-semibold
                                        tracking-[-0.02em]
                                    "
                                >
                                    {item.label}
                                </span>

                                {/* ACTIVE INDICATOR */}
                                <span
                                    className={`
                                        absolute
                                        bottom-0
                                        left-1/2
                                        h-[3px]
                                        -translate-x-1/2
                                        rounded-t-full
                                        bg-[#A47D45]
                                        transition-all
                                        duration-200

                                        ${
                                            isActive
                                                ? "w-[36px] opacity-100"
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
