import { lazy } from "react";

/**
 * Route-level code splitting.
 *
 * `lazyPage(() => import("..."))` behaves like React.lazy, plus:
 *   - every page factory is registered so it can be prefetched while the
 *     browser is idle (navigation then feels instant, but the first load
 *     only downloads what the current screen needs);
 *   - if a chunk fails to load because a new build was deployed while the
 *     tab was open, the page reloads once to pick up the fresh files.
 */

const registry = [];
const RELOAD_FLAG = "chunk_reload_attempted";

export const withChunkRetry = (factory) => () =>
    factory()
        .then((module) => {
            try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* ignore */ }
            return module;
        })
        .catch((error) => {
            let alreadyRetried = false;
            try { alreadyRetried = sessionStorage.getItem(RELOAD_FLAG) === "1"; } catch { /* ignore */ }

            if (!alreadyRetried) {
                try { sessionStorage.setItem(RELOAD_FLAG, "1"); } catch { /* ignore */ }
                window.location.reload();
                // Never resolve: the page is reloading.
                return new Promise(() => {});
            }
            throw error;
        });

export const lazyPage = (factory, { prefetch = true } = {}) => {
    if (prefetch) registry.push(factory);
    return lazy(withChunkRetry(factory));
};

let prefetched = false;

/** Download every registered page chunk in the background, a few at a time. */
export const prefetchAllPages = () => {
    if (prefetched) return;
    prefetched = true;

    const queue = [...registry];
    const next = () => {
        const factory = queue.shift();
        if (!factory) return;
        factory()
            .catch(() => { /* ignore — it will load on demand */ })
            .finally(() => schedule(next));
    };

    for (let i = 0; i < 3; i += 1) schedule(next);
};

const schedule = (fn) => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(fn, { timeout: 3000 });
    } else {
        setTimeout(fn, 200);
    }
};
