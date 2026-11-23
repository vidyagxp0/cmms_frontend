import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import FloatingActionButtons from "./FloatingActionButtons";

// [0] = collapsed "Show actions" toggle, [1] = Save/Update (label changes to
// "Saving..." while busy, so select by position), [2] = Cancel.
const saveButton = () => screen.getAllByRole("button")[1];

describe("FloatingActionButtons — duplicate submission protection", () => {
    afterEach(() => vi.useRealTimers());

    it("a rapid double click calls onSave only once (validation window)", () => {
        const onSave = vi.fn();
        render(<FloatingActionButtons onSave={onSave} onCancel={() => {}} saveLabel="Create" />);

        fireEvent.click(saveButton());
        fireEvent.click(saveButton());
        fireEvent.click(saveButton());

        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("unlocks after the save finishes (isSaving true -> false)", () => {
        const onSave = vi.fn();
        const { rerender } = render(
            <FloatingActionButtons onSave={onSave} onCancel={() => {}} saveLabel="Create" />
        );

        fireEvent.click(saveButton());
        rerender(<FloatingActionButtons onSave={onSave} onCancel={() => {}} saveLabel="Create" isSaving />);
        rerender(<FloatingActionButtons onSave={onSave} onCancel={() => {}} saveLabel="Create" isSaving={false} />);
        fireEvent.click(saveButton());

        expect(onSave).toHaveBeenCalledTimes(2);
    });

    it("unlocks shortly after a click when validation fails and no save starts", () => {
        vi.useFakeTimers();
        const onSave = vi.fn();
        render(<FloatingActionButtons onSave={onSave} onCancel={() => {}} saveLabel="Create" />);

        fireEvent.click(saveButton());
        act(() => { vi.advanceTimersByTime(1300); });
        fireEvent.click(saveButton());

        expect(onSave).toHaveBeenCalledTimes(2);
    });

    it("stays locked while a save is in flight", () => {
        vi.useFakeTimers();
        const onSave = vi.fn();
        const { rerender } = render(
            <FloatingActionButtons onSave={onSave} onCancel={() => {}} saveLabel="Create" />
        );

        fireEvent.click(saveButton());
        rerender(<FloatingActionButtons onSave={onSave} onCancel={() => {}} saveLabel="Create" isSaving />);
        act(() => { vi.advanceTimersByTime(5000); });
        fireEvent.click(saveButton());

        expect(onSave).toHaveBeenCalledTimes(1);
    });
});
