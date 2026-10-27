
import EquipmentImportPanel from "../components/EquipmentImportPanel";

// PROVISIONAL: replace these with the exact headers
// from your approved Field Instrument Master template.
const REQUIRED_HEADERS = [
  "Sr. No.",
  "Field Instrument Name",
  "Instrument Tag Number",
  "Equipment Code",
  "Location",
  "Make",
  "Model",
  "Range",
  "Unit",
];

const REQUIRED_FIELDS = [
  "Field Instrument Name",
  "Instrument Tag Number",
];

export default function FieldInstrumentMasterImport() {
  return (
    <EquipmentImportPanel
      masterKey="field_instrument_master"
      masterLabel="Field Instrument Master"
      requiredHeaders={REQUIRED_HEADERS}
      requiredFields={REQUIRED_FIELDS}
      apiEndpoint={import.meta.env.VITE_FIELD_INSTRUMENT_IMPORT_URL}
      instructions={[
        "Use the approved Field Instrument Master Excel template.",
        "Keep the column headers exactly as they appear in the approved template.",
        "Make sure the instrument name and tag number are provided.",
        "Preview all records before starting the import.",
      ]}
    />
  );
}
