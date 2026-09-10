import React from "react";
import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";

const PreventivePlannerDashboard = () => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F4F8F7]">
      {/* Action bar (top bar with Home + group pills + Create) */}
      <div className="shrink-0">
        <DashboardActionBar
          title="Preventive Planner"
          buttonName="Create Record"
          navigationRoute="/user/create-record"
          sourceRoute="/user/preventive-planner-dashboard"
          sourceType="preventive"
        />
      </div>

      {/* Page body */}
      <main className="mt-8 min-h-0 flex-1 overflow-hidden pt-3">
        <div className="p-6">
          <h1 className="text-[20px] font-semibold text-[#263B35]">
            Preventive Planner Dashboard
          </h1>
          <p className="mt-1 text-[12.5px] text-[#6E897C]">
            Plan preventive maintenance schedules for equipment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PreventivePlannerDashboard;