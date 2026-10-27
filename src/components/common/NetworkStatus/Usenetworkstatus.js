import { useCallback, useEffect, useRef, useState } from "react";

/**
 * These are probed from the browser to prove REAL internet access.
 * They must NOT be your own app/API server: in development that server runs
 * on localhost and stays reachable even when the internet is down.
 * Online = at least ONE of them answers.
 */
const DEFAULT_CHECK_URLS = [
  "https://www.gstatic.com/generate_204",
  "https://www.cloudflare.com/cdn-cgi/trace",
  "https://www.google.com/generate_204",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One probe. `no-cors` lets us hit any host without CORS headers: the response
// is opaque, but the request only resolves if the network round trip worked.
function probe(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const sep = url.includes("?") ? "&" : "?";
  return fetch(`${url}${sep}_=${Date.now()}`, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
    signal: controller.signal,
  })
    .then(() => true)
    .finally(() => clearTimeout(timer));
}

// true as soon as any endpoint answers, false only when all of them fail
function hasInternet(urls, timeoutMs = 4000) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return Promise.resolve(false); // the browser itself says there is no network
  }
  return new Promise((resolve) => {
    let pending = urls.length;
    if (!pending) {
      resolve(true);
      return;
    }
    urls.forEach((url) => {
      probe(url, timeoutMs)
        .then(() => resolve(true))
        .catch(() => {
          pending -= 1;
          if (pending === 0) resolve(false);
        });
    });
  });
}

/**
 * status: "online" | "offline" | "restored"
 *
 * Going offline
 *   - instantly on the browser `offline` event (Wi-Fi off, cable out), and
 *   - by heartbeat: Wi-Fi connected but no internet fires NO browser event,
 *     so we probe every `heartbeatMs` and go offline after
 *     `failuresBeforeOffline` failed checks in a row.
 *
 * Coming back
 *   - never trusted from the `online` event alone: a real probe must succeed.
 *   - while offline we re-probe every `pollMs`.
 */
export default function useNetworkStatus({
  checkUrls = DEFAULT_CHECK_URLS,
  pollMs = 3000,
  heartbeatMs = 10000,
  failuresBeforeOffline = 2,
  restoredMs = 4500,
} = {}) {
  const [status, setStatusState] = useState("online");
  const [checking, setChecking] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const [offlineSeconds, setOfflineSeconds] = useState(0);
  const [lastOfflineSeconds, setLastOfflineSeconds] = useState(0);

  const statusRef = useRef("online");
  const urlsRef = useRef(checkUrls);
  urlsRef.current = checkUrls;
  const offlineSinceRef = useRef(null);
  const restoredTimerRef = useRef(null);
  const checkingRef = useRef(false);
  const aliveRef = useRef(true);

  const setStatus = useCallback((next) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const goOffline = useCallback(() => {
    if (statusRef.current === "offline") return;
    clearTimeout(restoredTimerRef.current);
    offlineSinceRef.current = Date.now();
    setOfflineSeconds(0);
    setRetryFailed(false);
    setStatus("offline");
  }, [setStatus]);

  const goOnline = useCallback(() => {
    if (statusRef.current !== "offline") return;
    const since = offlineSinceRef.current ?? Date.now();
    setLastOfflineSeconds(Math.max(1, Math.round((Date.now() - since) / 1000)));
    offlineSinceRef.current = null;
    setRetryFailed(false);
    setStatus("restored");
    clearTimeout(restoredTimerRef.current);
    restoredTimerRef.current = setTimeout(() => setStatus("online"), restoredMs);
  }, [restoredMs, setStatus]);

  const dismiss = useCallback(() => {
    if (statusRef.current !== "restored") return;
    clearTimeout(restoredTimerRef.current);
    setStatus("online");
  }, [setStatus]);

  // Recovery check (only meaningful while offline)
  const verify = useCallback(
    async (manual = false) => {
      if (statusRef.current !== "offline" || checkingRef.current) return;
      checkingRef.current = true;
      if (manual) {
        setChecking(true);
        setRetryFailed(false);
      }

      const [reachable] = await Promise.all([
        hasInternet(urlsRef.current),
        manual ? sleep(700) : Promise.resolve(), // keep the spinner visible
      ]);

      checkingRef.current = false;
      if (!aliveRef.current) return;
      if (manual) {
        setChecking(false);
        if (!reachable) setRetryFailed(true);
      }
      if (reachable) goOnline();
    },
    [goOnline]
  );

  // Browser events
  useEffect(() => {
    aliveRef.current = true;

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      goOffline();
    }

    const handleOffline = () => goOffline();
    const handleOnline = () => verify(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      aliveRef.current = false;
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearTimeout(restoredTimerRef.current);
    };
  }, [goOffline, verify]);

  // While offline: keep trying to reconnect + live "offline for" clock
  useEffect(() => {
    if (status !== "offline") return undefined;

    const poll = setInterval(() => verify(false), pollMs);
    const clock = setInterval(() => {
      const since = offlineSinceRef.current ?? Date.now();
      setOfflineSeconds(Math.floor((Date.now() - since) / 1000));
    }, 1000);

    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [status, pollMs, verify]);

  // While NOT offline: heartbeat to catch "Wi-Fi connected, no internet"
  const watching = status !== "offline";
  useEffect(() => {
    if (!watching) return undefined;

    let cancelled = false;
    let running = false;
    let fails = 0;
    let timer = null;

    const run = async () => {
      if (cancelled || running) return;
      if (document.hidden) {
        timer = setTimeout(run, heartbeatMs);
        return;
      }
      running = true;
      const ok = await hasInternet(urlsRef.current);
      running = false;
      if (cancelled) return;

      if (ok) {
        fails = 0;
        timer = setTimeout(run, heartbeatMs);
      } else {
        fails += 1;
        if (fails >= failuresBeforeOffline) goOffline();
        else timer = setTimeout(run, 2000); // quick re-check before declaring offline
      }
    };

    // Re-check right away when the user comes back to the tab
    const wake = () => {
      if (document.hidden) return;
      clearTimeout(timer);
      fails = 0;
      run();
    };

    timer = setTimeout(run, 1500);
    window.addEventListener("focus", wake);
    document.addEventListener("visibilitychange", wake);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("focus", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [watching, heartbeatMs, failuresBeforeOffline, goOffline]);

  const retry = useCallback(() => verify(true), [verify]);

  return {
    status,
    offlineSeconds,
    lastOfflineSeconds,
    checking,
    retryFailed,
    retry,
    dismiss,
  };
}