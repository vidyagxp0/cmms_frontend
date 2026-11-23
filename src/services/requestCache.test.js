import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cachedRequest, invalidateRequest, clearRequestCache } from "./requestCache";

const deferred = () => {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
};

describe("requestCache", () => {
    beforeEach(() => {
        clearRequestCache();
        sessionStorage.setItem("auth_type", "User");
    });
    afterEach(() => vi.useRealTimers());

    it("shares one request between concurrent callers (deduplication)", async () => {
        const d = deferred();
        const fetcher = vi.fn(() => d.promise);

        const a = cachedRequest("departments", fetcher);
        const b = cachedRequest("departments", fetcher);
        const c = cachedRequest("departments", fetcher);

        expect(fetcher).toHaveBeenCalledTimes(1);
        d.resolve({ data: "ok" });
        await expect(Promise.all([a, b, c])).resolves.toEqual([
            { data: "ok" }, { data: "ok" }, { data: "ok" },
        ]);
    });

    it("re-uses the cached result within the TTL and refetches after it", async () => {
        vi.useFakeTimers();
        const fetcher = vi.fn(() => Promise.resolve({ n: fetcher.mock.calls.length }));

        await cachedRequest("stages:1", fetcher, 1000);
        await cachedRequest("stages:1", fetcher, 1000);
        expect(fetcher).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1001);
        await cachedRequest("stages:1", fetcher, 1000);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("does not cache failures — the next call retries", async () => {
        const fetcher = vi
            .fn()
            .mockRejectedValueOnce(new Error("network"))
            .mockResolvedValueOnce({ data: "fresh" });

        await expect(cachedRequest("profile", fetcher)).rejects.toThrow("network");
        await expect(cachedRequest("profile", fetcher)).resolves.toEqual({ data: "fresh" });
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("keeps different keys separate", async () => {
        const fetcher = vi.fn((k) => Promise.resolve(k));
        await cachedRequest("activities:1", () => fetcher(1));
        await cachedRequest("activities:2", () => fetcher(2));
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("isolates admin and user sessions (auth-scoped keys)", async () => {
        const fetcher = vi.fn(() => Promise.resolve({}));

        sessionStorage.setItem("auth_type", "User");
        await cachedRequest("profile", fetcher);
        sessionStorage.setItem("auth_type", "Admin");
        await cachedRequest("profile", fetcher);

        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("invalidateRequest drops matching keys only", async () => {
        const profile = vi.fn(() => Promise.resolve({}));
        const depts = vi.fn(() => Promise.resolve({}));
        await cachedRequest("profile", profile);
        await cachedRequest("departments", depts);

        invalidateRequest("profile");
        await cachedRequest("profile", profile);
        await cachedRequest("departments", depts);

        expect(profile).toHaveBeenCalledTimes(2);
        expect(depts).toHaveBeenCalledTimes(1);
    });

    it("clearRequestCache forces every key to refetch (logout / login)", async () => {
        const fetcher = vi.fn(() => Promise.resolve({}));
        await cachedRequest("departments", fetcher);
        clearRequestCache();
        await cachedRequest("departments", fetcher);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("a request in flight during clearRequestCache is not written back", async () => {
        const d = deferred();
        const first = vi.fn(() => d.promise);
        const p = cachedRequest("profile", first);

        clearRequestCache(); // e.g. logout while the request is pending
        d.resolve({ user: "A" });
        await p;

        const second = vi.fn(() => Promise.resolve({ user: "B" }));
        await expect(cachedRequest("profile", second)).resolves.toEqual({ user: "B" });
        expect(second).toHaveBeenCalledTimes(1);
    });
});
