import { Outlet } from "react-router-dom";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
    return (
        <div className="min-h-screen flex">

            <AdminSidebar />

            <div className="flex-1">

                <AdminHeader />

                <main className="p-6">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;