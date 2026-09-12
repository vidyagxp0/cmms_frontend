import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plus, ArrowUpRight } from "lucide-react";

import {
  DASHBOARD_NAV_ITEMS,
  getDashboardActionItems,
} from "../../layout/UserLayout/navigation";

const DashboardActionBar = ({
  buttonName = "Create Record",
  navigationRoute,
  sourceRoute,
  sourceType,
  onCreate,
  showCreateButton = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const actionItems = getDashboardActionItems(location.pathname);

  const handleCreate = () => {
    if (onCreate) {
      onCreate();
      return;
    }

    if (navigationRoute) {
      navigate(navigationRoute, {
        state: {
          sourceRoute,
          sourceType,
        },
      });
    }
  };

  return (
    <div
      className="
                fixed
                left-0
                right-0
                top-[138px]
                z-30
                h-[54px]
                w-full
                border-b
                border-[#193F3B]
                bg-[#244F4A]
            "
      style={{
        boxShadow: "0 5px 16px -12px rgba(20,54,50,0.40)",
      }}
    >
      <div
        className="
                    flex
                    h-full
                    items-center
                    justify-between
                    gap-3
                    px-4
                    sm:px-6
                    lg:px-8
                "
      >
        {/* =====================================================
                    LEFT : HOME
                ====================================================== */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/user/cmms-dashboard")}
            aria-label="Home"
            className="
                            group
                            flex
                            h-[34px]
                            w-[34px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[9px]
                            border
                            border-transparent
                            bg-transparent
                            text-[#D5E1DE]
                            transition-all
                            duration-200
                            hover:border-white/10
                            hover:bg-white/10
                            hover:text-white
                            active:scale-[0.96]
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[#AFC7C1]
                            focus-visible:ring-offset-1
                            focus-visible:ring-offset-[#244F4A]
                        "
          >
            <Home
              size={15}
              strokeWidth={1.8}
              className="
                                transition-transform
                                duration-200
                                group-hover:scale-[1.05]
                            "
            />
          </button>

          {/* DIVIDER */}
          {actionItems.length > 0 && (
            <span
              className="
                                hidden
                                h-6
                                w-px
                                shrink-0
                                bg-white/15
                                sm:block
                            "
            />
          )}
        </div>

        {/* =====================================================
                    CENTER : ACTION ITEMS
                ====================================================== */}
        <nav
          className="
                        flex
                        h-full
                        min-w-0
                        flex-1
                        items-center
                        gap-1.5
                        overflow-x-auto
                        custom-scrollbar
                    "
        >
          {actionItems.map((item) => {
            const Icon = item.icon;

            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`
                                    group
                                    relative
                                    flex
                                    h-[36px]
                                    shrink-0
                                    items-center
                                    gap-2
                                    rounded-[10px]
                                    border
                                    px-3
                                    text-[11px]
                                    font-semibold
                                    tracking-[-0.01em]
                                    transition-all
                                    duration-200
                                    ease-out
                                    focus:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-[#AFC7C1]
                                    focus-visible:ring-offset-1
                                    focus-visible:ring-offset-[#244F4A]

                                    ${
                                      isActive
                                        ? `
                                                border-white/20
                                                bg-[#F1F0EB]
                                                text-[#244F4A]
                                                shadow-[0_3px_10px_-4px_rgba(0,0,0,0.35)]
                                            `
                                        : `
                                                border-transparent
                                                bg-transparent
                                                text-[#C7D8D3]
                                                hover:border-white/10
                                                hover:bg-white/10
                                                hover:text-white
                                            `
                                    }
                                `}
              >
                {/* ICON */}
                <span
                  className={`
                                        flex
                                        h-[27px]
                                        w-[27px]
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-[8px]
                                        transition-all
                                        duration-200
                                        ${
                                          isActive
                                            ? `
                                                    bg-[#E8F0ED]
                                                    text-[#56766D]
                                                `
                                            : `
                                                    bg-transparent
                                                    text-[#B7CBC5]
                                                    group-hover:text-white
                                                `
                                        }
                                    `}
                >
                  <Icon size={14} strokeWidth={isActive ? 2.1 : 1.8} />
                </span>

                {/* LABEL */}
                <span
                  className="
        whitespace-nowrap
        font-[var(--font-display)]
        text-[12px]
        font-bold
        tracking-[-0.02em]
    "
                >
                  {item.label}
                </span>

                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <span
                    className="
                                            pointer-events-none
                                            absolute
                                            -bottom-[9px]
                                            left-1/2
                                            h-[3px]
                                            w-[26px]
                                            -translate-x-1/2
                                            rounded-full
                                            bg-[#A47D45]
                                        "
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* =====================================================
                    RIGHT : CREATE BUTTON
                ====================================================== */}
        {showCreateButton && (
          <button
            type="button"
            onClick={handleCreate}
            className="
            group
            relative
            flex
            h-[37px]
            shrink-0
            items-center
            gap-2.5
            rounded-[10px]
            border
            border-white/25
            bg-[#F1F0EB]
            px-3
            text-[#243238]
            shadow-[0_3px_10px_-5px_rgba(0,0,0,0.35)]
            transition-all
            duration-200
            ease-out
            hover:-translate-y-[1px]
            hover:bg-white
            hover:shadow-[0_6px_14px_-7px_rgba(0,0,0,0.4)]
            active:translate-y-0
            active:scale-[0.98]
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#AFC7C1]
            focus-visible:ring-offset-1
            focus-visible:ring-offset-[#244F4A]
        "
          >
            {/* PLUS */}
            <span
              className="
                flex
                h-[23px]
                w-[23px]
                items-center
                justify-center
                rounded-[7px]
                border
                border-[#D6D8D3]
                bg-[#E8F0ED]
                text-[#56766D]
                transition-all
                duration-200
                group-hover:border-[#C7D8D2]
                group-hover:bg-[#DCE7E2]
            "
            >
              <Plus
                size={13}
                strokeWidth={2.2}
                className="
                    transition-transform
                    duration-200
                    group-hover:rotate-90
                "
              />
            </span>

            {/* LABEL */}
            <span
              className="
                whitespace-nowrap
                font-[var(--font-display)]
                text-[12px]
                font-bold
                tracking-[-0.02em]
            "
            >
              {buttonName}
            </span>

            {/* ARROW */}
            <ArrowUpRight
              size={13}
              strokeWidth={1.8}
              className="
                text-[#7D8985]
                transition-all
                duration-200
                group-hover:-translate-y-[1px]
                group-hover:translate-x-[1px]
                group-hover:text-[#56766D]
            "
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardActionBar;
