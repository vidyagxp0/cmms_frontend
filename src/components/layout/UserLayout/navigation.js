import { LayoutDashboard, Wrench, HardHat, ClipboardCheck } from "lucide-react";

export const DASHBOARD_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/user/cmms-dashboard",
    icon: LayoutDashboard,
    group: "root",
  },
  {
    id: "equipment",
    label: "Equipment Dashboard",
    path: "/user/equipment-dashboard",
    icon: Wrench,
    group: "equipment",
  },
  {
    id: "engineering",
    label: "Engineering Dashboard",     
    actionLabel: "Calibration Planner", 
    path: "/user/engineering-dashboard",
    icon: HardHat,
    group: "engineering",
  },
  {
    id: "calibration",
    label: "Calibration Management",  
    path: "/user/calibration-management-dashboard",
    icon: ClipboardCheck,
    hiddenFromNav: true,             
    group: "engineering",
  },
];

// Top nav (UserNav) — filters out Calibration
export const USER_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  (item) => !item.hiddenFromNav
);

/**
 * Returns the pills to render inside DashboardActionBar for a given route.
 * Uses `actionLabel` if present, otherwise falls back to `label`.
 */
export const getDashboardActionItems = (pathname) => {
  const active = DASHBOARD_NAV_ITEMS.find((item) => item.path === pathname);
  if (!active || !active.group) return [];
  if (active.id === "dashboard") return [];

  return DASHBOARD_NAV_ITEMS.filter(
    (item) => item.group === active.group && item.id !== "dashboard"
  );
};