/**
 * Tiny in-memory cache for read-only lookup requests that many pages ask for
 * (profile, departments, workflow stages, stage activities).
 *
 *  - De-duplicates concurrent calls: 5 components asking for departments at
 *    the same moment share ONE network request.
 *  - Re-uses the result for `ttlMs`, so opening another record or module does
 *    not refetch data that has not changed.
 *  - Failed requests are never cached.
 *  - Keys are scoped to the current login type, and the whole cache is cleared
 *    on login / logout / 401 so one user's data never leaks to another.
 *
 * Only use this for data that is the same for every record. Never for
 * permissions, activity logs, record numbers or record details.
 */

const store = new Map();

const scopedKey = (key) => {
    let authType = "";
    try { authType = sessionStorage.getItem("auth_type") || ""; } catch { /* ignore */ }
    return `${authType}::${key}`;
};

export const cachedRequest = (key, fetcher, ttlMs = 5 * 60 * 1000) => {
    const fullKey = scopedKey(key);
    const now = Date.now();
    const hit = store.get(fullKey);

    if (hit && hit.expiresAt > now) return hit.promise;

    const promise = fetcher().catch((error) => {
        // Don't keep failures around — the next caller should retry.
        if (store.get(fullKey)?.promise === promise) store.delete(fullKey);
        throw error;
    });

    store.set(fullKey, { promise, expiresAt: now + ttlMs });
    return promise;
};

/** Drop every cached entry whose key starts with `prefix` (any login scope). */
export const invalidateRequest = (prefix) => {
    for (const fullKey of store.keys()) {
        const key = fullKey.slice(fullKey.indexOf("::") + 2);
        if (key.startsWith(prefix)) store.delete(fullKey);
    }
};

export const clearRequestCache = () => store.clear();
