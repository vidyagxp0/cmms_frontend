import { Outlet, useLocation } from "react-router-dom";

import UserHeader from "./UserHeader";
import UserNav from "./UserNav";

function UserLayout() {
    const location = useLocation();

    const showNav =
        location.pathname === "/user/cmms-dashboard" ||
        location.pathname === "/user/equipment-dashboard" ||
        location.pathname === "/user/engineering-dashboard" ||
        location.pathname ===
            "/user/calibration-management-dashboard" ||
        location.pathname ===
            "/user/preventive-planner-dashboard" ||
        location.pathname ===
            "/user/preventive-maintenance-dashboard";

    return (
        <div
            className={
                showNav
                    ? "h-screen overflow-hidden bg-[var(--color-background)]"
                    : "min-h-screen bg-[var(--color-background)]"
            }
        >
            <UserHeader />

            {showNav && <UserNav />}

            <main
                className={
                    showNav
                        ? "h-screen pt-[138px]"
                        : "pt-[74px]"
                }
            >
                <div
                    className={
                        showNav
                            ? "h-full bg-[var(--color-background)] p-2"
                            : "bg-[var(--color-background)] p-6"
                    }
                >
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default UserLayout;