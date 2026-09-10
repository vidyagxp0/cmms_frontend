import {
  LayoutDashboard,
  Wrench,
  HardHat,
  ClipboardCheck,
  CalendarClock,
  ClipboardList,
} from "lucide-react";

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
    label: "Calibration Planner",
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

  // ─── Preventive Maintenance group ───────────────────────────────
  {
    id: "maintenance",
    label: "Preventive Maintenance",           // 👈 UserNav item
    path: "/user/preventive-planner-dashboard", // shared with the first pill
    icon: CalendarClock,
    group: "maintenance",
  },
  {
    id: "preventive-planner",
    label: "Preventive Planner",               // 👈 ActionBar pill #1
    path: "/user/preventive-planner-dashboard",
    icon: CalendarClock,
    hiddenFromNav: true,
    group: "maintenance",
  },
  {
    id: "preventive-maintenance",
    label: "Preventive Maintenance", // 👈 ActionBar pill #2
    path: "/user/preventive-maintenance-dashboard",
    icon: ClipboardList,
    hiddenFromNav: true,
    group: "maintenance",
  },
];

export const USER_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  (item) => !item.hiddenFromNav
);

export const getDashboardActionItems = (pathname) => {
  const active = DASHBOARD_NAV_ITEMS.find((item) => item.path === pathname);
  if (!active || !active.group) return [];
  if (active.id === "dashboard") return [];

  const groupItems = DASHBOARD_NAV_ITEMS.filter(
    (item) => item.group === active.group && item.id !== "dashboard"
  );

  // Drop duplicate parent when a same-path sibling exists
  const pathCounts = groupItems.reduce((acc, item) => {
    acc[item.path] = (acc[item.path] || 0) + 1;
    return acc;
  }, {});

  return groupItems.filter((item) => {
    if (item.hiddenFromNav) return true;
    if (pathCounts[item.path] > 1) return false;
    return true;
  });
};

export const isNavItemActive = (pathname, item) => {
  if (!item) return false;
  if (pathname === item.path) return true;

  const active = DASHBOARD_NAV_ITEMS.find((i) => i.path === pathname);
  if (!active || !active.group) return false;
  if (active.group === "root") return false;
  if (active.group !== item.group) return false;

  return !item.hiddenFromNav;
};