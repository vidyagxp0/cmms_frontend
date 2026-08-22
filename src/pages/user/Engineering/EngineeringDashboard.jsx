import React from 'react'
import DashboardActionBar from '../../../components/common/DashboardActionBar/DashboardActionBar'

const EngineeringDashboard = () => {
  return (
    // <div>Comming Soon Engineering Dashboard</div>
                <div className="shrink-0">
                    <DashboardActionBar
                        title="Engineering Dashboard"
                        onCreate={() =>
                            setIsCreateModalOpen(true)
                        }
                    />
                </div>
    
  )
}

export default EngineeringDashboard