import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";


const ImportMasterEquipmentData = () => {
   

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {/* =====================================================
                SECONDARY ACTION BAR
            ====================================================== */}
            <DashboardActionBar
                title="Import Master Equipment Data"
                sourceType="import-master-equipment-data"
                showCreateButton={false}
            />

        </div>
    );
};

export default ImportMasterEquipmentData;