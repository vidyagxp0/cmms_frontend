import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Home,
  Plus,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DASHBOARD_NAV_ITEMS } from "../../layout/UserLayout/navigation";

const DashboardActionBar = ({
  title,            // may become obsolete – we’ll derive from active item
  buttonName = "Create Record",
  navigationRoute,
  sourceRoute,
  sourceType,
  onCreate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the active item based on current path
  const activeItem = DASHBOARD_NAV_ITEMS.find(
    (item) => location.pathname === item.path
  ) || DASHBOARD_NAV_ITEMS[0]; // fallback to first

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  // Keep existing create handler
  const handleCreate = () => {
    if (onCreate) {
      onCreate();
      return;
    }
    if (navigationRoute) {
      navigate(navigationRoute, {
        state: { sourceRoute, sourceType },
      });
    }
  };

  return (
    <div className="fixed left-0 right-0 top-[138px] z-30 h-[54px] border-b border-[#D9DEDB] bg-[#1a5161] px-4 sm:px-6 lg:px-8">
      <div className="flex h-full items-center justify-between">
        {/* LEFT — BREADCRUMB */}
        <div className="flex items-center">
          {/* Home button */}
          <button
            type="button"
            onClick={() => navigate("/user/cmms-dashboard")}
            aria-label="Home"
            className="group flex h-8 w-8 items-center justify-center rounded-[8px] text-[#dee4e1] transition-all duration-200 hover:bg-white hover:text-[#303A35] hover:shadow-[0_2px_8px_-5px_rgba(30,40,35,0.35)] active:scale-[0.96]"
          >
            <Home size={15} strokeWidth={1.7} className="transition-transform duration-200 group-hover:scale-[1.04]" />
          </button>

          <ChevronRight size={14} strokeWidth={1.5} className="mx-1 text-[#d2dad5]" />

          {/* DROPDOWN TITLE */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[13px] font-semibold tracking-[-0.01em] text-[#dee9e8] transition-colors hover:bg-white/10"
            >
              <span>{activeItem.label}</span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 min-w-[180px] rounded-lg border border-[#DCEBE2] bg-white py-1 shadow-lg">
                {DASHBOARD_NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.path)}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#F4FAF7] ${
                        isActive ? "text-[#2563EB]" : "text-[#64748B]"
                      }`}
                    >
                      <item.icon size={16} strokeWidth={isActive ? 2 : 1.75} />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — DYNAMIC ACTION */}
        <button
          type="button"
          onClick={handleCreate}
          className="group relative flex h-[36px] items-center gap-2.5 rounded-[9px] border border-[#BFC7C2] bg-white px-3 text-[12px] font-semibold tracking-[-0.01em] text-[#303A35] shadow-[0_2px_8px_-5px_rgba(31,42,36,0.35)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-[#929D97] hover:bg-[#FCFDFC] hover:shadow-[0_6px_14px_-8px_rgba(31,42,36,0.42)] active:translate-y-0 active:scale-[0.98]"
        >
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[#EEF1EF] text-[#46534C] transition-all duration-200 group-hover:bg-[#E5E9E6] group-hover:text-[#27322D]">
            <Plus size={13} strokeWidth={2.2} className="transition-transform duration-200 group-hover:rotate-90" />
          </span>
          <span className="whitespace-nowrap">{buttonName}</span>
          <ArrowUpRight size={13} strokeWidth={1.8} className="text-[#9AA39E] transition-all duration-200 group-hover:-translate-y-[1px] group-hover:translate-x-[1px] group-hover:text-[#59645E]" />
        </button>
      </div>
    </div>
  );
};

export default DashboardActionBar;