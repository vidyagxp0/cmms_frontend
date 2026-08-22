import React, { useState } from "react";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";
import CreateEquipmentModal from "./CreateEquipmentModal";

const EquipDashboard = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F7F9F8]">
            <DashboardActionBar
                title="Equipment Dashboard"
                onCreate={() => {
                    setIsCreateModalOpen(true);
                }}
            />

            <main className="pt-[190px]">
                <div className="p-6">
                    {/* Equipment dashboard content */}
                </div>
            </main>

            <CreateEquipmentModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default EquipDashboard;