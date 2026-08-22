import { Outlet, useLocation } from "react-router-dom";

import UserHeader from "./UserHeader";
import UserNav from "./UserNav";

function UserLayout() {
    const location = useLocation();

    const showNav =
        location.pathname === "/user/cmms-dashboard" ||
        location.pathname === "/user/equipment-dashboard" ||
        location.pathname === "/user/engineering-dashboard"; 

    return (
        <div className="min-h-screen bg-[#F7F9F8]">
            <UserHeader />

            {showNav && <UserNav />}

            <main className={showNav ? "pt-[138px]" : "pt-[74px]"}>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default UserLayout;