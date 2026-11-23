import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SymbolicInput from "./SymbolicInput";

// Regression: emitting onChange from an effect raced the prop-sync effect and
// caused "Maximum update depth exceeded" after form.setFieldsValue (save/reload).

describe("SymbolicInput", () => {
    it("does not emit onChange on mount", () => {
        const onChange = vi.fn();
        render(<SymbolicInput value="5 Bar" onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("does not echo an externally changed value back to the form", () => {
        const onChange = vi.fn();
        const { rerender } = render(<SymbolicInput value="5 Bar" onChange={onChange} />);

        // Parent replaces the value (e.g. reload after save) — twice, quickly.
        rerender(<SymbolicInput value="7 psi" onChange={onChange} />);
        rerender(<SymbolicInput value="9" onChange={onChange} />);

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("textbox").value).toBe("9");
    });

    it("emits the combined value when the user types", () => {
        const onChange = vi.fn();
        render(<SymbolicInput value="5 Bar" onChange={onChange} />);

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "12" } });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith("12 Bar");
    });

    it("emits the raw value when the symbol is off", () => {
        const onChange = vi.fn();
        render(<SymbolicInput value="" onChange={onChange} />);

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "0.01" } });
        expect(onChange).toHaveBeenLastCalledWith("0.01");
    });
});
