import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import ChecklistConfiguration from "./ChecklistConfig";
import EquipmentChecklistConfig from "../../pages/user/Equipment/ChecklistConfig";
import ChecklistConfigField from "../../pages/user/FieldInstruments/ChecklistConfigField";

describe("ChecklistConfig consolidation", () => {
    it("all three module entry points resolve to the single shared component", () => {
        expect(EquipmentChecklistConfig).toBe(ChecklistConfiguration);
        expect(ChecklistConfigField).toBe(ChecklistConfiguration);
    });
});

describe("ChecklistConfiguration", () => {
    it("renders and reports edits through onChange (controlled)", () => {
        const onChange = vi.fn();
        render(<ChecklistConfiguration value={{}} onChange={onChange} />);

        const name = screen.getByPlaceholderText("e.g. Daily Equipment Inspection");
        fireEvent.change(name, { target: { value: "Daily Check" } });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toMatchObject({ checklist_name: "Daily Check" });
    });

    it("does not call onChange on mount (no dirty flag from merely opening the tab)", () => {
        const onChange = vi.fn();
        render(<ChecklistConfiguration value={{ checklist_name: "Existing" }} onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue("Existing")).toBeTruthy();
    });

    it("the Field Instruments entry point behaves identically", () => {
        const onChange = vi.fn();
        render(<ChecklistConfigField value={{}} onChange={onChange} />);
        fireEvent.change(screen.getByPlaceholderText("e.g. Daily Equipment Inspection"), {
            target: { value: "Field" },
        });
        expect(onChange.mock.calls[0][0]).toMatchObject({ checklist_name: "Field" });
    });
});
