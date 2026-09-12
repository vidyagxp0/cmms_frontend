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
                <div
                    className="
                        flex
                        h-full
                        items-center
                        gap-1
                    "
                >
                    {navItems.map((item) => {
                        const Icon =
                            item.icon;

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
                                    navigate(
                                        item.path
                                    )
                                }
                                className={`
                                    group
                                    relative
                                    flex
                                    h-full
                                    items-center
                                    gap-2.5
                                    px-5
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
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-[9px]
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
                                        size={17}
                                        strokeWidth={
                                            isActive
                                                ? 2
                                                : 1.75
                                        }
                                    />
                                </span>

                                {/* LABEL */}
                                <span
                                    className="
                                        whitespace-nowrap
                                        font-[var(--font-display)]
                                        text-[13px]
                                        font-semibold
                                        tracking-[-0.025em]
                                    "
                                >
                                    {
                                        item.label
                                    }
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
                                                ? "w-[42px] opacity-100"
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