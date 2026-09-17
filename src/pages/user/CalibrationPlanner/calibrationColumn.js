const CALIBRATED_BY_COLUMNS = [
  {
    key: "masterInstrumentReadings",
    title: "Master Instrument Readings in",
    type: "text",
    placeholder: "Enter Master Instrument Readings",
    required: true,
    minWidth: 180,
    toggleable: true,
    splitFields: [
      { key: "masterInstrumentReadings1", placeholder: "Master Instrument Readings 1" },
      { key: "masterInstrumentReadings2", placeholder: "Master Instrument Readings 2" }
    ]
  },
  {
    key: "unitUnderCalibrationReading",
    title: "Unit Under Calibration Readings in",
    type: "text",
    placeholder: "Enter Unit Under Calibration Readings",
    minWidth: 160,
    toggleable: true,
    splitFields: [
      { key: "unitUnderCalibrationReading1", placeholder: "Unit Under Calibration Readings 1" },
      { key: "unitUnderCalibrationReading2", placeholder: "Unit Under Calibration Readings 2" }
    ]
  },
  {
    key: "errorIn",
    title: "Error in",
    type: "text",
    placeholder: "Enter error",
    minWidth: 160,
  },
];

const CALIBRATION_RESULT_GRID = [
  {
    key: "name",
    title: "Name",
    type: "text",
    placeholder: "Enter name",
    required: true,
    minWidth: 180,
  },
  {
    key: "IdNo",
    title: "ID NO.",
    type: "text",
    placeholder: "Enter ID No.",
    minWidth: 160,
  },
  {
    key: "accuracy",
    title: "Accuracy",
    type: "text",
    placeholder: "Enter Accuracy",
    minWidth: 160,
    toggleable: true,
    splitFields: [
      { key: "accuracy1", placeholder: "Accuracy 1" },
      { key: "accuracy2", placeholder: "Accuracy 2" }
    ]
  },
  {
    key: "range",
    title: "Range",
    type: "text",
    placeholder: "Enter Range",
    minWidth: 160,
    toggleable: true,
    splitFields: [
      { key: "range1", placeholder: "Range 1" },
      { key: "range2", placeholder: "Range 2" }
    ]
  },
  {
    key: "calibrationdoneDATE",
    title: "Calibration Done Date",
    type: "date",
    placeholder: "Enter Calibration Done Date",
    minWidth: 160,
    disabled: true,
  },
  {
    key: "calibrationNewDueDate",
    title: "Calibration New Due Date",
    type: "date",
    placeholder: "Enter Calibration New Due Date",
    minWidth: 160,
  },
];

export {
  CALIBRATED_BY_COLUMNS,
  CALIBRATION_RESULT_GRID,
};
