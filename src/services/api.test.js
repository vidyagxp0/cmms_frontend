import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError } from "axios";
import api from "./api";
import { useAuthStore } from "../store/authStore";

// All tests run against a mocked Axios adapter — no real network/backend.
const ok = (config, data = {}) =>
    Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config });

const networkError = (config) =>
    Promise.reject(new AxiosError("Network Error", "ERR_NETWORK", config));

const httpError = (config, status) =>
    Promise.reject(
        new AxiosError(`HTTP ${status}`, "ERR_BAD_RESPONSE", config, null, {
            status, data: {}, headers: {}, config, statusText: String(status),
        })
    );

const loginAs = (type, token) => {
    sessionStorage.setItem("auth_type", type);
    sessionStorage.setItem(type === "Admin" ? "admin_token" : "user_token", token);
};

describe("api client", () => {
    beforeEach(() => {
        // Stay on /login so the 401 handler never tries to navigate jsdom.
        window.history.pushState({}, "", "/login");
        useAuthStore.setState({ user: { id: 1 }, loading: false });
    });

    it("attaches the active session's bearer token", async () => {
        loginAs("User", "user-token-1");
        const adapter = vi.fn((config) => ok(config));
        await api.get("/x", { adapter });
        expect(adapter.mock.calls[0][0].headers.Authorization).toBe("Bearer user-token-1");
    });

    it("strips a stale Authorization header when no session is active", async () => {
        const adapter = vi.fn((config) => ok(config));
        await api.get("/x", { adapter, headers: { Authorization: "Bearer old" } });
        expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined();
    });

    it("retries a GET once after a network error, then succeeds", async () => {
        const adapter = vi
            .fn()
            .mockImplementationOnce(networkError)
            .mockImplementationOnce((config) => ok(config, { fine: true }));

        const res = await api.get("/x", { adapter });
        expect(res.data).toEqual({ fine: true });
        expect(adapter).toHaveBeenCalledTimes(2);
    });

    it("retries a GET at most once", async () => {
        const adapter = vi.fn(networkError);
        await expect(api.get("/x", { adapter })).rejects.toBeInstanceOf(AxiosError);
        expect(adapter).toHaveBeenCalledTimes(2);
    });

    it("retries GET on 503 but not on 500", async () => {
        const a503 = vi.fn().mockImplementationOnce((c) => httpError(c, 503)).mockImplementationOnce(ok);
        await api.get("/x", { adapter: a503 });
        expect(a503).toHaveBeenCalledTimes(2);

        const a500 = vi.fn((c) => httpError(c, 500));
        await expect(api.get("/x", { adapter: a500 })).rejects.toBeInstanceOf(AxiosError);
        expect(a500).toHaveBeenCalledTimes(1);
    });

    it.each(["post", "put", "patch", "delete"])(
        "never retries a %s (non-idempotent mutation)",
        async (method) => {
            const adapter = vi.fn(networkError);
            await expect(api.request({ url: "/x", method, adapter })).rejects.toBeInstanceOf(AxiosError);
            expect(adapter).toHaveBeenCalledTimes(1);
        }
    );

    it("does not retry a timed-out GET", async () => {
        const adapter = vi.fn((config) =>
            Promise.reject(new AxiosError("timeout", "ECONNABORTED", config))
        );
        await expect(api.get("/x", { adapter })).rejects.toBeInstanceOf(AxiosError);
        expect(adapter).toHaveBeenCalledTimes(1);
    });

    it("401 for the current session clears the whole auth state", async () => {
        loginAs("User", "user-token-1");
        sessionStorage.setItem("session_start_time", "123");

        const adapter = vi.fn((c) => httpError(c, 401));
        await expect(api.get("/x", { adapter })).rejects.toBeInstanceOf(AxiosError);

        expect(sessionStorage.getItem("user_token")).toBeNull();
        expect(sessionStorage.getItem("auth_type")).toBeNull();
        expect(sessionStorage.getItem("session_start_time")).toBeNull();
        expect(useAuthStore.getState().user).toBeNull();
    });

    it("401 from a superseded session does NOT log out the new session", async () => {
        loginAs("User", "token-A");
        let rejectLater;
        const adapter = vi.fn(
            (config) => new Promise((_, reject) => {
                rejectLater = () => reject(new AxiosError("401", "ERR_BAD_REQUEST", config, null, {
                    status: 401, data: {}, headers: {}, config, statusText: "401",
                }));
            })
        );

        const pending = api.get("/slow", { adapter });
        await vi.waitFor(() => expect(adapter).toHaveBeenCalled());

        // User A logs out, user B logs in while A's request is still pending.
        sessionStorage.clear();
        loginAs("User", "token-B");
        useAuthStore.setState({ user: { id: 2 } });

        rejectLater();
        await expect(pending).rejects.toBeInstanceOf(AxiosError);

        expect(sessionStorage.getItem("user_token")).toBe("token-B");
        expect(useAuthStore.getState().user).toEqual({ id: 2 });
    });
});
