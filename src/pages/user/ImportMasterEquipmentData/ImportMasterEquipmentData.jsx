
import { useState } from "react";
import { Select } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";

import MasterInstrumentImport from "./masters/MasterInstrumentImport";
import FieldInstrumentMasterImport from "./masters/FieldInstrumentMasterImport";
import SpareInstrumentMasterImport from "./masters/SpareInstrumentMasterImport";

const equipmentMasterOptions = [
  { label: "Master Instrument", value: "master_instrument" },
  { label: "Field Instrument Master", value: "field_instrument_master" },
  { label: "Spare Instrument Master", value: "spare_instrument_master" },
];

export default function ImportMasterEquipmentData() {
  const [selectedMaster, setSelectedMaster] = useState();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <DashboardActionBar
        title="Import Master Equipment Data"
        sourceType="import-master-equipment-data"
        showCreateButton={false}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-gray-200 px-4 py-3 mt-12">
          <h2 className="text-base font-semibold text-gray-800">
            Bulk Equipment Data Import
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Upload, validate, preview, and import equipment records.
          </p>
        </div>

        <div className="border-b border-gray-200 px-4 py-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Equipment Master{" "}
            <span className="text-red-500">*</span>
          </label>

          <Select
            value={selectedMaster}
            onChange={setSelectedMaster}
            options={equipmentMasterOptions}
            placeholder="Choose equipment master"
            showSearch
            optionFilterProp="label"
            allowClear
            size="large"
            className="w-full sm:max-w-lg"
            style={{ width: "100%" }}
          />
        </div>

        {selectedMaster === "master_instrument" && (
          <MasterInstrumentImport />
        )}

        {selectedMaster === "field_instrument_master" && (
          <FieldInstrumentMasterImport />
        )}

        {selectedMaster === "spare_instrument_master" && (
          <SpareInstrumentMasterImport />
        )}

        {!selectedMaster && (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
            <FileExcelOutlined className="text-4xl text-blue-500" />

            <h3 className="mt-4 text-sm font-semibold text-gray-800">
              Choose an equipment master
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
              Select a master above to display its own import configuration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
