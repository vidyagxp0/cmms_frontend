import React from 'react'
import DashboardActionBar from '../../../components/common/DashboardActionBar/DashboardActionBar'

const ManagementDashboard = () => {
  return (
    <div>
            <div className="shrink-0">
                <DashboardActionBar
                    buttonName="Create Record"
                    navigationRoute="/user/create-record"
                    sourceRoute="/user/calibration-management-dashboard"
                    sourceType="calibration"
                />
            </div>
    </div>
  )
}

export default ManagementDashboard