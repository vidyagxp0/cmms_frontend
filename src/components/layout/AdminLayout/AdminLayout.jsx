import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#F6F7F8]">
            <AdminSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <div
                className={`min-h-screen min-w-0 overflow-x-hidden transition-[margin] duration-300 ease-out ${
                    collapsed ? "ml-[76px]" : "ml-[264px]"
                }`}
            >
                <AdminHeader />

                <main className="pt-[72px]">
                    <div className="min-h-[calc(100vh-72px)] min-w-0 p-5 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;