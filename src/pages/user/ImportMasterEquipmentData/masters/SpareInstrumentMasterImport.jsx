
import EquipmentImportPanel from "../components/EquipmentImportPanel";

// PROVISIONAL: replace these with the exact headers
// from your approved Spare Instrument Master template.
const REQUIRED_HEADERS = [
  "Sr. No.",
  "Spare Instrument Name",
  "Spare Code",
  "Part Number",
  "Make",
  "Model",
  "Specification",
  "UOM",
  "Minimum Stock",
  "Maximum Stock",
];

const REQUIRED_FIELDS = [
  "Spare Instrument Name",
  "Spare Code",
];

export default function SpareInstrumentMasterImport() {
  return (
    <EquipmentImportPanel
      masterKey="spare_instrument_master"
      masterLabel="Spare Instrument Master"
      requiredHeaders={REQUIRED_HEADERS}
      requiredFields={REQUIRED_FIELDS}
      apiEndpoint={"/user/import-excel"}
      instructions={[
        "Use the approved Spare Instrument Master Excel template.",
        "Keep the column headers exactly as they appear in the approved template.",
        // "Provide the spare name and spare code for each record.",
        // "Review the preview before importing stock or spare records.",
      ]}
    />
  );
}
