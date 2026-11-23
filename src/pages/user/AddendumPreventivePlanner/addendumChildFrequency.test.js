import { describe, it, expect } from "vitest";
import { resolveChildFrequency } from "./addendumChildFrequency";
import { getRowBiggestFrequency } from "./AddendumPreventivePlannerGrid";

// Regression for the ReferenceError at AddendumPreventivePlannerPanel.jsx:631
// (`frequency` was read but never declared).

describe("resolveChildFrequency", () => {
    it("uses the row's own frequency first (passed through unchanged)", () => {
        expect(resolveChildFrequency({ frequency: "quarterly" }, { code: "Y", label: "Yearly" }))
            .toBe("quarterly");
    });

    it.each([
        ["M", "monthly"],
        ["Q", "quarterly"],
        ["H", "half-yearly"],
        ["Y", "yearly"],
    ])("maps grid code %s to the child option %s", (code, name) => {
        expect(resolveChildFrequency({}, { code, label: "" })).toBe(name);
    });

    it("falls back to the label when there is no code", () => {
        expect(resolveChildFrequency({}, { code: "", label: "Custom" })).toBe("Custom");
    });

    it("returns empty string (no crash) when nothing is known", () => {
        expect(resolveChildFrequency({}, undefined)).toBe("");
        expect(resolveChildFrequency(undefined, { code: "", label: "" })).toBe("");
    });

    it("works end-to-end with the grid's own getRowBiggestFrequency", () => {
        const row = {
            weeklyPreventive: {
                jan: [{ planned: "M", actual: "" }],
                apr: [{ planned: "Q", actual: "" }],
            },
        };
        expect(resolveChildFrequency(row, getRowBiggestFrequency(row))).toBe("quarterly");
        expect(resolveChildFrequency({}, getRowBiggestFrequency({}))).toBe("");
    });
});
