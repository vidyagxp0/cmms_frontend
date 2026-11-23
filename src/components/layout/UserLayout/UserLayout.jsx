import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import UserHeader from "./UserHeader";
import UserNav from "./UserNav";
import PageLoader from "../../common/PageLoader/PageLoader";
import { prefetchAllPages } from "../../../routes/lazyPage";

function UserLayout() {
    const location = useLocation();

    // After the first screen is up, quietly download the other pages so
    // navigating between modules is instant.
    useEffect(() => {
        const timer = setTimeout(prefetchAllPages, 2000);
        return () => clearTimeout(timer);
    }, []);

    const showNav =
        location.pathname === "/user/cmms-dashboard" ||
        location.pathname === "/user/equipment-dashboard" ||
        location.pathname === "/user/engineering-dashboard" ||
        location.pathname ===
            "/user/calibration-management-dashboard" ||
        location.pathname ===
            "/user/preventive-planner-dashboard" ||
        location.pathname ===
            "/user/preventive-maintenance-dashboard" || 
            location.pathname === "/user/field-instruments-dashboard" ||
            location.pathname === "/user/field-instrument-planner-dashboard" ||
            location.pathname === "/user/field-instrument-calibration-addendum-dashboard" ||
            location.pathname === "/user/spare-instrument-calibration-master-dashboard" ||
            location.pathname === "/user/import-master-equipment-data" || 
            location.pathname === "/user/equipment-master-dashboard" ||
            location.pathname === "/user/addendum-preventive-planner-dashboard" ||
            location.pathname === "/user/addendum-calibration-management-dashboard" ||
            location.pathname === "/user/addendum-preventive-management-dashboard" ||
            location.pathname === "/user/unplanned-calibration-dashboard" ;

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
                        ? "h-screen pt-[130px]"
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
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}

export default UserLayout;