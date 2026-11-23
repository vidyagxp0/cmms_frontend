import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../services/usersApi/equipmentApi", () => ({
    getAllEquipment: vi.fn(),
    getInstrumentReport: vi.fn(),
}));

import { getAllEquipment } from "../../../services/usersApi/equipmentApi";
import EquipDashboard from "./EquipDashboard";
import { useAuthStore } from "../../../store/authStore";

const deferred = () => {
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    return { promise, resolve };
};

const page = (name) => ({
    data: { data: { data: [{ id: name, instrument_name: name, instrument_id_no: name }], current_page: 1, last_page: 1, per_page: 10, total: 1 } },
});

describe("EquipDashboard — latest response wins", () => {
    beforeEach(() => {
        useAuthStore.setState({ user: { id: 1, roles: [], permissions: [] }, permissions: [], loading: false });
    });

    it("a slow older response never overwrites newer search results", async () => {
        const initial = deferred();
        const searched = deferred();
        getAllEquipment
            .mockImplementationOnce(() => initial.promise)   // mount, search=""
            .mockImplementationOnce(() => searched.promise); // search="pump"

        vi.useFakeTimers({ shouldAdvanceTime: true });
        render(<MemoryRouter><EquipDashboard /></MemoryRouter>);

        fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "pump" } });
        await act(async () => { vi.advanceTimersByTime(450); }); // debounce
        expect(getAllEquipment).toHaveBeenCalledTimes(2);
        expect(getAllEquipment.mock.calls[1][0]).toMatchObject({ search: "pump" });

        // Newer request finishes first, then the stale initial one arrives.
        await act(async () => { searched.resolve(page("PUMP-NEW")); });
        await act(async () => { initial.resolve(page("STALE-ALL")); });

        expect(screen.getAllByText("PUMP-NEW").length).toBeGreaterThan(0);
        expect(screen.queryByText("STALE-ALL")).toBeNull();
        vi.useRealTimers();
    });
});
