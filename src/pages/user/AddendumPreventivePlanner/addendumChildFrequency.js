// Frequency handed to the Addendum Preventive child (management) record.
//
// AddendumPreventivePlannerGrid calls
//   onViewChild(rowIndex, row, getRowBiggestFrequency(row))
// where the 3rd argument is { code, label }:
//   - code  : "M" | "Q" | "H" | "Y" (derived from the weekly plan), or the
//             row's own `frequency` value when the row has one
//   - label : full name ("Monthly", ...) or the row's `frequency` value
//
// The child form's "preventiveFrequency" select uses full option names
// ("monthly", "quarterly", "half-yearly", "yearly"), so short codes are
// converted. Anything else is passed through unchanged, as before.

export const FREQUENCY_CODE_TO_NAME = {
    M: "monthly",
    Q: "quarterly",
    H: "half-yearly",
    Y: "yearly",
};

export const resolveChildFrequency = (rowData, frequency) => {
    const raw =
        rowData?.frequency || frequency?.code || frequency?.label || "";

    return FREQUENCY_CODE_TO_NAME[raw] || raw || "";
};
