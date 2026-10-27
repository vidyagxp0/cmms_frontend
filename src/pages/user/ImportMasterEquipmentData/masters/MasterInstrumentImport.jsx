
import EquipmentImportPanel from "../components/EquipmentImportPanel";

const REQUIRED_HEADERS = [
  "Sr. No.",
  "Equipment / Instrument Name",
  "Equipment/ Instrument Code Number",
  "Asset Code",
  "Make",
  "Model",
  "Capacity",
];

const REQUIRED_FIELDS = [
  "Equipment / Instrument Name",
  "Equipment/ Instrument Code Number",
];

export default function MasterInstrumentImport() {
  return (
    <EquipmentImportPanel
      masterKey="master_instrument"
      masterLabel="Master Instrument"
      requiredHeaders={REQUIRED_HEADERS}
      requiredFields={REQUIRED_FIELDS}
      apiEndpoint={"/user/import-excel"}
      instructions={[
        "Use the Master Instrument Excel template.",
        "Keep all seven column headers unchanged. Line breaks in headers are supported.",
        "Equipment / Instrument Name and Equipment/ Instrument Code Number must be filled in.",
        "Review the preview and correct missing required values before importing.",
      ]}
    />
  );
}
