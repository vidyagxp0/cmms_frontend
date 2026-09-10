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
  console.log("DashboardActionBar: actionItems", actionItems);

  const handleCreate = () => {
    if (onCreate) {
      onCreate();
      return;
    }
    if (navigationRoute) {
      navigate(navigationRoute, { state: { sourceRoute, sourceType } });
    }
  };

  return (
    <div className="fixed left-0 right-0 top-[138px] z-30 h-[54px] border-b border-[#D9DEDB] bg-[#1a5161] px-4 sm:px-6 lg:px-8">
      <div className="flex h-full items-center justify-between gap-4">

        {/* ── LEFT : Home ─────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => navigate("/user/cmms-dashboard")}
          aria-label="Home"
          className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[#dee4e1] transition-all duration-200 hover:bg-white hover:text-[#303A35] hover:shadow-[0_2px_8px_-5px_rgba(30,40,35,0.35)] active:scale-[0.96]"
        >
          <Home
            size={15}
            strokeWidth={1.7}
            className="transition-transform duration-200 group-hover:scale-[1.04]"
          />
        </button>

        {/* Divider — only shown when there are pills */}
        {actionItems.length > 0 && (
          <span className="hidden h-6 w-px shrink-0 bg-white/15 sm:block" />
        )}

        {/* ── CENTER : Group pills (conditional) ──────────────────── */}
        <nav className="flex h-full min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {actionItems.map((item) => {
  const Icon = item.icon;
  const isActive = location.pathname === item.path;
  const displayLabel = item.actionLabel || item.label;   

  return (
    <button
      key={item.id}
      type="button"
      onClick={() => navigate(item.path)}
      title={displayLabel}                               
      className={`
        group relative flex h-[30px] shrink-0 items-center gap-2
        rounded-full px-2.5 text-[10px] font-semibold tracking-[-0.01em]
        transition-all duration-200 ease-out
        ${
          isActive
            ? "bg-white text-[#1a5161] shadow-[0_3px_10px_-4px_rgba(0,0,0,0.4)]"
            : "text-[#cfe0dd] hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <Icon
        size={13}
        strokeWidth={isActive ? 2.3 : 1.8}
        className="transition-transform duration-200 group-hover:scale-[1.08]"
      />
      <span className="whitespace-nowrap">{displayLabel}</span>   {/* 👈 here */}

      {isActive && (
        <span className="pointer-events-none absolute -bottom-[10px] left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[#6ad4c8]" />
      )}
    </button>
  );
})}
        </nav>

        {/* ── RIGHT : Create button ───────────────────────────────── */}
          {showCreateButton && (
        <button
          type="button"
          onClick={handleCreate}
          className="group relative flex h-[36px] shrink-0 items-center gap-2.5 rounded-[9px] border border-[#BFC7C2] bg-white px-3 text-[12px] font-semibold tracking-[-0.01em] text-[#303A35] shadow-[0_2px_8px_-5px_rgba(31,42,36,0.35)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-[#929D97] hover:bg-[#FCFDFC] hover:shadow-[0_6px_14px_-8px_rgba(31,42,36,0.42)] active:translate-y-0 active:scale-[0.98]"
        >
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[#EEF1EF] text-[#46534C] transition-all duration-200 group-hover:bg-[#E5E9E6] group-hover:text-[#27322D]">
            <Plus
              size={13}
              strokeWidth={2.2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </span>
          <span className="whitespace-nowrap">{buttonName}</span>
          <ArrowUpRight
            size={13}
            strokeWidth={1.8}
            className="text-[#9AA39E] transition-all duration-200 group-hover:-translate-y-[1px] group-hover:translate-x-[1px] group-hover:text-[#59645E]"
          />
        </button>
        )}
      </div>
    </div>
  );
};

export default DashboardActionBar;