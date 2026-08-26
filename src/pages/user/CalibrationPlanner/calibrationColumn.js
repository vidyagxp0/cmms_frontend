const calibrationColumns = [
    {
        key: "equipmentInstrumentName",
        title: "Equipment / Instrument Name",
        type: "text",
        placeholder: "Enter equipment / instrument name",
        required: true,
        minWidth: 220,
    },
    {
        key: "equipmentInstrumentId",
        title: "Equipment / Instrument ID",
        type: "text",
        placeholder: "Enter equipment / instrument ID",
        required: true,
        minWidth: 200,
    },
    {
        key: "department",
        title: "Department",
        type: "text",
        placeholder: "Enter department",
        minWidth: 180,
    },
    {
        key: "location",
        title: "Location",
        type: "text",
        placeholder: "Enter location",
        minWidth: 180,
    },
    {
        key: "makeModel",
        title: "Make & Model",
        type: "text",
        placeholder: "Enter make & model",
        minWidth: 200,
    },
    {
        key: "range",
        title: "Range",
        type: "text",
        placeholder: "Enter range",
        minWidth: 160,
    },
    {
        key: "leastCount",
        title: "Least Count",
        type: "text",
        placeholder: "Enter least count",
        minWidth: 160,
    },
    {
        key: "accuracy",
        title: "Accuracy",
        type: "text",
        placeholder: "Enter accuracy",
        minWidth: 160,
    },
    {
        key: "cNc",
        title: "C / NC",
        type: "select",
        placeholder: "Select",
        minWidth: 130,
        options: [
            {
                value: "C",
                label: "C",
            },
            {
                value: "NC",
                label: "NC",
            },
        ],
    },
    {
        key: "calibrationFrequency",
        title: "Calibration Frequency",
        type: "select",
        placeholder: "Select frequency",
        minWidth: 190,
        options: [
            {
                value: "monthly",
                label: "Monthly",
            },
            {
                value: "quarterly",
                label: "Quarterly",
            },
            {
                value: "half-yearly",
                label: "Half Yearly",
            },
            {
                value: "yearly",
                label: "Yearly",
            },
        ],
    },
    {
        key: "previousCalibrationDate",
        title: "Previous / Calibration Date",
        type: "date",
        placeholder: "Select date",
        minWidth: 190,
    },
    {
        key: "nextCalibrationDate",
        title: "Next Calibration Date",
        type: "date",
        placeholder: "Select date",
        minWidth: 180,
    },
    {
        key: "alert",
        title: "Alert",
        type: "select",
        placeholder: "Select alert",
        minWidth: 140,
        options: [
            {
                value: "yes",
                label: "Yes",
            },
            {
                value: "no",
                label: "No",
            },
        ],
    },
    {
        key: "remark",
        title: "Remark",
        type: "textarea",
        placeholder: "Enter remark",
        minWidth: 240,
    },
];

export default calibrationColumns;