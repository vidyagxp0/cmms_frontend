import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./api", () => ({
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

import api from "./api";
import { getProfile, updateProfile, login, logout, LOGOUT_TIMEOUT_MS } from "./authApi";
import { clearRequestCache } from "./requestCache";

describe("authApi (mocked HTTP)", () => {
    beforeEach(() => {
        clearRequestCache();
        sessionStorage.setItem("auth_type", "User");
        api.get.mockResolvedValue({ data: { data: { id: 1 } } });
        api.post.mockResolvedValue({ data: {} });
        api.put.mockResolvedValue({ data: {} });
    });

    it("getProfile is deduplicated and cached across many pages", async () => {
        await Promise.all([getProfile(), getProfile(), getProfile()]);
        await getProfile();
        expect(api.get).toHaveBeenCalledTimes(1);
        expect(api.get).toHaveBeenCalledWith("/profile");
    });

    it("updateProfile invalidates the cached profile only after success", async () => {
        await getProfile();
        await updateProfile({ name: "New" });
        await getProfile();
        expect(api.get).toHaveBeenCalledTimes(2);
    });

    it("a failed updateProfile keeps the cached profile", async () => {
        await getProfile();
        api.put.mockRejectedValueOnce(new Error("422"));
        await expect(updateProfile({})).rejects.toThrow("422");
        await getProfile();
        expect(api.get).toHaveBeenCalledTimes(1);
    });

    it("login clears cached data from any previous session", async () => {
        await getProfile();
        await login({ username: "b", password: "x" });
        await getProfile();
        expect(api.get).toHaveBeenCalledTimes(2);
    });

    it("logout clears the cache and uses a short timeout", async () => {
        await getProfile();
        await logout();
        expect(api.post).toHaveBeenCalledWith("/logout", undefined, { timeout: LOGOUT_TIMEOUT_MS });
        expect(LOGOUT_TIMEOUT_MS).toBeLessThanOrEqual(5000);
        await getProfile();
        expect(api.get).toHaveBeenCalledTimes(2);
    });
});
