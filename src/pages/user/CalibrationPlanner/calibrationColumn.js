const CALIBRATED_BY_COLUMNS = [
  {
    key: "parameter",
    title: "Master Instrument Readings in",
    type: "text",
    placeholder: "Enter name",
    required: true,
    minWidth: 180,
    toggleable: true,
    splitFields: [
      { key: "reading1", placeholder: "Reading 1" },
      { key: "reading2", placeholder: "Reading 2" }
    ]
  },
  {
    key: "result",
    title: "Unit under calibration Readings in",
    type: "text",
    placeholder: "Enter result",
    minWidth: 160,
    toggleable: true,
    splitFields: [
      { key: "result1", placeholder: "Result 1" },
      { key: "result2", placeholder: "Result 2" }
    ]
  },
  {
    key: "error",
    title: "Error in",
    type: "text",
    placeholder: "Enter error",
    minWidth: 160,
  },
];

const CALIBRATION_RESULT_GRID = [
  {
    key: "parameter",
    title: "Name",
    type: "text",
    placeholder: "Enter name",
    required: true,
    minWidth: 180,
  },
  {
    key: "result",
    title: "ID NO.",
    type: "text",
    placeholder: "Enter result",
    minWidth: 160,
  },
  {
    key: "error",
    title: "Accuracy",
    type: "text",
    placeholder: "Enter error",
    minWidth: 160,
  },
  {
    key: "range",
    title: "Range",
    type: "text",
    placeholder: "Enter error",
    minWidth: 160,
  },
  {
    key: "calibrationdoneDATE",
    title: "Calibration DONE DATE",
    type: "date",
    placeholder: "Enter Calibration DONE DATE",
    minWidth: 160,
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
