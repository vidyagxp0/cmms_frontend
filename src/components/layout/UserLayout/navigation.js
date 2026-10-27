import {
  LayoutDashboard,
  Wrench,
  HardHat,
  ClipboardCheck,
  CalendarClock,
  ClipboardList,
  Gauge,
  Compass,
} from "lucide-react";

export const DASHBOARD_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/user/cmms-dashboard",
    icon: LayoutDashboard,
    group: "root",
  },

  // ─── Master Dashboard group ─────────────────────────────────────
  // Parent (visible in sidebar)
  {
    id: "equipment",
    label: "Master Dashboard",
    path: "/user/equipment-dashboard",
    icon: Wrench,
    group: "equipment",
  },

  // Child pill #1 (hidden from sidebar, shown in ActionBar)
  {
    id: "instrument-dashboard",
    label: "Master Instrument Dashboard",
    path: "/user/equipment-dashboard",
    icon: Gauge,
    hiddenFromNav: true,
    group: "equipment",
  },

  // Child pill #2 (hidden from sidebar, shown in ActionBar)
  {
    id: "field-instruments-dashboard",
    label: "Field Instrument Dashboard",
    path: "/user/field-instruments-dashboard",
    icon: Compass,
    hiddenFromNav: true,
    group: "equipment",
  },

  // Child pill #2 (hidden from sidebar, shown in ActionBar)
  {
    id: "spare-instruments-dashboard",
    label: "Spare Instrument Calibration Dashboard",
    path: "/user/spare-instrument-calibration-master-dashboard",
    icon: Compass,
    hiddenFromNav: true,
    group: "equipment",
  },
  {
    id: "import-master-equipment-data",
    label: "Import Master Equipment Data",
    path: "/user/import-master-equipment-data",
    icon: Compass,
    hiddenFromNav: true,
    group: "equipment",
  },

  // ─── Engineering group ──────────────────────────────────────────
  {
    id: "engineering",
    label: "Calibration Planner",
    path: "/user/engineering-dashboard",
    icon: HardHat,
    group: "engineering",
  },
  {
    id: "calibration",
    label: " Calibration Management",
    path: "/user/calibration-management-dashboard",
    icon: ClipboardCheck,
    hiddenFromNav: true,
    group: "engineering",
  },
    {
    id: "fieldInstrument-calibration-addendum",
    label: "Addendum Calibration",
    path: "/user/field-instrument-calibration-addendum-dashboard",
    icon: ClipboardList,
    group: "engineering",
    hiddenFromNav: true,
  },

  // ─── Preventive Maintenance group ───────────────────────────────
  {
    id: "maintenance",
    label: "Preventive Maintenance",
    path: "/user/preventive-planner-dashboard",
    icon: CalendarClock,
    group: "maintenance",
  },
  {
    id: "preventive-planner",
    label: "Preventive Planner",
    path: "/user/preventive-planner-dashboard",
    icon: CalendarClock,
    hiddenFromNav: true,
    group: "maintenance",
  },
  {
    id: "preventive-maintenance",
    label: "Preventive Maintenance",
    path: "/user/preventive-maintenance-dashboard",
    icon: ClipboardList,
    hiddenFromNav: true,
    group: "maintenance",
  },

  // ─── Field Instrument Planner group ───────────────────────────────
  // Commented out per request:
  // {
  //   id: "fieldInstrument",
  //   label: "Field Instrument",
  //   path: "/user/field-instrument-planner-dashboard",
  //   icon: CalendarClock,
  //   group: "fieldInstrument",
  // },

  // {
  //   id: "fieldInstrument-planner",
  //   label: "Field Instrument Planner",
  //   path: "/user/field-instrument-planner-dashboard",
  //   icon: CalendarClock,
  //   hiddenFromNav: true,
  //   group: "fieldInstrument",
  // },


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