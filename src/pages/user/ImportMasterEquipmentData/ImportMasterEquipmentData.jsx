import { useState } from "react";
import { Select } from "antd";
import {
  FileExcelOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";

import MasterInstrumentImport from "./masters/MasterInstrumentImport";
import FieldInstrumentMasterImport from "./masters/FieldInstrumentMasterImport";
import SpareInstrumentMasterImport from "./masters/SpareInstrumentMasterImport";

const equipmentMasterOptions = [
  { label: "Master Instrument", value: "master_instrument" },
  { label: "Field Instrument Master", value: "field_instrument_master" },
  { label: "Spare Instrument Master", value: "spare_instrument_master" },
];

const steps = [
  { icon: <DatabaseOutlined />, title: "Select master", text: "Choose the data type" },
  { icon: <CloudUploadOutlined />, title: "Upload file", text: "Add your Excel sheet" },
];

export default function ImportMasterEquipmentData() {
  const [selectedMaster, setSelectedMaster] = useState();

  const activeStep = selectedMaster ? 1 : 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <DashboardActionBar
        title="Import Master Equipment Data"
        sourceType="import-master-equipment-data"
        showCreateButton={false}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Page header */}
        <div className="mt-12 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-white px-4 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
              <FileExcelOutlined />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Bulk Equipment Data Import
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Upload an Excel file and import equipment records in bulk.
                Progress and any row errors are shown after you confirm.
              </p>
            </div>
          </div>

          {/* Steps */}
          <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isDone = index < activeStep;

              return (
                <li
                  key={step.title}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    isActive
                      ? "border-blue-300 bg-blue-50"
                      : isDone
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isDone
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isDone ? <CheckCircleOutlined /> : step.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      {index + 1}. {step.title}
                    </p>
                    <p className="truncate text-xs text-gray-500">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Master selector */}
        <div className="border-b border-gray-200 px-4 py-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Equipment Master <span className="text-red-500">*</span>
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

          <p className="mt-2 text-xs text-gray-500">
            Each master has its own required columns and import rules.
          </p>
        </div>

        {selectedMaster === "master_instrument" && <MasterInstrumentImport />}

        {selectedMaster === "field_instrument_master" && (
          <FieldInstrumentMasterImport />
        )}

        {selectedMaster === "spare_instrument_master" && (
          <SpareInstrumentMasterImport />
        )}

        {/* Empty state */}
        {!selectedMaster && (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <FileExcelOutlined className="text-3xl text-blue-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              Choose an equipment master to begin
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
              Select a master above to see its import instructions, required
              columns and upload area.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {equipmentMasterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedMaster(option.value)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}