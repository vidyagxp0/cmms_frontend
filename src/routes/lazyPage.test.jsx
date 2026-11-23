import { describe, it, expect, vi, beforeEach } from "vitest";
import { Suspense } from "react";
import { render, screen } from "@testing-library/react";

const RELOAD_FLAG = "chunk_reload_attempted";

// prefetchAllPages keeps module-level state, so load a fresh copy per test.
const loadModule = async () => {
    vi.resetModules();
    return import("./lazyPage");
};

describe("lazyPage — route-level code splitting", () => {
    beforeEach(() => {
        // Run idle callbacks immediately in tests.
        window.requestIdleCallback = (fn) => setTimeout(fn, 0);
    });

    it("renders the page once its chunk has loaded", async () => {
        const { lazyPage } = await loadModule();
        const Page = lazyPage(() => Promise.resolve({ default: () => <div>EQUIPMENT PAGE</div> }));

        render(
            <Suspense fallback={<div>LOADING</div>}>
                <Page />
            </Suspense>
        );

        expect(screen.getByText("LOADING")).toBeTruthy();
        expect(await screen.findByText("EQUIPMENT PAGE")).toBeTruthy();
    });

    it("does not download any page until asked (no eager loading)", async () => {
        const { lazyPage } = await loadModule();
        const factory = vi.fn(() => Promise.resolve({ default: () => null }));
        lazyPage(factory);
        expect(factory).not.toHaveBeenCalled();
    });

    it("idle prefetch loads registered pages, but skips prefetch:false entries, once", async () => {
        const { lazyPage, prefetchAllPages } = await loadModule();
        const page = vi.fn(() => Promise.resolve({ default: () => null }));
        const login = vi.fn(() => Promise.resolve({ default: () => null }));
        lazyPage(page);
        lazyPage(login, { prefetch: false });

        prefetchAllPages();
        prefetchAllPages(); // second call is a no-op
        await vi.waitFor(() => expect(page).toHaveBeenCalledTimes(1));

        expect(login).not.toHaveBeenCalled();
    });

    it("a successful load clears the stale-chunk reload flag", async () => {
        const { withChunkRetry } = await loadModule();
        sessionStorage.setItem(RELOAD_FLAG, "1");
        await withChunkRetry(() => Promise.resolve({ default: "ok" }))();
        expect(sessionStorage.getItem(RELOAD_FLAG)).toBeNull();
    });

    it("after one reload attempt, a still-missing chunk surfaces the error (no reload loop)", async () => {
        const { withChunkRetry } = await loadModule();
        sessionStorage.setItem(RELOAD_FLAG, "1");
        const err = new Error("Failed to fetch dynamically imported module");
        await expect(withChunkRetry(() => Promise.reject(err))()).rejects.toBe(err);
    });

    it("the first chunk failure marks a reload attempt (page reloads once)", async () => {
        const { withChunkRetry } = await loadModule();
        // jsdom cannot really reload; we only verify the one-shot guard is set
        // and that the promise is left pending instead of throwing.
        const settled = vi.fn();
        withChunkRetry(() => Promise.reject(new Error("chunk 404")))().then(settled, settled);
        await vi.waitFor(() => expect(sessionStorage.getItem(RELOAD_FLAG)).toBe("1"));
        expect(settled).not.toHaveBeenCalled();
    });
});
