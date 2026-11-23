// Field Instruments module entry point for the checklist builder.
//
// This file used to be a 1,622-line copy of
// components/checklist/ChecklistConfig.jsx (identical except for an import
// path and the component's name). It now re-exports the shared
// implementation, keeping the `ChecklistConfigField` name for callers.
import ChecklistConfiguration from "../../../components/checklist/ChecklistConfig";

const ChecklistConfigField = ChecklistConfiguration;

export default ChecklistConfigField;
