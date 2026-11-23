import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Capture the onTimeout callback instead of waiting 6 real minutes.
let idleOptions;
vi.mock("../../../hooks/useIdleTimeout", () => ({
    default: (opts) => {
        idleOptions = opts;
        return { isWarning: false, secondsLeft: 60, stayLoggedIn: () => {} };
    },
}));

vi.mock("../../../services/authApi", () => ({ logout: vi.fn() }));
vi.mock("sonner", () => ({ toast: { warning: vi.fn(), success: vi.fn() } }));

import SessionTimeout from "./SessionTimeout";
import { logout } from "../../../services/authApi";
import { useAuthStore } from "../../../store/authStore";

const renderAt = () =>
    render(
        <MemoryRouter initialEntries={["/user/equipment-dashboard"]}>
            <Routes>
                <Route path="/user/*" element={<SessionTimeout tokenKey="user_token" />} />
                <Route path="/login" element={<div>LOGIN PAGE</div>} />
            </Routes>
        </MemoryRouter>
    );

const seedSession = () => {
    sessionStorage.setItem("auth_type", "User");
    sessionStorage.setItem("user_token", "tok");
    sessionStorage.setItem("session_start_time", "1");
    useAuthStore.setState({ user: { id: 1, name: "A" }, loading: false });
};

describe("SessionTimeout (idle logout)", () => {
    beforeEach(seedSession);

    it("calls the logout API, clears the whole session and redirects to /login", async () => {
        logout.mockResolvedValue({});
        renderAt();

        await act(async () => { await idleOptions.onTimeout(); });

        expect(logout).toHaveBeenCalledTimes(1);
        expect(sessionStorage.getItem("user_token")).toBeNull();
        expect(sessionStorage.getItem("auth_type")).toBeNull();
        expect(sessionStorage.getItem("session_start_time")).toBeNull();
        expect(useAuthStore.getState().user).toBeNull();
        expect(screen.getByText("LOGIN PAGE")).toBeTruthy();
    });

    it("still logs out locally when the logout API is unavailable", async () => {
        logout.mockRejectedValue(new Error("Network Error"));
        renderAt();

        await act(async () => { await idleOptions.onTimeout(); });

        expect(sessionStorage.getItem("user_token")).toBeNull();
        expect(useAuthStore.getState().user).toBeNull();
        expect(screen.getByText("LOGIN PAGE")).toBeTruthy();
    });

    it("ignores a second trigger while the first logout is running", async () => {
        let finish;
        logout.mockImplementation(() => new Promise((r) => { finish = r; }));
        renderAt();

        let first;
        await act(async () => {
            first = idleOptions.onTimeout();
            idleOptions.onTimeout();
        });
        await act(async () => { finish({}); await first; });

        expect(logout).toHaveBeenCalledTimes(1);
    });
});
