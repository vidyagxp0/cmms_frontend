import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#F5F8F6]">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <div
                className={`min-h-screen min-w-0 overflow-x-hidden transition-[margin] duration-300 ease-out ${
                    collapsed ? "ml-[65px]" : "ml-[230px]"
                }`}
            >
                <AdminHeader />

                <main className="pt-[72px]">
                    <div className="min-h-[calc(100vh-72px)] min-w-0 w-full px-5 pt-3 pb-6 sm:px-6 lg:px-7">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;