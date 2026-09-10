import React from "react";
import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";

const PreventiveMaintenanceDashboard = () => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F4F8F7]">
      <div className="shrink-0">
        <DashboardActionBar
          title="Preventive Maintenance"
          buttonName="Create Record"
          navigationRoute="/user/create-record"
          sourceRoute="/user/preventive-maintenance-dashboard"
          sourceType="preventive"
        />
      </div>

      <main className="mt-8 min-h-0 flex-1 overflow-hidden pt-3">
        <div className="p-6">
          <h1 className="text-[20px] font-semibold text-[#263B35]">
            Preventive Maintenance Dashboard
          </h1>
          <p className="mt-1 text-[12.5px] text-[#6E897C]">
            Track preventive maintenance execution and completion.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PreventiveMaintenanceDashboard;