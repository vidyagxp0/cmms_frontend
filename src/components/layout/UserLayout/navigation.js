
import {
    LayoutDashboard,
    Wrench,
    HardHat,
    ClipboardCheck,
    CalendarClock,
    ClipboardList,
    Gauge,
    Compass,
    RadioTower,
    Package,
    Settings2,
    Database,
    FileCheck,
    CalendarDays,
    ClipboardPlus,
    FilePlus2,
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
        label: "Masters",
        path: "/user/equipment-dashboard",
        icon: Wrench,
        group: "equipment",
    },

    // Child pill #1 (hidden from sidebar, shown in ActionBar)
    {
        id: "instrument-dashboard",
        label: "Master Instrument",
        path: "/user/equipment-dashboard",
        icon: Gauge,
        hiddenFromNav: true,
        group: "equipment",
    },

    // Child pill #2 (hidden from sidebar, shown in ActionBar)
    {
        id: "field-instruments-dashboard",
        label: "Field Instrument",
        path: "/user/field-instruments-dashboard",
        icon: RadioTower,
        hiddenFromNav: true,
        group: "equipment",
    },

    // Child pill #2 (hidden from sidebar, shown in ActionBar)
    {
        id: "spare-instruments-dashboard",
        label: "Spare Instrument",
        path: "/user/spare-instrument-calibration-master-dashboard",
        icon: Package,
        hiddenFromNav: true,
        group: "equipment",
    },

    {
        id: "equipment-master-dashboard",
        label: "Equipment Master",
        path: "/user/equipment-master-dashboard",
        icon: Settings2,
        hiddenFromNav: true,
        group: "equipment",
    },

    {
        id: "import-master-equipment-data",
        label: "Import Master Data",
        path: "/user/import-master-equipment-data",
        icon: Database,
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
        icon: FileCheck,
        group: "engineering",
        hiddenFromNav: true,
    },

    {
        id: "addendum-calibration-management",
        label: "Addendum Calibration Management",
        path: "/user/addendum-calibration-management-dashboard",
        icon: FileCheck,
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
        icon: CalendarDays,
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
    {
        id: "addendum-preventive",
        label: "Addendum Preventive",
        path: "/user/addendum-preventive-planner-dashboard",
        icon: ClipboardPlus,
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
