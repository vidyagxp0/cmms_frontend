// src/constants/navigation.js
import { LayoutDashboard, Wrench, HardHat } from "lucide-react";

export const DASHBOARD_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/user/cmms-dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "equipment",
    label: "Equipment Dashboard",
    path: "/user/equipment-dashboard",
    icon: Wrench,
  },
  {
    id: "engineering",
    label: "Engineering Dashboard",
    path: "/user/engineering-dashboard",
    icon: HardHat,
  },
  // Placeholder for future "Calibration Management"
  // {
  //   id: "calibration",
  //   label: "Calibration Management",
  //   path: "/user/calibration-dashboard",
  //   icon: SomeIcon,
  // },
];