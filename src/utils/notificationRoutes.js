/* ═════════════════════════════════════════════════════════════════
   NOTIFICATION → RECORD ROUTE
   Uses `process_id` / `process.name` from the notification API to
   build the `/user/...` panel route for `record_id`.
═════════════════════════════════════════════════════════════════ */

/* process_id → { route prefix, label } */
const PROCESS_ROUTES = {
    1: { path: "/user/calibration-planner-panel", label: "Calibration Planner" },
    2: { path: "/user/preventive-maintenance-planner-panel", label: "Preventive Maintenance Planner" },
    3: { path: "/user/equipment-panel", label: "Instrument Master" },
    4: { path: "/user/preventive-maintenance-panel", label: "Preventive Maintenance" },
    5: { path: "/user/calibration-management-panel", label: "Calibration Management" },
    6: { path: "/user/field-instruments-panel", label: "Field Instruments" },
    7: { path: "/user/field-instruments-planner-panel", label: "Field Instrument Planner" },
    8: { path: "/user/field-instrument-calibration-addendum-panel", label: "Field Instrument Calibration Addendum" },
    9: { path: "/user/spare-instrument-calibration-master-panel", label: "Spare Instrument Master" },
    10: { path: "/user/equipment-master-panel", label: "Equipment Master" },
    11: { path: "/user/addendum-preventive-planner-panel", label: "Preventive Addendum" },
    12: { path: "/user/addendum-calibration-management-panel", label: "Addendum Calibration Management" },
    13: { path: "/user/addendum-preventive-management-panel", label: "Addendum Preventive Management" },
    14: { path: "/user/unplanned-calibration-panel", label: "Unplanned Calibration" },
    15: { path: "/user/unplanned-calibration-management-panel", label: "Unplanned Calibration Management" },
};

/* process.name (lower-case) → process_id — used when the id is missing/unknown */
const PROCESS_NAME_TO_ID = {
    "calibration planner": 1,
    "preventive maintenance planner": 2,
    "instrument master": 3,
    "master instrument": 3,
    "preventive maintenance": 4,
    "calibration management": 5,
    "field instruments": 6,
    "field instrument": 6,
    "field instrument planner": 7,
    "field instruments planner": 7,
    "field instrument calibration addendum": 8,
    "spare instrument master": 9,
    "spare instrument calibration master": 9,
    "equipment master": 10,
    "preventive addendum": 11,
    "addendum preventive planner": 11,
    "addendum calibration management": 12,
    "addendum preventive management": 13,
    "unplanned calibration": 14,
    "unplanned calibration management": 15,
};

const resolveProcessConfig = (item) => {
    if (!item) return null;

    const byId = PROCESS_ROUTES[Number(item.process_id ?? item.process?.id)];
    if (byId) return byId;

    const name = String(item.process?.name || "").trim().toLowerCase();
    const idFromName = PROCESS_NAME_TO_ID[name];
    return idFromName ? PROCESS_ROUTES[idFromName] : null;
};

export const resolveNotificationRoute = (item) => {
    const recordId = item?.record_id;
    if (!recordId) return null;

    const config = resolveProcessConfig(item);
    return config ? `${config.path}/${recordId}` : null;
};

export const resolveNotificationModuleLabel = (item) =>
    item?.process?.name || resolveProcessConfig(item)?.label || null;
