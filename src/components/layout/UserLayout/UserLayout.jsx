import { Outlet } from "react-router-dom";
import UserHeader from "./UserHeader";

function UserLayout() {
    return (
        <div className="min-h-screen flex">

            <div className="flex-1">

                <UserHeader />

                <main className="p-6">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default UserLayout;